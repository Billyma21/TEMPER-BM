/**
 * Rôles métier de TEMPER.
 *
 * Principes (voir docs/reunions/03-securite-et-droits.md) :
 * - Moindre privilège : chaque rôle reçoit le strict nécessaire à son métier.
 * - Composition : un utilisateur cumule des rôles (ex. CHEF_EQUIPE + RESPONSABLE_MAINTENANCE),
 *   chacun limité à un périmètre (sites, départements, équipes) et à une période.
 * - Le socle EMPLOYE (ou EXTERNE) est ajouté automatiquement, jamais attribué à la main.
 * - Les données sensibles (paie, aptitude médicale, recettes, coûts) sont des sujets séparés.
 *
 * MAAYOUD
 */
import {
  type Action,
  type AppSubject,
  type Scope,
  type SubjectName,
  DIRECTORY_FIELDS,
  SELF_EDITABLE_EMPLOYEE_FIELDS,
  SUBJECT_NAMES,
  SUBJECTS,
} from './catalog';

export type NeutralCondition = Record<
  string,
  string | number | boolean | null | { in: ReadonlyArray<string | number> }
>;

export interface Grant {
  actions: readonly Action[];
  subjects: readonly AppSubject[];
  scope: Scope;
  fields?: readonly string[];
  /** Conditions métier additionnelles, combinées (ET) avec la portée. */
  conditions?: NeutralCondition;
}

export type RoleCategory =
  | 'socle'
  | 'direction'
  | 'rh'
  | 'production'
  | 'qualite'
  | 'maintenance'
  | 'logistique'
  | 'achats'
  | 'commercial'
  | 'boutique'
  | 'finance'
  | 'securite'
  | 'it'
  | 'externe'
  | 'appareil';

export type AvatarOutfit =
  | 'chemise'
  | 'costume'
  | 'blouse-blanche'
  | 'blouse-verte'
  | 'combinaison-bleue'
  | 'gilet-orange'
  | 'tablier-boutique'
  | 'gilet-securite'
  | 'visiteur';

export interface RoleDef {
  label: string;
  description: string;
  category: RoleCategory;
  inherits?: readonly RoleKey[];
  grants: readonly Grant[];
  /** Le rôle n'est actif que si la session a validé un second facteur. */
  requiresMfa: boolean;
  /** Peut être délégué temporairement (absence, congés). */
  delegable: boolean;
  /** Rôle destiné à des personnes sans contrat de travail chez nous. */
  external?: boolean;
  /** Rôle socle ajouté automatiquement : non attribuable manuellement. */
  base?: boolean;
  /** Durée maximale d'une session (minutes). */
  maxSessionMinutes: number;
  /** Tenue de l'avatar dans le monde 3D. */
  avatar: AvatarOutfit;
}

const g = (
  actions: Action | readonly Action[],
  subjects: AppSubject | readonly AppSubject[],
  scope: Scope,
  extra: Pick<Grant, 'fields' | 'conditions'> = {},
): Grant => ({
  actions: (Array.isArray(actions) ? actions : [actions]) as Action[],
  subjects: (Array.isArray(subjects) ? subjects : [subjects]) as AppSubject[],
  scope,
  ...extra,
});

const CRU: Action[] = ['create', 'read', 'update'];
const RU: Action[] = ['read', 'update'];
const CR: Action[] = ['create', 'read'];

const subjectsOfModule = (...modules: string[]): SubjectName[] =>
  SUBJECT_NAMES.filter((s) => modules.includes(SUBJECTS[s].module));

/** Sujets que la direction ne voit jamais en nominatif (uniquement en agrégé via les rapports). */
const PRIVATE_INDIVIDUAL: SubjectName[] = [
  'EmployeePayroll',
  'EmployeeMedical',
  'AccessEvent',
  'WorldPresence',
  'Notification',
  'ApiKey',
  'SupplierBankAccount',
  'DataRequest',
];

const ALL_BUT_PRIVATE = SUBJECT_NAMES.filter((s) => !PRIVATE_INDIVIDUAL.includes(s));

const OPERATIONAL_SITE_SUBJECTS: SubjectName[] = SUBJECT_NAMES.filter((s) => {
  const def = SUBJECTS[s];
  return 'site' in def.ownership && !PRIVATE_INDIVIDUAL.includes(s);
});

export const ROLE_KEYS = [
  'EMPLOYE',
  'EXTERNE',
  'SUPER_ADMIN',
  'ADMIN_IT',
  'DIRECTION_GENERALE',
  'DIRECTEUR_SITE',
  'DRH',
  'GESTIONNAIRE_RH',
  'GESTIONNAIRE_PAIE',
  'CONSEILLER_PREVENTION',
  'REPRESENTANT_PERSONNEL',
  'MANAGER_EQUIPE',
  'DIRECTEUR_PRODUCTION',
  'PLANIFICATEUR',
  'MAITRE_CHOCOLATIER',
  'CHEF_EQUIPE',
  'OPERATEUR',
  'RESPONSABLE_QUALITE',
  'TECHNICIEN_QUALITE',
  'RESPONSABLE_MAINTENANCE',
  'TECHNICIEN_MAINTENANCE',
  'RESPONSABLE_LOGISTIQUE',
  'MAGASINIER',
  'PREPARATEUR_COMMANDES',
  'CHAUFFEUR',
  'RESPONSABLE_ACHATS',
  'ACHETEUR',
  'DIRECTEUR_COMMERCIAL',
  'COMMERCIAL',
  'ADV',
  'MARKETING',
  'RESPONSABLE_BOUTIQUE',
  'VENDEUR_BOUTIQUE',
  'DAF',
  'COMPTABLE',
  'CONTROLEUR_GESTION',
  'AGENT_SECURITE',
  'SOUS_TRAITANT',
  'AUDITEUR_QUALITE',
  'AUDITEUR_FINANCE',
  'BORNE',
] as const;
export type RoleKey = (typeof ROLE_KEYS)[number];

