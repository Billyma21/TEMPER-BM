/**
 * Construction de l'objet "ability" côté front (et tests).
 * L'API utilise les mêmes règles en dialecte prisma avec @casl/prisma.
 *
 * MAAYOUD
 */
import { type ForcedSubject, type MongoAbility, createMongoAbility, subject as tag } from '@casl/ability';
import {
  type Action,
  type AppSubject,
  type ModuleKey,
  MODULES,
  SUBJECTS,
  SUBJECT_NAMES,
  type SubjectName,
} from './catalog';
import type { RawRule } from './rules';

export type TaggedRecord = ForcedSubject<SubjectName>;
export type AppAbility = MongoAbility<[Action, AppSubject | TaggedRecord]>;

export function createAppAbility(rules: RawRule[]): AppAbility {
  return createMongoAbility<AppAbility>(rules as never);
}

/** Marque un objet brut avec son type pour les vérifications conditionnelles. */
export function asSubject<T extends Record<string, unknown>>(type: SubjectName, obj: T): T & ForcedSubject<SubjectName> {
  return tag(type, obj);
}

/**
 * Un droit "personnel" (portée own) ou limité à quelques champs (annuaire)
 * relève du libre-service "Mon espace", pas de l'ouverture d'un module métier.
 */
function isBusinessRule(rule: { inverted: boolean; fields?: string | string[]; reason?: string }): boolean {
  return !rule.inverted && !rule.fields && !(rule.reason ?? '').endsWith('|own');
}

/** Modules métier à afficher dans la navigation. */
export function visibleModules(ability: AppAbility): ModuleKey[] {
  const keys = new Set<ModuleKey>();
  for (const s of SUBJECT_NAMES) {
    if (ability.rulesFor('read', s).some(isBusinessRule)) keys.add(SUBJECTS[s].module);
  }
  return [...keys].sort((a, b) => MODULES[a].order - MODULES[b].order);
}

/** Ressources du libre-service "Mon espace" (consultables avec la portée personnelle). */
export function selfServiceSubjects(ability: AppAbility): SubjectName[] {
  return SUBJECT_NAMES.filter((s) =>
    ability.rulesFor('read', s).some((r) => !r.inverted && (r.reason ?? '').endsWith('|own')),
  );
}

/**
 * Zones du monde 3D accessibles. Une zone est "ouverte" si l'utilisateur voit
 * au moins un module rattaché. Sinon la porte reste fermée (cadenas) dans le monde.
 */
export function openWorldZones(ability: AppAbility): string[] {
  const zones = new Set<string>(['campus']);
  for (const m of visibleModules(ability)) zones.add(MODULES[m].worldZone);
  return [...zones];
}
