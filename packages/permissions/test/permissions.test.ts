import { describe, expect, it } from 'vitest';
import {
  APPROVAL_POLICIES,
  ASSIGNABLE_ROLES,
  ROLES,
  SUBJECTS,
  type AccessContext,
  approvalSteps,
  asSubject,
  assertFourEyes,
  checkSod,
  createAppAbility,
  expandRole,
  resolveAccess,
  visibleModules,
} from '../src';

const NOW = new Date('2026-11-27T10:00:00Z');

const operator: AccessContext = {
  principal: 'USER',
  userId: 'u-op',
  employee: { id: 'e-op', siteId: 'site-bxl', departmentId: 'dep-prod', teamId: 'team-a' },
  assignments: [{ role: 'OPERATEUR', siteIds: ['site-bxl'], teamIds: ['team-a'] }],
  mfaVerified: false,
  now: NOW,
};

const abilityOf = (ctx: AccessContext) => createAppAbility(resolveAccess(ctx).rules);

describe('Cohérence du catalogue', () => {
  it('chaque droit restreint pointe vers un champ de rattachement existant', () => {
    const errors: string[] = [];
    for (const [key, role] of Object.entries(ROLES)) {
      for (const g of role.grants) {
        if (g.scope === 'all') continue;
        for (const s of g.subjects) {
          if (s === 'all') {
            errors.push(`${key}: portée ${g.scope} sur "all"`);
            continue;
          }
          const own = SUBJECTS[s].ownership as Record<string, unknown>;
          if (!own[g.scope]) errors.push(`${key}: ${s} ne supporte pas la portée ${g.scope}`);
        }
      }
    }
    expect(errors).toEqual([]);
  });

  it('aucun héritage circulaire', () => {
    for (const k of ASSIGNABLE_ROLES) expect(() => expandRole(k)).not.toThrow();
  });

  it('aucun rôle seul (hors super admin) ne viole une règle bloquante de séparation des tâches', () => {
    const offenders = ASSIGNABLE_ROLES.filter((r) => r !== 'SUPER_ADMIN')
      .map((r) => ({ r, v: checkSod([r]).filter((x) => x.rule.severity === 'BLOCK') }))
      .filter((x) => x.v.length);
    expect(offenders).toEqual([]);
  });

  it('le cumul ADMIN_IT + DAF est bloqué', () => {
    const ids = checkSod(['ADMIN_IT', 'DAF']).map((v) => v.rule.id);
    expect(ids).toContain('SOD-03');
  });
});

describe('Opérateur de ligne', () => {
  const ab = abilityOf(operator);

  it('voit ses pointages, pas ceux des autres', () => {
    expect(ab.can('read', asSubject('TimeEntry', { employeeId: 'e-op', teamId: 'team-a', siteId: 'site-bxl' }))).toBe(true);
    expect(ab.can('read', asSubject('TimeEntry', { employeeId: 'e-autre', teamId: 'team-a', siteId: 'site-bxl' }))).toBe(false);
  });

  it('voit les OF de son équipe uniquement', () => {
    expect(ab.can('read', asSubject('ProductionOrder', { teamId: 'team-a', siteId: 'site-bxl' }))).toBe(true);
    expect(ab.can('read', asSubject('ProductionOrder', { teamId: 'team-b', siteId: 'site-bxl' }))).toBe(false);
  });

  it('n a jamais accès aux recettes, coûts ni à la paie des autres', () => {
    expect(ab.can('read', 'Recipe')).toBe(false);
    expect(ab.can('read', 'CostSheet')).toBe(false);
    expect(ab.can('read', asSubject('EmployeePayroll', { employeeId: 'e-autre', siteId: 'site-bxl' }))).toBe(false);
    expect(ab.can('read', asSubject('EmployeePayroll', { employeeId: 'e-op', siteId: 'site-bxl' }))).toBe(true);
  });

  it('voit l annuaire mais pas les données personnelles d un collègue', () => {
    const colleague = asSubject('Employee', { id: 'e-autre', siteId: 'site-bxl' });
    expect(ab.can('read', colleague, 'lastName')).toBe(true);
    expect(ab.can('read', colleague, 'birthDate')).toBe(false);
  });

  it('ne peut modifier un congé que tant qu il est en attente', () => {
    expect(ab.can('update', asSubject('LeaveRequest', { employeeId: 'e-op', status: 'PENDING' }))).toBe(true);
    expect(ab.can('update', asSubject('LeaveRequest', { employeeId: 'e-op', status: 'APPROVED' }))).toBe(false);
  });

  it('navigation : production oui, finance non', () => {
    const mods = visibleModules(ab);
    expect(mods).toContain('production');
    expect(mods).toContain('monde');
    expect(mods).not.toContain('finance');
    expect(mods).not.toContain('admin');
  });
});

