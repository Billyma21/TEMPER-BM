/**
 * Correspondance module / ressource, même pluriel que l API.
 * MAAYOUD
 */
import { SUBJECTS, SUBJECT_NAMES, type ModuleKey, type SubjectName } from '@temper/permissions';
import { pluralKebab } from '@temper/shared';

const VIRTUAL = new Set<SubjectName>(['World', 'WorldPresence']);

export function subjectsOf(module: ModuleKey): SubjectName[] {
  return SUBJECT_NAMES.filter((name) => SUBJECTS[name].module === module && !VIRTUAL.has(name));
}

export function subjectFromSegment(module: ModuleKey, segment: string): SubjectName | undefined {
  return subjectsOf(module).find((name) => pluralKebab(name) === segment);
}

export function resourcePath(subject: SubjectName): string {
  return `${SUBJECTS[subject].module}/${pluralKebab(subject)}`;
}

export { pluralKebab };
