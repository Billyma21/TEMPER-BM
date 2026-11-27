/**
 * Principal authentifié attaché à chaque requête par le SessionGuard.
 * MAAYOUD
 */
import {
  type Action,
  type AppAbility,
  type RawRule,
  type RoleKey,
  type SubjectName,
  asSubject,
  prismaWhere,
} from '@temper/permissions';
import { ForbiddenException } from '@nestjs/common';

export interface Principal {
  kind: 'USER' | 'DEVICE';
  id: string;
  sessionId?: string;
  email?: string;
  employee: { id: string; siteId: string; departmentId: string | null; teamId: string | null; firstName: string } | null;
  deviceSiteId?: string;
  activeRoles: RoleKey[];
  mfaPending: boolean;
  /** Règles dialecte mongo : vérifications sur objets chargés, envoyées au front */
  rules: RawRule[];
  /** Règles dialecte prisma : filtres de requêtes */
  prismaRules: RawRule[];
  ability: AppAbility;
  /** Durée maximale de session imposée par les rôles actifs (minutes) */
  maxSessionMinutes: number;
}

/** Filtre de lignes à combiner avec les filtres métier. Lève 403 si aucun accès. */
export function whereOrForbid(p: Principal, action: Action, subject: SubjectName, includeFieldRestricted = false) {
  const where = prismaWhere(p.prismaRules, action, subject, { includeFieldRestricted });
  if (where === null) throw new ForbiddenException({ code: 'FORBIDDEN', action, subject });
  return where;
}

/** Vérification objet par objet (après chargement). */
export function assertCan(p: Principal, action: Action, subject: SubjectName, obj: Record<string, unknown>, field?: string) {
  if (!p.ability.can(action, asSubject(subject, obj), field)) {
    throw new ForbiddenException({ code: 'FORBIDDEN', action, subject });
  }
}
