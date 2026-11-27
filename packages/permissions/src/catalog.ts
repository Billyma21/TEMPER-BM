/**
 * Catalogue des droits TEMPER.
 * Source unique de vérité : l'API, le front 2D, le monde 3D et la documentation
 * (docs/04-roles-permissions.md, générée) lisent tous ce fichier.
 *
 * MAAYOUD
 */

export const ACTIONS = [
  'read',
  'create',
  'update',
  'delete',
  'approve',
  'export',
  'execute',
  'manage',
] as const;
export type Action = (typeof ACTIONS)[number];

export const ACTION_LABELS: Record<Action, string> = {
  read: 'Consulter',
  create: 'Créer',
  update: 'Modifier',
  delete: 'Supprimer',
  approve: 'Valider / approuver',
  export: 'Exporter',
  execute: 'Exécuter (borne, scan, opération terrain)',
  manage: 'Tous droits',
};

/**
 * Portée d'un droit, de la plus étroite à la plus large.
 * own        : ce qui me concerne (mes pointages, mes congés, mes prospects)
 * team       : les équipes que je dirige
 * department : les départements dont j'ai la charge
 * site       : les sites (usine, entrepôt, boutique) qui me sont attribués
 * all        : toute l'entreprise
 */
export const SCOPES = ['own', 'team', 'department', 'site', 'all'] as const;
export type Scope = (typeof SCOPES)[number];

export const SCOPE_LABELS: Record<Scope, string> = {
  own: 'Personnel',
  team: 'Équipe',
  department: 'Département',
  site: 'Site',
  all: 'Entreprise',
};

export const SCOPE_LETTER: Record<Scope, string> = {
  own: 'P',
  team: 'E',
  department: 'D',
  site: 'S',
  all: 'T',
};

export type ModuleKey =
  | 'organisation'
  | 'rh'
  | 'acces'
  | 'temps'
  | 'production'
  | 'qualite'
  | 'stock'
  | 'outils'
  | 'maintenance'
  | 'achats'
  | 'ventes'
  | 'boutique'
  | 'logistique'
  | 'finance'
  | 'hse'
  | 'communication'
  | 'monde'
  | 'reporting'
  | 'admin';

export interface ModuleDef {
  label: string;
  /** Libellé court (onglets mobiles, tableaux) */
  short: string;
  description: string;
  /** Nom d'icône lucide-react */
  icon: string;
  /** Route de l'interface classique */
  route: string;
  /** Identifiant du bâtiment ou de la zone dans le monde 3D */
  worldZone: string;
  order: number;
}

