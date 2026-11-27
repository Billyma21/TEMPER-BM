/**
 * Authentification : mot de passe argon2id, verrouillage progressif, sessions opaques (cookie httpOnly),
 * second facteur TOTP, authentification des appareils.
 * MAAYOUD
 */
import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { MODULES, openWorldZones, selfServiceSubjects, visibleModules } from '@temper/permissions';
import type { LoginInput } from '@temper/shared';
import { decryptField, randomToken, safeEqual, sha256, verifyPassword } from '../common/crypto.js';
import { env } from '../config/env.js';
import { AccessService } from '../permissions/access.service.js';
import type { Principal } from '../permissions/principal.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { verifyTotp } from './totp.js';

const LOCKOUT_THRESHOLD = 5;
const LOCKOUT_MINUTES = 15;
const IDLE_MINUTES = 30;

/** Empreinte factice : le temps de réponse est identique que le compte existe ou non. */
const DUMMY_HASH = '$argon2id$v=19$m=19456,t=2,p=1$c29tZXNhbHRzb21lc2FsdA$K9n3lJ2yR5pQ4c0n1m8bS3S3cXJ0aQqvYp1z0m3Yq2c';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: AccessService,
  ) {}

  async login(input: LoginInput, ip?: string, userAgent?: string) {
    const db = this.prisma.db;
    const user = await db.user.findUnique({ where: { email: input.email } });
    const ok = user?.passwordHash ? await verifyPassword(user.passwordHash, input.password) : await verifyPassword(DUMMY_HASH, input.password).catch(() => false);

    if (!user || !ok || user.status !== 'ACTIVE' || (user.lockedUntil && user.lockedUntil > new Date())) {
      if (user) {
        const failed = user.failedLoginCount + 1;
        await db.user.update({
          where: { id: user.id },
          data: {
            failedLoginCount: failed,
            lockedUntil: failed >= LOCKOUT_THRESHOLD ? new Date(Date.now() + LOCKOUT_MINUTES * 60_000) : user.lockedUntil,
          },
        });
      }
      // Message volontairement identique dans tous les cas (pas d'énumération de comptes)
      throw new UnauthorizedException({ code: 'INVALID_CREDENTIALS', message: 'Identifiants invalides' });
    }

    const token = randomToken();
    const principal = await this.access.forUser(user.id, false);
    const minutes = principal?.maxSessionMinutes ?? 60;
    const session = await db.session.create({
      data: { userId: user.id, tokenHash: sha256(token), ip, userAgent, expiresAt: new Date(Date.now() + minutes * 60_000) },
    });
    await db.user.update({ where: { id: user.id }, data: { failedLoginCount: 0, lockedUntil: null, lastLoginAt: new Date() } });
    return { token, sessionId: session.id, expiresAt: session.expiresAt, mfaRequired: user.mfaEnabled && !env().AUTH_DEV_MFA_BYPASS };
  }

  async verifyMfa(principal: Principal, code: string) {
    if (!principal.sessionId) throw new ForbiddenException();
    const user = await this.prisma.db.user.findUniqueOrThrow({ where: { id: principal.id } });
    if (!user.mfaEnabled || !user.mfaSecretEnc) throw new ForbiddenException({ code: 'MFA_NOT_ENROLLED' });
    const secret = decryptField(user.mfaSecretEnc, env().FIELD_ENCRYPTION_KEY);
    const trimmed = code.trim();
    const totpOk = /^\d{6}$/.test(trimmed) && verifyTotp(secret, trimmed);
    if (!totpOk) {
      const hash = sha256(trimmed.toLowerCase());
      const index = user.recoveryCodesHash.indexOf(hash);
      if (index < 0) throw new UnauthorizedException({ code: 'INVALID_MFA_CODE' });
      await this.prisma.db.user.update({
        where: { id: user.id },
        data: { recoveryCodesHash: user.recoveryCodesHash.filter((_, i) => i !== index) },
      });
    }
    const refreshed = await this.access.forUser(user.id, true, principal.sessionId);
    const session = await this.prisma.db.session.findUniqueOrThrow({ where: { id: principal.sessionId } });
    const capped = new Date(Math.min(session.expiresAt.getTime(), Date.now() + (refreshed?.maxSessionMinutes ?? 60) * 60_000));
    await this.prisma.db.session.update({ where: { id: principal.sessionId }, data: { mfaVerifiedAt: new Date(), expiresAt: capped } });
    return { ok: true };
  }

  async authenticateSession(token: string): Promise<Principal | null> {
    const db = this.prisma.db;
    const session = await db.session.findUnique({ where: { tokenHash: sha256(token) } });
    const now = Date.now();
    if (!session || session.revokedAt || session.expiresAt.getTime() < now) return null;
    if (now - session.lastSeenAt.getTime() > IDLE_MINUTES * 60_000) {
      await db.session.update({ where: { id: session.id }, data: { revokedAt: new Date() } });
      return null;
    }
    if (now - session.lastSeenAt.getTime() > 60_000) {
      await db.session.update({ where: { id: session.id }, data: { lastSeenAt: new Date() } });
    }
    return this.access.forUser(session.userId, !!session.mfaVerifiedAt, session.id);
  }

  /** Format : "<deviceId>.<secret>" */
  async authenticateDevice(credential: string): Promise<Principal | null> {
    const [id, secret] = credential.split('.');
    if (!id || !secret) return null;
    const device = await this.prisma.db.device.findUnique({ where: { id } });
    if (!device || device.status !== 'ACTIVE' || !safeEqual(device.secretHash, sha256(secret))) return null;
    await this.prisma.db.device.update({ where: { id }, data: { lastSeenAt: new Date() } });
    return this.access.forDevice(device.id, device.siteId);
  }

  async logout(principal: Principal) {
    if (principal.sessionId) {
      await this.prisma.db.session.update({ where: { id: principal.sessionId }, data: { revokedAt: new Date() } });
    }
    if (principal.kind === 'USER') await this.access.invalidate(principal.id);
  }

  /** Profil + droits effectifs envoyés au front (le front ne décide jamais seul : l'API revérifie tout). */
  async me(p: Principal) {
    const user = await this.prisma.db.user.findUniqueOrThrow({
      where: { id: p.id },
      select: { id: true, email: true, locale: true, theme: true, mfaEnabled: true, worldPrefs: true, employee: { select: { id: true, firstName: true, lastName: true, preferredName: true, jobTitle: true, photoUrl: true, siteId: true, teamId: true, departmentId: true, xp: true, level: true } } },
    });
    const modules = visibleModules(p.ability).map((k) => ({ key: k, ...MODULES[k] }));
    return {
      user,
      activeRoles: p.activeRoles,
      mfaPending: p.mfaPending,
      rules: p.rules,
      modules,
      selfService: selfServiceSubjects(p.ability),
      openWorldZones: openWorldZones(p.ability),
    };
  }
}
