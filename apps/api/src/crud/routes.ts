/**
 * Chemins HTTP du gabarit : /<domaine>/<ressource au pluriel>.
 * MAAYOUD
 */
import { SUBJECTS, type SubjectName } from '@temper/permissions';
import { pluralKebab } from '@temper/shared';

export { pluralKebab };

export function resourcePath(subject: SubjectName): string {
  return `${SUBJECTS[subject].module}/${pluralKebab(subject)}`;
}