export const MODULES: Record<ModuleKey, ModuleDef> = {
  organisation: { short: 'Orga', label: 'Organisation', description: 'Sites, départements, équipes, organigramme', icon: 'Network', route: '/organisation', worldZone: 'siege', order: 1 },
  rh: { short: 'RH', label: 'Ressources humaines', description: 'Dossiers du personnel, contrats, formations, onboarding', icon: 'Users', route: '/rh', worldZone: 'siege', order: 2 },
  acces: { short: 'Accès', label: 'Badges et accès', description: 'Badges, zones, lecteurs, visiteurs, journal des accès', icon: 'IdCard', route: '/acces', worldZone: 'poste-garde', order: 3 },
  temps: { short: 'Temps', label: 'Temps et présences', description: 'Pointage, plannings, équipes, congés, absences, export paie', icon: 'Clock', route: '/temps', worldZone: 'siege', order: 4 },
  production: { short: 'Prod', label: 'Production', description: 'Recettes, ordres de fabrication, lignes, lots, TRS', icon: 'Factory', route: '/production', worldZone: 'usine', order: 5 },
  qualite: { short: 'Qualité', label: 'Qualité et sécurité alimentaire', description: 'HACCP, contrôles, non-conformités, libération des lots, rappels', icon: 'ShieldCheck', route: '/qualite', worldZone: 'labo', order: 6 },
  stock: { short: 'Stock', label: 'Stocks et entrepôts', description: 'Articles, lots, emplacements, mouvements, inventaires', icon: 'Boxes', route: '/stock', worldZone: 'entrepot', order: 7 },
  outils: { short: 'Outils', label: 'Outils et équipements', description: 'Outillage, moules, prêts, étalonnage, EPI', icon: 'Wrench', route: '/outils', worldZone: 'atelier', order: 8 },
  maintenance: { short: 'Maint.', label: 'Maintenance', description: 'Préventif, correctif, demandes d intervention, pièces', icon: 'Cog', route: '/maintenance', worldZone: 'atelier', order: 9 },
  achats: { short: 'Achats', label: 'Achats et fournisseurs', description: 'Fournisseurs, demandes, commandes, réceptions, devoir de vigilance', icon: 'ShoppingCart', route: '/achats', worldZone: 'siege', order: 10 },
  ventes: { short: 'Ventes', label: 'Ventes et clients', description: 'Prospects, clients, devis, commandes, factures', icon: 'Handshake', route: '/ventes', worldZone: 'ville', order: 11 },
  boutique: { short: 'Boutique', label: 'Boutiques', description: 'Caisse, ventes comptoir, fidélité, stock boutique', icon: 'Store', route: '/boutique', worldZone: 'boutique', order: 12 },
  logistique: { short: 'Logist.', label: 'Logistique', description: 'Préparation, expéditions, tournées, preuves de livraison', icon: 'Truck', route: '/logistique', worldZone: 'quai', order: 13 },
  finance: { short: 'Finance', label: 'Finance', description: 'Comptabilité, paiements, budgets, coûts de revient', icon: 'Landmark', route: '/finance', worldZone: 'siege', order: 14 },
  hse: { short: 'HSE', label: 'Santé, sécurité, environnement', description: 'Incidents, risques, permis de travail, énergie', icon: 'HardHat', route: '/hse', worldZone: 'usine', order: 15 },
  communication: { short: 'Comm.', label: 'Communication et tâches', description: 'Annonces, documents, tâches, validations', icon: 'MessageSquare', route: '/communication', worldZone: 'siege', order: 16 },
  monde: { short: 'Monde', label: 'Monde 3D', description: 'Jumeau numérique de l entreprise, quêtes, progression', icon: 'Gamepad2', route: '/monde', worldZone: 'campus', order: 17 },
  reporting: { short: 'Pilotage', label: 'Pilotage', description: 'Tableaux de bord, indicateurs, rapports', icon: 'LineChart', route: '/pilotage', worldZone: 'siege', order: 18 },
  admin: { short: 'Admin', label: 'Administration', description: 'Utilisateurs, rôles, appareils, paramètres, journal d audit', icon: 'Settings', route: '/admin', worldZone: 'siege', order: 19 },
};

/**
 * Comment une ressource se rattache à une portée.
 * Chaque valeur est le nom du champ (dans la table) qui porte l'information.
 * own.source indique si le champ contient un id d'employé ou d'utilisateur.
 */
export interface Ownership {
  own?: { field: string; source: 'employee' | 'user' };
  team?: string;
  department?: string;
  site?: string;
}

export type Sensitivity = 'public' | 'interne' | 'personnel' | 'sensible' | 'secret';

export interface SubjectDef {
  module: ModuleKey;
  label: string;
  sensitivity: Sensitivity;
  ownership: Ownership;
  /**
   * Interdits globaux, y compris pour SUPER_ADMIN.
   * Sert à garantir l'immuabilité des objets légaux et de traçabilité :
   * on corrige par une contre-écriture, jamais par une suppression.
   */
  forbidden?: Action[];
}

const E = (field: string) => ({ field, source: 'employee' as const });
const U = (field: string) => ({ field, source: 'user' as const });

