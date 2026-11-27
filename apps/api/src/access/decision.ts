/**
 * Décision de porte, pure : badge, horaire, formation, EPI, règle, anti-passback, capacité.
 * La sortie reste possible dès que le badge est actif, pour ne jamais enfermer quelqu un.
 * MAAYOUD
 */

export type DoorDeny =
  | 'UNKNOWN_BADGE'
  | 'BADGE_INACTIVE'
  | 'OUT_OF_SCHEDULE'
  | 'NO_RIGHT'
  | 'TRAINING_EXPIRED'
  | 'MEDICAL_RESTRICTION'
  | 'ANTI_PASSBACK'
  | 'ZONE_FULL'
  | 'DEVICE_OFFLINE';

export interface DoorWindow {
  days: number[];
  from: string;
  to: string;
}

export interface DoorFacts {
  now: Date;
  direction: 'IN' | 'OUT';
  badge: { status: string; validFrom: Date; validUntil: Date | null; siteId: string } | null;
  deviceSiteId: string;
  holderActive: boolean;
  zoneLevel: 'PUBLIC' | 'STANDARD' | 'RESTRICTED' | 'CRITICAL';
  requiredTrainings: string[];
  requiredPpe: string[];
  trainings: Array<{ type: string; validUntil: Date | null }>;
  wornPpe: string[];
  unfit: boolean;
  /** allow : une règle positive correspond. deny : une règle négative correspond. open : aucune règle d autorisation et la zone n est pas critique. closed : il faut une règle et aucune ne correspond. */
  rule: 'allow' | 'deny' | 'open' | 'closed';
  schedule: DoorWindow[] | null;
  inside: boolean;
  occupancy: number;
  maxOccupancy: number | null;
  antiPassback: boolean;
}

const WEEK: Record<string, number> = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7 };

export function brusselsClock(now: Date): { day: number; hm: string } {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Brussels',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now);
  const weekday = parts.find((part) => part.type === 'weekday')?.value ?? 'Mon';
  const hour = parts.find((part) => part.type === 'hour')?.value ?? '00';
  const minute = parts.find((part) => part.type === 'minute')?.value ?? '00';
  return { day: WEEK[weekday.slice(0, 3)] ?? 1, hm: `${hour}:${minute}` };
}

function inSchedule(now: Date, windows: DoorWindow[]): boolean {
  const clock = brusselsClock(now);
  return windows.some((window) => {
    if (!window.days.includes(clock.day)) return false;
    if (window.from <= window.to) return clock.hm >= window.from && clock.hm <= window.to;
    return clock.hm >= window.from || clock.hm <= window.to;
  });
}

function trainingValid(facts: DoorFacts, type: string): boolean {
  return facts.trainings.some((row) => row.type === type && (row.validUntil === null || row.validUntil > facts.now));
}

export function decideAccess(facts: DoorFacts): { result: 'GRANTED' | 'DENIED'; denyReason: DoorDeny | null } {
  const deny = (denyReason: DoorDeny) => ({ result: 'DENIED' as const, denyReason });
  if (!facts.badge || facts.badge.siteId !== facts.deviceSiteId) return deny('UNKNOWN_BADGE');
  const outside =
    facts.badge.validFrom > facts.now || (facts.badge.validUntil !== null && facts.badge.validUntil < facts.now);
  if (facts.badge.status !== 'ACTIVE' || !facts.holderActive || outside) return deny('BADGE_INACTIVE');
  if (facts.direction === 'OUT') return { result: 'GRANTED', denyReason: null };
  if (facts.unfit) return deny('MEDICAL_RESTRICTION');
  if (facts.schedule && facts.schedule.length > 0 && !inSchedule(facts.now, facts.schedule)) return deny('OUT_OF_SCHEDULE');
  if (facts.requiredTrainings.some((type) => !trainingValid(facts, type))) return deny('TRAINING_EXPIRED');
  const worn = new Set(facts.wornPpe.map((item) => item.trim().toLowerCase()));
  if (facts.requiredPpe.some((item) => !worn.has(item.trim().toLowerCase()))) return deny('NO_RIGHT');
  if (facts.rule === 'deny' || facts.rule === 'closed') return deny('NO_RIGHT');
  if (facts.antiPassback && facts.inside) return deny('ANTI_PASSBACK');
  if (facts.maxOccupancy !== null && facts.occupancy >= facts.maxOccupancy) return deny('ZONE_FULL');
  return { result: 'GRANTED', denyReason: null };
}
