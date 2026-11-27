import { describe, expect, it } from 'vitest';
import { computeDay, haversineMeters, nextKind } from '../src/time/time-rules.js';
import { base32Encode, hotp, totp, verifyTotp } from '../src/auth/totp.js';
import { decryptField, encryptField } from '../src/common/crypto.js';

const d = (s: string) => new Date(`2026-11-27T${s}:00`);
const plan = { start: d('06:00'), end: d('14:00'), breakMinutes: 30 };

describe('Calcul de journée', () => {
  it('journée normale avec pause badgée', () => {
    const r = computeDay(
      [
        { at: d('05:55'), kind: 'IN' },
        { at: d('10:00'), kind: 'BREAK_START' },
        { at: d('10:30'), kind: 'BREAK_END' },
        { at: d('14:02'), kind: 'OUT' },
      ],
      plan,
    );
    expect(r.workedMinutes).toBe(457);
    expect(r.breakMinutes).toBe(30);
    expect(r.overtimeMinutes).toBe(7);
    expect(r.lateMinutes).toBe(0);
    expect(r.anomalies).toEqual([]);
  });

  it('pause non badgée : déduction de la pause planifiée', () => {
    const r = computeDay([{ at: d('06:00'), kind: 'IN' }, { at: d('14:00'), kind: 'OUT' }], plan);
    expect(r.workedMinutes).toBe(450);
    expect(r.flags).toContain('AUTO_BREAK_DEDUCTED');
  });

  it('sortie manquante une fois la journée passée', () => {
    const r = computeDay([{ at: d('06:00'), kind: 'IN' }], plan, undefined, null, d('23:00'));
    expect(r.anomalies).toContain('MISSING_OUT');
    expect(r.workedMinutes).toBe(0);
  });

  it('journée en cours : pas d anomalie, minutes jusqu à maintenant', () => {
    const r = computeDay([{ at: d('06:00'), kind: 'IN' }], plan, undefined, null, d('09:00'));
    expect(r.inProgress).toBe(true);
    expect(r.workedMinutes).toBe(180);
    expect(r.anomalies).toEqual([]);
  });

  it('repos inférieur à 11 h entre deux postes', () => {
    const r = computeDay([{ at: d('06:00'), kind: 'IN' }, { at: d('14:00'), kind: 'OUT' }], plan, undefined, new Date('2026-11-26T22:30:00'));
    expect(r.anomalies).toContain('REST_UNDER_11H');
  });

  it('retard et minutes de nuit', () => {
    const r = computeDay([{ at: d('05:00'), kind: 'IN' }, { at: d('06:30'), kind: 'BREAK_START' }, { at: d('06:45'), kind: 'BREAK_END' }, { at: d('07:00'), kind: 'OUT' }], null);
    expect(r.nightMinutes).toBe(60);
    expect(r.anomalies).toContain('NO_SCHEDULE');
  });

  it('bascule entrée / sortie', () => {
    expect(nextKind(undefined)).toBe('IN');
    expect(nextKind('IN')).toBe('OUT');
    expect(nextKind('OUT')).toBe('IN');
  });

  it('géorepérage', () => {
    expect(Math.round(haversineMeters(50.8467, 4.3525, 50.8467, 4.3539))).toBeGreaterThan(90);
  });
});

describe('Second facteur TOTP (RFC 6238)', () => {
  it('vecteur de test RFC 4226', () => {
    expect(hotp(Buffer.from('12345678901234567890'), 1)).toBe('287082');
  });
  it('vérifie un code courant', () => {
    const secret = base32Encode(Buffer.from('12345678901234567890'));
    const now = Date.now();
    expect(verifyTotp(secret, totp(secret, now), now)).toBe(true);
    expect(verifyTotp(secret, 'abcdef', now)).toBe(false);
  });
});

describe('Chiffrement de champ', () => {
  it('aller-retour AES-256-GCM', () => {
    const enc = encryptField('BE71 0961 2345 6769', 'cle-de-test');
    expect(enc.startsWith('v1.')).toBe(true);
    expect(decryptField(enc, 'cle-de-test')).toBe('BE71 0961 2345 6769');
    expect(() => decryptField(enc, 'mauvaise-cle')).toThrow();
  });
});
