/**
 * Construit l'instantané du monde 3D pour l'utilisateur, strictement filtré par ses droits.
 * Le monde est une vue : chaque élément provient d'une requête soumise aux mêmes règles que l'interface classique.
 * MAAYOUD
 */
import { Injectable } from '@nestjs/common';
import { MODULES, type ModuleKey, ROLES, type RoleKey, asSubject, openWorldZones, prismaWhere, visibleModules } from '@temper/permissions';
import type { AvatarOutfit, LeadRoom, WorldAlert, WorldSnapshot } from '@temper/shared';
import type { Principal } from '../permissions/principal.js';
import { PrismaService } from '../prisma/prisma.service.js';

const KIND_TO_ZONE: Record<string, string> = {
  OFFICE: 'siege',
  PRODUCTION: 'usine',
  LAB: 'labo',
  WORKSHOP: 'atelier',
  WAREHOUSE: 'entrepot',
  LOADING_DOCK: 'quai',
  GATEHOUSE: 'poste-garde',
  STORE: 'boutique',
  UTILITY: 'usine',
};
const DEPT_TO_BUILDING: Record<string, string> = { PROD: 'PROD', QUAL: 'LABO', MAINT: 'ATELIER', LOG: 'ENT-PF', BOUT: 'BOUTIQUE' };
const XP_PER_LEVEL = 512;

@Injectable()
export class WorldService {
  constructor(private readonly prisma: PrismaService) {}