describe('Second facteur, validité, appareils', () => {
  it('un rôle sensible reste inactif sans second facteur', () => {
    const ctx: AccessContext = {
      ...operator,
      userId: 'u-drh',
      employee: { id: 'e-drh', siteId: 'site-bxl' },
      assignments: [{ role: 'DRH' }],
    };
    const res = resolveAccess(ctx);
    expect(res.mfaPending).toBe(true);
    expect(res.activeRoles).not.toContain('DRH');
    const ab = createAppAbility(res.rules);
    expect(ab.can('read', asSubject('EmployeePayroll', { employeeId: 'x', siteId: 'site-bxl' }))).toBe(false);
    const ok = createAppAbility(resolveAccess({ ...ctx, mfaVerified: true }).rules);
    expect(ok.can('read', asSubject('EmployeePayroll', { employeeId: 'x', siteId: 'site-bxl' }))).toBe(true);
  });

  it('une attribution expirée (intérim terminé) est ignorée', () => {
    const res = resolveAccess({
      ...operator,
      assignments: [{ role: 'MAGASINIER', siteIds: ['site-bxl'], validUntil: '2026-10-31T23:59:59Z' }],
    });
    expect(res.inactive).toEqual([{ role: 'MAGASINIER', reason: 'EXPIRED' }]);
  });

  it('le rôle BORNE est réservé aux appareils', () => {
    const asUser = resolveAccess({ ...operator, assignments: [{ role: 'BORNE' }] });
    expect(asUser.inactive[0]?.reason).toBe('WRONG_PRINCIPAL');
    const device = resolveAccess({
      principal: 'DEVICE',
      userId: 'dev-1',
      deviceSiteId: 'site-bxl',
      assignments: [{ role: 'BORNE' }],
      mfaVerified: false,
      now: NOW,
    });
    const ab = createAppAbility(device.rules);
    expect(ab.can('create', asSubject('TimeEntry', { siteId: 'site-bxl' }))).toBe(true);
    expect(ab.can('read', 'Employee')).toBe(false);
  });

  it('la direction générale ne voit pas la paie nominative', () => {
    const ab = abilityOf({
      ...operator,
      employee: { id: 'e-ceo', siteId: 'site-bxl' },
      assignments: [{ role: 'DIRECTION_GENERALE' }],
      mfaVerified: true,
    });
    expect(ab.can('read', 'Invoice')).toBe(true);
    expect(ab.can('read', asSubject('EmployeePayroll', { employeeId: 'x', siteId: 'site-bxl' }))).toBe(false);
  });
});

describe('Immuabilité et quatre yeux', () => {
  const ab = abilityOf({
    principal: 'USER',
    userId: 'u-root',
    employee: null,
    assignments: [{ role: 'SUPER_ADMIN' }],
    mfaVerified: true,
    now: NOW,
  });

  it('même le super admin ne peut ni modifier ni supprimer le journal d audit ou un pointage brut', () => {
    expect(ab.can('delete', 'AuditLog')).toBe(false);
    expect(ab.can('update', 'TimeEntry')).toBe(false);
    expect(ab.can('delete', 'StockMovement')).toBe(false);
    expect(ab.can('delete', 'Product')).toBe(true);
  });

  it('le valideur doit être différent du saisisseur', () => {
    expect(() => assertFourEyes('u1', 'u1', 'BATCH_RELEASE')).toThrow();
    expect(() => assertFourEyes('u1', 'u2', 'BATCH_RELEASE')).not.toThrow();
  });
});

describe('Dialecte prisma', () => {
  it('produit des conditions "in" sans opérateur mongo', () => {
    const { rules } = resolveAccess(operator, 'prisma');
    const json = JSON.stringify(rules);
    expect(json).not.toContain('$in');
    expect(json).toContain('"in":["team-a"]');
  });
});

describe('Circuits de validation', () => {
  it('paliers de commande fournisseur', () => {
    expect(approvalSteps('PURCHASE_ORDER', 1200)).toEqual([['RESPONSABLE_ACHATS']]);
    expect(approvalSteps('PURCHASE_ORDER', 18000)).toEqual([['RESPONSABLE_ACHATS'], ['DAF']]);
    expect(approvalSteps('PURCHASE_ORDER', 180000)).toHaveLength(3);
  });

  it('toutes les politiques référencent des rôles existants', () => {
    for (const p of Object.values(APPROVAL_POLICIES)) {
      for (const t of p.tiers) for (const step of t.steps) for (const r of step) expect(ROLES[r as keyof typeof ROLES]).toBeDefined();
    }
  });
});

describe('Filtre Prisma', () => {
  it('un opérateur ne liste que les OF de son équipe', async () => {
    const { prismaWhere } = await import('../src');
    const { rules } = resolveAccess(operator, 'prisma');
    expect(prismaWhere(rules, 'read', 'ProductionOrder')).toEqual({ OR: [{ teamId: { in: ['team-a'] } }] });
    expect(prismaWhere(rules, 'read', 'Recipe')).toBeNull();
    expect(prismaWhere(rules, 'delete', 'TimeEntry')).toBeNull();
  });
  it('le super admin lit tout mais ne supprime jamais un pointage', async () => {
    const { prismaWhere } = await import('../src');
    const { rules } = resolveAccess({ principal: 'USER', userId: 'r', assignments: [{ role: 'SUPER_ADMIN' }], mfaVerified: true, now: NOW }, 'prisma');
    expect(prismaWhere(rules, 'read', 'Employee')).toEqual({});
    expect(prismaWhere(rules, 'delete', 'TimeEntry')).toBeNull();
  });
});
