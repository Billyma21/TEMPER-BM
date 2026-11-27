/**
 * Moteur de calcul d'une journée de travail (fonctions pures, testées).
 * Règles par défaut alignées sur le droit belge du travail ; paramétrables (Setting "time.rules").
 * Aucun arrondi en défaveur du travailleur : les minutes réelles sont conservées.
 * MAAYOUD
 */

export type ClockKind = 'IN' | 'OUT' | 'BREAK_START' | 'BREAK_END' | 'MISSION_START' | 'MISSION_END';

export interface ClockEvent {
  at: Date;
  kind: ClockKind;
}

export interface PlannedShift {
  start: Date;
  end: Date;
  breakMinutes: number;
}

export interface TimeRules {
  dailyNormalHours: number;
  maxDailyHours: number;
  minRestBetweenShiftsHours: number;
  minBreakAfterHours: number;
  minBreakMinutes: number;
  /** "HH:mm" heure locale */
  nightStart: string;
  nightEnd: string;
}

export const DEFAULT_RULES: TimeRules = {
  dailyNormalHours: 8,
  maxDailyHours: 11,
  minRestBetweenShiftsHours: 11,
  minBreakAfterHours: 6,
  minBreakMinutes: 15,
  nightStart: '20:00',
  nightEnd: '06:00',
};

export interface DayResult {
  firstIn: Date | null;
  lastOut: Date | null;
  workedMinutes: number;
  breakMinutes: number;
  overtimeMinutes: number;
  nightMinutes: number;
  lateMinutes: number;
  earlyLeaveMinutes: number;
  inProgress: boolean;
  anomalies: string[];
  flags: string[];
}

const minutesBetween = (a: Date, b: Date) => Math.max(0, Math.round((b.getTime() - a.getTime()) / 60_000));
const hm = (s: string) => {
  const [h, m] = s.split(':').map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
};

function isNightMinute(d: Date, rules: TimeRules): boolean {
  const t = d.getHours() * 60 + d.getMinutes();
  const start = hm(rules.nightStart);
  const end = hm(rules.nightEnd);
  return start > end ? t >= start || t < end : t >= start && t < end;
}

function nightMinutesIn(from: Date, to: Date, rules: TimeRules): number {
  let n = 0;
  for (let t = from.getTime(); t < to.getTime(); t += 60_000) if (isNightMinute(new Date(t), rules)) n++;
  return n;
}

/**
 * @param events pointages de la journée (ordre quelconque)
 * @param plan poste planifié, ou null
 * @param previousLastOut dernière sortie de la journée précédente (contrôle du repos de 11 h)
 * @param now si fourni et que le poste n'est pas terminé, la journée est "en cours" (pas d'anomalie de sortie manquante)
 */
export function computeDay(
  events: readonly ClockEvent[],
  plan: PlannedShift | null,
  rules: TimeRules = DEFAULT_RULES,
  previousLastOut: Date | null = null,
  now?: Date,
): DayResult {
  const sorted = [...events].sort((a, b) => a.at.getTime() - b.at.getTime());
  const anomalies = new Set<string>();
  const flags = new Set<string>();
  const work: Array<[Date, Date]> = [];
  const breaks: Array<[Date, Date]> = [];

  let state: 'OFF' | 'WORK' | 'BREAK' = 'OFF';
  let since: Date | null = null;
  let firstIn: Date | null = null;
  let lastOut: Date | null = null;

  for (const e of sorted) {
    switch (e.kind) {
      case 'IN':
        if (state !== 'OFF') {
          anomalies.add('DUPLICATE_IN');
          break;
        }
        state = 'WORK';
        since = e.at;
        firstIn ??= e.at;
        break;
      case 'BREAK_START':
        if (state !== 'WORK') {
          anomalies.add('BREAK_WITHOUT_IN');
          break;
        }
        work.push([since!, e.at]);
        state = 'BREAK';
        since = e.at;
        break;
      case 'BREAK_END':
        if (state !== 'BREAK') {
          anomalies.add('BREAK_END_WITHOUT_START');
          break;
        }
        breaks.push([since!, e.at]);
        state = 'WORK';
        since = e.at;
        break;
      case 'OUT':
        if (state === 'OFF') {
          anomalies.add('OUT_WITHOUT_IN');
          break;
        }
        if (state === 'WORK') work.push([since!, e.at]);
        if (state === 'BREAK') {
          breaks.push([since!, e.at]);
          anomalies.add('OUT_DURING_BREAK');
        }
        state = 'OFF';
        since = null;
        lastOut = e.at;
        break;
      case 'MISSION_START':
      case 'MISSION_END':
        flags.add('MISSION');
        break;
    }
  }

  let inProgress = false;
  if (state !== 'OFF' && since) {
    const horizon = plan ? new Date(plan.end.getTime() + 2 * 3_600_000) : new Date((firstIn ?? since).getTime() + 14 * 3_600_000);
    if (now && now < horizon) {
      inProgress = true;
      (state === 'WORK' ? work : breaks).push([since, now]);
    } else {
      anomalies.add('MISSING_OUT');
    }
  }

  let worked = work.reduce((s, [a, b]) => s + minutesBetween(a, b), 0);
  let breakMin = breaks.reduce((s, [a, b]) => s + minutesBetween(a, b), 0);

  if (!inProgress && worked > rules.minBreakAfterHours * 60 && breakMin === 0 && plan && plan.breakMinutes > 0) {
    // Pause non badgée : déduction de la pause planifiée prévue au règlement de travail
    worked -= plan.breakMinutes;
    breakMin = plan.breakMinutes;
    flags.add('AUTO_BREAK_DEDUCTED');
  } else if (!inProgress && worked > rules.minBreakAfterHours * 60 && breakMin < rules.minBreakMinutes) {
    anomalies.add('SHORT_BREAK');
  }

  if (sorted.length && !plan) anomalies.add('NO_SCHEDULE');
  if (worked > rules.maxDailyHours * 60) anomalies.add('OVER_DAILY_LIMIT');
  if (previousLastOut && firstIn && minutesBetween(previousLastOut, firstIn) < rules.minRestBetweenShiftsHours * 60) {
    anomalies.add('REST_UNDER_11H');
  }

  const expected = plan ? Math.max(0, minutesBetween(plan.start, plan.end) - plan.breakMinutes) : rules.dailyNormalHours * 60;
  const overtime = inProgress ? 0 : Math.max(0, worked - expected);
  const night = work.reduce((s, [a, b]) => s + nightMinutesIn(a, b, rules), 0);
  const late = plan && firstIn ? minutesBetween(plan.start, firstIn) : 0;
  const early = plan && lastOut && !inProgress ? minutesBetween(lastOut, plan.end) : 0;

  return {
    firstIn,
    lastOut,
    workedMinutes: worked,
    breakMinutes: breakMin,
    overtimeMinutes: overtime,
    nightMinutes: night,
    lateMinutes: late,
    earlyLeaveMinutes: early,
    inProgress,
    anomalies: [...anomalies],
    flags: [...flags],
  };
}

/** Distance en mètres (géorepérage du pointage mobile). */
export function haversineMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6_371_000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

/** Prochain type de pointage quand la borne ne le précise pas. */
export function nextKind(last: ClockKind | null | undefined): 'IN' | 'OUT' {
  return last === 'IN' || last === 'BREAK_END' || last === 'MISSION_START' || last === 'MISSION_END' ? 'OUT' : 'IN';
}