  async snapshot(p: Principal, siteIdParam?: string): Promise<WorldSnapshot> {
    const db = this.prisma.db;
    const siteId = siteIdParam ?? p.employee?.siteId;
    const site = siteId ? await db.site.findUnique({ where: { id: siteId } }) : await db.site.findFirst({ where: { kind: 'FACTORY' } });
    if (!site) throw new Error('Site introuvable');

    const zones = new Set(openWorldZones(p.ability));
    const modules = visibleModules(p.ability);
    const routeForZone = (zone: string) => {
      const m = modules.find((k: ModuleKey) => MODULES[k].worldZone === zone);
      return m ? MODULES[m].route : null;
    };

    // Présence (toujours agrégée ; nominative selon droits)
    const since = new Date(Date.now() - 16 * 3_600_000);
    const entries = await db.timeEntry.findMany({
      where: { siteId: site.id, at: { gte: since } },
      orderBy: { at: 'asc' },
      select: {
        kind: true,
        employeeId: true,
        teamId: true,
        departmentId: true,
        employee: { select: { firstName: true, level: true, department: { select: { code: true } }, position: { select: { defaultRoles: true } } } },
      },
    });
    const last = new Map<string, (typeof entries)[number]>();
    for (const e of entries) last.set(e.employeeId, e);
    const present = [...last.values()].filter((e) => e.kind !== 'OUT');
    const occupancy: Record<string, number> = {};
    const avatars: WorldSnapshot['avatars'] = present.map((e) => {
      const building = DEPT_TO_BUILDING[e.employee.department?.code ?? ''] ?? 'SIEGE';
      occupancy[building] = (occupancy[building] ?? 0) + 1;
      const isMe = e.employeeId === p.employee?.id;
      const named = isMe || p.ability.can('read', asSubject('WorldPresence', { siteId: site.id, teamId: e.teamId, departmentId: e.departmentId }));
      const role = e.employee.position?.defaultRoles.find((r): r is RoleKey => r in ROLES);
      return {
        id: named ? e.employeeId : `anon-${Math.abs(hashCode(e.employeeId))}`,
        name: named ? e.employee.firstName : null,
        outfit: (role ? ROLES[role].avatar : 'chemise') as AvatarOutfit,
        buildingCode: building,
        isMe,
        level: named ? e.employee.level : undefined,
      };
    });

    const buildings = (await db.building.findMany({ where: { siteId: site.id } })).map((b) => {
      const zone = KIND_TO_ZONE[b.kind] ?? 'campus';
      return {
        id: b.id,
        code: b.code,
        name: b.name,
        kind: b.kind,
        x: b.worldX,
        z: b.worldZ,
        width: b.width,
        depth: b.depth,
        floors: b.floors,
        color: b.color,
        zone,
        locked: !zones.has(zone),
        occupancy: occupancy[b.code] ?? 0,
        route: routeForZone(zone),
      };
    });

    const machineWhere = prismaWhere(p.prismaRules, 'read', 'Machine');
    const machines = machineWhere
      ? (await db.machine.findMany({ where: { AND: [machineWhere, { siteId: site.id }] }, include: { line: { select: { code: true } } } })).map((m) => ({
          id: m.id,
          code: m.code,
          name: m.name,
          type: m.type,
          status: m.status,
          lineCode: m.line?.code ?? null,
          x: m.worldX,
          z: m.worldZ,
        }))
      : [];

    // Bureau commercial : chaque prospect est un personnage dans la pièce de son étape
    const leadWhere = prismaWhere(p.prismaRules, 'read', 'Lead');
    const leads = leadWhere
      ? (await db.lead.findMany({ where: { AND: [leadWhere, { stage: { not: 'LOST' } }] }, select: { id: true, company: true, stage: true, score: true, ownerEmployeeId: true }, take: 500 })).map((l) => ({
          id: l.id,
          company: l.company,
          stage: l.stage as LeadRoom,
          score: l.score,
          mine: l.ownerEmployeeId === p.employee?.id,
        }))
      : null;

    // Ville : chaque client est un lot, la commande en cours est un chantier qui monte
    const custWhere = prismaWhere(p.prismaRules, 'read', 'Customer', { includeFieldRestricted: true });
    const soWhere = prismaWhere(p.prismaRules, 'read', 'SalesOrder');
    let city: WorldSnapshot['city'] = null;
    if (custWhere) {
      const customers = await db.customer.findMany({ where: { AND: [custWhere, { worldX: { not: null } }] }, select: { id: true, name: true, segment: true, worldX: true, worldZ: true, buildingStyle: true } });
      const orders = soWhere
        ? await db.salesOrder.findMany({ where: { AND: [soWhere, { customerId: { in: customers.map((c) => c.id) } }, { status: { not: 'CANCELLED' } }] }, orderBy: { updatedAt: 'desc' }, select: { customerId: true, number: true, progress: true, status: true } })
        : [];
      city = customers.map((c) => {
        const o = orders.find((x) => x.customerId === c.id);
        return { customerId: c.id, name: c.name, segment: c.segment, x: c.worldX!, z: c.worldZ!, style: c.buildingStyle, orderNumber: o?.number ?? null, progress: o?.progress ?? 0, status: o?.status ?? null, delivered: o ? ['DELIVERED', 'INVOICED'].includes(o.status) : false };
      });
    }

    // Quêtes et progression personnelles
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const me = p.employee ? await db.employee.findUnique({ where: { id: p.employee.id }, select: { firstName: true, preferredName: true, xp: true, questsEnabled: true, position: { select: { defaultRoles: true } } } }) : null;
    const quests = me?.questsEnabled
      ? (await db.quest.findMany({ where: { employeeId: p.employee!.id, date: today }, orderBy: { status: 'asc' }, include: { template: { select: { xpReward: true } } } })).map((q) => ({ id: q.id, title: q.title, progress: q.progress, target: q.target, status: q.status as 'ACTIVE' | 'COMPLETED' | 'EXPIRED', xp: q.template?.xpReward ?? q.xpAwarded }))
      : [];

    const alerts = await this.alerts(p, site.id);
    const kpis = await this.kpis(p, site.id, present.length);
    const myRole = me?.position?.defaultRoles.find((r): r is RoleKey => r in ROLES);

    return {
      generatedAt: new Date().toISOString(),
      site: { id: site.id, name: site.name, code: site.code },
      me: me
        ? { firstName: me.preferredName ?? me.firstName, level: 1 + Math.floor(me.xp / XP_PER_LEVEL), xp: me.xp, xpToNext: XP_PER_LEVEL - (me.xp % XP_PER_LEVEL), outfit: (myRole ? ROLES[myRole].avatar : 'chemise') as AvatarOutfit, streakDays: await this.streak(p.employee!.id) }
        : null,
      openZones: [...zones],
      buildings,
      machines,
      avatars,
      leads,
      city,
      quests,
      alerts,
      kpis,
    };
  }