export const SUBJECTS = {
  // ---------- Organisation ----------
  Company: { module: 'organisation', label: 'Société', sensitivity: 'interne', ownership: {} },
  Site: { module: 'organisation', label: 'Site', sensitivity: 'interne', ownership: { site: 'id' } },
  Department: { module: 'organisation', label: 'Département', sensitivity: 'interne', ownership: { site: 'siteId', department: 'id' } },
  Team: { module: 'organisation', label: 'Équipe', sensitivity: 'interne', ownership: { site: 'siteId', department: 'departmentId', team: 'id' } },
  Position: { module: 'organisation', label: 'Fiche de poste', sensitivity: 'interne', ownership: {} },

  // ---------- RH ----------
  Employee: { module: 'rh', label: 'Fiche employé', sensitivity: 'personnel', ownership: { own: E('id'), team: 'teamId', department: 'departmentId', site: 'siteId' } },
  EmployeePayroll: { module: 'rh', label: 'Données de paie (salaire, IBAN, NISS)', sensitivity: 'sensible', ownership: { own: E('employeeId'), department: 'departmentId', site: 'siteId' } },
  EmployeeMedical: { module: 'rh', label: 'Aptitude médecine du travail', sensitivity: 'sensible', ownership: { own: E('employeeId'), site: 'siteId' } },
  Contract: { module: 'rh', label: 'Contrat de travail', sensitivity: 'personnel', ownership: { own: E('employeeId'), department: 'departmentId', site: 'siteId' } },
  Training: { module: 'rh', label: 'Formation et certification', sensitivity: 'personnel', ownership: { own: E('employeeId'), team: 'teamId', department: 'departmentId', site: 'siteId' } },
  EmployeeDocument: { module: 'rh', label: 'Document du personnel', sensitivity: 'personnel', ownership: { own: E('employeeId'), department: 'departmentId', site: 'siteId' } },
  Onboarding: { module: 'rh', label: 'Arrivée et départ', sensitivity: 'personnel', ownership: { own: E('employeeId'), department: 'departmentId', site: 'siteId' } },

  // ---------- Badges et accès ----------
  Badge: { module: 'acces', label: 'Badge', sensitivity: 'personnel', ownership: { own: E('holderEmployeeId'), team: 'teamId', site: 'siteId' } },
  AccessZone: { module: 'acces', label: 'Zone d accès', sensitivity: 'interne', ownership: { site: 'siteId' } },
  AccessRule: { module: 'acces', label: 'Règle d accès', sensitivity: 'interne', ownership: { site: 'siteId' } },
  AccessEvent: { module: 'acces', label: 'Journal des passages', sensitivity: 'personnel', ownership: { own: E('employeeId'), site: 'siteId' }, forbidden: ['update', 'delete'] },
  Visitor: { module: 'acces', label: 'Visiteur', sensitivity: 'personnel', ownership: { own: E('hostEmployeeId'), site: 'siteId' } },
  Device: { module: 'acces', label: 'Appareil (borne, lecteur, capteur)', sensitivity: 'interne', ownership: { site: 'siteId' } },

  // ---------- Temps ----------
  TimeEntry: { module: 'temps', label: 'Pointage brut', sensitivity: 'personnel', ownership: { own: E('employeeId'), team: 'teamId', department: 'departmentId', site: 'siteId' }, forbidden: ['update', 'delete'] },
  TimeCorrection: { module: 'temps', label: 'Correction de pointage', sensitivity: 'personnel', ownership: { own: E('employeeId'), team: 'teamId', department: 'departmentId', site: 'siteId' } },
  Schedule: { module: 'temps', label: 'Planning', sensitivity: 'interne', ownership: { own: E('employeeId'), team: 'teamId', department: 'departmentId', site: 'siteId' } },
  ShiftPattern: { module: 'temps', label: 'Modèle horaire', sensitivity: 'interne', ownership: { site: 'siteId' } },
  LeaveRequest: { module: 'temps', label: 'Demande de congé', sensitivity: 'personnel', ownership: { own: E('employeeId'), team: 'teamId', department: 'departmentId', site: 'siteId' } },
  LeaveBalance: { module: 'temps', label: 'Solde de congés', sensitivity: 'personnel', ownership: { own: E('employeeId'), team: 'teamId', department: 'departmentId', site: 'siteId' } },
  Absence: { module: 'temps', label: 'Absence', sensitivity: 'personnel', ownership: { own: E('employeeId'), team: 'teamId', department: 'departmentId', site: 'siteId' } },
  Timesheet: { module: 'temps', label: 'Relevé de prestations', sensitivity: 'personnel', ownership: { own: E('employeeId'), team: 'teamId', department: 'departmentId', site: 'siteId' } },
  PayrollExport: { module: 'temps', label: 'Export secrétariat social', sensitivity: 'sensible', ownership: { site: 'siteId' } },

  // ---------- Production ----------
  Product: { module: 'production', label: 'Produit fini', sensitivity: 'interne', ownership: {} },
  Recipe: { module: 'production', label: 'Recette (secret de fabrication)', sensitivity: 'secret', ownership: {} },
  DemandForecast: { module: 'production', label: 'Prévision de la demande', sensitivity: 'interne', ownership: {} },
  ProductionLine: { module: 'production', label: 'Ligne de production', sensitivity: 'interne', ownership: { site: 'siteId' } },
  Machine: { module: 'production', label: 'Machine', sensitivity: 'interne', ownership: { site: 'siteId' } },
  ProductionPlan: { module: 'production', label: 'Plan de production', sensitivity: 'interne', ownership: { site: 'siteId' } },
  ProductionOrder: { module: 'production', label: 'Ordre de fabrication', sensitivity: 'interne', ownership: { team: 'teamId', site: 'siteId' } },
  ProductionStep: { module: 'production', label: 'Étape de fabrication', sensitivity: 'interne', ownership: { team: 'teamId', site: 'siteId' } },
  Batch: { module: 'production', label: 'Lot', sensitivity: 'interne', ownership: { site: 'siteId' }, forbidden: ['delete'] },
  Downtime: { module: 'production', label: 'Arrêt machine', sensitivity: 'interne', ownership: { team: 'teamId', site: 'siteId' } },

  // ---------- Qualité ----------
  HaccpPlan: { module: 'qualite', label: 'Plan HACCP', sensitivity: 'interne', ownership: { site: 'siteId' } },
  QualityCheck: { module: 'qualite', label: 'Contrôle qualité', sensitivity: 'interne', ownership: { own: E('performedByEmployeeId'), site: 'siteId' }, forbidden: ['delete'] },
  NonConformity: { module: 'qualite', label: 'Non-conformité', sensitivity: 'interne', ownership: { own: E('reportedByEmployeeId'), site: 'siteId' } },
  Capa: { module: 'qualite', label: 'Action corrective et préventive', sensitivity: 'interne', ownership: { own: E('ownerEmployeeId'), site: 'siteId' } },
  LabAnalysis: { module: 'qualite', label: 'Analyse laboratoire', sensitivity: 'interne', ownership: { site: 'siteId' } },
  BatchRelease: { module: 'qualite', label: 'Libération de lot', sensitivity: 'interne', ownership: { site: 'siteId' }, forbidden: ['update', 'delete'] },
  Recall: { module: 'qualite', label: 'Retrait et rappel produit', sensitivity: 'interne', ownership: {} },
  Allergen: { module: 'qualite', label: 'Allergène', sensitivity: 'public', ownership: {} },
  QualityCertification: { module: 'qualite', label: 'Certification (IFS, BRCGS, bio, cacao durable)', sensitivity: 'interne', ownership: {} },
  Complaint: { module: 'qualite', label: 'Réclamation client', sensitivity: 'interne', ownership: { own: E('createdByEmployeeId') } },

  // ---------- Stock ----------
  Item: { module: 'stock', label: 'Article', sensitivity: 'interne', ownership: {} },
  Warehouse: { module: 'stock', label: 'Entrepôt', sensitivity: 'interne', ownership: { site: 'siteId' } },
  Location: { module: 'stock', label: 'Emplacement', sensitivity: 'interne', ownership: { site: 'siteId' } },
  StockLot: { module: 'stock', label: 'Stock par lot', sensitivity: 'interne', ownership: { site: 'siteId' } },
  StockMovement: { module: 'stock', label: 'Mouvement de stock', sensitivity: 'interne', ownership: { own: E('createdByEmployeeId'), site: 'siteId' }, forbidden: ['update', 'delete'] },
  InventoryCount: { module: 'stock', label: 'Inventaire', sensitivity: 'interne', ownership: { site: 'siteId' } },
  StockTransfer: { module: 'stock', label: 'Transfert inter-sites', sensitivity: 'interne', ownership: { site: 'siteId' } },
  EnvironmentReading: { module: 'stock', label: 'Mesure température et humidité', sensitivity: 'interne', ownership: { site: 'siteId' }, forbidden: ['update', 'delete'] },

  // ---------- Outils ----------
  Tool: { module: 'outils', label: 'Outil, moule, instrument', sensitivity: 'interne', ownership: { site: 'siteId' } },
  ToolLoan: { module: 'outils', label: 'Prêt d outil', sensitivity: 'interne', ownership: { own: E('employeeId'), team: 'teamId', site: 'siteId' } },
  Calibration: { module: 'outils', label: 'Étalonnage', sensitivity: 'interne', ownership: { site: 'siteId' } },
  Ppe: { module: 'outils', label: 'Équipement de protection individuelle', sensitivity: 'interne', ownership: { own: E('employeeId'), team: 'teamId', site: 'siteId' } },

  // ---------- Maintenance ----------
  MaintenancePlan: { module: 'maintenance', label: 'Plan de maintenance préventive', sensitivity: 'interne', ownership: { site: 'siteId' } },
  WorkOrder: { module: 'maintenance', label: 'Bon d intervention', sensitivity: 'interne', ownership: { own: E('assignedToEmployeeId'), team: 'teamId', site: 'siteId' } },

  // ---------- Achats ----------
  Supplier: { module: 'achats', label: 'Fournisseur', sensitivity: 'interne', ownership: {} },
  SupplierBankAccount: { module: 'achats', label: 'Coordonnées bancaires fournisseur', sensitivity: 'sensible', ownership: {} },
  DueDiligence: { module: 'achats', label: 'Devoir de vigilance (déforestation, durabilité)', sensitivity: 'interne', ownership: {} },
  SupplierContract: { module: 'achats', label: 'Contrat fournisseur', sensitivity: 'interne', ownership: {} },
  PurchaseRequest: { module: 'achats', label: 'Demande d achat', sensitivity: 'interne', ownership: { own: E('requestedByEmployeeId'), department: 'departmentId', site: 'siteId' } },
  PurchaseOrder: { module: 'achats', label: 'Commande fournisseur', sensitivity: 'interne', ownership: { own: E('buyerEmployeeId'), site: 'siteId' } },
  GoodsReceipt: { module: 'achats', label: 'Réception marchandise', sensitivity: 'interne', ownership: { site: 'siteId' } },
  SupplierInvoice: { module: 'achats', label: 'Facture fournisseur', sensitivity: 'interne', ownership: {} },

  // ---------- Ventes ----------
  Customer: { module: 'ventes', label: 'Client', sensitivity: 'interne', ownership: { own: E('accountManagerEmployeeId') } },
  Lead: { module: 'ventes', label: 'Prospect', sensitivity: 'interne', ownership: { own: E('ownerEmployeeId') } },
  Opportunity: { module: 'ventes', label: 'Opportunité', sensitivity: 'interne', ownership: { own: E('ownerEmployeeId') } },
  Activity: { module: 'ventes', label: 'Activité commerciale (appel, rendez-vous)', sensitivity: 'interne', ownership: { own: E('ownerEmployeeId') } },
  PriceList: { module: 'ventes', label: 'Tarif', sensitivity: 'interne', ownership: {} },
  Promotion: { module: 'ventes', label: 'Promotion', sensitivity: 'interne', ownership: {} },
  Quote: { module: 'ventes', label: 'Devis', sensitivity: 'interne', ownership: { own: E('ownerEmployeeId') } },
  SalesOrder: { module: 'ventes', label: 'Commande client', sensitivity: 'interne', ownership: { own: E('salesRepEmployeeId'), site: 'shippingSiteId' } },
  Invoice: { module: 'ventes', label: 'Facture client', sensitivity: 'interne', ownership: { own: E('salesRepEmployeeId') }, forbidden: ['delete'] },
  CreditNote: { module: 'ventes', label: 'Note de crédit', sensitivity: 'interne', ownership: {}, forbidden: ['delete'] },

  // ---------- Boutiques ----------
  Store: { module: 'boutique', label: 'Boutique', sensitivity: 'interne', ownership: { site: 'siteId' } },
  PosSession: { module: 'boutique', label: 'Session de caisse', sensitivity: 'interne', ownership: { own: E('cashierEmployeeId'), site: 'siteId' } },
  PosSale: { module: 'boutique', label: 'Ticket de caisse', sensitivity: 'interne', ownership: { own: E('cashierEmployeeId'), site: 'siteId' }, forbidden: ['delete'] },
  LoyaltyMember: { module: 'boutique', label: 'Client fidélité', sensitivity: 'personnel', ownership: { site: 'homeSiteId' } },

  // ---------- Logistique ----------
  PickingList: { module: 'logistique', label: 'Liste de préparation', sensitivity: 'interne', ownership: { own: E('assignedToEmployeeId'), site: 'siteId' } },
  Shipment: { module: 'logistique', label: 'Expédition', sensitivity: 'interne', ownership: { site: 'siteId' } },
  Carrier: { module: 'logistique', label: 'Transporteur', sensitivity: 'interne', ownership: {} },
  DeliveryRoute: { module: 'logistique', label: 'Tournée de livraison', sensitivity: 'interne', ownership: { own: E('driverEmployeeId'), site: 'siteId' } },
  Vehicle: { module: 'logistique', label: 'Véhicule', sensitivity: 'interne', ownership: { own: E('assignedEmployeeId'), site: 'siteId' } },
  ProofOfDelivery: { module: 'logistique', label: 'Preuve de livraison', sensitivity: 'interne', ownership: { own: E('driverEmployeeId'), site: 'siteId' }, forbidden: ['update', 'delete'] },

  // ---------- Finance ----------
  LedgerAccount: { module: 'finance', label: 'Compte du plan comptable', sensitivity: 'interne', ownership: {} },
  JournalEntry: { module: 'finance', label: 'Écriture comptable', sensitivity: 'interne', ownership: {}, forbidden: ['delete'] },
  Payment: { module: 'finance', label: 'Paiement', sensitivity: 'sensible', ownership: {} },
  Budget: { module: 'finance', label: 'Budget', sensitivity: 'interne', ownership: { department: 'departmentId', site: 'siteId' } },
  CostSheet: { module: 'finance', label: 'Coût de revient', sensitivity: 'secret', ownership: {} },
  Asset: { module: 'finance', label: 'Immobilisation', sensitivity: 'interne', ownership: { site: 'siteId' } },
  ExpenseReport: { module: 'finance', label: 'Note de frais', sensitivity: 'personnel', ownership: { own: E('employeeId'), department: 'departmentId', site: 'siteId' } },

  // ---------- HSE ----------
  Incident: { module: 'hse', label: 'Accident, presque accident, situation dangereuse', sensitivity: 'personnel', ownership: { own: E('reportedByEmployeeId'), site: 'siteId' } },
  RiskAssessment: { module: 'hse', label: 'Analyse de risques', sensitivity: 'interne', ownership: { site: 'siteId' } },
  WorkPermit: { module: 'hse', label: 'Permis de travail (feu, hauteur, consignation)', sensitivity: 'interne', ownership: { own: E('requestedByEmployeeId'), site: 'siteId' } },
  EnvironmentalMetric: { module: 'hse', label: 'Énergie, eau, déchets, CO2', sensitivity: 'interne', ownership: { site: 'siteId' } },

  // ---------- Communication ----------
  Announcement: { module: 'communication', label: 'Annonce interne', sensitivity: 'interne', ownership: { site: 'siteId' } },
  Document: { module: 'communication', label: 'Document (procédures, notes)', sensitivity: 'interne', ownership: { own: U('ownerUserId'), department: 'departmentId', site: 'siteId' } },
  Task: { module: 'communication', label: 'Tâche', sensitivity: 'interne', ownership: { own: E('assigneeEmployeeId'), team: 'teamId' } },
  ApprovalRequest: { module: 'communication', label: 'Demande de validation', sensitivity: 'interne', ownership: { own: E('requesterEmployeeId') } },
  Notification: { module: 'communication', label: 'Notification', sensitivity: 'personnel', ownership: { own: U('userId') } },

  // ---------- Monde 3D et progression ----------
  World: { module: 'monde', label: 'Accès au monde 3D', sensitivity: 'interne', ownership: {} },
  WorldPresence: { module: 'monde', label: 'Présence nominative (qui est où)', sensitivity: 'personnel', ownership: { team: 'teamId', department: 'departmentId', site: 'siteId' } },
  Quest: { module: 'monde', label: 'Quête', sensitivity: 'interne', ownership: { own: E('employeeId'), team: 'teamId' } },
  QuestTemplate: { module: 'monde', label: 'Modèle de quête', sensitivity: 'interne', ownership: {} },

  // ---------- Pilotage ----------
  Dashboard: { module: 'reporting', label: 'Tableau de bord', sensitivity: 'interne', ownership: { own: U('ownerUserId') } },
  Report: { module: 'reporting', label: 'Rapport', sensitivity: 'interne', ownership: {} },

  // ---------- Administration ----------
  User: { module: 'admin', label: 'Compte utilisateur', sensitivity: 'personnel', ownership: { own: U('id') } },
  RoleAssignment: { module: 'admin', label: 'Attribution de rôle', sensitivity: 'sensible', ownership: { site: 'siteId' } },
  AuditLog: { module: 'admin', label: 'Journal d audit', sensitivity: 'sensible', ownership: {}, forbidden: ['update', 'delete'] },
  Setting: { module: 'admin', label: 'Paramètre', sensitivity: 'interne', ownership: {} },
  Integration: { module: 'admin', label: 'Intégration externe', sensitivity: 'sensible', ownership: {} },
  ApiKey: { module: 'admin', label: 'Clé d API', sensitivity: 'secret', ownership: {} },
  DataRequest: { module: 'admin', label: 'Demande RGPD (accès, rectification, effacement)', sensitivity: 'personnel', ownership: { own: U('requesterUserId') } },
} as const satisfies Record<string, SubjectDef>;

export type SubjectName = keyof typeof SUBJECTS;
export type AppSubject = SubjectName | 'all';

export const SUBJECT_NAMES = Object.keys(SUBJECTS) as SubjectName[];

export function subjectDef(name: SubjectName): SubjectDef {
  return SUBJECTS[name];
}

/** Champs de l'annuaire interne visibles par tout le personnel. */
export const DIRECTORY_FIELDS = [
  'id',
  'firstName',
  'lastName',
  'preferredName',
  'jobTitle',
  'positionId',
  'departmentId',
  'teamId',
  'siteId',
  'workEmail',
  'workPhone',
  'photoUrl',
  'languages',
  'avatar',
] as const;

/** Champs du profil que l'employé peut modifier lui-même. */
export const SELF_EDITABLE_EMPLOYEE_FIELDS = [
  'preferredName',
  'personalPhone',
  'personalEmail',
  'address',
  'emergencyContactName',
  'emergencyContactPhone',
  'photoUrl',
  'languages',
  'avatar',
] as const;
