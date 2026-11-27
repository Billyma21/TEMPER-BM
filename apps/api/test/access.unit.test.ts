/**
 * Décision de porte et attribution de rôle, sans base.
 * MAAYOUD
 */
import { describe, expect, it } from 'vitest';
import { decideAccess, type DoorFacts } from '../src/access/decision.js';
import { judgeAssignment } from '../src/people/assignment.js';

const now = new Date('2026-11-23T10:00:00.000Z');

function facts(patch: Partial<DoorFacts> = {}): DoorFacts {
  return {
    now,
    direction: 'IN',
    badge: { status: 'ACTIVE', validFrom: new Date('2026-01-01'), validUntil: null, siteId: 'site' },
    deviceSiteId: 'site',
    holderActive: true,
    zoneLevel: 'RESTRICTED',
    requiredTrainings: ['FOOD_HYGIENE'],
    requiredPpe: ['charlotte'],
    trainings: [{ type: 'FOOD_HYGIENE', validUntil: new Date('2027-01-01') }],
    wornPpe: ['charlotte'],
    unfit: false,
    rule: 'open',
    schedule: null,
    inside: false,
    occupancy: 0,
    maxOccupancy: null,
    antiPassback: true,
    ...patch,
  };
}

describe('Décision de porte', () => {
  it('ouvre le sas quand la formation et l EPI sont valides', () => {
    expect(decideAccess(facts()).result).toBe('GRANTED');
  });

  it('refuse une formation échue et prévient par le motif TRAINING_EXPIRED', () => {
    const decision = decideAccess(facts({ trainings: [{ type: 'FOOD_HYGIENE', validUntil: new Date('2026-01-01') }] }));
    expect(decision).toEqual({ result: 'DENIED', denyReason: 'TRAINING_EXPIRED' });
  });

  it('refuse un badge perdu', () => {
    expect(decideAccess(facts({ badge: { status: 'LOST', validFrom: new Date('2026-01-01'), validUntil: null, siteId: 'site' } })).denyReason).toBe('BADGE_INACTIVE');
  });

  it('laisse sortir même sans formation, pour ne pas enfermer', () => {
    expect(decideAccess(facts({ direction: 'OUT', trainings: [], inside: true })).result).toBe('GRANTED');
  });

  it('bloque une seconde entrée sans sortie', () => {
    expect(decideAccess(facts({ inside: true })).denyReason).toBe('ANTI_PASSBACK');
  });

  it('bloque une zone pleine', () => {
    expect(decideAccess(facts({ antiPassback: false, occupancy: 2, maxOccupancy: 2 })).denyReason).toBe('ZONE_FULL');
  });

  it('ferme une zone critique sans règle positive', () => {
    expect(decideAccess(facts({ zoneLevel: 'CRITICAL', rule: 'closed', requiredTrainings: [], requiredPpe: [] })).denyReason).toBe('NO_RIGHT');
  });
});

describe('Attribution de rôle', () => {
  it('refuse l auto-attribution', () => {
    const verdict = judgeAssignment({
      actorId: 'u1',
      targetUserId: 'u1',
      existingRoles: [],
      next: 'EMPLOYE',
      employmentType: 'PERMANENT',
      validUntil: null,
      requiresMfa: false,
    });
    expect(verdict.code).toBe('FORBIDDEN');
  });

  it('exige une date de fin pour un étudiant', () => {
    const verdict = judgeAssignment({
      actorId: 'u1',
      targetUserId: 'u2',
      existingRoles: [],
      next: 'EMPLOYE',
      employmentType: 'STUDENT',
      validUntil: null,
      requiresMfa: false,
    });
    expect(verdict.details).toEqual({ field: 'validUntil' });
  });

  it('bloque un cumul interdit et met un rôle sensible en circuit', () => {
    const blocked = judgeAssignment({
      actorId: 'u1',
      targetUserId: 'u2',
      existingRoles: ['DAF'],
      next: 'ADMIN_IT',
      employmentType: 'PERMANENT',
      validUntil: null,
      requiresMfa: true,
    });
    expect(blocked.code).toBe('CONFLICT');
    const pending = judgeAssignment({
      actorId: 'u1',
      targetUserId: 'u2',
      existingRoles: ['OPERATEUR'],
      next: 'ADMIN_IT',
      employmentType: 'PERMANENT',
      validUntil: null,
      requiresMfa: true,
    });
    expect(pending.ok).toBe(true);
    expect(pending.pending).toBe(true);
  });
});
