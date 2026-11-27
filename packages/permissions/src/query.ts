/**
 * Traduction des règles (dialecte prisma) en clause "where" Prisma.
 * Équivalent minimal et sans dépendance de accessibleBy (@casl/prisma),
 * adapté à nos conditions (égalités et "in").
 *
 * MAAYOUD
 */
import type { Action, SubjectName } from './catalog';
import type { RawRule } from './rules';

const asArray = <T>(v: T | T[]) => (Array.isArray(v) ? v : [v]);

const matchesAction = (r: RawRule, action: Action) => {
  const acts = asArray(r.action);
  return acts.includes(action) || (!r.inverted && acts.includes('manage'));
};
const matchesSubject = (r: RawRule, subject: SubjectName) => {
  const subs = asArray(r.subject);
  return subs.includes(subject) || subs.includes('all');
};

export interface WhereOptions {
  /** Inclure les droits limités à certains champs (ex. annuaire). Le service doit alors restreindre le select. */
  includeFieldRestricted?: boolean;
}

/**
 * - null : aucun accès (le service répond 403 ou liste vide)
 * - {}   : accès sans restriction de lignes
 * - { OR: [...] } : filtre à combiner (AND) avec les filtres métier
 */
export function prismaWhere(
  rules: readonly RawRule[],
  action: Action,
  subject: SubjectName,
  opts: WhereOptions = {},
): Record<string, unknown> | null {
  const relevant = rules.filter((r) => matchesAction(r, action) && matchesSubject(r, subject));
  if (relevant.some((r) => r.inverted && !r.conditions && !r.fields)) return null;
  const allows = relevant.filter((r) => !r.inverted && (opts.includeFieldRestricted || !r.fields));
  if (!allows.length) return null;
  if (allows.some((r) => !r.conditions || Object.keys(r.conditions).length === 0)) return {};
  return { OR: allows.map((r) => r.conditions) };
}