export const ROLES: Record<RoleKey, RoleDef> = {
  // =====================================================================
  // SOCLES (ajoutés automatiquement)
  // =====================================================================
  EMPLOYE: {
    label: 'Employé (socle)',
    description:
      'Libre-service de chaque membre du personnel : profil, pointages, planning, congés, absences, fiches de paie, formations, outils empruntés, quêtes, annuaire.',
    category: 'socle',
    base: true,
    requiresMfa: false,
    delegable: false,
    maxSessionMinutes: 12 * 60,
    avatar: 'chemise',
    grants: [
      // Annuaire et organisation
      g('read', ['Company', 'Site', 'Department', 'Team', 'Position'], 'all'),
      g('read', 'Employee', 'all', { fields: DIRECTORY_FIELDS }),
      // Mon dossier
      g('read', 'Employee', 'own'),
      g('update', 'Employee', 'own', { fields: SELF_EDITABLE_EMPLOYEE_FIELDS }),
      g('read', ['EmployeePayroll', 'EmployeeMedical', 'Contract', 'Training', 'EmployeeDocument', 'Onboarding'], 'own'),
      // Mon temps
      g('read', ['TimeEntry', 'Schedule', 'LeaveBalance', 'Timesheet', 'Absence'], 'own'),
      g('create', 'TimeEntry', 'own', { conditions: { source: { in: ['MOBILE', 'WEB'] } } }),
      g(CR, ['TimeCorrection', 'LeaveRequest'], 'own'),
      g('update', 'LeaveRequest', 'own', { conditions: { status: 'PENDING' } }),
      g('create', 'Absence', 'own'),
      // Mes accès (droit d'accès RGPD à mes propres données)
      g('read', ['Badge', 'AccessEvent'], 'own'),
      // Mes outils et EPI
      g('read', ['ToolLoan', 'Ppe'], 'own'),
      // Culture sécurité et qualité : tout le monde peut signaler
      g(CR, ['Incident', 'NonConformity'], 'own'),
      // Communication
      g('read', 'Announcement', 'site'),
      g('read', 'Document', 'site', { conditions: { visibility: 'ALL_STAFF' } }),
      g(RU, 'Task', 'own'),
      g(CR, 'ApprovalRequest', 'own'),
      g(RU, 'Notification', 'own'),
      // Dépenses et demandes
      g(CR, ['ExpenseReport', 'PurchaseRequest'], 'own'),
      g('update', 'ExpenseReport', 'own', { conditions: { status: 'DRAFT' } }),
      g(CR, 'DataRequest', 'own'),
      // Monde 3D et progression
      g('read', 'World', 'all'),
      g(RU, 'Quest', 'own'),
      g(['create', 'read', 'update', 'delete'], 'Dashboard', 'own'),
      g(RU, 'User', 'own', { fields: ['locale', 'theme', 'notificationPrefs', 'worldPrefs', 'mfaEnabled'] }),
    ],
  },

  EXTERNE: {
    label: 'Externe (socle)',
    description: 'Socle minimal des personnes sans contrat (sous-traitants, auditeurs, sécurité externalisée).',
    category: 'socle',
    base: true,
    external: true,
    requiresMfa: false,
    delegable: false,
    maxSessionMinutes: 8 * 60,
    avatar: 'visiteur',
    grants: [
      g('read', ['Company', 'Site'], 'all'),
      g(RU, 'Notification', 'own'),
      g(RU, 'User', 'own', { fields: ['locale', 'theme', 'notificationPrefs'] }),
    ],
  },

  // =====================================================================
  // DIRECTION ET IT
  // =====================================================================
  SUPER_ADMIN: {
    label: 'Super administrateur',
    description:
      'Accès total, réservé à 2 personnes nommément désignées. Clé de sécurité matérielle obligatoire, chaque action est journalisée et notifiée à la direction (accès bris de glace).',
    category: 'it',
    requiresMfa: true,
    delegable: false,
    maxSessionMinutes: 60,
    avatar: 'chemise',
    grants: [g('manage', 'all', 'all')],
  },

  ADMIN_IT: {
    label: 'Administrateur IT',
    description:
      'Comptes, rôles, appareils, intégrations, paramètres. Aucun accès aux données RH sensibles, financières ou aux recettes.',
    category: 'it',
    requiresMfa: true,
    delegable: false,
    maxSessionMinutes: 4 * 60,
    avatar: 'chemise',
    grants: [
      g('manage', ['User', 'RoleAssignment', 'Device', 'Setting', 'Integration', 'ApiKey', 'QuestTemplate', 'World'], 'all'),
      g('read', 'AuditLog', 'all'),
      g(CRU, ['Company', 'Site', 'Department', 'Team'], 'all'),
      g('read', ['AccessZone', 'AccessRule'], 'all'),
    ],
  },

  DIRECTION_GENERALE: {
    label: 'Direction générale',
    description:
      'Vision complète de l entreprise et validations stratégiques. Pas de données individuelles sensibles (paie nominative, médical, traces de passage) : uniquement des agrégats.',
    category: 'direction',
    requiresMfa: true,
    delegable: true,
    maxSessionMinutes: 8 * 60,
    avatar: 'costume',
    grants: [
      g(['read', 'export'], ALL_BUT_PRIVATE, 'all'),
      g('approve', ['PurchaseOrder', 'Budget', 'Recall', 'Recipe', 'CreditNote', 'Payment', 'Customer'], 'all'),
      g(CRU, 'Announcement', 'all'),
    ],
  },

  DIRECTEUR_SITE: {
    label: 'Directeur de site',
    description: 'Pilotage complet d un site (usine, entrepôt, boutique) : lecture de tout le site et validations locales.',
    category: 'direction',
    requiresMfa: true,
    delegable: true,
    maxSessionMinutes: 8 * 60,
    avatar: 'costume',
    grants: [
      g(['read', 'export'], OPERATIONAL_SITE_SUBJECTS, 'site'),
      g('read', 'WorldPresence', 'site'),
      g('read', ['Product', 'Item', 'Customer', 'Supplier', 'Report', 'Dashboard'], 'all'),
      g('approve', ['PurchaseRequest', 'Budget', 'Timesheet', 'WorkPermit', 'InventoryCount', 'TimeCorrection'], 'site'),
      g(CRU, 'Announcement', 'site'),
    ],
  },

  // =====================================================================
  // RESSOURCES HUMAINES ET PRÉVENTION
  // =====================================================================
  DRH: {
    label: 'Directeur des ressources humaines',
    description: 'Tout le personnel, contrats, paie, temps, formations, organisation. Traite les demandes RGPD.',
    category: 'rh',
    requiresMfa: true,
    delegable: true,
    maxSessionMinutes: 8 * 60,
    avatar: 'chemise',
    grants: [
      g('manage', ['Employee', 'EmployeePayroll', 'Contract', 'Training', 'EmployeeDocument', 'Onboarding', 'Position'], 'all'),
      g('read', 'EmployeeMedical', 'all'),
      g('manage', ['TimeCorrection', 'Schedule', 'ShiftPattern', 'LeaveRequest', 'LeaveBalance', 'Absence', 'Timesheet', 'PayrollExport'], 'all'),
      g(['read', 'export'], ['TimeEntry', 'Badge'], 'all'),
      g(CRU, ['Department', 'Team'], 'all'),
      g(['read', 'update', 'approve'], 'DataRequest', 'all'),
      g(CRU, ['Announcement', 'Document'], 'all'),
      g(['read', 'export'], 'Report', 'all'),
    ],
  },

  GESTIONNAIRE_RH: {
    label: 'Gestionnaire RH',
    description: 'Dossiers du personnel d un ou plusieurs sites, sans accès aux salaires.',
    category: 'rh',
    requiresMfa: true,
    delegable: true,
    maxSessionMinutes: 8 * 60,
    avatar: 'chemise',
    grants: [
      g(CRU, ['Employee', 'Contract', 'Training', 'EmployeeDocument', 'Onboarding'], 'site'),
      g(['read', 'update', 'approve'], ['LeaveRequest', 'Absence', 'TimeCorrection'], 'site'),
      g('read', ['TimeEntry', 'Timesheet', 'LeaveBalance', 'Schedule', 'Badge'], 'site'),
      g(CRU, 'Announcement', 'site'),
    ],
  },

  GESTIONNAIRE_PAIE: {
    label: 'Gestionnaire de paie',
    description: 'Prépare et transmet les prestations au secrétariat social. Seul rôle (avec DRH) à modifier les données de paie.',
    category: 'rh',
    requiresMfa: true,
    delegable: false,
    maxSessionMinutes: 8 * 60,
    avatar: 'chemise',
    grants: [
      g('read', ['Employee', 'Contract', 'TimeEntry', 'Absence', 'Schedule'], 'all'),
      g('manage', ['EmployeePayroll', 'LeaveBalance', 'PayrollExport'], 'all'),
      g(['read', 'update', 'approve', 'export'], ['Timesheet', 'TimeCorrection'], 'all'),
    ],
  },

  CONSEILLER_PREVENTION: {
    label: 'Conseiller en prévention',
    description:
      'Fonction légale de prévention : incidents, analyses de risques, permis de travail, EPI, aptitudes (jamais de diagnostic), liste d évacuation.',
    category: 'rh',
    requiresMfa: true,
    delegable: true,
    maxSessionMinutes: 8 * 60,
    avatar: 'gilet-securite',
    grants: [
      g('manage', ['Incident', 'RiskAssessment', 'WorkPermit', 'Ppe'], 'site'),
      g('read', ['EmployeeMedical', 'Machine', 'EnvironmentalMetric', 'Training', 'Employee'], 'site'),
      g(CR, 'Training', 'site'),
      g(['read', 'export'], 'WorldPresence', 'site'),
      g(CRU, ['Document', 'Announcement'], 'site'),
    ],
  },

  REPRESENTANT_PERSONNEL: {
    label: 'Représentant du personnel (CPPT, CE)',
    description: 'Accès aux informations collectives prévues par la loi : bilans agrégés, analyses de risques, annonces.',
    category: 'rh',
    requiresMfa: false,
    delegable: false,
    maxSessionMinutes: 8 * 60,
    avatar: 'chemise',
    grants: [
      g('read', 'Report', 'all', { conditions: { audience: 'WORKS_COUNCIL' } }),
      g('read', 'RiskAssessment', 'site'),
    ],
  },

  MANAGER_EQUIPE: {
    label: 'Manager d équipe',
    description: 'Brique de management réutilisable : présences, plannings, congés, corrections et quêtes de son équipe.',
    category: 'rh',
    requiresMfa: false,
    delegable: true,
    maxSessionMinutes: 12 * 60,
    avatar: 'chemise',
    grants: [
      g('read', ['Employee', 'Training', 'LeaveBalance', 'TimeEntry', 'Timesheet', 'ToolLoan', 'Ppe'], 'team'),
      g('read', 'Absence', 'team', { fields: ['id', 'employeeId', 'startDate', 'endDate', 'status', 'type'] }),
      g(['read', 'approve'], ['LeaveRequest', 'TimeCorrection', 'Timesheet'], 'team'),
      g('create', 'TimeCorrection', 'team'),
      g(CRU, 'Schedule', 'team'),
      g('read', 'WorldPresence', 'team'),
      g(CRU, ['Quest', 'Task'], 'team'),
    ],
  },

  // =====================================================================
  // PRODUCTION
  // =====================================================================
  DIRECTEUR_PRODUCTION: {
    label: 'Directeur de production',
    description: 'Toute la production d un site, validation industrielle des recettes, arbitrages qualité et maintenance.',
    category: 'production',
    inherits: ['MANAGER_EQUIPE'],
    requiresMfa: true,
    delegable: true,
    maxSessionMinutes: 10 * 60,
    avatar: 'blouse-blanche',
    grants: [
      g('manage', ['ProductionLine', 'Machine', 'ProductionPlan', 'ProductionOrder', 'ProductionStep', 'Downtime'], 'site'),
      g(CRU, 'Batch', 'site'),
      g(['read', 'approve'], 'Recipe', 'all'),
      g('read', ['Product', 'Item', 'DemandForecast', 'CostSheet'], 'all'),
      g('read', ['QualityCheck', 'NonConformity', 'Capa', 'BatchRelease', 'WorkOrder', 'MaintenancePlan', 'StockLot', 'Employee', 'TimeEntry', 'Schedule', 'EnvironmentReading'], 'site'),
      g('read', 'WorldPresence', 'site'),
      g('approve', ['PurchaseRequest', 'Timesheet'], 'site'),
      g(['read', 'export'], 'Report', 'all'),
    ],
  },

  PLANIFICATEUR: {
    label: 'Planificateur',
    description: 'Plan directeur, calcul des besoins, lancement des ordres de fabrication, capacité des lignes.',
    category: 'production',
    requiresMfa: false,
    delegable: true,
    maxSessionMinutes: 10 * 60,
    avatar: 'chemise',
    grants: [
      g('manage', ['ProductionPlan', 'DemandForecast'], 'all'),
      g(CRU, 'ProductionOrder', 'site'),
      g('read', 'Recipe', 'all', { fields: ['id', 'code', 'name', 'version', 'status', 'yieldKg', 'lines', 'productId', 'durationMinutes'] }),
      g('read', ['Product', 'Item', 'SalesOrder', 'PurchaseOrder'], 'all'),
      g('read', ['ProductionLine', 'Machine', 'StockLot', 'Schedule', 'MaintenancePlan', 'WorkOrder'], 'site'),
      g('create', 'PurchaseRequest', 'site'),
    ],
  },

  MAITRE_CHOCOLATIER: {
    label: 'Maître chocolatier (R&D)',
    description: 'Crée et fait évoluer les recettes, lance des essais, définit les fiches techniques produit.',
    category: 'production',
    requiresMfa: true,
    delegable: false,
    maxSessionMinutes: 10 * 60,
    avatar: 'blouse-blanche',
    grants: [
      g(CRU, 'Recipe', 'all'),
      g(RU, 'Product', 'all'),
      g('read', ['Item', 'Allergen', 'Supplier'], 'all'),
      g('read', ['LabAnalysis', 'QualityCheck', 'Batch'], 'site'),
      g('create', 'ProductionOrder', 'site', { conditions: { kind: 'TRIAL' } }),
    ],
  },

  OPERATEUR: {
    label: 'Opérateur de ligne',
    description:
      'Exécute les ordres de fabrication de son équipe, saisit quantités, arrêts et contrôles en ligne, emprunte les outils, déclare les consommations.',
    category: 'production',
    requiresMfa: false,
    delegable: false,
    maxSessionMinutes: 12 * 60,
    avatar: 'blouse-blanche',
    grants: [
      g('read', ['ProductionOrder', 'ProductionStep', 'Downtime'], 'team'),
      g(['update', 'execute'], 'ProductionStep', 'team'),
      g('create', 'Downtime', 'team'),
      g(CR, 'QualityCheck', 'site'),
      g('read', ['Machine', 'ProductionLine', 'Batch', 'Location', 'HaccpPlan', 'StockLot', 'Tool'], 'site'),
      g('read', ['Item', 'Product', 'Allergen'], 'all'),
      g('create', 'StockMovement', 'own'),
      g(['create', 'execute'], 'ToolLoan', 'own'),
      g(CR, 'WorkOrder', 'site', { conditions: { kind: 'REQUEST' } }),
    ],
  },

  CHEF_EQUIPE: {
    label: 'Chef d équipe production',
    description: 'Opérateur expérimenté qui encadre une équipe postée (3x8) : présences, affectations, démarrage des OF.',
    category: 'production',
    inherits: ['OPERATEUR', 'MANAGER_EQUIPE'],
    requiresMfa: false,
    delegable: true,
    maxSessionMinutes: 12 * 60,
    avatar: 'blouse-blanche',
    grants: [
      g('update', ['ProductionOrder', 'Downtime'], 'team'),
      g('read', ['QualityCheck', 'NonConformity', 'Incident'], 'site'),
    ],
  },

  // =====================================================================
  // QUALITÉ
  // =====================================================================
  RESPONSABLE_QUALITE: {
    label: 'Responsable qualité et sécurité alimentaire',
    description:
      'HACCP, contrôles, non-conformités, actions correctives, libération et blocage des lots, retraits et rappels, certifications, allergènes.',
    category: 'qualite',
    requiresMfa: true,
    delegable: true,
    maxSessionMinutes: 10 * 60,
    avatar: 'blouse-verte',
    grants: [
      g('manage', ['HaccpPlan', 'NonConformity', 'Capa', 'LabAnalysis', 'Calibration'], 'site'),
      g(['create', 'read', 'update', 'export'], 'QualityCheck', 'site'),
      g(['create', 'read', 'approve'], 'BatchRelease', 'site'),
      g('manage', ['Recall', 'Allergen', 'QualityCertification', 'Complaint'], 'all'),
      g(['read', 'approve'], 'Recipe', 'all'),
      g(RU, ['Batch', 'StockLot'], 'site'),
      g(RU, ['Supplier', 'Product'], 'all'),
      g('read', ['DueDiligence', 'Item'], 'all'),
      g('read', ['EnvironmentReading', 'ProductionOrder', 'Training', 'Incident', 'GoodsReceipt'], 'site'),
      g(['read', 'export'], 'Report', 'all', { conditions: { domain: 'QUALITY' } }),
    ],
  },

  TECHNICIEN_QUALITE: {
    label: 'Technicien qualité',
    description: 'Contrôles, prélèvements, analyses, ouverture de non-conformités, étalonnages.',
    category: 'qualite',
    requiresMfa: false,
    delegable: false,
    maxSessionMinutes: 12 * 60,
    avatar: 'blouse-verte',
    grants: [
      g(CRU, ['QualityCheck', 'LabAnalysis', 'NonConformity', 'Calibration'], 'site'),
      g('read', ['HaccpPlan', 'Batch', 'StockLot', 'EnvironmentReading', 'Capa', 'GoodsReceipt'], 'site'),
      g('update', 'Capa', 'own'),
      g('read', ['Item', 'Product', 'Allergen'], 'all'),
    ],
  },

  // =====================================================================
  // MAINTENANCE
  // =====================================================================
  TECHNICIEN_MAINTENANCE: {
    label: 'Technicien de maintenance',
    description: 'Réalise les interventions, met à jour les compteurs, sort les pièces détachées, demande les permis.',
    category: 'maintenance',
    requiresMfa: false,
    delegable: false,
    maxSessionMinutes: 12 * 60,
    avatar: 'combinaison-bleue',
    grants: [
      g('read', ['WorkOrder', 'MaintenancePlan', 'Machine', 'Calibration', 'StockLot', 'Location', 'Tool'], 'site'),
      g(CR, 'WorkOrder', 'site'),
      g(['update', 'execute'], 'WorkOrder', 'own'),
      g('update', 'Machine', 'site', { fields: ['meterHours', 'meterCycles', 'status'] }),
      g('create', 'StockMovement', 'own'),
      g(['create', 'execute'], 'ToolLoan', 'own'),
      g(CR, 'WorkPermit', 'own'),
      g('read', 'Item', 'all'),
    ],
  },

  RESPONSABLE_MAINTENANCE: {
    label: 'Responsable maintenance',
    description: 'Plans préventifs, priorisation et affectation des interventions, parc machines et outillage, étalonnage.',
    category: 'maintenance',
    inherits: ['TECHNICIEN_MAINTENANCE', 'MANAGER_EQUIPE'],
    requiresMfa: true,
    delegable: true,
    maxSessionMinutes: 10 * 60,
    avatar: 'combinaison-bleue',
    grants: [
      g('manage', ['MaintenancePlan', 'WorkOrder', 'Machine', 'Tool', 'Calibration'], 'site'),
      g('read', ['Downtime', 'EnvironmentReading', 'ProductionOrder'], 'site'),
      g(['read', 'approve'], 'WorkPermit', 'site'),
      g('create', 'PurchaseRequest', 'site'),
      g(['read', 'export'], 'Report', 'all', { conditions: { domain: 'MAINTENANCE' } }),
    ],
  },

  // =====================================================================
  // LOGISTIQUE ET STOCK
  // =====================================================================
  MAGASINIER: {
    label: 'Magasinier, cariste',
    description: 'Réceptions, rangement, mouvements, inventaires tournants, transferts, prêts d outils et dotation EPI.',
    category: 'logistique',
    requiresMfa: false,
    delegable: false,
    maxSessionMinutes: 12 * 60,
    avatar: 'gilet-orange',
    grants: [
      g('read', ['Warehouse', 'Location', 'StockLot', 'Tool', 'PurchaseOrder', 'EnvironmentReading'], 'site'),
      g('read', 'Item', 'all'),
      g(CR, ['StockMovement', 'GoodsReceipt', 'StockTransfer', 'Ppe'], 'site'),
      g(CRU, 'InventoryCount', 'site'),
      g(RU, 'PickingList', 'site'),
      g(['create', 'read', 'update', 'execute'], 'ToolLoan', 'site'),
    ],
  },

  PREPARATEUR_COMMANDES: {
    label: 'Préparateur de commandes',
    description: 'Prélève et conditionne les commandes, déclare les écarts de stock.',
    category: 'logistique',
    requiresMfa: false,
    delegable: false,
    maxSessionMinutes: 12 * 60,
    avatar: 'gilet-orange',
    grants: [
      g(['read', 'update', 'execute'], 'PickingList', 'own'),
      g('read', ['PickingList', 'StockLot', 'Location'], 'site'),
      g('read', 'Item', 'all'),
      g('create', 'StockMovement', 'own'),
    ],
  },

  CHAUFFEUR: {
    label: 'Chauffeur livreur',
    description: 'Ses tournées, preuves de livraison (signature, photo, températures), incidents de route.',
    category: 'logistique',
    requiresMfa: false,
    delegable: false,
    maxSessionMinutes: 12 * 60,
    avatar: 'gilet-orange',
    grants: [
      g(['read', 'update', 'execute'], 'DeliveryRoute', 'own'),
      g(CR, 'ProofOfDelivery', 'own'),
      g('read', 'Vehicle', 'own'),
      g('read', 'Customer', 'all', { fields: ['id', 'name', 'deliveryAddresses', 'deliveryContact', 'deliveryInstructions'] }),
    ],
  },

  RESPONSABLE_LOGISTIQUE: {
    label: 'Responsable logistique',
    description: 'Entrepôts, stocks, transports, expéditions, tournées, flotte.',
    category: 'logistique',
    inherits: ['MAGASINIER', 'MANAGER_EQUIPE'],
    requiresMfa: true,
    delegable: true,
    maxSessionMinutes: 10 * 60,
    avatar: 'gilet-orange',
    grants: [
      g('manage', ['Warehouse', 'Location', 'StockTransfer', 'PickingList', 'Shipment', 'DeliveryRoute', 'Vehicle', 'Tool', 'ToolLoan', 'GoodsReceipt'], 'site'),
      g(CRU, 'StockLot', 'site'),
      g(['read', 'approve'], 'InventoryCount', 'site'),
      g('read', ['ProofOfDelivery', 'SalesOrder'], 'site'),
      g(RU, 'Item', 'all', { fields: ['minStock', 'maxStock', 'reorderPoint', 'storageConditions', 'defaultLocationId', 'palletization'] }),
      g('read', 'Item', 'all'),
      g('manage', 'Carrier', 'all'),
    ],
  },

  // =====================================================================
  // ACHATS
  // =====================================================================
  ACHETEUR: {
    label: 'Acheteur',
    description: 'Fournisseurs de fèves, sucre, lait, fruits secs, emballages ; commandes, contrats, devoir de vigilance.',
    category: 'achats',
    requiresMfa: true,
    delegable: true,
    maxSessionMinutes: 10 * 60,
    avatar: 'chemise',
    grants: [
      g(CRU, ['Supplier', 'SupplierContract', 'DueDiligence', 'Item'], 'all'),
      g(CRU, 'PurchaseOrder', 'own'),
      g('read', ['PurchaseOrder', 'PurchaseRequest', 'GoodsReceipt', 'SupplierInvoice', 'DemandForecast'], 'all'),
      g('update', 'PurchaseRequest', 'all', { fields: ['status', 'purchaseOrderId', 'buyerComment'] }),
      g('read', 'StockLot', 'all'),
    ],
  },

  RESPONSABLE_ACHATS: {
    label: 'Responsable achats',
    description: 'Valide les commandes dans sa délégation, qualifie les fournisseurs, négocie les contrats cadres.',
    category: 'achats',
    inherits: ['ACHETEUR'],
    requiresMfa: true,
    delegable: true,
    maxSessionMinutes: 10 * 60,
    avatar: 'costume',
    grants: [
      g('approve', ['PurchaseOrder', 'PurchaseRequest', 'Supplier', 'SupplierContract', 'DueDiligence'], 'all'),
      g(['read', 'export'], 'Report', 'all', { conditions: { domain: 'PURCHASING' } }),
    ],
  },

  // =====================================================================
  // COMMERCIAL ET MARKETING
  // =====================================================================
  COMMERCIAL: {
    label: 'Commercial',
    description: 'Son portefeuille : prospects, clients, activités, devis, commandes. Vue limitée sur les autres clients.',
    category: 'commercial',
    requiresMfa: false,
    delegable: true,
    maxSessionMinutes: 12 * 60,
    avatar: 'costume',
    grants: [
      g(CRU, ['Lead', 'Opportunity', 'Activity', 'Quote', 'Customer'], 'own'),
      g('create', ['Lead', 'Customer', 'Complaint'], 'all'),
      g('read', 'Customer', 'all', { fields: ['id', 'name', 'segment', 'city', 'accountManagerEmployeeId'] }),
      g(CR, 'SalesOrder', 'own'),
      g('read', 'Invoice', 'own'),
      g('read', ['Product', 'PriceList', 'Promotion', 'Item'], 'all'),
    ],
  },

  DIRECTEUR_COMMERCIAL: {
    label: 'Directeur commercial',
    description: 'Toute l activité commerciale, politique tarifaire, remises exceptionnelles, encours clients.',
    category: 'commercial',
    inherits: ['COMMERCIAL', 'MANAGER_EQUIPE'],
    requiresMfa: true,
    delegable: true,
    maxSessionMinutes: 10 * 60,
    avatar: 'costume',
    grants: [
      g('manage', ['Lead', 'Opportunity', 'Activity', 'Quote', 'Customer', 'SalesOrder', 'PriceList', 'Promotion'], 'all'),
      g('read', ['Invoice', 'CreditNote', 'CostSheet', 'DemandForecast'], 'all'),
      g('approve', ['Quote', 'Customer', 'SalesOrder'], 'all'),
      g(['read', 'export'], 'Report', 'all', { conditions: { domain: 'SALES' } }),
    ],
  },

  ADV: {
    label: 'Administration des ventes',
    description: 'Saisie et suivi des commandes, contrôle d encours, facturation électronique, notes de crédit, réclamations.',
    category: 'commercial',
    requiresMfa: true,
    delegable: true,
    maxSessionMinutes: 10 * 60,
    avatar: 'chemise',
    grants: [
      g(RU, 'Customer', 'all'),
      g(['create', 'read', 'update', 'approve'], 'SalesOrder', 'all'),
      g(CR, ['Invoice', 'CreditNote'], 'all'),
      g('read', ['Shipment', 'PriceList', 'Promotion', 'Product', 'Item', 'ProofOfDelivery'], 'all'),
      g(CRU, 'Complaint', 'all'),
    ],
  },

  MARKETING: {
    label: 'Marketing',
    description: 'Catalogue, fiches produits, promotions, saisonnalité (Pâques, Saint-Nicolas, Noël), salons.',
    category: 'commercial',
    requiresMfa: false,
    delegable: true,
    maxSessionMinutes: 10 * 60,
    avatar: 'chemise',
    grants: [
      g(RU, 'Product', 'all', { fields: ['name', 'marketingName', 'description', 'images', 'range', 'season', 'claims', 'translations'] }),
      g('read', ['Product', 'PriceList', 'DemandForecast', 'Allergen'], 'all'),
      g('manage', 'Promotion', 'all'),
      g('create', 'Lead', 'all'),
      g(CRU, ['Document', 'Announcement'], 'all'),
      g('read', 'Report', 'all', { conditions: { domain: 'SALES' } }),
    ],
  },

  // =====================================================================
  // BOUTIQUES
  // =====================================================================
  VENDEUR_BOUTIQUE: {
    label: 'Vendeur en boutique',
    description: 'Caisse, encaissement, fidélité, réception des colis boutique.',
    category: 'boutique',
    requiresMfa: false,
    delegable: false,
    maxSessionMinutes: 12 * 60,
    avatar: 'tablier-boutique',
    grants: [
      g(CRU, 'PosSession', 'own'),
      g(CR, 'PosSale', 'own'),
      g('read', ['StockLot', 'Store'], 'site'),
      g('create', 'StockMovement', 'own'),
      g(CR, 'LoyaltyMember', 'site'),
      g('read', ['Product', 'PriceList', 'Promotion', 'Allergen'], 'all'),
      g('create', 'Complaint', 'all'),
    ],
  },

  RESPONSABLE_BOUTIQUE: {
    label: 'Responsable de boutique',
    description: 'Gère sa boutique : caisse, écarts, annulations, réassort, inventaire, planning des vendeurs.',
    category: 'boutique',
    inherits: ['VENDEUR_BOUTIQUE', 'MANAGER_EQUIPE'],
    requiresMfa: false,
    delegable: true,
    maxSessionMinutes: 12 * 60,
    avatar: 'tablier-boutique',
    grants: [
      g(['read', 'update', 'approve'], ['PosSession', 'PosSale'], 'site'),
      g(RU, ['Store', 'LoyaltyMember'], 'site'),
      g(CR, ['StockTransfer', 'InventoryCount'], 'site'),
      g('read', 'Report', 'all', { conditions: { domain: 'RETAIL' } }),
    ],
  },

  // =====================================================================
  // FINANCE
  // =====================================================================
  COMPTABLE: {
    label: 'Comptable',
    description: 'Écritures, factures fournisseurs, rapprochements, préparation des paiements (sans les valider).',
    category: 'finance',
    requiresMfa: true,
    delegable: true,
    maxSessionMinutes: 10 * 60,
    avatar: 'chemise',
    grants: [
      g(CRU, ['JournalEntry', 'SupplierInvoice', 'Asset'], 'all'),
      g(CR, 'Payment', 'all'),
      g('read', ['LedgerAccount', 'Invoice', 'CreditNote', 'ExpenseReport', 'Supplier', 'Customer', 'PurchaseOrder', 'GoodsReceipt'], 'all'),
      g(CRU, 'SupplierBankAccount', 'all'),
      g('export', ['JournalEntry', 'Invoice', 'SupplierInvoice'], 'all'),
    ],
  },

  CONTROLEUR_GESTION: {
    label: 'Contrôleur de gestion',
    description: 'Coûts de revient, budgets, valorisation des stocks, marges, tableaux de bord financiers.',
    category: 'finance',
    requiresMfa: true,
    delegable: true,
    maxSessionMinutes: 10 * 60,
    avatar: 'chemise',
    grants: [
      g('manage', ['CostSheet', 'Budget'], 'all'),
      g('read', 'Recipe', 'all', { fields: ['id', 'code', 'name', 'version', 'yieldKg', 'lines', 'productId'] }),
      g('read', ['JournalEntry', 'LedgerAccount', 'ProductionOrder', 'StockLot', 'SalesOrder', 'Invoice', 'PurchaseOrder', 'Product', 'Item', 'Asset'], 'all'),
      g(['read', 'export'], 'Report', 'all'),
    ],
  },

  DAF: {
    label: 'Directeur administratif et financier',
    description: 'Finance complète, validation des paiements et des engagements dans sa délégation, masse salariale.',
    category: 'finance',
    inherits: ['CONTROLEUR_GESTION'],
    requiresMfa: true,
    delegable: true,
    maxSessionMinutes: 8 * 60,
    avatar: 'costume',
    grants: [
      g('manage', ['LedgerAccount', 'JournalEntry', 'Payment', 'Asset', 'ExpenseReport'], 'all'),
      g('read', 'SupplierInvoice', 'all'),
      g('approve', ['PurchaseOrder', 'SupplierInvoice', 'CreditNote', 'ExpenseReport', 'Payment', 'SupplierBankAccount', 'Customer'], 'all'),
      g('read', ['EmployeePayroll', 'PayrollExport', 'SupplierBankAccount', 'Supplier', 'Customer'], 'all'),
      g(['read', 'export'], ['Invoice', 'CreditNote', 'SalesOrder'], 'all'),
    ],
  },

  // =====================================================================
  // SÉCURITÉ, EXTERNES, APPAREILS
  // =====================================================================
  AGENT_SECURITE: {
    label: 'Agent de sécurité, accueil',
    description: 'Accueil des visiteurs, badges temporaires, surveillance des accès, alarmes, appel d évacuation.',
    category: 'securite',
    requiresMfa: false,
    delegable: false,
    maxSessionMinutes: 12 * 60,
    avatar: 'gilet-securite',
    grants: [
      g(CRU, 'Visitor', 'site'),
      g(CRU, 'Badge', 'site', { conditions: { kind: 'TEMPORARY' } }),
      g('read', ['Badge', 'AccessEvent', 'AccessZone', 'Device'], 'site'),
      g(['read', 'export'], 'WorldPresence', 'site'),
      g('create', 'Incident', 'site'),
      g('read', 'Employee', 'all', { fields: DIRECTORY_FIELDS }),
    ],
  },

  SOUS_TRAITANT: {
    label: 'Sous-traitant',
    description: 'Intervenant externe : uniquement les interventions qui lui sont confiées et les permis associés.',
    category: 'externe',
    external: true,
    requiresMfa: false,
    delegable: false,
    maxSessionMinutes: 10 * 60,
    avatar: 'visiteur',
    grants: [
      g(['read', 'update', 'execute'], 'WorkOrder', 'own'),
      g(CR, 'WorkPermit', 'own'),
      g('read', 'Machine', 'site', { fields: ['id', 'code', 'name', 'location', 'manufacturer', 'model', 'status'] }),
      g('create', 'Incident', 'own'),
    ],
  },

  AUDITEUR_QUALITE: {
    label: 'Auditeur qualité (lecture seule, durée limitée)',
    description: 'Audit de certification ou client : accès en lecture au système qualité pour la durée de l audit.',
    category: 'externe',
    external: true,
    requiresMfa: true,
    delegable: false,
    maxSessionMinutes: 8 * 60,
    avatar: 'visiteur',
    grants: [
      g('read', ['HaccpPlan', 'QualityCheck', 'NonConformity', 'Capa', 'LabAnalysis', 'BatchRelease', 'Batch', 'Calibration', 'EnvironmentReading', 'GoodsReceipt'], 'site'),
      g('read', ['Recall', 'Allergen', 'QualityCertification', 'Complaint', 'Supplier', 'DueDiligence', 'Product'], 'all'),
      g('read', 'Training', 'site', { fields: ['id', 'employeeId', 'type', 'title', 'completedAt', 'validUntil', 'status'] }),
    ],
  },

  AUDITEUR_FINANCE: {
    label: 'Auditeur financier (lecture seule, durée limitée)',
    description: 'Réviseur d entreprises : lecture des données financières et du journal d audit.',
    category: 'externe',
    external: true,
    requiresMfa: true,
    delegable: false,
    maxSessionMinutes: 8 * 60,
    avatar: 'visiteur',
    grants: [
      g(['read', 'export'], [...subjectsOfModule('finance'), 'Invoice', 'CreditNote', 'SupplierInvoice', 'PurchaseOrder', 'GoodsReceipt', 'StockLot'], 'all'),
      g('read', 'AuditLog', 'all'),
    ],
  },

  BORNE: {
    label: 'Borne et lecteur (appareil)',
    description:
      'Identité technique des bornes de pointage, lecteurs de badge et bornes outils. Aucune lecture de données en dehors de l opération en cours.',
    category: 'appareil',
    requiresMfa: false,
    delegable: false,
    maxSessionMinutes: 24 * 60,
    avatar: 'visiteur',
    grants: [
      g(['create', 'execute'], ['TimeEntry', 'AccessEvent'], 'site'),
      g('execute', ['ToolLoan', 'Visitor'], 'site'),
      g('create', 'EnvironmentReading', 'site'),
    ],
  },
};

export const ASSIGNABLE_ROLES = ROLE_KEYS.filter((k) => !ROLES[k].base);

/** Rôles effectifs d'un rôle, héritage compris (sans doublon, ordre stable). */
export function expandRole(key: RoleKey, seen = new Set<RoleKey>()): RoleKey[] {
  if (seen.has(key)) return [];
  seen.add(key);
  const parents = ROLES[key].inherits ?? [];
  return [...parents.flatMap((p) => expandRole(p, seen)), key];
}

/** Portées exigées par un rôle (pour valider une attribution). */
export function requiredScopes(key: RoleKey): Set<Exclude<Scope, 'own' | 'all'>> {
  const out = new Set<Exclude<Scope, 'own' | 'all'>>();
  for (const r of expandRole(key)) {
    for (const gr of ROLES[r].grants) {
      if (gr.scope === 'site' || gr.scope === 'department' || gr.scope === 'team') out.add(gr.scope);
    }
  }
  return out;
}
