/**
 * Calcul des règles effectives d'un utilisateur ou d'un appareil.
 * Produit des règles CASL brutes, dans le dialecte du consommateur :
 * - 'mongo'  : front (createMongoAbility), conditions { champ: { $in: [...] } }
 * - 'prisma' : API (@casl/prisma), conditions { champ: { in: [...] } }
 *
 * MAAYOUD
 */
import {
  type Action,
  type AppSubject,
  type Scope,
  type SubjectName,
  SUBJECTS,
  SUBJECT_NAMES,
} from './catalog';
import { type Grant, type NeutralCondition, type RoleKey, ROLES, expandRole } from './roles';

export type Dialect = 'mongo' | 'prisma';

export interface RoleAssignmentContext {
  role: RoleKey;
  siteIds?: readonly string[];
  departmentIds?: readonly string[];
  teamIds?: readonly string[];
  validFrom?: Date | string | null;
  validUntil?: Date | string | null;
  source?: 'DIRECT' | 'DELEGATION' | 'BREAK_GLASS';
}

export interface AccessContext {
  principal: 'USER' | 'DEVICE';
  userId: string;
  employee?: {
    id: string;
    siteId: string;
    departmentId?: string | null;
    teamId?: string | null;
  } | null;
  /** Pour un appareil : le site où il est installé. */
  deviceSiteId?: string | null;
  assignments: readonly RoleAssignmentContext[];
  mfaVerified: boolean;
  now?: Date;
}

export interface RawRule {
  action: Action | Action[];
  subject: AppSubject | AppSubject[];
  conditions?: Record<string, unknown>;
  fields?: string[];
  inverted?: boolean;
  reason?: string;
}

export type InactiveReason =
  | 'MFA_REQUIRED'
  | 'EXPIRED'
  | 'NOT_YET_VALID'
  | 'NOT_ASSIGNABLE'
  | 'WRONG_PRINCIPAL';

export interface ResolvedAccess {
  rules: RawRule[];
  activeRoles: RoleKey[];
  inactive: Array<{ role: RoleKey; reason: InactiveReason }>;
  /** Vrai si au moins un rôle attend la validation du second facteur. */
  mfaPending: boolean;
  /** Durée de session autorisée : la plus courte des rôles actifs. */
  maxSessionMinutes: number;
}

interface ScopeIds {
  siteIds: readonly string[];
  departmentIds: readonly string[];
  teamIds: readonly string[];
}

const toDate = (d: Date | string | null | undefined) => (d ? new Date(d) : null);

function translate(cond: NeutralCondition | undefined, dialect: Dialect): Record<string, unknown> {
  if (!cond) return {};
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(cond)) {
    if (v !== null && typeof v === 'object' && 'in' in v) {
      out[k] = dialect === 'mongo' ? { $in: [...v.in] } : { in: [...v.in] };
    } else {
      out[k] = v;
    }
  }
  return out;
}

function inCondition(field: string, ids: readonly string[], dialect: Dialect) {
  return { [field]: dialect === 'mongo' ? { $in: [...ids] } : { in: [...ids] } };
}

/**
 * Condition de portée pour un sujet donné.
 * Retourne null si la portée ne peut pas s'appliquer (droit ignoré, par sécurité).
 */
function scopeCondition(
  subject: SubjectName,
  scope: Scope,
  ids: ScopeIds,
  ctx: AccessContext,
  dialect: Dialect,
): Record<string, unknown> | null {
  const own = SUBJECTS[subject].ownership as {
    own?: { field: string; source: 'employee' | 'user' };
    team?: string;
    department?: string;
    site?: string;
  };
  switch (scope) {
    case 'all':
      return {};
    case 'own': {
      if (!own.own) return null;
      const id = own.own.source === 'employee' ? ctx.employee?.id : ctx.userId;
      return id ? { [own.own.field]: id } : null;
    }
    case 'team':
      return own.team && ids.teamIds.length ? inCondition(own.team, ids.teamIds, dialect) : null;
    case 'department':
      return own.department && ids.departmentIds.length
        ? inCondition(own.department, ids.departmentIds, dialect)
        : null;
    case 'site':
      return own.site && ids.siteIds.length ? inCondition(own.site, ids.siteIds, dialect) : null;
  }
}

