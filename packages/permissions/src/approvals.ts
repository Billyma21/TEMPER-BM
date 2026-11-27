/**
 * Circuits de validation par défaut.
 * Les seuils sont des valeurs par défaut : ils sont surchargés par le paramétrage
 * (table Setting, clé "approvals.<POLICY>") sans redéploiement.
 *
 * MAAYOUD
 */
import type { SubjectName } from './catalog';
import type { RoleKey } from './roles';

export interface ApprovalTier {
  /** Borne supérieure incluse ; null = au-delà de tous les paliers. */
  upTo: number | null;
  /** Étapes successives ; chaque étape = un des rôles listés doit valider. */
  steps: RoleKey[][];
}

export interface ApprovalPolicy {
  label: string;
  subject: SubjectName;
  unit: 'EUR' | 'PERCENT' | 'DAYS' | 'NONE';
  /** La personne qui a créé la demande ne peut pas la valider. */
  fourEyes: boolean;
  tiers: ApprovalTier[];
  note?: string;
}

export const APPROVAL_POLICIES = {
  PURCHASE_ORDER: {
    label: 'Commande fournisseur',
    subject: 'PurchaseOrder',
    unit: 'EUR',
    fourEyes: true,
    tiers: [
      { upTo: 2500, steps: [['RESPONSABLE_ACHATS']] },
      { upTo: 25000, steps: [['RESPONSABLE_ACHATS'], ['DAF']] },
      { upTo: null, steps: [['RESPONSABLE_ACHATS'], ['DAF'], ['DIRECTION_GENERALE']] },
    ],
    note: 'Les appels sur contrat cadre (fèves, sucre) déjà approuvé suivent le palier du contrat, pas celui de l appel.',
  },
  PURCHASE_REQUEST: {
    label: 'Demande d achat',
    subject: 'PurchaseRequest',
    unit: 'EUR',
    fourEyes: true,
    tiers: [
      { upTo: 1000, steps: [['MANAGER_EQUIPE', 'DIRECTEUR_PRODUCTION', 'RESPONSABLE_MAINTENANCE', 'RESPONSABLE_LOGISTIQUE']] },
      { upTo: null, steps: [['DIRECTEUR_SITE', 'DIRECTEUR_PRODUCTION'], ['RESPONSABLE_ACHATS']] },
    ],
  },
  LEAVE_REQUEST: {
    label: 'Congé',
    subject: 'LeaveRequest',
    unit: 'DAYS',
    fourEyes: true,
    tiers: [
      { upTo: 10, steps: [['MANAGER_EQUIPE', 'CHEF_EQUIPE', 'RESPONSABLE_BOUTIQUE']] },
      { upTo: null, steps: [['MANAGER_EQUIPE', 'CHEF_EQUIPE', 'RESPONSABLE_BOUTIQUE'], ['GESTIONNAIRE_RH', 'DRH']] },
    ],
  },
  TIME_CORRECTION: {
    label: 'Correction de pointage',
    subject: 'TimeCorrection',
    unit: 'NONE',
    fourEyes: true,
    tiers: [{ upTo: null, steps: [['MANAGER_EQUIPE', 'CHEF_EQUIPE', 'RESPONSABLE_BOUTIQUE', 'GESTIONNAIRE_RH']] }],
  },
  EXPENSE_REPORT: {
    label: 'Note de frais',
    subject: 'ExpenseReport',
    unit: 'EUR',
    fourEyes: true,
    tiers: [
      { upTo: 500, steps: [['MANAGER_EQUIPE']] },
      { upTo: null, steps: [['MANAGER_EQUIPE'], ['DAF']] },
    ],
  },
  QUOTE_DISCOUNT: {
    label: 'Remise sur devis',
    subject: 'Quote',
    unit: 'PERCENT',
    fourEyes: true,
    tiers: [
      { upTo: 5, steps: [] },
      { upTo: 15, steps: [['DIRECTEUR_COMMERCIAL']] },
      { upTo: null, steps: [['DIRECTEUR_COMMERCIAL'], ['DIRECTION_GENERALE']] },
    ],
  },
  CREDIT_NOTE: {
    label: 'Note de crédit',
    subject: 'CreditNote',
    unit: 'EUR',
    fourEyes: true,
    tiers: [
      { upTo: 1000, steps: [['DIRECTEUR_COMMERCIAL']] },
      { upTo: null, steps: [['DIRECTEUR_COMMERCIAL'], ['DAF']] },
    ],
  },
  INVENTORY_ADJUSTMENT: {
    label: 'Écart d inventaire',
    subject: 'InventoryCount',
    unit: 'EUR',
    fourEyes: true,
    tiers: [
      { upTo: 250, steps: [['RESPONSABLE_LOGISTIQUE', 'RESPONSABLE_BOUTIQUE']] },
      { upTo: 2500, steps: [['RESPONSABLE_LOGISTIQUE']] },
      { upTo: null, steps: [['RESPONSABLE_LOGISTIQUE'], ['CONTROLEUR_GESTION', 'DAF']] },
    ],
  },
  BATCH_RELEASE: {
    label: 'Libération de lot',
    subject: 'BatchRelease',
    unit: 'NONE',
    fourEyes: true,
    tiers: [{ upTo: null, steps: [['RESPONSABLE_QUALITE']] }],
    note: 'Bloquante si un CCP est hors limite, une analyse non conforme ou une non-conformité ouverte sur le lot.',
  },
  RECIPE_VERSION: {
    label: 'Nouvelle version de recette',
    subject: 'Recipe',
    unit: 'NONE',
    fourEyes: true,
    tiers: [{ upTo: null, steps: [['RESPONSABLE_QUALITE'], ['DIRECTEUR_PRODUCTION']] }],
    note: 'La qualité valide allergènes et étiquetage, la production valide la faisabilité industrielle.',
  },
  SUPPLIER_BANK_CHANGE: {
    label: 'Changement d IBAN fournisseur',
    subject: 'SupplierBankAccount',
    unit: 'NONE',
    fourEyes: true,
    tiers: [{ upTo: null, steps: [['DAF']] }],
    note: 'Contre-appel obligatoire au numéro connu du fournisseur (jamais celui du courriel de demande), tracé dans la validation.',
  },
  PAYMENT_RUN: {
    label: 'Lot de paiements',
    subject: 'Payment',
    unit: 'EUR',
    fourEyes: true,
    tiers: [
      { upTo: 50000, steps: [['DAF']] },
      { upTo: null, steps: [['DAF'], ['DIRECTION_GENERALE']] },
    ],
  },
  RECALL: {
    label: 'Retrait ou rappel produit',
    subject: 'Recall',
    unit: 'NONE',
    fourEyes: false,
    tiers: [{ upTo: null, steps: [['RESPONSABLE_QUALITE'], ['DIRECTION_GENERALE']] }],
    note: 'En cas d urgence sanitaire, la qualité bloque immédiatement les lots ; la validation formalise ensuite la notification à l autorité.',
  },
  SENSITIVE_ROLE_ASSIGNMENT: {
    label: 'Attribution d un rôle sensible (MFA requis)',
    subject: 'RoleAssignment',
    unit: 'NONE',
    fourEyes: true,
    tiers: [{ upTo: null, steps: [['ADMIN_IT'], ['DRH', 'DIRECTION_GENERALE']] }],
    note: 'Un administrateur ne peut jamais s attribuer un rôle à lui-même.',
  },
} as const satisfies Record<string, ApprovalPolicy>;

export type ApprovalPolicyKey = keyof typeof APPROVAL_POLICIES;

export function approvalSteps(policy: ApprovalPolicyKey, value = 0): RoleKey[][] {
  const p: ApprovalPolicy = APPROVAL_POLICIES[policy];
  const tier = p.tiers.find((t) => t.upTo === null || value <= t.upTo);
  return tier ? tier.steps.map((s) => [...s]) : [];
}
