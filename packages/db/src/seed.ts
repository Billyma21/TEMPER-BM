/**
 * Données de démonstration : Maison Aurum Chocolatier SA (société fictive).
 * Usine et siège à Bruxelles, entrepôt à Vilvorde, deux boutiques.
 *
 * Usage : pnpm db:seed (base vide, après migration)
 * Mot de passe de tous les comptes de démo : Temper!2026
 *
 * MAAYOUD
 */
import { hash } from 'argon2';
import { createHmac, randomUUID } from 'node:crypto';
import { ROLES, type RoleKey } from '@temper/permissions';
import { createPrismaClient, Prisma } from './index';

const db = createPrismaClient();
const DEMO_PASSWORD = 'Temper!2026';
const PEPPER = process.env.BADGE_UID_PEPPER ?? 'dev-pepper';

const today = new Date();
today.setHours(0, 0, 0, 0);
const at = (h: number, m = 0, dayOffset = 0) => {
  const d = new Date(today);
  d.setDate(d.getDate() + dayOffset);
  d.setHours(h, m, 0, 0);
  return d;
};
const day = (offset: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() + offset);
  return d;
};
const dec = (n: number) => new Prisma.Decimal(n);
const badgeHash = (uid: string) => createHmac('sha256', PEPPER).update(uid).digest('hex');
const slug = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z]/g, '')
    .toLowerCase();

