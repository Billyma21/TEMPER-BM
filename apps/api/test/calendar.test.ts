/**
 * Semaine, jours ouvrés et rotation des équipes.
 * MAAYOUD
 */
import { describe, expect, it } from 'vitest';
import { isMonday, rotationCode, workingDays } from '../src/time/calendar.js';

describe('Calendrier du temps', () => {
  it('compte les jours ouvrés hors férié', () => {
    expect(workingDays('2027-01-04', '2027-01-08', new Set())).toBe(5);
    expect(workingDays('2027-01-04', '2027-01-08', new Set(['2027-01-04']))).toBe(4);
    expect(workingDays('2027-01-09', '2027-01-10', new Set())).toBe(0);
  });

  it('fait tourner matin, après-midi et nuit', () => {
    expect(isMonday('2027-01-04')).toBe(true);
    expect(rotationCode(0, '2027-01-04')).toBe('APREM');
    expect(rotationCode(1, '2027-01-04')).toBe('NUIT');
    expect(rotationCode(2, '2027-01-04')).toBe('MATIN');
  });
});