function rulesFromGrant(
  grant: Grant,
  ids: ScopeIds,
  ctx: AccessContext,
  dialect: Dialect,
  reason: string,
): RawRule[] {
  const extra = translate(grant.conditions, dialect);
  const fields = grant.fields ? [...grant.fields] : undefined;
  const hasExtra = Object.keys(extra).length > 0;

  if (grant.scope === 'all') {
    return [
      {
        action: [...grant.actions],
        subject: [...grant.subjects],
        ...(hasExtra ? { conditions: extra } : {}),
        ...(fields ? { fields } : {}),
        reason,
      },
    ];
  }

  const out: RawRule[] = [];
  for (const s of grant.subjects) {
    if (s === 'all') continue; // une portée restreinte sur "tout" n'a pas de sens : ignorée
    const sc = scopeCondition(s, grant.scope, ids, ctx, dialect);
    if (sc === null) continue;
    out.push({
      action: [...grant.actions],
      subject: s,
      conditions: { ...sc, ...extra },
      ...(fields ? { fields } : {}),
      reason,
    });
  }
  return out;
}

export function resolveAccess(ctx: AccessContext, dialect: Dialect = 'mongo'): ResolvedAccess {
  const now = ctx.now ?? new Date();
  const rules: RawRule[] = [];
  const activeRoles: RoleKey[] = [];
  const inactive: ResolvedAccess['inactive'] = [];
  let mfaPending = false;
  let maxSessionMinutes = Number.POSITIVE_INFINITY;

  // 1. Socle automatique
  if (ctx.principal === 'USER') {
    const baseRole: RoleKey = ctx.employee ? 'EMPLOYE' : 'EXTERNE';
    const baseIds: ScopeIds = {
      siteIds: ctx.employee ? [ctx.employee.siteId] : [],
      departmentIds: ctx.employee?.departmentId ? [ctx.employee.departmentId] : [],
      teamIds: ctx.employee?.teamId ? [ctx.employee.teamId] : [],
    };
    for (const gr of ROLES[baseRole].grants) {
      rules.push(...rulesFromGrant(gr, baseIds, ctx, dialect, `${baseRole}|${gr.scope}`));
    }
    activeRoles.push(baseRole);
    maxSessionMinutes = Math.min(maxSessionMinutes, ROLES[baseRole].maxSessionMinutes);
  }

  // 2. Rôles attribués
  for (const a of ctx.assignments) {
    const def = ROLES[a.role];
    if (def.base) {
      inactive.push({ role: a.role, reason: 'NOT_ASSIGNABLE' });
      continue;
    }
    const isDeviceRole = def.category === 'appareil';
    if ((ctx.principal === 'DEVICE') !== isDeviceRole) {
      inactive.push({ role: a.role, reason: 'WRONG_PRINCIPAL' });
      continue;
    }
    const from = toDate(a.validFrom);
    const until = toDate(a.validUntil);
    if (from && from > now) {
      inactive.push({ role: a.role, reason: 'NOT_YET_VALID' });
      continue;
    }
    if (until && until < now) {
      inactive.push({ role: a.role, reason: 'EXPIRED' });
      continue;
    }
    const chain = expandRole(a.role);
    const needsMfa = chain.some((r) => ROLES[r].requiresMfa);
    if (needsMfa && !ctx.mfaVerified) {
      inactive.push({ role: a.role, reason: 'MFA_REQUIRED' });
      mfaPending = true;
      continue;
    }
    const ids: ScopeIds = {
      siteIds: a.siteIds ?? (ctx.principal === 'DEVICE' && ctx.deviceSiteId ? [ctx.deviceSiteId] : []),
      departmentIds: a.departmentIds ?? [],
      teamIds: a.teamIds ?? [],
    };
    for (const r of chain) {
      for (const gr of ROLES[r].grants) {
        rules.push(...rulesFromGrant(gr, ids, ctx, dialect, `${r}|${gr.scope}`));
      }
    }
    activeRoles.push(a.role);
    maxSessionMinutes = Math.min(maxSessionMinutes, def.maxSessionMinutes);
  }

  // 3. Interdits globaux (immuabilité), placés en dernier pour primer sur tout
  for (const s of SUBJECT_NAMES) {
    const forbidden = (SUBJECTS[s] as { forbidden?: Action[] }).forbidden;
    if (forbidden?.length) {
      rules.push({ action: [...forbidden], subject: s, inverted: true, reason: 'IMMUABLE' });
    }
  }

  // 4. Dédoublonnage
  const seen = new Set<string>();
  const unique = rules.filter((r) => {
    const k = JSON.stringify([r.action, r.subject, r.conditions, r.fields, r.inverted]);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  return {
    rules: unique,
    activeRoles: [...new Set(activeRoles)],
    inactive,
    mfaPending,
    maxSessionMinutes: Number.isFinite(maxSessionMinutes) ? maxSessionMinutes : 60,
  };
}