async function main() {
  if (await db.company.count()) {
    console.log('Base déjà initialisée : seed ignoré.');
    return;
  }
  const passwordHash = await hash(DEMO_PASSWORD, { type: 2, memoryCost: 19456, timeCost: 2 });

  // ---------------------------------------------------------------------------
  // Société, sites, bâtiments
  // ---------------------------------------------------------------------------
  const company = await db.company.create({
    data: {
      legalName: 'Maison Aurum Chocolatier SA',
      tradeName: 'Maison Aurum',
      vatNumber: 'BE0799999901',
      kboNumber: '0799.999.901',
      address: { street: 'Rue du Cacao 12', zip: '1070', city: 'Anderlecht', country: 'BE' },
      peppolId: '0208:0799999901',
    },
  });

  const mkSite = (code: string, name: string, kind: Prisma.SiteCreateInput['kind'], worldX: number, worldZ: number, city: string) =>
    db.site.create({
      data: { companyId: company.id, code, name, kind, worldX, worldZ, address: { city, country: 'BE' }, latitude: dec(50.83), longitude: dec(4.33) },
    });
  const usine = await mkSite('BXL-USINE', 'Usine et siège de Bruxelles-Sud', 'FACTORY', 0, 0, 'Anderlecht');
  const vilvorde = await mkSite('VIL-ENT', 'Entrepôt de Vilvorde', 'WAREHOUSE', 90, -40, 'Vilvoorde');
  const sablon = await mkSite('BXL-SABLON', 'Boutique du Sablon', 'STORE', -70, 50, 'Bruxelles');
  const louise = await mkSite('BXL-LOUISE', 'Boutique Louise', 'STORE', -90, 15, 'Ixelles');

  const buildingDefs: Array<[string, string, Prisma.BuildingCreateManyInput['kind'], number, number, number, number, number, string]> = [
    ['GARDE', 'Poste de garde et accueil', 'GATEHOUSE', -34, 24, 6, 5, 1, '#B9C3D6'],
    ['SIEGE', 'Bureaux du siège', 'OFFICE', -20, -12, 16, 10, 3, '#C9C2F2'],
    ['PROD', 'Hall de production', 'PRODUCTION', 6, -2, 26, 16, 1, '#F2E6DC'],
    ['TORREF', 'Torréfaction et masse de cacao', 'PRODUCTION', 6, -26, 16, 10, 2, '#E8D3C2'],
    ['LABO', 'Laboratoire qualité', 'LAB', -16, 12, 10, 8, 1, '#CDEBD9'],
    ['ATELIER', 'Atelier maintenance et outillage', 'WORKSHOP', 26, 18, 12, 8, 1, '#C8DDF2'],
    ['ENT-MP', 'Entrepôt matières premières', 'WAREHOUSE', 34, -16, 14, 12, 1, '#F3E2B8'],
    ['ENT-PF', 'Entrepôt produits finis (15-18 °C)', 'WAREHOUSE', 34, 2, 14, 12, 1, '#F3D4B8'],
    ['QUAI', 'Quais d expédition', 'LOADING_DOCK', 47, -6, 6, 24, 1, '#D9D9D9'],
  ];
  const buildings: Record<string, string> = {};
  for (const [code, name, kind, x, z, w, d, floors, color] of buildingDefs) {
    const b = await db.building.create({ data: { siteId: usine.id, code, name, kind, worldX: x, worldZ: z, width: w, depth: d, floors, color } });
    buildings[code] = b.id;
  }
  for (const s of [sablon, louise]) {
    await db.building.create({ data: { siteId: s.id, code: 'BOUTIQUE', name: s.name, kind: 'STORE', width: 8, depth: 6, color: '#F5C6D6' } });
  }
  await db.building.create({ data: { siteId: vilvorde.id, code: 'ENT', name: 'Entrepôt de Vilvorde', kind: 'WAREHOUSE', width: 30, depth: 20, color: '#F3E2B8' } });

  // ---------------------------------------------------------------------------
  // Horaires, départements, équipes, postes
  // ---------------------------------------------------------------------------
  const shifts: Record<string, string> = {};
  for (const [code, name, start, end, night, color] of [
    ['MATIN', 'Matin 06:00-14:00', '06:00', '14:00', false, '#F6C453'],
    ['APREM', 'Après-midi 14:00-22:00', '14:00', '22:00', false, '#F08A5D'],
    ['NUIT', 'Nuit 22:00-06:00', '22:00', '06:00', true, '#6C5CE7'],
    ['JOUR', 'Journée 08:30-17:00', '08:30', '17:00', false, '#00B894'],
  ] as const) {
    const s = await db.shiftPattern.create({ data: { siteId: usine.id, code, name, startTime: start, endTime: end, isNight: night, color, breakMinutes: 30 } });
    shifts[code] = s.id;
  }
  const storeShift = async (siteId: string) =>
    (await db.shiftPattern.create({ data: { siteId, code: 'BOUTIQUE', name: 'Boutique 09:30-18:30', startTime: '09:30', endTime: '18:30', breakMinutes: 60, color: '#FD79A8' } })).id;
  const sablonShift = await storeShift(sablon.id);
  const louiseShift = await storeShift(louise.id);

  const depts: Record<string, { id: string; siteId: string }> = {};
  for (const [code, name, cc] of [
    ['DIR', 'Direction', 'CC100'],
    ['RH', 'Ressources humaines', 'CC110'],
    ['FIN', 'Finance', 'CC120'],
    ['IT', 'Informatique', 'CC130'],
    ['PROD', 'Production', 'CC200'],
    ['QUAL', 'Qualité et sécurité alimentaire', 'CC210'],
    ['MAINT', 'Maintenance', 'CC220'],
    ['LOG', 'Logistique', 'CC230'],
    ['ACH', 'Achats', 'CC240'],
    ['COM', 'Commercial et marketing', 'CC300'],
  ] as const) {
    const d = await db.department.create({ data: { siteId: usine.id, code, name, costCenter: cc } });
    depts[code] = { id: d.id, siteId: usine.id };
  }
  depts['LOG-VIL'] = { id: (await db.department.create({ data: { siteId: vilvorde.id, code: 'LOG', name: 'Logistique Vilvorde', costCenter: 'CC231' } })).id, siteId: vilvorde.id };
  depts['BOUT-SAB'] = { id: (await db.department.create({ data: { siteId: sablon.id, code: 'BOUT', name: 'Boutique Sablon', costCenter: 'CC400' } })).id, siteId: sablon.id };
  depts['BOUT-LOU'] = { id: (await db.department.create({ data: { siteId: louise.id, code: 'BOUT', name: 'Boutique Louise', costCenter: 'CC410' } })).id, siteId: louise.id };

  const teams: Record<string, { id: string; siteId: string; dept: string }> = {};
  for (const [code, name, dept, shift, color] of [
    ['PROD-A', 'Production équipe A (matin)', 'PROD', 'MATIN', '#F6C453'],
    ['PROD-B', 'Production équipe B (après-midi)', 'PROD', 'APREM', '#F08A5D'],
    ['PROD-C', 'Production équipe C (nuit)', 'PROD', 'NUIT', '#6C5CE7'],
    ['MAINT', 'Maintenance', 'MAINT', 'JOUR', '#0984E3'],
    ['QUAL', 'Qualité', 'QUAL', 'JOUR', '#00B894'],
    ['LOG', 'Magasin et expéditions', 'LOG', 'JOUR', '#E17055'],
    ['COM', 'Force de vente', 'COM', 'JOUR', '#A29BFE'],
  ] as const) {
    const t = await db.team.create({ data: { siteId: usine.id, departmentId: depts[dept]!.id, code, name, shiftPatternId: shifts[shift], color } });
    teams[code] = { id: t.id, siteId: usine.id, dept };
  }
  teams['SABLON'] = { id: (await db.team.create({ data: { siteId: sablon.id, departmentId: depts['BOUT-SAB']!.id, code: 'SABLON', name: 'Équipe Sablon', shiftPatternId: sablonShift, color: '#FD79A8' } })).id, siteId: sablon.id, dept: 'BOUT-SAB' };
  teams['LOUISE'] = { id: (await db.team.create({ data: { siteId: louise.id, departmentId: depts['BOUT-LOU']!.id, code: 'LOUISE', name: 'Équipe Louise', shiftPatternId: louiseShift, color: '#E84393' } })).id, siteId: louise.id, dept: 'BOUT-LOU' };

  type PosDef = [code: string, title: string, family: string, cat: 'BLUE_COLLAR' | 'WHITE_COLLAR' | 'MANAGER', cp: string, roles: RoleKey[], trainings: string[], night?: boolean];
  const positionDefs: PosDef[] = [
    ['DIR_GEN', 'Directeur général', 'Direction', 'MANAGER', '220', ['DIRECTION_GENERALE'], []],
    ['DIR_USINE', 'Directeur d usine', 'Production', 'MANAGER', '220', ['DIRECTEUR_SITE', 'DIRECTEUR_PRODUCTION'], ['FOOD_HYGIENE', 'SAFETY']],
    ['DRH', 'Directeur des ressources humaines', 'RH', 'MANAGER', '220', ['DRH'], []],
    ['GEST_RH', 'Gestionnaire RH', 'RH', 'WHITE_COLLAR', '220', ['GESTIONNAIRE_RH'], []],
    ['GEST_PAIE', 'Gestionnaire de paie', 'RH', 'WHITE_COLLAR', '220', ['GESTIONNAIRE_PAIE'], []],
    ['PREV', 'Conseiller en prévention', 'HSE', 'WHITE_COLLAR', '220', ['CONSEILLER_PREVENTION'], ['SAFETY', 'FIRST_AID']],
    ['MAITRE_CHOC', 'Maître chocolatier', 'R&D', 'MANAGER', '220', ['MAITRE_CHOCOLATIER'], ['FOOD_HYGIENE', 'ALLERGENS']],
    ['PLANIF', 'Planificateur de production', 'Production', 'WHITE_COLLAR', '220', ['PLANIFICATEUR'], []],
    ['CHEF_EQ', 'Chef d équipe production', 'Production', 'BLUE_COLLAR', '118', ['CHEF_EQUIPE'], ['FOOD_HYGIENE', 'ALLERGENS', 'SAFETY', 'LOTO'], true],
    ['OPERATEUR', 'Opérateur de ligne', 'Production', 'BLUE_COLLAR', '118', ['OPERATEUR'], ['FOOD_HYGIENE', 'ALLERGENS', 'SAFETY'], true],
    ['RESP_QUAL', 'Responsable qualité', 'Qualité', 'MANAGER', '220', ['RESPONSABLE_QUALITE'], ['FOOD_HYGIENE', 'ALLERGENS']],
    ['TECH_QUAL', 'Technicien qualité', 'Qualité', 'WHITE_COLLAR', '220', ['TECHNICIEN_QUALITE'], ['FOOD_HYGIENE', 'ALLERGENS']],
    ['RESP_MAINT', 'Responsable maintenance', 'Maintenance', 'MANAGER', '220', ['RESPONSABLE_MAINTENANCE'], ['SAFETY', 'LOTO', 'FOOD_HYGIENE']],
    ['TECH_MAINT', 'Technicien de maintenance', 'Maintenance', 'BLUE_COLLAR', '118', ['TECHNICIEN_MAINTENANCE'], ['SAFETY', 'LOTO', 'FOOD_HYGIENE']],
    ['RESP_LOG', 'Responsable logistique', 'Logistique', 'MANAGER', '220', ['RESPONSABLE_LOGISTIQUE'], ['SAFETY', 'FORKLIFT']],
    ['MAGASINIER', 'Magasinier cariste', 'Logistique', 'BLUE_COLLAR', '118', ['MAGASINIER'], ['SAFETY', 'FORKLIFT', 'FOOD_HYGIENE']],
    ['PREPARATEUR', 'Préparateur de commandes', 'Logistique', 'BLUE_COLLAR', '118', ['PREPARATEUR_COMMANDES'], ['SAFETY']],
    ['CHAUFFEUR', 'Chauffeur livreur', 'Logistique', 'BLUE_COLLAR', '118', ['CHAUFFEUR'], ['SAFETY']],
    ['RESP_ACHATS', 'Responsable achats', 'Achats', 'MANAGER', '220', ['RESPONSABLE_ACHATS'], []],
    ['ACHETEUR', 'Acheteur matières', 'Achats', 'WHITE_COLLAR', '220', ['ACHETEUR'], []],
    ['DIR_COM', 'Directeur commercial', 'Commercial', 'MANAGER', '220', ['DIRECTEUR_COMMERCIAL'], []],
    ['COMMERCIAL', 'Commercial terrain', 'Commercial', 'WHITE_COLLAR', '220', ['COMMERCIAL'], []],
    ['ADV', 'Assistant administration des ventes', 'Commercial', 'WHITE_COLLAR', '220', ['ADV'], []],
    ['MARKETING', 'Chef de produit marketing', 'Commercial', 'WHITE_COLLAR', '220', ['MARKETING'], []],
    ['RESP_BOUT', 'Responsable de boutique', 'Boutiques', 'WHITE_COLLAR', '202', ['RESPONSABLE_BOUTIQUE'], ['FOOD_HYGIENE', 'ALLERGENS']],
    ['VENDEUR', 'Vendeur chocolatier', 'Boutiques', 'WHITE_COLLAR', '202', ['VENDEUR_BOUTIQUE'], ['FOOD_HYGIENE', 'ALLERGENS']],
    ['DAF', 'Directeur administratif et financier', 'Finance', 'MANAGER', '220', ['DAF'], []],
    ['COMPTABLE', 'Comptable', 'Finance', 'WHITE_COLLAR', '220', ['COMPTABLE'], []],
    ['CDG', 'Contrôleur de gestion', 'Finance', 'WHITE_COLLAR', '220', ['CONTROLEUR_GESTION'], []],
    ['ADMIN_IT', 'Administrateur systèmes', 'IT', 'WHITE_COLLAR', '220', ['ADMIN_IT'], []],
  ];
  const positions: Record<string, { id: string; def: PosDef }> = {};
  for (const def of positionDefs) {
    const [code, title, family, cat, cp, roles, trainings, night] = def;
    const p = await db.position.create({
      data: { companyId: company.id, code, title, jobFamily: family, workerCategory: cat, jointCommittee: cp, defaultRoles: roles, requiredTrainings: trainings, isNightWork: !!night },
    });
    positions[code] = { id: p.id, def };
  }

  // ---------------------------------------------------------------------------
  // Personnel, comptes, rôles, badges, formations
  // ---------------------------------------------------------------------------
  type EmpDef = { first: string; last: string; pos: string; dept: string; team?: string; extraRoles?: Array<{ role: RoleKey; teams?: string[] }>; type?: 'TEMPORARY_AGENCY' | 'STUDENT'; leadTeam?: string };
  const empDefs: EmpDef[] = [
    { first: 'Catherine', last: 'Vandenberghe', pos: 'DIR_GEN', dept: 'DIR' },
    { first: 'Marc', last: 'Dubois', pos: 'DIR_USINE', dept: 'PROD', extraRoles: [{ role: 'MANAGER_EQUIPE', teams: ['PROD-A', 'PROD-B', 'PROD-C'] }] },
    { first: 'Nadia', last: 'El Amrani', pos: 'DRH', dept: 'RH' },
    { first: 'Lotte', last: 'Claes', pos: 'GEST_RH', dept: 'RH' },
    { first: 'Julien', last: 'Lambert', pos: 'GEST_PAIE', dept: 'RH' },
    { first: 'Yves', last: 'Hermans', pos: 'PREV', dept: 'RH' },
    { first: 'Pierre', last: 'Leclercq', pos: 'MAITRE_CHOC', dept: 'PROD' },
    { first: 'Sofie', last: 'Peeters', pos: 'PLANIF', dept: 'PROD' },
    { first: 'Karim', last: 'Benali', pos: 'CHEF_EQ', dept: 'PROD', team: 'PROD-A', leadTeam: 'PROD-A' },
    { first: 'Emma', last: 'Janssens', pos: 'OPERATEUR', dept: 'PROD', team: 'PROD-A' },
    { first: 'Lucas', last: 'Martin', pos: 'OPERATEUR', dept: 'PROD', team: 'PROD-A' },
    { first: 'Inès', last: 'Rachidi', pos: 'OPERATEUR', dept: 'PROD', team: 'PROD-A' },
    { first: 'Thomas', last: 'Maes', pos: 'OPERATEUR', dept: 'PROD', team: 'PROD-A', type: 'TEMPORARY_AGENCY' },
    { first: 'Fatima', last: 'Idrissi', pos: 'OPERATEUR', dept: 'PROD', team: 'PROD-A' },
    { first: 'Bart', last: 'Wouters', pos: 'CHEF_EQ', dept: 'PROD', team: 'PROD-B', leadTeam: 'PROD-B' },
    { first: 'Julie', last: 'Simon', pos: 'OPERATEUR', dept: 'PROD', team: 'PROD-B' },
    { first: 'Mehdi', last: 'Ouali', pos: 'OPERATEUR', dept: 'PROD', team: 'PROD-B' },
    { first: 'Pieter', last: 'Goossens', pos: 'OPERATEUR', dept: 'PROD', team: 'PROD-B' },
    { first: 'Aïcha', last: 'Diallo', pos: 'CHEF_EQ', dept: 'PROD', team: 'PROD-C', leadTeam: 'PROD-C' },
    { first: 'Kevin', last: 'Lemaire', pos: 'OPERATEUR', dept: 'PROD', team: 'PROD-C' },
    { first: 'Sarah', last: 'Willems', pos: 'RESP_QUAL', dept: 'QUAL', team: 'QUAL' },
    { first: 'Hugo', last: 'Dumont', pos: 'TECH_QUAL', dept: 'QUAL', team: 'QUAL' },
    { first: 'Laura', last: 'Mertens', pos: 'TECH_QUAL', dept: 'QUAL', team: 'QUAL' },
    { first: 'Olivier', last: 'Renard', pos: 'RESP_MAINT', dept: 'MAINT', team: 'MAINT', leadTeam: 'MAINT' },
    { first: 'Samir', last: 'Haddad', pos: 'TECH_MAINT', dept: 'MAINT', team: 'MAINT' },
    { first: 'Jan', last: 'De Smet', pos: 'TECH_MAINT', dept: 'MAINT', team: 'MAINT' },
    { first: 'Nathalie', last: 'Collard', pos: 'RESP_LOG', dept: 'LOG', team: 'LOG', leadTeam: 'LOG' },
    { first: 'Youssef', last: 'Tahiri', pos: 'MAGASINIER', dept: 'LOG', team: 'LOG' },
    { first: 'Dries', last: 'Vermeulen', pos: 'MAGASINIER', dept: 'LOG', team: 'LOG' },
    { first: 'Anaïs', last: 'Pirard', pos: 'PREPARATEUR', dept: 'LOG', team: 'LOG' },
    { first: 'Rachid', last: 'Moussaoui', pos: 'CHAUFFEUR', dept: 'LOG', team: 'LOG' },
    { first: 'Isabelle', last: 'Gérard', pos: 'RESP_ACHATS', dept: 'ACH' },
    { first: 'Tom', last: 'Jacobs', pos: 'ACHETEUR', dept: 'ACH' },
    { first: 'Philippe', last: 'Lejeune', pos: 'DIR_COM', dept: 'COM', team: 'COM', leadTeam: 'COM' },
    { first: 'Noa', last: 'Lefèvre', pos: 'COMMERCIAL', dept: 'COM', team: 'COM' },
    { first: 'Elias', last: 'Bouzid', pos: 'COMMERCIAL', dept: 'COM', team: 'COM' },
    { first: 'Charlotte', last: 'Dupont', pos: 'ADV', dept: 'COM' },
    { first: 'Manon', last: 'Thiry', pos: 'MARKETING', dept: 'COM' },
    { first: 'Véronique', last: 'Lemmens', pos: 'RESP_BOUT', dept: 'BOUT-SAB', team: 'SABLON', leadTeam: 'SABLON' },
    { first: 'Zineb', last: 'Amrani', pos: 'VENDEUR', dept: 'BOUT-SAB', team: 'SABLON' },
    { first: 'Arthur', last: 'Henrard', pos: 'VENDEUR', dept: 'BOUT-SAB', team: 'SABLON', type: 'STUDENT' },
    { first: 'Céline', last: 'Bastin', pos: 'RESP_BOUT', dept: 'BOUT-LOU', team: 'LOUISE', leadTeam: 'LOUISE' },
    { first: 'Milan', last: 'Verstraete', pos: 'VENDEUR', dept: 'BOUT-LOU', team: 'LOUISE' },
    { first: 'François', last: 'Delcourt', pos: 'DAF', dept: 'FIN' },
    { first: 'Sabrina', last: 'Kaya', pos: 'COMPTABLE', dept: 'FIN' },
    { first: 'Antoine', last: 'Michel', pos: 'CDG', dept: 'FIN' },
    { first: 'Bilal', last: 'Chraibi', pos: 'ADMIN_IT', dept: 'IT' },
  ];

  const employees: Array<{ id: string; userId: string; def: EmpDef; siteId: string; teamId?: string; deptId: string }> = [];
  let n = 1;
  for (const def of empDefs) {
    const dept = depts[def.dept]!;
    const team = def.team ? teams[def.team] : undefined;
    const pos = positions[def.pos]!;
    const email = `${slug(def.first)}.${slug(def.last)}@maison-aurum.test`;
    const emp = await db.employee.create({
      data: {
        companyId: company.id,
        siteId: dept.siteId,
        departmentId: dept.id,
        teamId: team?.id,
        positionId: pos.id,
        employeeNumber: `MA${String(n++).padStart(4, '0')}`,
        firstName: def.first,
        lastName: def.last,
        jobTitle: pos.def[1],
        workEmail: email,
        workPhone: `+32 2 555 ${String(1000 + n).slice(-4)}`,
        languages: n % 3 === 0 ? ['nl', 'fr', 'en'] : ['fr', 'nl'],
        hireDate: day(-30 * ((n * 7) % 90) - 40),
        status: 'ACTIVE',
        employmentType: def.type ?? 'PERMANENT',
        workerCategory: pos.def[3],
        jointCommittee: pos.def[4],
        weeklyHours: dec(def.type === 'STUDENT' ? 16 : 38),
        avatar: { skin: (n % 5) + 1, hair: (n % 7) + 1 },
        xp: (n * 137) % 4200,
        level: 1 + (((n * 137) % 4200) >> 9),
        leaderboardOptIn: n % 2 === 0,
      },
    });
    const user = await db.user.create({ data: { email, passwordHash, status: 'ACTIVE', employeeId: emp.id, locale: 'fr' } });
    const roleRows = [
      ...pos.def[5].map((role) => ({ role, teams: def.leadTeam ? [def.leadTeam] : undefined })),
      ...(def.extraRoles ?? []),
    ];
    for (const r of roleRows) {
      const teamIds = (r.teams ?? (def.leadTeam ? [def.leadTeam] : def.team ? [def.team] : [])).map((t) => teams[t]!.id);
      const siteIds = r.role === 'DIRECTEUR_SITE' || ROLES[r.role].category !== 'boutique' ? [dept.siteId, ...(r.role === 'RESPONSABLE_LOGISTIQUE' ? [vilvorde.id] : [])] : [dept.siteId];
      await db.roleAssignment.create({
        data: {
          userId: user.id,
          role: r.role,
          siteId: dept.siteId,
          siteIds,
          departmentIds: [dept.id],
          teamIds,
          validUntil: def.type === 'TEMPORARY_AGENCY' ? day(60) : null,
          createdById: 'seed',
          reason: 'Initialisation',
        },
      });
    }
    await db.badge.create({
      data: { holderEmployeeId: emp.id, siteId: dept.siteId, teamId: team?.id, uidHash: badgeHash(`04A1${n}B2C3`), uidLast4: `${1000 + n}`.slice(-4), technology: 'MIFARE_DESFIRE', kind: 'PERMANENT', issuedById: 'seed' },
    });
    for (const t of pos.def[6]) {
      const expired = def.first === 'Kevin' && t === 'FOOD_HYGIENE';
      await db.training.create({
        data: {
          employeeId: emp.id, siteId: dept.siteId, departmentId: dept.id, teamId: team?.id,
          type: t as Prisma.TrainingCreateManyInput['type'], title: `Formation ${t}`, status: 'COMPLETED',
          completedAt: day(-400), validUntil: expired ? day(-3) : day(300),
        },
      });
    }
    employees.push({ id: emp.id, userId: user.id, def, siteId: dept.siteId, teamId: team?.id, deptId: dept.id });
  }
  const emp = (first: string) => employees.find((e) => e.def.first === first)!;

  // Responsables d'équipe et de département
  for (const e of employees.filter((x) => x.def.leadTeam)) {
    await db.team.update({ where: { id: teams[e.def.leadTeam!]!.id }, data: { leaderEmployeeId: e.id } });
  }
  for (const e of employees.filter((x) => x.def.team && !x.def.leadTeam)) {
    const lead = employees.find((l) => l.def.leadTeam === e.def.team);
    if (lead) await db.employee.update({ where: { id: e.id }, data: { managerId: lead.id } });
  }

  // Externes : sous-traitant, auditeur, agent de sécurité
  const externals: Array<[string, string, RoleKey, number | null]> = [
    ['tech@frigotech.test', 'Frigotech SRL', 'SOUS_TRAITANT', 30],
    ['audit@certif-food.test', 'Certif Food Audit', 'AUDITEUR_QUALITE', 5],
    ['accueil@securis.test', 'Securis Gardiennage', 'AGENT_SECURITE', null],
  ];
  for (const [email, ext, role, days] of externals) {
    const u = await db.user.create({ data: { email, passwordHash, status: 'ACTIVE', externalCompany: ext } });
    await db.roleAssignment.create({ data: { userId: u.id, role, siteId: usine.id, siteIds: [usine.id], validUntil: days ? day(days) : null, createdById: 'seed', reason: 'Prestataire' } });
  }
  // Super administrateur de secours (aucun employé lié, clé matérielle exigée en production)
  const root = await db.user.create({ data: { email: 'secours@maison-aurum.test', passwordHash, status: 'ACTIVE' } });
  await db.roleAssignment.create({ data: { userId: root.id, role: 'SUPER_ADMIN', createdById: 'seed', reason: 'Compte bris de glace' } });

  // ---------------------------------------------------------------------------
  // Zones d'accès et appareils
  // ---------------------------------------------------------------------------
  const zone = async (code: string, name: string, b: string, level: Prisma.AccessZoneCreateManyInput['level'], hygiene: Prisma.AccessZoneCreateManyInput['hygieneLevel'], trainings: Prisma.AccessZoneCreateManyInput['requiredTrainingTypes'] = [], ppe: string[] = []) =>
    db.accessZone.create({ data: { siteId: usine.id, buildingId: buildings[b], code, name, level, hygieneLevel: hygiene, requiredTrainingTypes: trainings, requiredPpe: ppe, antiPassback: level === 'RESTRICTED' } });
  const zAccueil = await zone('ACCUEIL', 'Accueil', 'GARDE', 'PUBLIC', 'NONE');
  await zone('BUREAUX', 'Bureaux', 'SIEGE', 'STANDARD', 'NONE');
  const zProd = await zone('PROD', 'Production (haute hygiène)', 'PROD', 'RESTRICTED', 'HIGH_HYGIENE', ['FOOD_HYGIENE'], ['charlotte', 'blouse', 'chaussures de sécurité']);
  await zone('TORREF', 'Torréfaction', 'TORREF', 'RESTRICTED', 'HYGIENE', ['FOOD_HYGIENE'], ['charlotte', 'blouse']);
  await zone('LABO', 'Laboratoire', 'LABO', 'RESTRICTED', 'HYGIENE', ['FOOD_HYGIENE']);
  await zone('ENTREPOTS', 'Entrepôts', 'ENT-PF', 'STANDARD', 'HYGIENE', [], ['chaussures de sécurité', 'gilet']);
  await zone('ATELIER', 'Atelier', 'ATELIER', 'STANDARD', 'NONE', [], ['chaussures de sécurité']);
  await zone('SERVEURS', 'Salle serveurs', 'SIEGE', 'CRITICAL', 'NONE');

  const device = (kind: Prisma.DeviceCreateManyInput['kind'], name: string, serial: string, zoneId?: string) =>
    db.device.create({ data: { siteId: usine.id, kind, name, serial, secretHash: 'a-provisionner', status: 'ACTIVE', accessZoneId: zoneId, lastSeenAt: new Date() } });
  const kiosk = await device('CLOCK_KIOSK', 'Borne de pointage entrée', 'KIOSK-0001', zAccueil.id);
  await device('BADGE_READER', 'Lecteur sas production', 'READER-0001', zProd.id);
  await device('TOOL_KIOSK', 'Borne outils atelier', 'TOOLKIOSK-0001');
  await device('ENV_SENSOR', 'Capteur entrepôt produits finis', 'SENSOR-0001');
  await device('LINE_TABLET', 'Tablette ligne L1', 'TABLET-L1');

  // ---------------------------------------------------------------------------
  // Temps : types de congé belges, fériés, soldes, plannings, pointages du jour
  // ---------------------------------------------------------------------------
  const leaveTypes: Record<string, string> = {};
  for (const [code, fr, nl, paid, deducts, doc, color] of [
    ['LEGAL_HOLIDAY', 'Congés légaux', 'Wettelijke vakantie', true, true, false, '#00B894'],
    ['EXTRA_HOLIDAY', 'Congés extra-légaux', 'Extralegale vakantie', true, true, false, '#55EFC4'],
    ['RECOVERY_DAY', 'Jours de récupération (ADV)', 'ADV-dagen', true, true, false, '#74B9FF'],
    ['SHORT_LEAVE', 'Petit chômage (événement familial)', 'Klein verlet', true, false, true, '#FDCB6E'],
    ['EDUCATION_LEAVE', 'Congé-éducation payé', 'Betaald educatief verlof', true, false, true, '#A29BFE'],
    ['UNPAID', 'Congé sans solde', 'Onbetaald verlof', false, false, false, '#B2BEC3'],
  ] as const) {
    const lt = await db.leaveType.create({ data: { companyId: company.id, code, label: { fr, nl }, paid, deductsBalance: deducts, requiresDocument: doc, color } });
    leaveTypes[code] = lt.id;
  }
  const holidays: Array<[string, string]> = [
    ['2026-01-01', 'Nouvel An'], ['2026-04-06', 'Lundi de Pâques'], ['2026-05-01', 'Fête du travail'], ['2026-05-14', 'Ascension'],
    ['2026-05-25', 'Lundi de Pentecôte'], ['2026-07-21', 'Fête nationale'], ['2026-08-15', 'Assomption'], ['2026-11-01', 'Toussaint'],
    ['2026-11-11', 'Armistice'], ['2026-12-25', 'Noël'], ['2027-01-01', 'Nouvel An'], ['2027-03-29', 'Lundi de Pâques'],
    ['2027-05-01', 'Fête du travail'], ['2027-05-06', 'Ascension'], ['2027-05-17', 'Lundi de Pentecôte'], ['2027-07-21', 'Fête nationale'],
    ['2027-08-15', 'Assomption'], ['2027-11-01', 'Toussaint'], ['2027-11-11', 'Armistice'], ['2027-12-25', 'Noël'],
  ];
  await db.publicHoliday.createMany({ data: holidays.map(([d, label]) => ({ companyId: company.id, date: new Date(`${d}T00:00:00Z`), label })) });

  const year = today.getFullYear();
  for (const e of employees) {
    await db.leaveBalance.create({ data: { employeeId: e.id, siteId: e.siteId, departmentId: e.deptId, teamId: e.teamId, leaveTypeId: leaveTypes['LEGAL_HOLIDAY']!, year, entitledDays: dec(20), takenDays: dec(14), plannedDays: dec(2) } });
    await db.leaveBalance.create({ data: { employeeId: e.id, siteId: e.siteId, departmentId: e.deptId, teamId: e.teamId, leaveTypeId: leaveTypes['RECOVERY_DAY']!, year, entitledDays: dec(12), takenDays: dec(9) } });
  }
  await db.leaveRequest.create({ data: { employeeId: emp('Lucas').id, siteId: usine.id, departmentId: depts['PROD']!.id, teamId: teams['PROD-A']!.id, leaveTypeId: leaveTypes['LEGAL_HOLIDAY']!, startDate: day(26), endDate: day(30), days: dec(5), comment: 'Fêtes de fin d année' } });
  await db.leaveRequest.create({ data: { employeeId: emp('Inès').id, siteId: usine.id, departmentId: depts['PROD']!.id, teamId: teams['PROD-A']!.id, leaveTypeId: leaveTypes['SHORT_LEAVE']!, startDate: day(5), endDate: day(5), days: dec(1), comment: 'Mariage de ma soeur' } });

  // Plannings de la semaine et pointages du jour
  const shiftHours: Record<string, [number, number]> = { 'PROD-A': [6, 14], 'PROD-B': [14, 22], 'PROD-C': [22, 30], SABLON: [9.5, 18.5], LOUISE: [9.5, 18.5] };
  const nowH = new Date().getHours() + new Date().getMinutes() / 60;
  for (const e of employees) {
    const [s, f] = shiftHours[e.def.team ?? ''] ?? [8.5, 17];
    for (let dOff = 0; dOff < 5; dOff++) {
      await db.schedule.create({
        data: {
          employeeId: e.id, siteId: e.siteId, departmentId: e.deptId, teamId: e.teamId, date: day(dOff),
          plannedStart: at(Math.floor(s), (s % 1) * 60, dOff), plannedEnd: at(Math.floor(f % 24), (f % 1) * 60, dOff + (f >= 24 ? 1 : 0)),
          status: 'PUBLISHED', createdById: 'seed', publishedAt: new Date(),
        },
      });
    }
    // Présent si son poste a commencé (quelques minutes d'avance), sauf deux absents
    if (['Pieter', 'Kevin'].includes(e.def.first)) continue;
    if (nowH >= s - 0.2) {
      const inAt = at(Math.floor(s), Math.max(0, (s % 1) * 60 - 8 + (e.id.charCodeAt(e.id.length - 1) % 6)));
      await db.timeEntry.create({
        data: { employeeId: e.id, siteId: e.siteId, departmentId: e.deptId, teamId: e.teamId, at: inAt, kind: 'IN', source: 'BADGE', deviceId: kiosk.id, clientEventId: randomUUID() },
      });
    }
  }
  await db.absence.create({ data: { employeeId: emp('Pieter').id, siteId: usine.id, departmentId: depts['PROD']!.id, teamId: teams['PROD-B']!.id, type: 'SICKNESS', startDate: day(-1), endDate: day(2), certificateReceivedAt: new Date() } });
  await db.timeCorrection.create({ data: { employeeId: emp('Emma').id, siteId: usine.id, departmentId: depts['PROD']!.id, teamId: teams['PROD-A']!.id, date: day(-1), kind: 'ADD', proposedAt: at(14, 3, -1), proposedKind: 'OUT', reason: 'Oubli de badge à la sortie', requestedById: emp('Emma').userId } });

  // ---------------------------------------------------------------------------
  // Allergènes, articles, produits
  // ---------------------------------------------------------------------------
  const allergens: Record<string, string> = {};
  for (const [code, fr, nl] of [['MILK', 'Lait', 'Melk'], ['NUTS', 'Fruits à coque', 'Noten'], ['SOY', 'Soja', 'Soja'], ['GLUTEN', 'Gluten', 'Gluten'], ['PEANUTS', 'Arachides', 'Pinda'], ['EGG', 'Oeuf', 'Ei'], ['SESAME', 'Sésame', 'Sesam']] as const) {
    allergens[code] = (await db.allergen.create({ data: { code, labels: { fr, nl } } })).id;
  }

  type ItemDef = [sku: string, name: string, type: Prisma.ItemCreateManyInput['type'], cat: string, uom: Prisma.ItemCreateManyInput['baseUom'], cost: number, min: number, allergens?: string[], eudr?: boolean];
  const itemDefs: ItemDef[] = [
    ['MP-FEVE-CI', 'Fèves de cacao Côte d Ivoire (Forastero)', 'RAW_MATERIAL', 'COCOA_BEANS', 'KG', 4.8, 20000, [], true],
    ['MP-FEVE-EC', 'Fèves de cacao Équateur (Nacional, arôme fin)', 'RAW_MATERIAL', 'COCOA_BEANS', 'KG', 7.9, 5000, [], true],
    ['MP-BEURRE', 'Beurre de cacao désodorisé', 'RAW_MATERIAL', 'COCOA_BUTTER', 'KG', 9.6, 4000, [], true],
    ['MP-SUCRE', 'Sucre de canne fin', 'RAW_MATERIAL', 'SUGAR', 'KG', 0.95, 15000],
    ['MP-LAIT', 'Lait entier en poudre', 'RAW_MATERIAL', 'MILK_POWDER', 'KG', 4.2, 6000, ['MILK']],
    ['MP-NOISETTE', 'Noisettes du Piémont torréfiées', 'RAW_MATERIAL', 'HAZELNUTS', 'KG', 11.5, 2500, ['NUTS']],
    ['MP-VANILLE', 'Gousses de vanille Bourbon', 'RAW_MATERIAL', 'VANILLA', 'KG', 380, 5],
    ['MP-LECITHINE', 'Lécithine de tournesol', 'RAW_MATERIAL', 'LECITHIN', 'KG', 3.1, 200],
    ['EMB-ALU', 'Feuille aluminium tablette', 'PACKAGING', 'FOIL', 'ROLL', 42, 40],
    ['EMB-ETUI-100', 'Étui carton tablette 100 g', 'PACKAGING', 'CARTON', 'PIECE', 0.06, 80000],
    ['EMB-BALLOTIN', 'Ballotin pralines 250 g', 'PACKAGING', 'CARTON', 'PIECE', 0.38, 12000],
    ['SF-MASSE', 'Masse de cacao', 'INTERMEDIATE', 'COCOA_MASS', 'KG', 6.1, 3000, [], true],
    ['SF-NOIR72', 'Chocolat noir 72 % (couverture)', 'INTERMEDIATE', 'COUVERTURE', 'KG', 6.4, 4000, [], true],
    ['SF-LAIT34', 'Chocolat au lait 34 % (couverture)', 'INTERMEDIATE', 'COUVERTURE', 'KG', 5.9, 4000, ['MILK'], true],
    ['SF-PRALINE', 'Praliné noisette 50 %', 'INTERMEDIATE', 'FILLING', 'KG', 7.2, 1500, ['NUTS', 'MILK']],
    ['PF-TAB-NOIR72', 'Tablette Noir Intense 72 % 100 g', 'FINISHED_GOOD', 'TABLET', 'PIECE', 0.92, 30000],
    ['PF-TAB-LAITNOIS', 'Tablette Lait Noisettes 100 g', 'FINISHED_GOOD', 'TABLET', 'PIECE', 1.05, 25000, ['MILK', 'NUTS']],
    ['PF-BALLOTIN-250', 'Ballotin Pralines Assorties 250 g', 'FINISHED_GOOD', 'GIFT_BOX', 'PIECE', 6.8, 4000, ['MILK', 'NUTS', 'SOY']],
    ['PF-STNICOLAS-150', 'Saint-Nicolas chocolat au lait 150 g', 'FINISHED_GOOD', 'SEASONAL', 'PIECE', 1.9, 8000, ['MILK']],
    ['PF-COUV-NOIR-5KG', 'Couverture Noir 72 % pistoles 5 kg', 'FINISHED_GOOD', 'COUVERTURE', 'BAG', 34, 600],
    ['PR-CHARLOTTE', 'Charlotte jetable', 'PPE', 'HAIRNET', 'BOX', 4.5, 50],
    ['PR-BLOUSE', 'Blouse blanche alimentaire', 'PPE', 'COAT', 'PIECE', 18, 40],
    ['PR-CHAUSSURES', 'Chaussures de sécurité S2', 'PPE', 'SAFETY_SHOES', 'PIECE', 62, 20],
    ['PD-COURROIE-L1', 'Courroie tapis mouleuse L1', 'SPARE_PART', 'BELT', 'PIECE', 240, 2],
    ['PD-SONDE-PT100', 'Sonde PT100 tempéreuse', 'SPARE_PART', 'SENSOR', 'PIECE', 95, 3],
  ];
  const items: Record<string, string> = {};
  for (const [sku, name, type, category, uom, cost, min, alls = [], eudr = false] of itemDefs) {
    const it = await db.item.create({
      data: {
        companyId: company.id, sku, name, type, category, baseUom: uom, standardCost: dec(cost), minStock: dec(min), reorderPoint: dec(min * 1.3), eudrRelevant: eudr,
        shelfLifeDays: type === 'FINISHED_GOOD' ? 540 : type === 'RAW_MATERIAL' ? 365 : null, storageConditions: type === 'FINISHED_GOOD' ? '15-18 °C, HR < 60 %' : null,
        isLotTracked: !['PPE', 'SPARE_PART'].includes(type), isExpiryTracked: ['RAW_MATERIAL', 'INTERMEDIATE', 'FINISHED_GOOD'].includes(type),
      },
    });
    items[sku] = it.id;
    for (const a of alls) await db.itemAllergen.create({ data: { itemId: it.id, allergenId: allergens[a]!, presence: 'CONTAINS' } });
  }
  // Traces possibles : ligne partagée lait / noisettes
  await db.itemAllergen.create({ data: { itemId: items['PF-TAB-NOIR72']!, allergenId: allergens['MILK']!, presence: 'MAY_CONTAIN' } });
  await db.itemAllergen.create({ data: { itemId: items['PF-TAB-NOIR72']!, allergenId: allergens['NUTS']!, presence: 'MAY_CONTAIN' } });

  const nutrition = (kcal: number, fat: number, sat: number, carbs: number, sugar: number, protein: number) => ({ energyKcal: kcal, fat, saturatedFat: sat, carbohydrates: carbs, sugars: sugar, protein, salt: 0.02 });
  const productDefs: Array<[string, string, Prisma.ProductCreateManyInput['range'], Prisma.ProductCreateManyInput['season'], number | null, number, string[], ReturnType<typeof nutrition>]> = [
    ['PF-TAB-NOIR72', 'Noir Intense 72 %', 'TABLET', 'PERMANENT', 72, 100, ['MILK', 'NUTS'], nutrition(580, 43, 26, 32, 27, 8.5)],
    ['PF-TAB-LAITNOIS', 'Lait Noisettes', 'TABLET', 'PERMANENT', 34, 100, ['MILK', 'NUTS'], nutrition(560, 36, 15, 50, 47, 8)],
    ['PF-BALLOTIN-250', 'Ballotin Pralines Assorties', 'GIFT_BOX', 'PERMANENT', null, 250, ['MILK', 'NUTS', 'SOY'], nutrition(545, 34, 17, 51, 46, 7)],
    ['PF-STNICOLAS-150', 'Saint-Nicolas au lait', 'SEASONAL_MOULDING', 'SAINT_NICHOLAS', 34, 150, ['MILK'], nutrition(550, 33, 20, 55, 54, 7)],
    ['PF-COUV-NOIR-5KG', 'Couverture Noir 72 % pistoles', 'COUVERTURE', 'PERMANENT', 72, 5000, [], nutrition(580, 43, 26, 32, 27, 8.5)],
  ];
  const products: Record<string, string> = {};
  let gtin = 5400000000001;
  for (const [sku, name, range, season, cocoa, weight, alls, nutri] of productDefs) {
    const p = await db.product.create({
      data: {
        companyId: company.id, sku, gtin: String(gtin++), itemId: items[sku]!, name, marketingName: `Maison Aurum ${name}`, range, season,
        cocoaPercent: cocoa ? dec(cocoa) : null, netWeightG: weight, shelfLifeDays: 540, nutrition: nutri, status: 'ACTIVE',
        ingredientsText: { fr: 'Pâte de cacao, sucre, beurre de cacao, émulsifiant : lécithine de tournesol, vanille.', nl: 'Cacaomassa, suiker, cacaoboter, emulgator: zonnebloemlecithine, vanille.' },
        claims: sku === 'PF-TAB-NOIR72' ? ['Cacao durable', 'Sans huile de palme'] : ['Sans huile de palme'],
      },
    });
    products[sku] = p.id;
    for (const a of alls) {
      const contains = !(sku === 'PF-TAB-NOIR72');
      await db.productAllergen.create({ data: { productId: p.id, allergenId: allergens[a]!, presence: contains ? 'CONTAINS' : 'MAY_CONTAIN' } });
    }
  }

  // ---------------------------------------------------------------------------
  // Recettes et gammes
  // ---------------------------------------------------------------------------
  const pierre = emp('Pierre');
  const sarah = emp('Sarah');
  const marc = emp('Marc');
  const couvNoir = await db.recipe.create({
    data: {
      code: 'R-NOIR72', name: 'Chocolat noir 72 % (couverture maison)', version: 3, status: 'APPROVED', yieldKg: dec(1000), durationMinutes: 26 * 60,
      createdById: pierre.userId, qualityApprovedById: sarah.userId, qualityApprovedAt: day(-90), productionApprovedById: marc.userId, productionApprovedAt: day(-89),
      lines: { create: [
        { itemId: items['MP-FEVE-CI']!, quantity: dec(520), uom: 'KG', lossPercent: dec(18), sortOrder: 1, phase: 'Masse' },
        { itemId: items['MP-FEVE-EC']!, quantity: dec(240), uom: 'KG', lossPercent: dec(18), sortOrder: 2, phase: 'Masse' },
        { itemId: items['MP-SUCRE']!, quantity: dec(270), uom: 'KG', sortOrder: 3, phase: 'Mélange' },
        { itemId: items['MP-BEURRE']!, quantity: dec(60), uom: 'KG', sortOrder: 4, phase: 'Conchage' },
        { itemId: items['MP-LECITHINE']!, quantity: dec(4), uom: 'KG', sortOrder: 5, phase: 'Conchage' },
        { itemId: items['MP-VANILLE']!, quantity: dec(0.2), uom: 'KG', sortOrder: 6, phase: 'Conchage' },
      ] },
      steps: { create: [
        { sequence: 10, operation: 'CLEANING_SORTING', durationMinutes: 60, targetParams: {}, instructions: 'Tri optique et épierrage des fèves.' },
        { sequence: 20, operation: 'ROASTING', machineType: 'ROASTER', durationMinutes: 35, isCcp: true, ccpCode: 'CCP1', targetParams: { temperatureC: { min: 125, target: 130, max: 140 }, holdMinutes: 20 }, instructions: 'Létalité salmonelles : température à coeur maintenue 20 min minimum.' },
        { sequence: 30, operation: 'WINNOWING', durationMinutes: 40, targetParams: { shellResiduePct: { max: 1.75 } } },
        { sequence: 40, operation: 'GRINDING', machineType: 'GRINDER', durationMinutes: 120, targetParams: { temperatureC: { max: 70 } } },
        { sequence: 50, operation: 'MIXING', durationMinutes: 30, targetParams: {} },
        { sequence: 60, operation: 'REFINING', durationMinutes: 180, targetParams: { particleSizeMicron: { max: 20 } } },
        { sequence: 70, operation: 'CONCHING', machineType: 'CONCHE', durationMinutes: 24 * 60, targetParams: { temperatureC: { min: 70, target: 75, max: 80 } } },
        { sequence: 80, operation: 'TEMPERING', machineType: 'TEMPERING_MACHINE', durationMinutes: 30, targetParams: { temperatureC: { min: 31, target: 31.5, max: 32 }, temperIndex: { min: 4.5, max: 5.5 } } },
      ] },
    },
  });
  const recTablette = await db.recipe.create({
    data: {
      code: 'R-TAB-NOIR72', name: 'Tablette Noir Intense 72 % 100 g (1000 tablettes)', productId: products['PF-TAB-NOIR72'], version: 2, status: 'APPROVED', yieldKg: dec(100), durationMinutes: 150,
      createdById: pierre.userId, qualityApprovedById: sarah.userId, qualityApprovedAt: day(-60), productionApprovedById: marc.userId, productionApprovedAt: day(-60),
      lines: { create: [
        { itemId: items['SF-NOIR72']!, quantity: dec(101.5), uom: 'KG', lossPercent: dec(1.5), sortOrder: 1 },
        { itemId: items['EMB-ALU']!, quantity: dec(0.5), uom: 'ROLL', sortOrder: 2 },
        { itemId: items['EMB-ETUI-100']!, quantity: dec(1000), uom: 'PIECE', sortOrder: 3 },
      ] },
      steps: { create: [
        { sequence: 10, operation: 'TEMPERING', machineType: 'TEMPERING_MACHINE', durationMinutes: 20, targetParams: { temperatureC: { min: 31, target: 31.5, max: 32 } } },
        { sequence: 20, operation: 'MOULDING', machineType: 'MOULDING_LINE', durationMinutes: 45, targetParams: { mouldTemperatureC: { min: 26, max: 28 } } },
        { sequence: 30, operation: 'COOLING', machineType: 'COOLING_TUNNEL', durationMinutes: 25, targetParams: { temperatureC: { min: 10, max: 14 } } },
        { sequence: 40, operation: 'DEMOULDING', durationMinutes: 10, targetParams: {} },
        { sequence: 50, operation: 'METAL_DETECTION', machineType: 'METAL_DETECTOR', durationMinutes: 10, isCcp: true, ccpCode: 'CCP2', targetParams: { testPiecesMm: { fe: 1.5, nonFe: 2.0, stainless: 2.5 } }, instructions: 'Test des témoins au démarrage, toutes les heures et à chaque changement de lot.' },
        { sequence: 60, operation: 'PACKAGING', machineType: 'PACKER', durationMinutes: 40, targetParams: {} },
      ] },
    },
  });
  void couvNoir;

  // ---------------------------------------------------------------------------
  // Lignes, machines, OF, lots, TRS
  // ---------------------------------------------------------------------------
  const lineDefs: Array<[string, string, string, number, number, number, Array<[string, string, string, Prisma.MachineCreateManyInput['status']]>]> = [
    ['L0', 'Masse de cacao', 'TORREF', 450, 0, -26, [['TORR-01', 'Torréfacteur à tambour', 'ROASTER', 'RUNNING'], ['BROY-01', 'Broyeur à billes', 'GRINDER', 'RUNNING'], ['CONCHE-01', 'Conche longue 3 t', 'CONCHE', 'RUNNING'], ['CONCHE-02', 'Conche longue 3 t', 'CONCHE', 'IDLE']]],
    ['L1', 'Tablettes', 'PROD', 600, -3, -7, [['TEMP-L1', 'Tempéreuse continue', 'TEMPERING_MACHINE', 'RUNNING'], ['MOUL-L1', 'Mouleuse tablettes', 'MOULDING_LINE', 'RUNNING'], ['TUN-L1', 'Tunnel de refroidissement', 'COOLING_TUNNEL', 'RUNNING'], ['DET-L1', 'Détecteur de métaux', 'METAL_DETECTOR', 'RUNNING'], ['EMB-L1', 'Emballeuse flow-pack', 'PACKER', 'BREAKDOWN']]],
    ['L2', 'Pralines et enrobage', 'PROD', 250, -3, -1, [['TEMP-L2', 'Tempéreuse', 'TEMPERING_MACHINE', 'RUNNING'], ['ENR-L2', 'Enrobeuse', 'ENROBER', 'RUNNING'], ['TUN-L2', 'Tunnel de refroidissement', 'COOLING_TUNNEL', 'RUNNING'], ['DET-L2', 'Détecteur de métaux', 'METAL_DETECTOR', 'RUNNING']]],
    ['L3', 'Moulages saisonniers', 'PROD', 180, -3, 4, [['MOUL-L3', 'Mouleuse creux (one-shot)', 'MOULDING_LINE', 'CLEANING'], ['DET-L3', 'Détecteur de métaux', 'METAL_DETECTOR', 'IDLE']]],
  ];
  const lines: Record<string, string> = {};
  const machines: Record<string, string> = {};
  for (const [code, name, b, rate, x, z, ms] of lineDefs) {
    const l = await db.productionLine.create({ data: { siteId: usine.id, buildingId: buildings[b], code, name, kind: code === 'L0' ? 'MASS' : 'FINISHING', nominalRateKgH: dec(rate), worldX: x, worldZ: z, status: 'RUNNING' } });
    lines[code] = l.id;
    let i = 0;
    for (const [mcode, mname, type, status] of ms) {
      const m = await db.machine.create({ data: { siteId: usine.id, lineId: l.id, code: mcode, name: mname, type, status, criticality: type === 'METAL_DETECTOR' ? 'A' : 'B', meterHours: 4000 + i * 731, worldX: x + i * 4, worldZ: z, iotTopic: `aurum/bxl/${code}/${mcode}` } });
      machines[mcode] = m.id;
      i++;
    }
  }

  const teamA = teams['PROD-A']!;
  const ofs = [
    { number: 'OF-2026-004211', line: 'L1', recipe: recTablette, product: 'PF-TAB-NOIR72', qty: 1200, status: 'IN_PROGRESS' as const, produced: 690, start: at(6, 10), end: at(13, 30) },
    { number: 'OF-2026-004212', line: 'L3', recipe: recTablette, product: 'PF-STNICOLAS-150', qty: 900, status: 'RELEASED' as const, produced: 0, start: at(9), end: at(13) },
    { number: 'OF-2026-004213', line: 'L1', recipe: recTablette, product: 'PF-TAB-NOIR72', qty: 1200, status: 'PLANNED' as const, produced: 0, start: at(14, 15), end: at(21, 30) },
  ];
  for (const o of ofs) {
    const po = await db.productionOrder.create({
      data: {
        number: o.number, siteId: usine.id, teamId: teamA.id, lineId: lines[o.line], productId: products[o.product], recipeId: o.recipe.id, recipeVersion: o.recipe.version,
        plannedQtyKg: dec(o.qty), producedQtyKg: dec(o.produced), plannedStart: o.start, plannedEnd: o.end, status: o.status, actualStart: o.status === 'IN_PROGRESS' ? o.start : null, createdById: emp('Sofie').userId,
        steps: { create: (['TEMPERING', 'MOULDING', 'COOLING', 'DEMOULDING', 'METAL_DETECTION', 'PACKAGING'] as const).map((op, i) => ({
          siteId: usine.id, teamId: teamA.id, sequence: (i + 1) * 10, operation: op,
          status: o.status === 'IN_PROGRESS' ? (i < 4 ? 'IN_PROGRESS' : i === 5 ? 'BLOCKED' : 'IN_PROGRESS') : 'TODO',
        })) },
      },
    });
    if (o.status === 'IN_PROGRESS') {
      await db.batch.create({ data: { code: `26${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}-L1-001`, siteId: usine.id, itemId: items['PF-TAB-NOIR72']!, orderId: po.id, kind: 'FINISHED_GOOD', quantity: dec(6900), uom: 'PIECE', producedAt: at(6, 40), bestBefore: day(540), status: 'QUARANTINE' } });
      await db.downtime.create({ data: { siteId: usine.id, teamId: teamA.id, machineId: machines['EMB-L1'], lineId: lines['L1'], orderId: po.id, category: 'BREAKDOWN', startedAt: at(10, 42), reason: 'Bourrage film sur l emballeuse', declaredByEmployeeId: emp('Emma').id } });
    }
  }
  for (const [code, oee, a, p, q] of [['L0', 0.81, 0.93, 0.9, 0.97], ['L1', 0.64, 0.78, 0.86, 0.95], ['L2', 0.77, 0.9, 0.88, 0.97], ['L3', 0.58, 0.7, 0.85, 0.98]] as const) {
    await db.oeeSnapshot.create({ data: { siteId: usine.id, lineId: lines[code]!, date: day(-1), shift: 'MATIN', plannedMinutes: 450, runMinutes: Math.round(450 * a), goodQtyKg: dec(2000 * oee), totalQtyKg: dec(2000 * oee / q), availability: dec(a), performance: dec(p), quality: dec(q), oee: dec(oee) } });
  }

  // ---------------------------------------------------------------------------
  // Entrepôts, emplacements, stock
  // ---------------------------------------------------------------------------
  const wh = async (code: string, name: string, b: string, kind: Prisma.WarehouseCreateManyInput['kind'], tmin?: number, tmax?: number) =>
    db.warehouse.create({ data: { siteId: usine.id, buildingId: buildings[b], code, name, kind, temperatureMin: tmin ? dec(tmin) : null, temperatureMax: tmax ? dec(tmax) : null } });
  const whMp = await wh('MP', 'Matières premières', 'ENT-MP', 'RAW_MATERIALS', 12, 20);
  const whPf = await wh('PF', 'Produits finis', 'ENT-PF', 'FINISHED_GOODS', 15, 18);
  const whQ = await wh('QUAR', 'Quarantaine', 'ENT-PF', 'QUARANTINE', 15, 18);
  await wh('PDR', 'Pièces détachées', 'ATELIER', 'SPARE_PARTS');
  const locs: Record<string, string[]> = { MP: [], PF: [], QUAR: [] };
  for (const [w, key] of [[whMp, 'MP'], [whPf, 'PF'], [whQ, 'QUAR']] as const) {
    const rows = key === 'QUAR' ? 1 : 4;
    for (let a = 1; a <= rows; a++) {
      for (let lvl = 1; lvl <= 3; lvl++) {
        const l = await db.location.create({ data: { siteId: usine.id, warehouseId: w.id, code: `${String.fromCharCode(64 + a)}-0${lvl}`, kind: key === 'QUAR' ? 'QUARANTINE' : 'RACK', capacityPallets: 12, worldX: a * 2.4, worldY: (lvl - 1) * 1.6, worldZ: 0 } });
        locs[key]!.push(l.id);
      }
    }
  }
  const supplierLot = (s: string) => `${s}-${Math.floor(100000 + (s.length * 7919) % 900000)}`;
  const stockDefs: Array<[string, string, number, number]> = [
    ['MP-FEVE-CI', 'MP', 0, 31500], ['MP-FEVE-EC', 'MP', 1, 6200], ['MP-BEURRE', 'MP', 2, 3100], ['MP-SUCRE', 'MP', 3, 18400], ['MP-LAIT', 'MP', 4, 7400],
    ['MP-NOISETTE', 'MP', 5, 1900], ['MP-VANILLE', 'MP', 6, 7], ['MP-LECITHINE', 'MP', 7, 410], ['EMB-ETUI-100', 'MP', 8, 96000], ['EMB-ALU', 'MP', 9, 55],
    ['PF-TAB-NOIR72', 'PF', 0, 41200], ['PF-TAB-LAITNOIS', 'PF', 1, 19800], ['PF-BALLOTIN-250', 'PF', 2, 3100], ['PF-STNICOLAS-150', 'PF', 3, 11800], ['PF-COUV-NOIR-5KG', 'PF', 4, 720],
  ];
  for (const [sku, w, li, qty] of stockDefs) {
    const it = itemDefs.find((d) => d[0] === sku)!;
    const batch = await db.batch.create({
      data: { code: supplierLot(sku), siteId: usine.id, itemId: items[sku]!, kind: it[2] === 'FINISHED_GOOD' ? 'FINISHED_GOOD' : 'RAW_MATERIAL', quantity: dec(qty), uom: it[4], receivedAt: day(-20), bestBefore: day(200), status: 'RELEASED', origin: sku.startsWith('MP-FEVE-CI') ? { country: 'CI', cooperative: 'Coopérative Kakao Ahoko' } : undefined },
    });
    await db.stockLot.create({ data: { siteId: usine.id, itemId: items[sku]!, batchId: batch.id, lotKey: batch.id, locationId: locs[w]![li]!, quantity: dec(qty), uom: it[4], bestBefore: day(200), unitCost: dec(it[5]) } });
  }

  // ---------------------------------------------------------------------------
  // Qualité : HACCP, contrôles, non-conformité, certifications
  // ---------------------------------------------------------------------------
  const haccp = await db.haccpPlan.create({
    data: {
      siteId: usine.id, version: 3, status: 'APPROVED', scope: 'Fabrication de chocolat de la fève à la tablette', approvedById: sarah.userId, approvedAt: day(-120), reviewDueAt: day(245),
      ccps: { create: [
        { code: 'CCP1', name: 'Torréfaction', hazard: 'Salmonella spp. sur fèves crues', criticalLimits: { temperatureC: { min: 125 }, holdMinutes: { min: 20 } }, monitoring: 'Enregistrement continu température à coeur', frequency: 'Chaque fournée', correctiveAction: 'Blocage du lot, re-torréfaction ou destruction', operation: 'ROASTING' },
        { code: 'CCP2', name: 'Détection des métaux', hazard: 'Corps étrangers métalliques', criticalLimits: { testPiecesMm: { fe: 1.5, nonFe: 2.0, stainless: 2.5 } }, monitoring: 'Test des témoins', frequency: 'Démarrage, toutes les heures, changement de lot', correctiveAction: 'Isoler et repasser toute la production depuis le dernier test conforme', operation: 'METAL_DETECTION' },
      ] },
    },
    include: { ccps: true },
  });
  const ccp2 = haccp.ccps.find((c) => c.code === 'CCP2')!;
  for (let h = 6; h <= Math.min(13, Math.max(6, new Date().getHours())); h++) {
    await db.qualityCheck.create({ data: { siteId: usine.id, kind: 'CCP', ccpId: ccp2.id, machineId: machines['DET-L1'], performedByEmployeeId: emp('Karim').id, performedAt: at(h, 5), values: { fe: 'REJECTED', nonFe: 'REJECTED', stainless: 'REJECTED' }, result: 'PASS' } });
  }
  await db.qualityCheck.create({ data: { siteId: usine.id, kind: 'IN_LINE', machineId: machines['TEMP-L1'], performedByEmployeeId: emp('Emma').id, performedAt: at(7, 15), values: { temperatureC: 31.4, temperIndex: 5.1 }, result: 'PASS' } });
  const nc = await db.nonConformity.create({ data: { number: 'NC-2026-0187', siteId: usine.id, source: 'INTERNAL', severity: 'MINOR', title: 'Blanchiment gras sur tablettes lait (lot de la veille)', description: 'Traces blanchâtres constatées sur 3 % des tablettes au contrôle final.', productId: products['PF-TAB-LAITNOIS'], reportedByEmployeeId: emp('Hugo').id, status: 'ANALYSIS' } });
  await db.capa.create({ data: { siteId: usine.id, nonConformityId: nc.id, kind: 'CORRECTIVE', title: 'Vérifier la courbe de tempérage L1 et l étalonnage de la sonde', description: 'Contrôle de la sonde PT100 et ajustement de la consigne.', ownerEmployeeId: emp('Samir').id, dueDate: day(3) } });
  await db.qualityCertification.create({ data: { siteId: usine.id, scheme: 'IFS_FOOD', certificateNumber: 'IFS-BE-26-0421', issuedAt: day(-200), validUntil: day(165), certificationBody: 'Certif Food Audit', grade: 'Higher level' } });

  // ---------------------------------------------------------------------------
  // Outils, étalonnage, prêts
  // ---------------------------------------------------------------------------
  const toolDefs: Array<[string, string, string, boolean]> = [
    ['MOULE-TAB-01', 'Moule tablette 100 g (24 empreintes)', 'POLYCARBONATE_MOULD', false],
    ['MOULE-TAB-02', 'Moule tablette 100 g (24 empreintes)', 'POLYCARBONATE_MOULD', false],
    ['MOULE-STN-01', 'Moule Saint-Nicolas 150 g', 'POLYCARBONATE_MOULD', false],
    ['THERMO-01', 'Thermomètre sonde étalonné', 'MEASURING_INSTRUMENT', true],
    ['THERMO-02', 'Thermomètre sonde étalonné', 'MEASURING_INSTRUMENT', true],
    ['BALANCE-01', 'Balance de précision 30 kg', 'MEASURING_INSTRUMENT', true],
    ['VISS-01', 'Visseuse sans fil', 'POWER_TOOL', false],
    ['CLE-DYN-01', 'Clé dynamométrique 5-60 Nm', 'HAND_TOOL', true],
  ];
  const tools: Record<string, string> = {};
  for (const [code, name, cat, cal] of toolDefs) {
    const t = await db.tool.create({ data: { siteId: usine.id, code, name, category: cat, qrCode: `TOOL:${code}`, requiresCalibration: cal, calibrationIntervalDays: cal ? 180 : null, nextCalibrationAt: cal ? (code === 'THERMO-02' ? day(-2) : day(90)) : null, cavityCount: cat === 'POLYCARBONATE_MOULD' ? 24 : null, maxCycles: cat === 'POLYCARBONATE_MOULD' ? 50000 : null, cycles: cat === 'POLYCARBONATE_MOULD' ? 31250 : 0, value: dec(cat === 'POLYCARBONATE_MOULD' ? 420 : 160) } });
    tools[code] = t.id;
  }
  await db.tool.update({ where: { id: tools['VISS-01']! }, data: { status: 'ON_LOAN' } });
  await db.toolLoan.create({ data: { toolId: tools['VISS-01']!, employeeId: emp('Samir').id, siteId: usine.id, teamId: teams['MAINT']!.id, borrowedAt: at(8, 50), dueAt: at(17), deviceId: kiosk.id } });
  await db.tool.update({ where: { id: tools['THERMO-01']! }, data: { status: 'ON_LOAN' } });
  await db.toolLoan.create({ data: { toolId: tools['THERMO-01']!, employeeId: emp('Emma').id, siteId: usine.id, teamId: teamA.id, borrowedAt: at(6, 12), dueAt: at(14) } });
  await db.calibration.create({ data: { siteId: usine.id, toolId: tools['THERMO-01'], performedAt: day(-60), performedBy: 'EXTERNAL', provider: 'Métrologie Benelux', result: 'PASS', nextDueAt: day(120) } });

  // ---------------------------------------------------------------------------
  // Maintenance
  // ---------------------------------------------------------------------------
  await db.maintenancePlan.create({ data: { siteId: usine.id, machineId: machines['TEMP-L1']!, name: 'Contrôle sonde et échangeur tempéreuse', trigger: 'CALENDAR', intervalDays: 30, nextDueAt: day(4), estimatedMinutes: 90, tasks: [{ label: 'Vérifier sonde PT100' }, { label: 'Nettoyer échangeur' }], requiredSkills: ['FOOD_HYGIENE'] } });
  await db.maintenancePlan.create({ data: { siteId: usine.id, machineId: machines['CONCHE-01']!, name: 'Graissage paliers conche', trigger: 'RUN_HOURS', intervalHours: 500, nextDueAt: day(9), estimatedMinutes: 60, tasks: [{ label: 'Graissage alimentaire H1' }], requiredSkills: [] } });
  await db.workOrder.create({ data: { number: 'BI-2026-01342', siteId: usine.id, teamId: teams['MAINT']!.id, machineId: machines['EMB-L1'], kind: 'CORRECTIVE', priority: 'P2', status: 'IN_PROGRESS', title: 'Emballeuse L1 : bourrage film récurrent', requestedByEmployeeId: emp('Emma').id, assignedToEmployeeId: emp('Samir').id, startedAt: at(10, 55), requiresHygieneClearance: true } });
  await db.workOrder.create({ data: { number: 'BI-2026-01343', siteId: usine.id, teamId: teams['MAINT']!.id, machineId: machines['TEMP-L1'], kind: 'PREVENTIVE', priority: 'P3', status: 'PLANNED', title: 'Préventif mensuel tempéreuse L1', assignedToEmployeeId: emp('Jan').id, plannedAt: day(4) } });

  // ---------------------------------------------------------------------------
  // Achats et fournisseurs
  // ---------------------------------------------------------------------------
  const supplierDefs: Array<[string, string, string, string]> = [
    ['F-AHOKO', 'Coopérative Kakao Ahoko', 'CI', 'COCOA_BEANS'],
    ['F-RIOVERDE', 'Hacienda Río Verde', 'EC', 'COCOA_BEANS'],
    ['F-SUCRE', 'Sucrerie du Brabant', 'BE', 'INGREDIENTS'],
    ['F-LAIT', 'Laiterie des Hautes Fagnes', 'BE', 'INGREDIENTS'],
    ['F-NOCCIOLE', 'Nocciole Langhe SRL', 'IT', 'INGREDIENTS'],
    ['F-EMB', 'Emballages Meuse SA', 'BE', 'PACKAGING'],
    ['F-FRIGO', 'Frigotech SRL', 'BE', 'MAINTENANCE'],
    ['F-TRANS', 'TransFroid Benelux', 'BE', 'TRANSPORT'],
  ];
  const suppliers: Record<string, string> = {};
  for (const [code, name, country, kind] of supplierDefs) {
    const s = await db.supplier.create({ data: { companyId: company.id, code, name, country, kind, status: 'APPROVED', qualityRating: 4, deliveryRating: code === 'F-NOCCIOLE' ? 2 : 4, address: { country }, incoterm: country === 'BE' ? 'DAP' : 'FOB' } });
    suppliers[code] = s.id;
  }
  await db.dueDiligence.create({ data: { supplierId: suppliers['F-AHOKO']!, itemId: items['MP-FEVE-CI'], reference: 'DDS-2026-CI-0091', countryOfProduction: 'CI', riskAssessment: 'STANDARD', status: 'SUBMITTED', submittedAt: day(-40), plots: { type: 'FeatureCollection', features: [] }, mitigation: 'Audit terrain annuel, cartographie satellite des parcelles' } });
  const contract = await db.supplierContract.create({ data: { supplierId: suppliers['F-AHOKO']!, number: 'CC-2026-FEVES-01', kind: 'FRAMEWORK', itemId: items['MP-FEVE-CI'], startDate: day(-200), endDate: day(165), totalQty: dec(400000), uom: 'KG', priceFormula: 'Cours cacao Londres M+2 + différentiel origine', status: 'ACTIVE' } });
  await db.purchaseOrder.create({
    data: {
      number: 'CA-2026-00877', siteId: usine.id, supplierId: suppliers['F-AHOKO']!, buyerEmployeeId: emp('Tom').id, contractId: contract.id, status: 'CONFIRMED', expectedDate: day(12), totalExclVat: dec(120000), totalVat: dec(7200), incoterm: 'FOB',
      lines: { create: [{ itemId: items['MP-FEVE-CI']!, quantity: dec(25000), uom: 'KG', unitPrice: dec(4.8), vatRate: dec(6) }] },
    },
  });
  await db.purchaseOrder.create({
    data: {
      number: 'CA-2026-00878', siteId: usine.id, supplierId: suppliers['F-NOCCIOLE']!, buyerEmployeeId: emp('Tom').id, status: 'TO_APPROVE', expectedDate: day(9), totalExclVat: dec(17250), totalVat: dec(1035),
      lines: { create: [{ itemId: items['MP-NOISETTE']!, quantity: dec(1500), uom: 'KG', unitPrice: dec(11.5), vatRate: dec(6) }] },
    },
  });
  await db.purchaseRequest.create({ data: { number: 'DA-2026-00311', siteId: usine.id, departmentId: depts['MAINT']!.id, requestedByEmployeeId: emp('Olivier').id, itemId: items['PD-COURROIE-L1'], description: 'Courroie de rechange mouleuse L1', quantity: dec(2), uom: 'PIECE', estimatedAmount: dec(480), status: 'SUBMITTED' } });

  // ---------------------------------------------------------------------------
  // Clients, prospects, devis, commandes, factures
  // ---------------------------------------------------------------------------
  const noa = emp('Noa');
  const elias = emp('Elias');
  const customerDefs: Array<[string, string, Prisma.CustomerCreateManyInput['segment'], string, string, number, number, string]> = [
    ['C-LUMEN', 'Supermarchés Lumen', 'RETAIL_CHAIN', 'Bruxelles', 'Noa', -58, 56, 'supermarket'],
    ['C-VANACKER', 'Épiceries Van Acker', 'WHOLESALER', 'Gand', 'Elias', -30, 56, 'warehouse'],
    ['C-HERMANS', 'Pâtisserie Hermans et Fils', 'ARTISAN', 'Namur', 'Noa', 14, 56, 'shop'],
    ['C-BELVEDERE', 'Hôtel Belvédère Ixelles', 'HORECA', 'Ixelles', 'Noa', 42, 56, 'hotel'],
    ['C-NOVA', 'Cadeaux Corporate Nova', 'CORPORATE', 'Wavre', 'Elias', -58, 80, 'office'],
    ['C-NORDIC', 'Nordic Sweets AB', 'EXPORT', 'Malmö', 'Elias', -30, 80, 'warehouse'],
    ['C-CANAL', 'Brasserie du Canal Vert', 'HORECA', 'Bruxelles', 'Noa', 14, 80, 'restaurant'],
    ['C-DELMOTTE', 'Maison Delmotte Traiteur', 'HORECA', 'Liège', 'Elias', 42, 80, 'shop'],
  ];
  const customers: Record<string, string> = {};
  for (const [code, name, segment, city, owner, x, z, style] of customerDefs) {
    const c = await db.customer.create({ data: { companyId: company.id, code, name, segment, city, accountManagerEmployeeId: emp(owner).id, billingAddress: { city, country: code === 'C-NORDIC' ? 'SE' : 'BE' }, country: code === 'C-NORDIC' ? 'SE' : 'BE', worldX: x, worldZ: z, buildingStyle: style, creditLimit: dec(segment === 'RETAIL_CHAIN' ? 250000 : 25000), peppolId: code === 'C-NORDIC' ? null : `0208:08${code.length}0000${x < 0 ? 1 : 2}` } });
    customers[code] = c.id;
  }
  const soDefs: Array<[string, string, Prisma.SalesOrderCreateManyInput['status'], number, number, string]> = [
    ['CV-2026-03101', 'C-LUMEN', 'IN_PRODUCTION', 40, 64200, 'PF-TAB-NOIR72'],
    ['CV-2026-03102', 'C-VANACKER', 'PICKING', 70, 18800, 'PF-TAB-LAITNOIS'],
    ['CV-2026-03103', 'C-HERMANS', 'DELIVERED', 100, 2740, 'PF-COUV-NOIR-5KG'],
    ['CV-2026-03104', 'C-NOVA', 'CONFIRMED', 10, 9600, 'PF-BALLOTIN-250'],
    ['CV-2026-03105', 'C-NORDIC', 'SHIPPED', 90, 31200, 'PF-STNICOLAS-150'],
    ['CV-2026-03106', 'C-BELVEDERE', 'READY', 80, 1950, 'PF-BALLOTIN-250'],
    ['CV-2026-03107', 'C-DELMOTTE', 'IN_PRODUCTION', 45, 4300, 'PF-STNICOLAS-150'],
  ];
  for (const [number, cust, status, progress, amount, sku] of soDefs) {
    const c = customerDefs.find((d) => d[0] === cust)!;
    const so = await db.salesOrder.create({
      data: {
        number, customerId: customers[cust]!, salesRepEmployeeId: emp(c[4]).id, shippingSiteId: usine.id, status, progress, totalExclVat: dec(amount), totalVat: dec(amount * 0.06), requestedDeliveryDate: day(6),
        lines: { create: [{ productId: products[sku]!, quantity: dec(Math.round(amount / 1.6)), unitPrice: dec(1.6), vatRate: dec(6) }] },
      },
    });
    if (status === 'DELIVERED') {
      await db.invoice.create({ data: { number: '2026/000981', customerId: customers[cust]!, salesRepEmployeeId: emp(c[4]).id, salesOrderId: so.id, issueDate: day(-2), dueDate: day(28), totalExclVat: dec(amount), totalVat: dec(amount * 0.06), totalInclVat: dec(amount * 1.06), status: 'SENT', peppolStatus: 'ACCEPTED', structuredCommunication: '+++000/0000/98197+++', createdById: emp('Charlotte').userId, lines: { create: [{ description: 'Couverture Noir 72 % pistoles 5 kg', quantity: dec(80), unitPrice: dec(34.25), vatRate: dec(6), totalExclVat: dec(amount) }] } } });
    }
  }
  const leadNames = ['Fleurs et Co', 'Garage Leroy', 'Café Margot', 'Coiffure Élise', 'Atelier Martens', 'Fitness Hub Uccle', 'Studio Pilates Louise', 'Tattoo Ink Saint-Gilles', 'Karting 4000', 'Salon Iris', 'Boucherie Lambert', 'Pâtisserie Noël', 'Bar Le Quai', 'Brasserie du Coin', 'Garage Delvaux', 'Institut Aube', 'Boulangerie Marot', 'Coach Élan', 'Studio Lumen', 'Le Comptoir Gourmand', 'Hôtel Mont des Arts', 'Fromagerie Vandamme', 'Épicerie Fine Rosa', 'Traiteur Saveurs du Sud'];
  const stages: Prisma.LeadCreateManyInput['stage'][] = ['TO_CALL', 'TO_CALL', 'TO_CALL', 'TO_CALL', 'TO_CALL', 'TO_CALL', 'TO_CALL', 'TO_CALL', 'NO_ANSWER', 'NO_ANSWER', 'NO_ANSWER', 'NO_ANSWER', 'FOLLOW_UP', 'FOLLOW_UP', 'FOLLOW_UP', 'MEETING', 'MEETING', 'MEETING', 'QUALIFIED', 'QUALIFIED', 'WON', 'WON', 'ARCHIVED', 'LOST'];
  for (let i = 0; i < leadNames.length; i++) {
    const owner = i % 2 === 0 ? noa : elias;
    const lead = await db.lead.create({ data: { ownerEmployeeId: owner.id, company: leadNames[i]!, contactName: 'Responsable achats', segment: i % 3 === 0 ? 'HORECA' : i % 3 === 1 ? 'CORPORATE' : 'PARTNER_STORE', source: i % 4 === 0 ? 'TRADE_FAIR' : 'OUTBOUND', stage: stages[i]!, score: (i * 13) % 100, nextActionAt: day(i % 5) } });
    if (stages[i] !== 'TO_CALL') {
      await db.activity.create({ data: { ownerEmployeeId: owner.id, kind: 'CALL', leadId: lead.id, subject: 'Premier appel', outcome: stages[i] === 'NO_ANSWER' ? 'NO_ANSWER' : 'REACHED', at: at(9, i) } });
    }
  }
  await db.quote.create({ data: { number: 'DV-2026-00450', ownerEmployeeId: noa.id, customerId: customers['C-BELVEDERE'], status: 'TO_APPROVE', validUntil: day(20), discountPercent: dec(12), totalExclVat: dec(5400), totalVat: dec(324), lines: { create: [{ productId: products['PF-BALLOTIN-250']!, quantity: dec(400), unitPrice: dec(13.5), vatRate: dec(6), discountPercent: dec(12) }] } } });

  // ---------------------------------------------------------------------------
  // Boutiques
  // ---------------------------------------------------------------------------
  for (const [s, name, cashier] of [[sablon, 'Boutique du Sablon', 'Zineb'], [louise, 'Boutique Louise', 'Milan']] as const) {
    const store = await db.store.create({ data: { siteId: s.id, name, openingHours: { mon_sat: '09:30-18:30', sun: '10:00-17:00' }, registerCount: 2, clickAndCollect: true } });
    const session = await db.posSession.create({ data: { siteId: s.id, storeId: store.id, cashierEmployeeId: emp(cashier).id, registerCode: 'CAISSE-1', openedAt: at(9, 25), openingFloat: dec(150) } });
    for (let i = 0; i < 6; i++) {
      await db.posSale.create({ data: { number: `${s.code}-${i + 1}`, siteId: s.id, sessionId: session.id, cashierEmployeeId: emp(cashier).id, at: at(10, i * 9), totalInclVat: dec(18.5 + i * 7), totalVat: dec((18.5 + i * 7) * 0.0566), paymentMethod: i % 3 === 0 ? 'PAYCONIQ' : 'CARD', receiptNumber: `T${1000 + i}`, lines: { create: [{ productId: products['PF-BALLOTIN-250']!, quantity: dec(1), unitPrice: dec(18.5 + i * 7), vatRate: dec(6) }] } } });
    }
  }

  // ---------------------------------------------------------------------------
  // Logistique
  // ---------------------------------------------------------------------------
  const carrier = await db.carrier.create({ data: { name: 'TransFroid Benelux', kind: 'REFRIGERATED' } });
  const van = await db.vehicle.create({ data: { siteId: usine.id, plate: '1-AUR-026', kind: 'REFRIGERATED_VAN', assignedEmployeeId: emp('Rachid').id, mileage: 48210, inspectionDueAt: day(40) } });
  const route = await db.deliveryRoute.create({ data: { siteId: usine.id, date: today, driverEmployeeId: emp('Rachid').id, vehicleId: van.id, status: 'IN_PROGRESS', startedAt: at(7, 30), stops: [{ customer: 'C-BELVEDERE', eta: '09:10' }, { customer: 'C-CANAL', eta: '10:05' }] } });
  await db.shipment.create({ data: { number: 'EXP-2026-02210', siteId: usine.id, carrierId: carrier.id, routeId: route.id, status: 'IN_TRANSIT', pallets: 1, parcels: 14, tempControlled: true, shippedAt: at(7, 30) } });
  await db.pickingList.create({ data: { number: 'PREP-2026-05530', siteId: usine.id, assignedToEmployeeId: emp('Anaïs').id, status: 'IN_PROGRESS', priority: 2, startedAt: at(8, 40), lines: { create: [{ itemId: items['PF-TAB-LAITNOIS']!, fromLocationId: locs['PF']![1]!, quantity: dec(11750), pickedQty: dec(7200) }] } } });

  // ---------------------------------------------------------------------------
  // HSE, finance, communication
  // ---------------------------------------------------------------------------
  await db.incident.create({ data: { number: 'INC-2026-0064', siteId: usine.id, reportedByEmployeeId: emp('Youssef').id, kind: 'NEAR_MISS', occurredAt: at(8, 15, -2), location: 'Allée B entrepôt PF', description: 'Palette mal filmée, chute de cartons évitée de justesse.', immediateActions: 'Zone balisée, palette refilmée.', status: 'ANALYSIS' } });
  await db.riskAssessment.create({ data: { siteId: usine.id, title: 'Poste opérateur tempéreuse L1', hazards: [{ hazard: 'Brûlure (chocolat 45 °C, eau chaude)', severity: 2, probability: 2, score: 4 }, { hazard: 'Coincement tapis', severity: 3, probability: 1, score: 3 }], measures: [{ label: 'Gants anti-chaleur', status: 'DONE' }], status: 'APPROVED', nextReviewAt: day(200) } });
  for (const [code, label, type] of [['400000', 'Clients', 'ASSET'], ['440000', 'Fournisseurs', 'LIABILITY'], ['550000', 'Banque', 'ASSET'], ['600000', 'Achats de matières premières', 'EXPENSE'], ['604000', 'Achats de marchandises', 'EXPENSE'], ['620000', 'Rémunérations', 'EXPENSE'], ['700000', 'Ventes', 'INCOME'], ['451000', 'TVA à payer', 'LIABILITY'], ['411000', 'TVA à récupérer', 'ASSET']] as const) {
    await db.ledgerAccount.create({ data: { companyId: company.id, code, label, type } });
  }
  await db.costSheet.create({ data: { productId: products['PF-TAB-NOIR72']!, recipeId: recTablette.id, recipeVersion: 2, period: `${year}-Q4`, method: 'STANDARD', materialCost: dec(0.66), packagingCost: dec(0.09), laborCost: dec(0.08), energyCost: dec(0.03), overheadCost: dec(0.06), totalCostPerKg: dec(9.2), totalCostPerUnit: dec(0.92), assumptions: { cocoaPricePerKg: 4.8 } } });
  await db.announcement.create({ data: { siteId: usine.id, title: 'Pic de production Saint-Nicolas', body: 'Les lignes L1 et L3 tournent en 3x8 jusqu au 5 décembre. Merci à toutes et à tous !', priority: 'IMPORTANT', publishedAt: new Date(), authorUserId: marc.userId } });
  await db.announcement.create({ data: { siteId: usine.id, title: 'Rappel sécurité : allée B', body: 'Suite à un presque-accident, vérifiez le filmage des palettes avant stockage en hauteur.', priority: 'URGENT', requiresAck: true, publishedAt: new Date(), authorUserId: emp('Yves').userId } });

  // ---------------------------------------------------------------------------
  // Progression : quêtes et succès
  // ---------------------------------------------------------------------------
  const questDefs: Array<[string, string, RoleKey[], Prisma.QuestTemplateCreateManyInput['cadence'], object, number]> = [
    ['Q-OP-TEMPER', 'Réaliser 3 contrôles de tempérage sur ton poste', ['OPERATEUR'], 'DAILY', { event: 'quality_check.created', filter: { kind: 'IN_LINE' }, count: 3 }, 30],
    ['Q-OP-SAFETY', 'Signaler une situation dangereuse ou une idée d amélioration', ['OPERATEUR', 'MAGASINIER'], 'WEEKLY', { event: 'incident.created', filter: { kind: ['NEAR_MISS', 'UNSAFE_CONDITION'] }, count: 1 }, 60],
    ['Q-COM-CALLS', 'Passer 50 appels', ['COMMERCIAL'], 'DAILY', { event: 'activity.created', filter: { kind: 'CALL' }, count: 50 }, 100],
    ['Q-COM-FOLLOW', 'Relancer 2 clients', ['COMMERCIAL'], 'DAILY', { event: 'activity.created', filter: { outcome: 'CALL_BACK' }, count: 2 }, 40],
    ['Q-COM-CUST', 'Compléter 3 fiches clients', ['COMMERCIAL'], 'DAILY', { event: 'customer.updated', count: 3 }, 30],
    ['Q-MAG-INV', 'Compter 20 emplacements en inventaire tournant', ['MAGASINIER'], 'DAILY', { event: 'inventory_line.counted', count: 20 }, 50],
    ['Q-MAINT-CAUSE', 'Clôturer 2 interventions avec la cause renseignée', ['TECHNICIEN_MAINTENANCE'], 'DAILY', { event: 'work_order.closed', filter: { hasCause: true }, count: 2 }, 50],
    ['Q-QUAL-REC', 'Réaliser 5 contrôles à réception', ['TECHNICIEN_QUALITE'], 'DAILY', { event: 'quality_check.created', filter: { kind: 'RECEPTION' }, count: 5 }, 40],
    ['Q-BOUT-FID', 'Inscrire 3 clients au programme fidélité', ['VENDEUR_BOUTIQUE'], 'DAILY', { event: 'loyalty_member.created', count: 3 }, 30],
    ['Q-MGR-CORR', 'Traiter les corrections de pointage en attente', ['MANAGER_EQUIPE', 'CHEF_EQUIPE'], 'DAILY', { metric: 'pending_time_corrections', target: 0 }, 40],
    ['Q-ALL-ACK', 'Lire l annonce sécurité de la semaine', ['EMPLOYE'], 'WEEKLY', { event: 'announcement.acknowledged', count: 1 }, 15],
  ];
  const qt: Record<string, { id: string; title: string; xp: number; target: number }> = {};
  for (const [code, title, roles, cadence, objective, xp] of questDefs) {
    const t = await db.questTemplate.create({ data: { companyId: company.id, code, title, roleKeys: roles, cadence, objective, xpReward: xp } });
    qt[code] = { id: t.id, title, xp, target: (objective as { count?: number }).count ?? 1 };
  }
  const giveQuest = (e: (typeof employees)[number], code: string, progress: number) =>
    db.quest.create({ data: { templateId: qt[code]!.id, employeeId: e.id, teamId: e.teamId, date: today, title: qt[code]!.title, target: qt[code]!.target, progress, status: progress >= qt[code]!.target ? 'COMPLETED' : 'ACTIVE', xpAwarded: progress >= qt[code]!.target ? qt[code]!.xp : 0 } });
  await giveQuest(noa, 'Q-COM-CALLS', 18);
  await giveQuest(noa, 'Q-COM-FOLLOW', 2);
  await giveQuest(noa, 'Q-COM-CUST', 0);
  await giveQuest(emp('Emma'), 'Q-OP-TEMPER', 1);
  await giveQuest(emp('Emma'), 'Q-OP-SAFETY', 0);
  await giveQuest(emp('Youssef'), 'Q-MAG-INV', 12);
  await giveQuest(emp('Karim'), 'Q-MGR-CORR', 0);
  await db.xpEvent.create({ data: { employeeId: noa.id, amount: 20, source: 'ACTION', reason: 'Rendez-vous planifié' } });

  for (const [code, title, description, icon] of [
    ['FIRST_CHECK', 'Premier contrôle', 'Ton premier contrôle qualité enregistré', 'ShieldCheck'],
    ['SAFETY_WATCH', 'Vigie sécurité', '5 situations dangereuses signalées', 'Siren'],
    ['TEMPER_MASTER', 'Maître du tempérage', '100 contrôles de tempérage conformes', 'Thermometer'],
    ['CLOSER', 'Signature', 'Premier client signé', 'PenLine'],
    ['STREAK_10', 'Régulier', '10 jours de quêtes accomplies', 'Flame'],
  ] as const) {
    await db.achievement.create({ data: { code, title, description, icon, condition: {} } });
  }

  // ---------------------------------------------------------------------------
  // Paramètres
  // ---------------------------------------------------------------------------
  const settings: Array<[string, Prisma.InputJsonValue]> = [
    ['time.rules', { dailyNormalHours: 8, weeklyNormalHours: 38, minRestBetweenShiftsHours: 11, minBreakAfterHours: 6, minBreakMinutes: 15, nightStart: '20:00', nightEnd: '06:00', rounding: 'NONE', clockGraceMinutes: 0, mobileClockingAllowedRoles: ['COMMERCIAL', 'CHAUFFEUR', 'TECHNICIEN_MAINTENANCE'] }],
    ['gamification', { enabled: true, leaderboard: 'TEAM_ANONYMOUS', neverRewardSpeed: true, xpPerLevel: 512 }],
    ['security', { sessionIdleMinutes: 30, passwordMinLength: 12, lockoutThreshold: 5, lockoutMinutes: 15 }],
    ['retention', { accessEventsDays: 180, visitorsDays: 90, timeEntriesYears: 5, payrollYears: 5, auditLogYears: 10 }],
  ];
  for (const [key, value] of settings) await db.setting.create({ data: { companyId: company.id, key, value } });

  console.log(`Seed terminé : ${employees.length} employés, mot de passe ${DEMO_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
