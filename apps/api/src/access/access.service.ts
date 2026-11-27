/**
 * Lecteur de porte, visiteurs et appel d évacuation.
 * Chaque passage ajoute un événement. Rien ne se corrige en place.
 * MAAYOUD
 */
import { ForbiddenException, HttpException, Injectable, NotFoundException } from '@nestjs/common';
import type { AccessDecideInput, EvacuationInput, VisitorArriveInput } from '@temper/shared';
import { prismaWhere } from '@temper/permissions';
import { badgeUidHash, randomToken } from '../common/crypto.js';
import { env } from '../config/env.js';
import { assertCan, type Principal } from '../permissions/principal.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { RedisService } from '../redis/redis.service.js';
import { type DoorFacts, type DoorWindow, decideAccess } from './decision.js';

const MUSTER = 'Point de rassemblement du parking nord';

@Injectable()
export class AccessDeskService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async decide(p: Principal, input: AccessDecideInput) {
    const db = this.prisma.db;
    const device = await db.device.findUnique({ where: { id: p.id } });
    if (!device || !device.accessZoneId) throw new HttpException({ code: 'VALIDATION_ERROR', field: 'device' }, 400);
    const zone = await db.accessZone.findUnique({ where: { id: device.accessZoneId } });
    if (!zone) throw new NotFoundException({ code: 'NOT_FOUND' });
    const now = new Date();
    if (device.status !== 'ACTIVE') {
      await db.accessEvent.create({
        data: { at: now, siteId: device.siteId, zoneId: zone.id, deviceId: device.id, direction: input.direction, result: 'DENIED', denyReason: 'DEVICE_OFFLINE' },
      });
      return { result: 'DENIED' as const, denyReason: 'DEVICE_OFFLINE' as const, zone: zone.code };
    }

    const badge = await db.badge.findUnique({ where: { uidHash: badgeUidHash(input.badgeUid, env().BADGE_UID_PEPPER) } });
    const employee = badge?.holderEmployeeId
      ? await db.employee.findUnique({
          where: { id: badge.holderEmployeeId },
          include: { trainings: { where: { status: 'COMPLETED' } }, medical: true, user: { include: { roleAssignments: { where: { revokedAt: null } } } } },
        })
      : null;
    const rules = await db.accessRule.findMany({ where: { zoneId: zone.id } });
    const live = rules.filter((rule) => (!rule.validFrom || rule.validFrom <= now) && (!rule.validUntil || rule.validUntil >= now));
    const roles = new Set((employee?.user?.roleAssignments ?? []).map((row) => row.role));
    const matches = (rule: (typeof live)[number]) => {
      if (rule.employeeId && rule.employeeId !== employee?.id) return false;
      if (rule.teamId && rule.teamId !== employee?.teamId) return false;
      if (rule.positionId && rule.positionId !== employee?.positionId) return false;
      if (rule.roleKey && !roles.has(rule.roleKey)) return false;
      return true;
    };
    const matching = live.filter(matches);
    const allowRules = live.filter((rule) => rule.allow);
    let rule: DoorFacts['rule'] = 'open';
    if (matching.some((item) => !item.allow)) rule = 'deny';
    else if (matching.some((item) => item.allow)) rule = 'allow';
    else if (allowRules.length > 0 || zone.level === 'CRITICAL') rule = 'closed';

    const scheduleSource = matching.find((item) => item.allow && item.schedule) ?? null;
    const personKey = employee?.id ?? badge?.visitorId ?? badge?.id;
    const inside = personKey
      ? (await db.accessEvent.findFirst({
          where: { zoneId: zone.id, result: 'GRANTED', OR: [{ employeeId: personKey }, { visitorId: personKey }, { badgeId: badge?.id }] },
          orderBy: { at: 'desc' },
        }))?.direction === 'IN'
      : false;
    const recent = await db.accessEvent.findMany({
      where: { zoneId: zone.id, result: 'GRANTED', at: { gte: new Date(now.getTime() - 18 * 3600_000) } },
      orderBy: { at: 'desc' },
      take: 2000,
    });
    const seen = new Set<string>();
    let occupancy = 0;
    for (const event of recent) {
      const key = event.employeeId ?? event.visitorId ?? event.badgeId ?? event.id;
      if (seen.has(key)) continue;
      seen.add(key);
      if (event.direction === 'IN') occupancy += 1;
    }