  private async alerts(p: Principal, siteId: string): Promise<WorldAlert[]> {
    const db = this.prisma.db;
    const out: WorldAlert[] = [];
    const mw = prismaWhere(p.prismaRules, 'read', 'Machine');
    if (mw) {
      for (const m of await db.machine.findMany({ where: { AND: [mw, { siteId, status: 'BREAKDOWN' }] }, include: { line: true } })) {
        out.push({ id: `m-${m.id}`, severity: 'CRITICAL', label: `${m.name} (${m.line?.code ?? ''}) en panne`, buildingCode: 'PROD', route: '/maintenance' });
      }
    }
    const tw = prismaWhere(p.prismaRules, 'read', 'Tool');
    if (tw) {
      const overdue = await db.tool.count({ where: { AND: [tw, { siteId, requiresCalibration: true, nextCalibrationAt: { lt: new Date() } }] } });
      if (overdue) out.push({ id: 'cal', severity: 'WARNING', label: `${overdue} instrument(s) à étalonner`, buildingCode: 'ATELIER', route: '/outils' });
    }
    const nw = prismaWhere(p.prismaRules, 'read', 'NonConformity');
    if (nw) {
      const open = await db.nonConformity.count({ where: { AND: [nw, { siteId, status: { not: 'CLOSED' } }] } });
      if (open) out.push({ id: 'nc', severity: 'WARNING', label: `${open} non-conformité(s) ouverte(s)`, buildingCode: 'LABO', route: '/qualite' });
    }
    const sw = prismaWhere(p.prismaRules, 'read', 'StockLot');
    if (sw) {
      const lots = await db.stockLot.groupBy({ by: ['itemId'], where: { AND: [sw, { siteId }] }, _sum: { quantity: true } });
      const items = await db.item.findMany({ where: { id: { in: lots.map((l) => l.itemId) }, minStock: { not: null } }, select: { id: true, name: true, minStock: true } });
      for (const it of items) {
        const qty = Number(lots.find((l) => l.itemId === it.id)?._sum.quantity ?? 0);
        if (qty < Number(it.minStock)) out.push({ id: `s-${it.id}`, severity: 'WARNING', label: `Stock bas : ${it.name}`, buildingCode: 'ENT-MP', route: '/stock' });
      }
    }
    const trw = prismaWhere(p.prismaRules, 'read', 'Training');
    if (trw && p.activeRoles.some((r) => r !== 'EMPLOYE')) {
      const expired = await db.training.count({ where: { AND: [trw, { siteId, type: 'FOOD_HYGIENE', validUntil: { lt: new Date() } }, { NOT: { employeeId: p.employee?.id ?? '' } }] } });
      if (expired) out.push({ id: 'tr', severity: 'WARNING', label: `${expired} formation(s) hygiène expirée(s) dans votre périmètre`, buildingCode: 'SIEGE', route: '/rh' });
    }
    return out;
  }

  private async kpis(p: Principal, siteId: string, presentCount: number) {
    const db = this.prisma.db;
    const k: WorldSnapshot['kpis'] = [{ label: 'Présents sur site', value: String(presentCount) }];
    if (prismaWhere(p.prismaRules, 'read', 'ProductionOrder')) {
      const snaps = await db.oeeSnapshot.findMany({ where: { siteId }, orderBy: { date: 'desc' }, take: 8 });
      if (snaps.length) k.push({ label: 'TRS moyen (veille)', value: `${Math.round((snaps.reduce((s, x) => s + Number(x.oee), 0) / snaps.length) * 100)} %` });
    }
    const sw = prismaWhere(p.prismaRules, 'read', 'SalesOrder');
    if (sw) k.push({ label: 'Commandes en cours', value: String(await db.salesOrder.count({ where: { AND: [sw, { status: { in: ['CONFIRMED', 'IN_PRODUCTION', 'PICKING', 'READY', 'SHIPPED'] } }] } })) });
    const ww = prismaWhere(p.prismaRules, 'read', 'WorkOrder');
    if (ww) k.push({ label: 'Interventions ouvertes', value: String(await db.workOrder.count({ where: { AND: [ww, { siteId, status: { notIn: ['DONE', 'CLOSED', 'CANCELLED'] } }] } })) });
    return k;
  }

  private async streak(employeeId: string): Promise<number> {
    const done = await this.prisma.db.quest.findMany({ where: { employeeId, status: 'COMPLETED', date: { gte: new Date(Date.now() - 60 * 86_400_000) } }, select: { date: true }, distinct: ['date'], orderBy: { date: 'desc' } });
    let streak = 0;
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    for (const q of done) {
      if (q.date.getTime() === d.getTime()) {
        streak++;
        d.setDate(d.getDate() - 1);
      } else if (q.date.getTime() < d.getTime()) break;
    }
    return streak;
  }
}

function hashCode(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return h;
}
