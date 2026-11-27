/**
 * Contrats du socle qui ne dépendent pas de PostgreSQL.
 * MAAYOUD
 */
import { SUBJECT_NAMES, SUBJECTS } from '@temper/permissions';
import { describe, expect, it } from 'vitest';
import { message, negotiate } from '../src/common/i18n.js';
import { CRUD_SUBJECTS, RESOURCE_META } from '../src/crud/resource-meta.js';
import { pluralKebab, resourcePath } from '../src/crud/routes.js';

const VIRTUAL = new Set(['World', 'WorldPresence']);

describe('Messages d erreur', () => {
  it('négocie fr, nl puis en', () => {
    expect(negotiate(undefined)).toBe('fr');
    expect(negotiate('fr-BE,fr;q=0.9,en;q=0.8')).toBe('fr');
    expect(negotiate('nl-BE,nl;q=0.8')).toBe('nl');
    expect(negotiate('en-GB,en;q=0.9')).toBe('en');
  });

  it('traduit le refus', () => {
    expect(message('FORBIDDEN', 'fr')).toBe('Accès refusé');
    expect(message('FORBIDDEN', 'nl')).toBe('Toegang geweigerd');
    expect(message('FORBIDDEN', 'en')).toBe('Access denied');
    expect(message('INCONNU', 'fr')).toBe('Erreur interne');
  });
});

describe('Descripteur des ressources', () => {
  it('couvre chaque ressource tabulée et seulement celles-là', () => {
    expect(CRUD_SUBJECTS).toHaveLength(SUBJECT_NAMES.length - VIRTUAL.size);
    for (const name of VIRTUAL) expect(RESOURCE_META[name]).toBeUndefined();
    for (const name of CRUD_SUBJECTS) {
      expect(RESOURCE_META[name]?.subject).toBe(name);
      expect(RESOURCE_META[name]?.module).toBe(SUBJECTS[name].module);
      expect(RESOURCE_META[name]?.fields.some((field) => field.name === 'id')).toBe(true);
    }
  });

  it('retrouve les colonnes de portée utilisées par les droits', () => {
    for (const name of CRUD_SUBJECTS) {
      const fields = new Set(RESOURCE_META[name]?.fields.map((field) => field.name));
      const ownership = SUBJECTS[name].ownership as {
        own?: { field: string };
        team?: string;
        department?: string;
        site?: string;
      };
      if (ownership.own) expect(fields.has(ownership.own.field), `${name}.${ownership.own.field}`).toBe(true);
      if (ownership.team) expect(fields.has(ownership.team), `${name}.${ownership.team}`).toBe(true);
      if (ownership.department) expect(fields.has(ownership.department), `${name}.${ownership.department}`).toBe(true);
      if (ownership.site) expect(fields.has(ownership.site), `${name}.${ownership.site}`).toBe(true);
    }
  });

  it('construit des chemins stables', () => {
    expect(pluralKebab('Company')).toBe('companies');
    expect(pluralKebab('TimeEntry')).toBe('time-entries');
    expect(pluralKebab('LabAnalysis')).toBe('lab-analyses');
    expect(pluralKebab('Batch')).toBe('batches');
    expect(resourcePath('EmployeePayroll')).toBe('rh/employee-payrolls');
  });
});