    const facts: DoorFacts = {
      now,
      direction: input.direction,
      badge: badge ? { status: badge.status, validFrom: badge.validFrom, validUntil: badge.validUntil, siteId: badge.siteId } : null,
      deviceSiteId: device.siteId,
      holderActive: !employee || (employee.status !== 'LEFT' && employee.status !== 'SUSPENDED'),
      zoneLevel: zone.level,
      requiredTrainings: zone.requiredTrainingTypes,
      requiredPpe: zone.requiredPpe,
      trainings: (employee?.trainings ?? []).map((row) => ({ type: row.type, validUntil: row.validUntil })),
      wornPpe: input.wornPpe ?? [],
      unfit: employee?.medical?.fitness === 'UNFIT' || employee?.medical?.fitness === 'TEMPORARILY_UNFIT',
      rule,
      schedule: windows(scheduleSource?.schedule),
      inside,
      occupancy,
      maxOccupancy: zone.maxOccupancy,
      antiPassback: zone.antiPassback,
    };
    const decision = decideAccess(facts);
    await db.accessEvent.create({
      data: {
        at: now,
        siteId: device.siteId,
        zoneId: zone.id,
        deviceId: device.id,
        badgeId: badge?.id,
        employeeId: badge?.holderEmployeeId,
        visitorId: badge?.visitorId,
        direction: input.direction,
        result: decision.result,
        denyReason: decision.denyReason,
      },
    });
    if (decision.denyReason === 'TRAINING_EXPIRED' && employee?.managerId) {
      const manager = await db.user.findUnique({ where: { employeeId: employee.managerId }, select: { id: true } });
      if (manager) {
        await db.notification.create({
          data: {
            userId: manager.id,
            kind: 'ACCESS',
            title: 'Formation expirée',
            body: `${employee.firstName} ${employee.lastName} : accès refusé au sas ${zone.name}.`,
            link: `/rh/employes/${employee.id}`,
            severity: 'WARNING',
          },
        });
      }
    }
    if (decision.denyReason === 'BADGE_INACTIVE' && badge && (badge.status === 'LOST' || badge.status === 'STOLEN')) {
      const watchers = await db.roleAssignment.findMany({
        where: { role: { in: ['AGENT_SECURITE', 'DIRECTEUR_SITE'] }, revokedAt: null },
        select: { userId: true },
      });
      const ids = [...new Set(watchers.map((row) => row.userId))];
      if (ids.length) {
        await db.notification.createMany({
          data: ids.map((userId) => ({
            userId,
            kind: 'ACCESS',
            title: 'Badge inactif présenté',
            body: `Un badge ${badge.status === 'LOST' ? 'perdu' : 'volé'} a été refusé au sas ${zone.name}.`,
            link: '/acces/badges',
            severity: 'CRITICAL' as const,
          })),
        });
      }
    }
    return { result: decision.result, denyReason: decision.denyReason, zone: zone.code };
  }

  async reportLoss(p: Principal, badgeId: string) {
    const db = this.prisma.db;
    const badge = await db.badge.findUnique({ where: { id: badgeId } });
    if (!badge) throw new NotFoundException({ code: 'NOT_FOUND' });
    assertCan(p, 'update', 'Badge', { id: badge.id, siteId: badge.siteId, holderEmployeeId: badge.holderEmployeeId, teamId: badge.teamId });
    await db.badge.update({ where: { id: badge.id }, data: { status: 'LOST' } });
    return { id: badge.id, status: 'LOST' as const };
  }

  async arrive(p: Principal, visitorId: string, input: VisitorArriveInput) {
    const db = this.prisma.db;
    const visitor = await db.visitor.findUnique({ where: { id: visitorId } });
    if (!visitor) throw new NotFoundException({ code: 'NOT_FOUND' });
    assertCan(p, 'update', 'Visitor', { id: visitor.id, siteId: visitor.siteId, hostEmployeeId: visitor.hostEmployeeId });
    if (visitor.status === 'ON_SITE') throw new HttpException({ code: 'CONFLICT' }, 409);
    const now = new Date();
    const uid = randomToken(8).toUpperCase();
    const updated = await db.$transaction(async (tx) => {
      const row = await tx.visitor.update({
        where: { id: visitor.id },
        data: {
          status: 'ON_SITE',
          arrivedAt: now,
          safetyBriefingAt: now,
          hygieneDeclarationAt: input.hygieneDeclared ? now : null,
        },
      });
      const badge = await tx.badge.create({
        data: {
          visitorId: visitor.id,
          siteId: visitor.siteId,
          uidHash: badgeUidHash(uid, env().BADGE_UID_PEPPER),
          uidLast4: uid.slice(-4),
          technology: 'QR',
          kind: 'VISITOR',
          status: 'ACTIVE',
          validUntil: new Date(now.getTime() + 12 * 3600_000),
          issuedById: p.id,
        },
      });
      return { visitor: row, badge };
    });
    return { id: updated.visitor.id, status: updated.visitor.status, badgeId: updated.badge.id, uidLast4: updated.badge.uidLast4, uid };
  }

  async leave(p: Principal, visitorId: string) {
    const db = this.prisma.db;
    const visitor = await db.visitor.findUnique({ where: { id: visitorId } });
    if (!visitor) throw new NotFoundException({ code: 'NOT_FOUND' });
    assertCan(p, 'update', 'Visitor', { id: visitor.id, siteId: visitor.siteId, hostEmployeeId: visitor.hostEmployeeId });
    const now = new Date();
    await db.$transaction(async (tx) => {
      await tx.visitor.update({ where: { id: visitor.id }, data: { status: 'LEFT', leftAt: now } });
      await tx.badge.updateMany({ where: { visitorId: visitor.id, status: 'ACTIVE' }, data: { status: 'RETURNED', returnedAt: now } });
    });
    return { id: visitor.id, status: 'LEFT' as const };
  }

  async evacuation(p: Principal) {
    const where = prismaWhere(p.prismaRules, 'read', 'AccessEvent');
    if (!where || !seesBeyondOwn(where)) throw new ForbiddenException({ code: 'FORBIDDEN' });
    const db = this.prisma.db;
    const siteId = p.employee?.siteId ?? (await db.site.findFirst({ where: { kind: 'FACTORY' } }))?.id;
    if (!siteId) return { generatedAt: new Date().toISOString(), muster: MUSTER, zones: [] };
    const since = new Date(Date.now() - 18 * 3600_000);
    const events = await db.accessEvent.findMany({
      where: { siteId, result: 'GRANTED', at: { gte: since } },
      orderBy: { at: 'desc' },
      take: 2000,
    });
    const seen = new Set<string>();
    const present: Array<{ key: string; zoneId: string | null; employeeId: string | null; visitorId: string | null }> = [];
    for (const event of events) {
      const key = event.employeeId ?? event.visitorId ?? event.badgeId ?? event.id;
      if (seen.has(key)) continue;
      seen.add(key);
      if (event.direction === 'IN') present.push({ key, zoneId: event.zoneId, employeeId: event.employeeId, visitorId: event.visitorId });
    }
    const visitors = await db.visitor.findMany({ where: { siteId, status: 'ON_SITE' }, select: { id: true, firstName: true, lastName: true } });
    const employees = await db.employee.findMany({
      where: { id: { in: present.flatMap((row) => (row.employeeId ? [row.employeeId] : [])) } },
      select: { id: true, firstName: true, lastName: true },
    });
    const zones = await db.accessZone.findMany({ where: { siteId }, select: { id: true, code: true, name: true } });
    const byName = new Map(employees.map((row) => [row.id, `${row.firstName} ${row.lastName}`]));
    const grouped = new Map<string, Array<{ name: string; kind: 'employee' | 'visitor' }>>();
    for (const row of present) {
      const zone = row.zoneId ?? 'site';
      const list = grouped.get(zone) ?? [];
      if (row.employeeId && byName.has(row.employeeId)) list.push({ name: byName.get(row.employeeId)!, kind: 'employee' });
      grouped.set(zone, list);
    }
    if (visitors.length) {
      const accueil = zones.find((zone) => zone.code === 'ACCUEIL')?.id ?? 'accueil';
      const list = grouped.get(accueil) ?? [];
      for (const visitor of visitors) list.push({ name: `${visitor.firstName} ${visitor.lastName}`, kind: 'visitor' });
      grouped.set(accueil, list);
    }
    return {
      generatedAt: new Date().toISOString(),
      muster: MUSTER,
      evacuation: (await this.redis.get(`temper:evac:${siteId}`)) === '1',
      zones: [...grouped.entries()].map(([zoneId, people]) => ({
        zoneId,
        code: zones.find((zone) => zone.id === zoneId)?.code ?? zoneId,
        name: zones.find((zone) => zone.id === zoneId)?.name ?? 'Site',
        people,
      })),
    };
  }

  async setEvacuation(p: Principal, input: EvacuationInput) {
    const siteId = p.employee?.siteId ?? (await this.prisma.db.site.findFirst({ where: { kind: 'FACTORY' } }))?.id;
    if (!siteId) throw new NotFoundException({ code: 'NOT_FOUND' });
    assertCan(p, 'update', 'AccessZone', { siteId });
    await this.redis.set(`temper:evac:${siteId}`, input.active ? '1' : '0', 24 * 3600);
    return { active: input.active, siteId };
  }
}

function seesBeyondOwn(where: Record<string, unknown>): boolean {
  if (Object.keys(where).length === 0) return true;
  return JSON.stringify(where).includes('siteId');
}

function windows(value: unknown): DoorWindow[] | null {
  if (!Array.isArray(value)) return null;
  const rows: DoorWindow[] = [];
  for (const item of value) {
    if (!item || typeof item !== 'object') continue;
    const row = item as { days?: unknown; from?: unknown; to?: unknown };
    if (!Array.isArray(row.days) || typeof row.from !== 'string' || typeof row.to !== 'string') continue;
    rows.push({ days: row.days.filter((day) => typeof day === 'number'), from: row.from, to: row.to });
  }
  return rows.length ? rows : null;
}
