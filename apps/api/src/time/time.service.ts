/**
 * Pointage : bornes (badge ou PIN), pointage mobile géorepéré, journée en cours, présence.
 * MAAYOUD
 */
import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import type { ClockKind as DbClockKind } from '@temper/db';
import { ROLES, type RoleKey, asSubject } from '@temper/permissions';
import { type KioskScanInput, type KioskScanResult, REALTIME_EVENTS, type SelfClockInput } from '@temper/shared';
import { badgeUidHash, verifyPassword } from '../common/crypto.js';
import { env } from '../config/env.js';
import { assertCan, type Principal } from '../permissions/principal.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { RealtimeGateway } from '../realtime/realtime.gateway.js';
import { DEFAULT_RULES, computeDay, haversineMeters, nextKind } from './time-rules.js';

const DOUBLE_SCAN_SECONDS = 60;
const LOOKBACK_HOURS = 16; // couvre les postes de nuit qui chevauchent minuit

const DEPT_TO_BUILDING: Record<string, string> = { PROD: 'PROD', QUAL: 'LABO', MAINT: 'ATELIER', LOG: 'ENT-PF', BOUT: 'BOUTIQUE' };

@Injectable()
export class TimeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly realtime: RealtimeGateway,
  ) {}

  /** Scan à une borne. Ne lève pas d'erreur métier : la borne affiche toujours un message clair. */
  async kioskScan(device: Principal, input: KioskScanInput): Promise<KioskScanResult> {
    const db = this.prisma.db;
    const siteId = device.deviceSiteId!;
    const at = input.at ? new Date(input.at) : new Date();
    if (Math.abs(Date.now() - at.getTime()) > 72 * 3_600_000) {
      return { ok: false, message: 'Horodatage de la borne invalide. Prévenez l accueil.', warnings: [] };
    }

    // Idempotence : la borne renvoie le même clientEventId après une coupure réseau
    const existing = await db.timeEntry.findUnique({ where: { clientEventId: input.clientEventId }, include: { employee: true } });
    if (existing) {
      return { ok: true, duplicate: true, kind: existing.kind as KioskScanResult['kind'], message: 'Pointage déjà enregistré', employee: { firstName: existing.employee.firstName, photoUrl: existing.employee.photoUrl }, at: existing.at.toISOString(), warnings: [] };
    }

    // Identification
    let employeeId: string | null = null;
    let badgeId: string | null = null;
    if (input.badgeUid) {
      const badge = await db.badge.findUnique({ where: { uidHash: badgeUidHash(input.badgeUid, env().BADGE_UID_PEPPER) } });
      if (!badge || !badge.holderEmployeeId) return this.deny(siteId, device.id, null, null, 'UNKNOWN_BADGE', 'Badge inconnu. Présentez-vous à l accueil.');
      if (badge.status !== 'ACTIVE' || (badge.validUntil && badge.validUntil < at)) {
        return this.deny(siteId, device.id, badge.id, badge.holderEmployeeId, 'BADGE_INACTIVE', 'Badge désactivé. Présentez-vous à l accueil.');
      }
      employeeId = badge.holderEmployeeId;
      badgeId = badge.id;
    } else {
      const emp = await db.employee.findUnique({ where: { employeeNumber: input.employeeNumber! }, include: { badges: { where: { status: 'ACTIVE', pinHash: { not: null } } } } });
      const pinOk = emp?.badges[0]?.pinHash ? await verifyPassword(emp.badges[0].pinHash, input.pin!) : false;
      if (!emp || !pinOk) return this.deny(siteId, device.id, null, emp?.id ?? null, 'UNKNOWN_BADGE', 'Matricule ou code incorrect.');
      employeeId = emp.id;
      badgeId = emp.badges[0]!.id;
    }

    const employee = await db.employee.findUniqueOrThrow({
      where: { id: employeeId },
      include: { department: true, trainings: { where: { type: 'FOOD_HYGIENE' }, orderBy: { validUntil: 'desc' }, take: 1 } },
    });
    if (employee.status !== 'ACTIVE' && employee.status !== 'ONBOARDING') {
      return this.deny(siteId, device.id, badgeId, employee.id, 'NO_RIGHT', 'Accès non autorisé.');
    }

    const last = await db.timeEntry.findFirst({
      where: { employeeId: employee.id, at: { gte: new Date(at.getTime() - LOOKBACK_HOURS * 3_600_000) } },
      orderBy: { at: 'desc' },
    });
    if (last && (at.getTime() - last.at.getTime()) / 1000 < DOUBLE_SCAN_SECONDS && !input.kind) {
      return { ok: true, duplicate: true, kind: last.kind as KioskScanResult['kind'], message: `C est noté ${employee.firstName}, déjà pointé à l instant.`, employee: { firstName: employee.firstName, photoUrl: employee.photoUrl }, at: last.at.toISOString(), warnings: [] };
    }

    const kind: DbClockKind = input.kind ?? nextKind(last?.kind);
    const entry = await db.timeEntry.create({
      data: {
        employeeId: employee.id,
        siteId: employee.siteId,
        departmentId: employee.departmentId,
        teamId: employee.teamId,
        at,
        kind,
        source: input.badgeUid ? 'BADGE' : 'KIOSK_PIN',
        deviceId: device.id,
        badgeId,
        isOffline: !!input.at,
        clientEventId: input.clientEventId,
      },
    });
    const dev = await db.device.findUnique({ where: { id: device.id }, select: { accessZoneId: true } });
    await db.accessEvent.create({ data: { at, siteId, zoneId: dev?.accessZoneId, deviceId: device.id, badgeId, employeeId: employee.id, direction: kind === 'OUT' ? 'OUT' : 'IN', result: 'GRANTED' } });

    const warnings: string[] = [];
    const hygiene = employee.trainings[0];
    if (employee.department && ['PROD', 'QUAL'].includes(employee.department.code) && (!hygiene?.validUntil || hygiene.validUntil < at)) {
      warnings.push('Formation hygiène expirée : l accès aux zones de production sera refusé. Contactez votre responsable.');
    }

    const building = DEPT_TO_BUILDING[employee.department?.code ?? ''] ?? 'SIEGE';
    const delta = kind === 'IN' ? 1 : kind === 'OUT' ? -1 : 0;
    this.realtime.toSite(employee.siteId, REALTIME_EVENTS.presenceChanged, { buildingCode: building, delta });
    this.realtime.toPresence(employee.siteId, employee.teamId, REALTIME_EVENTS.presenceChanged, {
      buildingCode: building,
      delta,
      employee: { id: employee.id, name: `${employee.firstName} ${employee.lastName}`, teamId: employee.teamId },
    });

    const message =
      kind === 'IN' ? `Bonjour ${employee.firstName}, bonne journée !` : kind === 'OUT' ? `Merci ${employee.firstName}, bonne fin de journée !` : kind === 'BREAK_START' ? `Bonne pause ${employee.firstName}` : `Bon retour ${employee.firstName}`;
    return { ok: true, kind: kind as KioskScanResult['kind'], message, employee: { firstName: employee.firstName, photoUrl: employee.photoUrl }, at: entry.at.toISOString(), warnings };
  }

  private async deny(siteId: string, deviceId: string, badgeId: string | null, employeeId: string | null, reason: 'UNKNOWN_BADGE' | 'BADGE_INACTIVE' | 'NO_RIGHT', message: string): Promise<KioskScanResult> {
    await this.prisma.db.accessEvent.create({ data: { at: new Date(), siteId, deviceId, badgeId, employeeId, direction: 'IN', result: 'DENIED', denyReason: reason } });
    return { ok: false, message, warnings: [] };
  }

  /** Pointage depuis le téléphone ou le navigateur : autorisé par rôle et géorepéré. */
  async selfClock(p: Principal, input: SelfClockInput) {
    const e = p.employee;
    if (!e) throw new ForbiddenException({ code: 'NO_EMPLOYEE' });
    const db = this.prisma.db;
    const setting = await db.setting.findFirst({ where: { key: 'time.rules' } });
    const allowedRoles = ((setting?.value as { mobileClockingAllowedRoles?: RoleKey[] } | null)?.mobileClockingAllowedRoles ?? []) as RoleKey[];
    if (!p.activeRoles.some((r) => allowedRoles.includes(r))) {
      throw new ForbiddenException({ code: 'MOBILE_CLOCKING_DISABLED', message: 'Le pointage mobile n est pas activé pour votre fonction. Utilisez la borne.' });
    }
    const site = await db.site.findUniqueOrThrow({ where: { id: e.siteId } });
    const isFieldRole = p.activeRoles.some((r) => r === 'CHAUFFEUR' || r === 'COMMERCIAL');
    if (!isFieldRole) {
      if (input.latitude === undefined || input.longitude === undefined || !site.latitude || !site.longitude) {
        throw new BadRequestException({ code: 'LOCATION_REQUIRED' });
      }
      const dist = haversineMeters(input.latitude, input.longitude, Number(site.latitude), Number(site.longitude));
      if (dist > site.geofenceRadiusM + (input.accuracyM ?? 0)) {
        throw new ForbiddenException({ code: 'OUTSIDE_GEOFENCE', distanceM: Math.round(dist) });
      }
    }
    const data = { employeeId: e.id, siteId: e.siteId, departmentId: e.departmentId, teamId: e.teamId, source: 'MOBILE' as const };
    assertCan(p, 'create', 'TimeEntry', { ...data });
    const last = await db.timeEntry.findFirst({ where: { employeeId: e.id, at: { gte: new Date(Date.now() - LOOKBACK_HOURS * 3_600_000) } }, orderBy: { at: 'desc' } });
    const entry = await db.timeEntry.upsert({
      where: { clientEventId: input.clientEventId },
      update: {},
      create: { ...data, at: new Date(), kind: input.kind ?? nextKind(last?.kind), clientEventId: input.clientEventId, latitude: input.latitude, longitude: input.longitude, accuracyM: input.accuracyM },
    });
    return { id: entry.id, kind: entry.kind, at: entry.at };
  }

  /** Ma journée : planning, pointages, calcul en direct. */
  async myToday(p: Principal) {
    const e = p.employee;
    if (!e) return null;
    const db = this.prisma.db;
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const [entries, schedule] = await Promise.all([
      db.timeEntry.findMany({ where: { employeeId: e.id, at: { gte: new Date(start.getTime() - 8 * 3_600_000) } }, orderBy: { at: 'asc' } }),
      db.schedule.findFirst({ where: { employeeId: e.id, date: start, status: { not: 'CANCELLED' } } }),
    ]);
    const plan = schedule ? { start: schedule.plannedStart, end: schedule.plannedEnd, breakMinutes: schedule.plannedBreakMin } : null;
    const day = computeDay(entries.map((x) => ({ at: x.at, kind: x.kind })), plan, DEFAULT_RULES, null, new Date());
    return { schedule, entries, day, nextAction: nextKind(entries.at(-1)?.kind) };
  }

  /** Présence du site : nominative si autorisé, sinon uniquement des compteurs. */
  async presence(p: Principal, siteId: string) {
    const db = this.prisma.db;
    const since = new Date(Date.now() - LOOKBACK_HOURS * 3_600_000);
    const entries = await db.timeEntry.findMany({
      where: { siteId, at: { gte: since } },
      orderBy: { at: 'asc' },
      select: { employeeId: true, kind: true, at: true, teamId: true, departmentId: true, employee: { select: { firstName: true, lastName: true, department: { select: { code: true } } } } },
    });
    const lastByEmp = new Map<string, (typeof entries)[number]>();
    for (const x of entries) lastByEmp.set(x.employeeId, x);
    const present = [...lastByEmp.values()].filter((x) => x.kind !== 'OUT');
    const byBuilding: Record<string, number> = {};
    for (const x of present) {
      const b = DEPT_TO_BUILDING[x.employee.department?.code ?? ''] ?? 'SIEGE';
      byBuilding[b] = (byBuilding[b] ?? 0) + 1;
    }
    const people = present
      .filter((x) => p.ability.can('read', asSubject('WorldPresence', { siteId, teamId: x.teamId, departmentId: x.departmentId })))
      .map((x) => ({ employeeId: x.employeeId, name: `${x.employee.firstName} ${x.employee.lastName}`, since: x.at, onBreak: x.kind === 'BREAK_START' }));
    return { total: present.length, byBuilding, people, nominative: people.length > 0 };
  }

  /** Tenue d'avatar d'un employé : premier rôle par défaut de son poste. */
  static outfitFor(defaultRoles: string[]) {
    const r = defaultRoles.find((x): x is RoleKey => x in ROLES);
    return r ? ROLES[r].avatar : 'chemise';
  }
}
