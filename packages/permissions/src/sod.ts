/**
 * Séparation des tâches (contrôle interne).
 * - BLOCK : l'attribution du cumul de rôles est refusée.
 * - WARN  : autorisée mais signalée, et le contrôle "quatre yeux" s'applique à l'exécution.
 *
 * MAAYOUD
 */
import { type Action, ACTIONS, SUBJECT_NAMES, type SubjectName } from './catalog';
import { type RoleKey, ROLES, expandRole } from './roles';

export interface SodRule {
  id: string;
  label: string;
  a: readonly [Action, SubjectName];
  b: readonly [Action, SubjectName];
  severity: 'BLOCK' | 'WARN';
  rationale: string;
}

export const SOD_RULES: readonly SodRule[] = [
  { id: 'SOD-01', label: 'Créer un fournisseur et valider ses factures', a: ['create', 'Supplier'], b: ['approve', 'SupplierInvoice'], severity: 'BLOCK', rationale: 'Fournisseur fictif puis paiement.' },
  { id: 'SOD-02', label: 'Modifier un IBAN fournisseur et valider un paiement', a: ['update', 'SupplierBankAccount'], b: ['approve', 'Payment'], severity: 'BLOCK', rationale: 'Fraude au changement de coordonnées bancaires.' },
  { id: 'SOD-03', label: 'Attribuer des rôles et valider des paiements', a: ['create', 'RoleAssignment'], b: ['approve', 'Payment'], severity: 'BLOCK', rationale: 'Auto-attribution de pouvoirs financiers.' },
  { id: 'SOD-04', label: 'Émettre une note de crédit et l approuver', a: ['create', 'CreditNote'], b: ['approve', 'CreditNote'], severity: 'BLOCK', rationale: 'Remboursement non justifié.' },
  { id: 'SOD-05', label: 'Saisir une facture fournisseur et approuver le paiement', a: ['create', 'SupplierInvoice'], b: ['approve', 'Payment'], severity: 'BLOCK', rationale: 'Facture fictive payée.' },
  { id: 'SOD-06', label: 'Passer une commande et réceptionner la marchandise', a: ['create', 'PurchaseOrder'], b: ['create', 'GoodsReceipt'], severity: 'WARN', rationale: 'Réception de complaisance.' },
  { id: 'SOD-07', label: 'Produire un lot et le libérer', a: ['execute', 'ProductionStep'], b: ['approve', 'BatchRelease'], severity: 'WARN', rationale: 'Indépendance de la libération qualité.' },
  { id: 'SOD-08', label: 'Compter un inventaire et valider l écart', a: ['create', 'InventoryCount'], b: ['approve', 'InventoryCount'], severity: 'WARN', rationale: 'Masquage de pertes.' },
  { id: 'SOD-09', label: 'Créer un client et valider son encours', a: ['create', 'Customer'], b: ['approve', 'Customer'], severity: 'WARN', rationale: 'Encours excessif accordé à un client.' },
  { id: 'SOD-10', label: 'Encaisser et valider les annulations de tickets', a: ['create', 'PosSale'], b: ['approve', 'PosSale'], severity: 'WARN', rationale: 'Annulation de ventes encaissées en espèces.' },
];

type Capability = `${Action}:${SubjectName}`;

/** Capacités (action, sujet) d'un ensemble de rôles, sans tenir compte des portées (approche prudente). */
export function capabilities(roles: readonly RoleKey[]): Set<Capability> {
  const caps = new Set<Capability>();
  for (const role of roles) {
    for (const r of expandRole(role)) {
      for (const gr of ROLES[r].grants) {
        const subjects = gr.subjects.includes('all') ? SUBJECT_NAMES : (gr.subjects as SubjectName[]);
        const actions = gr.actions.includes('manage') ? ACTIONS : gr.actions;
        for (const s of subjects) for (const a of actions) caps.add(`${a}:${s}`);
      }
    }
  }
  return caps;
}

export interface SodViolation {
  rule: SodRule;
}

export function checkSod(roles: readonly RoleKey[]): SodViolation[] {
  // Le super administrateur est un compte de secours journalisé : hors du périmètre SoD.
  const scoped = roles.filter((r) => r !== 'SUPER_ADMIN');
  const caps = capabilities(scoped);
  return SOD_RULES.filter(
    (rule) => caps.has(`${rule.a[0]}:${rule.a[1]}`) && caps.has(`${rule.b[0]}:${rule.b[1]}`),
  ).map((rule) => ({ rule }));
}

export class FourEyesError extends Error {
  constructor(public readonly ruleId: string) {
    super(`Contrôle quatre yeux (${ruleId}) : la personne qui valide doit être différente de celle qui a saisi.`);
  }
}

/** À appeler dans chaque service de validation. */
export function assertFourEyes(makerUserId: string, checkerUserId: string, ruleId: string): void {
  if (makerUserId === checkerUserId) throw new FourEyesError(ruleId);
}
