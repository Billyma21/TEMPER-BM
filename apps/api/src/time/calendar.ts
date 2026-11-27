/**
 * Calendrier belge du temps de travail : lundi, jours ouvrés, rotation 3x8.
 * Les dates de planning sont des jours civils, minuit universel, comme en base.
 * MAAYOUD
 */

const PATTERNS = ['MATIN', 'APREM', 'NUIT'] as const;
export type RotationCode = (typeof PATTERNS)[number];

export function utcDay(isoDate: string): Date {
  return new Date(`${isoDate}T00:00:00.000Z`);
}

export function isMonday(isoDate: string): boolean {
  return utcDay(isoDate).getUTCDay() === 1;
}

export function addDays(isoDate: string, days: number): string {
  const date = utcDay(isoDate);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/** Numéro de semaine ISO, utilisé pour faire tourner les équipes. */
export function isoWeek(isoDate: string): number {
  const date = utcDay(isoDate);
  const day = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil(((date.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
}

/** Équipe 0, 1, 2 : matin, après-midi, nuit, décalées chaque semaine. */
export function rotationCode(teamSlot: number, isoDate: string): RotationCode {
  return PATTERNS[(teamSlot + isoWeek(isoDate)) % PATTERNS.length]!;
}

/** Jours ouvrés du lundi au vendredi, hors fériés. Les bornes sont inclusives. */
export function workingDays(startIso: string, endIso: string, holidays: ReadonlySet<string>): number {
  let count = 0;
  for (let iso = startIso; iso <= endIso; iso = addDays(iso, 1)) {
    const day = utcDay(iso).getUTCDay();
    if (day === 0 || day === 6) continue;
    if (holidays.has(iso)) continue;
    count += 1;
  }
  return count;
}

/** Heure civile de Bruxelles pour un jour et un horaire "HH:mm". */
export function brusselsInstant(isoDate: string, hm: string): Date {
  const [year, month, day] = isoDate.split('-').map(Number);
  const [hour, minute] = hm.split(':').map(Number);
  const guess = new Date(Date.UTC(year!, (month ?? 1) - 1, day, (hour ?? 0) - 1, minute ?? 0));
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Brussels',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(guess);
  const gotH = Number(parts.find((part) => part.type === 'hour')?.value ?? '0');
  const gotM = Number(parts.find((part) => part.type === 'minute')?.value ?? '0');
  const delta = (hour ?? 0) * 60 + (minute ?? 0) - (gotH * 60 + gotM);
  return new Date(guess.getTime() + delta * 60_000);
}

export function brusselsBounds(isoDate: string): { start: Date; end: Date } {
  return { start: brusselsInstant(isoDate, '00:00'), end: brusselsInstant(addDays(isoDate, 1), '00:00') };
}
