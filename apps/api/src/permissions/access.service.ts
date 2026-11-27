/**
 * Construit le principal (droits effectifs) d'un utilisateur ou d'un appareil.
 * Le résultat est mis en cache dans Redis (utilisateur + version + état MFA) et invalidé
 * explicitement quand les attributions, l employé ou la session changent.
 *
 * MAAYOUD
 */
import { Injectable, Logger } from '@nestjs/common';
import {
  type AccessContext,
  ROLE_KEYS,
  type RawRule,
  type RoleKey,
  createAppAbility,
  resolveAccess,
} from '@temper/permissions';
import { env } from '../config/env.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { RedisService } from '../redis/redis.service.js';
import type { Principal } from './principal.js';

/** Fenêtre maximale si une invalidation est perdue (Redis indisponible). */
const CACHE_TTL_SECONDS = 120;

interface CachedAccess {
  email?: string;
  employee: Principal['employee'];
  activeRoles: RoleKey[];
  mfaPending: boolean;
  rules: RawRule[];
  prismaRules: RawRule[];
  maxSessionMinutes: number;
}

const isRoleKey = (r: string): r is RoleKey => (ROLE_KEYS as readonly string[]).includes(r);

@Injectable()
export class AccessService {
  private readonly log = new Logger(AccessService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  /** Incrémente la version : les clés précédentes ne sont plus lues. */
  async invalidate(userId: string): Promise<void> {
    await this.redis.incr(`temper:accessver:${userId}`);
  }

  async invalidateEmployee(employeeId: string): Promise<void> {
    const user = await this.prisma.db.user.findFirst({ where: { employeeId }, select: { id: true } });
    if (user) await this.invalidate(user.id);
  }

  async forUser(userId: string, mfaVerified: boolean, sessionId?: string): Promise<Principal | null> {
    const mfa = mfaVerified || env().AUTH_DEV_MFA_BYPASS;
    const version = (await this.redis.get(`temper:accessver:${userId}`)) ?? '0';
    const cached = await this.readCache(userId, mfa, version);
    if (cached) return this.fromCache(userId, sessionId, cached);

    const user = await this.prisma.db.user.findUnique({
      where: { id: userId },
      include: { employee: true, roleAssignments: { where: { revokedAt: null } } },
    });
    if (!user || user.status !== 'ACTIVE' || user.deletedAt) return null;

    const assignments = user.roleAssignments.flatMap((a) => {
      if (!isRoleKey(a.role)) {
        this.log.warn(`Rôle inconnu ignoré : ${a.role} (attribution ${a.id})`);
        return [];
      }
      return [
        {
          role: a.role,
          siteIds: a.siteIds.length ? a.siteIds : undefined,
          departmentIds: a.departmentIds,
          teamIds: a.teamIds,
          validFrom: a.validFrom,
          validUntil: a.validUntil,
          source: a.source,
        },
      ];
    });

    const e = user.employee;
    const ctx: AccessContext = {
      principal: 'USER',
      userId: user.id,
      employee: e && e.status !== 'LEFT' ? { id: e.id, siteId: e.siteId, departmentId: e.departmentId, teamId: e.teamId } : null,
      assignments,
      mfaVerified: mfa,
    };
    const principal = this.build(ctx, {
      kind: 'USER',
      id: user.id,
      sessionId,
      email: user.email,
      employee: ctx.employee ? { ...ctx.employee, departmentId: e!.departmentId, teamId: e!.teamId, firstName: e!.preferredName ?? e!.firstName } : null,
    });
    await this.writeCache(userId, mfa, version, principal);
    return principal;
  }

  forDevice(deviceId: string, siteId: string): Principal {
    const ctx: AccessContext = {
      principal: 'DEVICE',
      userId: deviceId,
      deviceSiteId: siteId,
      assignments: [{ role: 'BORNE', siteIds: [siteId] }],
      mfaVerified: false,
    };
    return this.build(ctx, { kind: 'DEVICE', id: deviceId, employee: null, deviceSiteId: siteId });
  }

  private async readCache(userId: string, mfa: boolean, version: string): Promise<CachedAccess | null> {
    const raw = await this.redis.get(`temper:access:${userId}:${version}:${mfa ? '1' : '0'}`);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as CachedAccess;
    } catch {
      return null;
    }
  }

  /** N écrit pas si la version a changé pendant le calcul (droits déjà invalidés). */
  private async writeCache(userId: string, mfa: boolean, version: string, principal: Principal): Promise<void> {
    const current = (await this.redis.get(`temper:accessver:${userId}`)) ?? '0';
    if (current !== version) return;
    const payload: CachedAccess = {
      email: principal.email,
      employee: principal.employee,
      activeRoles: principal.activeRoles,
      mfaPending: principal.mfaPending,
      rules: principal.rules,
      prismaRules: principal.prismaRules,
      maxSessionMinutes: principal.maxSessionMinutes,
    };
    await this.redis.set(`temper:access:${userId}:${version}:${mfa ? '1' : '0'}`, JSON.stringify(payload), CACHE_TTL_SECONDS);
  }

  private fromCache(userId: string, sessionId: string | undefined, cached: CachedAccess): Principal {
    return {
      kind: 'USER',
      id: userId,
      sessionId,
      email: cached.email,
      employee: cached.employee,
      activeRoles: cached.activeRoles,
      mfaPending: cached.mfaPending,
      rules: cached.rules,
      prismaRules: cached.prismaRules,
      ability: createAppAbility(cached.rules),
      maxSessionMinutes: cached.maxSessionMinutes,
    };
  }

  private build(ctx: AccessContext, base: Pick<Principal, 'kind' | 'id' | 'employee'> & Partial<Principal>): Principal {
    const mongo = resolveAccess(ctx, 'mongo');
    const prisma = resolveAccess(ctx, 'prisma');
    return {
      ...base,
      activeRoles: mongo.activeRoles,
      mfaPending: mongo.mfaPending,
      rules: mongo.rules,
      prismaRules: prisma.rules,
      ability: createAppAbility(mongo.rules),
      maxSessionMinutes: mongo.maxSessionMinutes,
    } as Principal;
  }
}
