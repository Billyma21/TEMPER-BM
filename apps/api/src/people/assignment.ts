/**
 * Règles d attribution : pas d auto-attribution, date de fin pour l intérim et les étudiants, séparation des tâches.
 * MAAYOUD
 */
import { type RoleKey, checkSod } from '@temper/permissions';

export const TEMP_CONTRACTS = ['TEMPORARY_AGENCY', 'STUDENT', 'INTERN', 'FLEXI_JOB'] as const;

/** Tant que le circuit sensible n est pas accepté, le rôle n est pas encore valable. */
export const PENDING_FROM = new Date('2999-01-01T00:00:00.000Z');

export interface AssignmentVerdict {
  ok: boolean;
  pending: boolean;
  status: 200 | 400 | 403 | 409;
  code: 'OK' | 'FORBIDDEN' | 'VALIDATION_ERROR' | 'CONFLICT';
  details: Record<string, unknown> | null;
}

export function judgeAssignment(input: {
  actorId: string;
  targetUserId: string;
  existingRoles: readonly RoleKey[];
  next: RoleKey;
  employmentType: string | null;
  validUntil: string | null;
  requiresMfa: boolean;
}): AssignmentVerdict {
  if (input.actorId === input.targetUserId) {
    return { ok: false, pending: false, status: 403, code: 'FORBIDDEN', details: { reason: 'SELF' } };
  }
  if (input.employmentType && (TEMP_CONTRACTS as readonly string[]).includes(input.employmentType) && !input.validUntil) {
    return { ok: false, pending: false, status: 400, code: 'VALIDATION_ERROR', details: { field: 'validUntil' } };
  }
  const block = checkSod([...input.existingRoles, input.next]).find((item) => item.rule.severity === 'BLOCK');
  if (block) return { ok: false, pending: false, status: 409, code: 'CONFLICT', details: { rule: block.rule.id } };
  return { ok: true, pending: input.requiresMfa, status: 200, code: 'OK', details: null };
}
