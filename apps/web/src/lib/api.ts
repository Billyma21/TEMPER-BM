/**
 * Client HTTP. Mode démo (NEXT_PUBLIC_DEMO=1) : réponses réelles enregistrées depuis l'API,
 * pour prévisualiser l'interface et le monde 3D sans base de données.
 * MAAYOUD
 */
import type { RawRule } from '@temper/permissions';
import type { WorldSnapshot } from '@temper/shared';
import meEmma from './demo/me-emma.json';
import meMarc from './demo/me-marc.json';
import meNoa from './demo/me-noa.json';
import todayEmma from './demo/today-emma.json';
import todayMarc from './demo/today-marc.json';
import todayNoa from './demo/today-noa.json';
import worldEmma from './demo/world-emma.json';
import worldMarc from './demo/world-marc.json';
import worldNoa from './demo/world-noa.json';

export const DEMO = process.env.NEXT_PUBLIC_DEMO === '1';
export const DEMO_PROFILES = {
  noa: { label: 'Noa, commerciale', me: meNoa, world: worldNoa, today: todayNoa },
  emma: { label: 'Emma, opératrice de ligne', me: meEmma, world: worldEmma, today: todayEmma },
  marc: { label: 'Marc, directeur d usine', me: meMarc, world: worldMarc, today: todayMarc },
} as const;
export type DemoProfile = keyof typeof DEMO_PROFILES;

export function demoProfile(): DemoProfile {
  if (typeof window === 'undefined') return 'noa';
  const p = (localStorage.getItem('temper.demo.profile') ?? 'noa') as DemoProfile;
  return p in DEMO_PROFILES ? p : 'noa';
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public body: { code?: string; message?: string } | null,
  ) {
    super(body?.message ?? body?.code ?? `HTTP ${status}`);
  }
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  if (DEMO) return demoResponse<T>(path);
  const res = await fetch(`/api/v1${path}`, {
    ...init,
    credentials: 'include',
    headers: { 'content-type': 'application/json', ...(init?.headers ?? {}) },
  });
  if (res.status === 204) return undefined as T;
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(res.status, body);
  return body as T;
}

function demoResponse<T>(path: string): T {
  const p = DEMO_PROFILES[demoProfile()];
  if (path.startsWith('/auth/me')) return p.me as unknown as T;
  if (path.startsWith('/world/snapshot')) return p.world as unknown as T;
  if (path.startsWith('/time/me/today')) return p.today as unknown as T;
  if (path.startsWith('/auth/login')) return { mfaRequired: false } as T;
  return null as T;
}

export interface MeResponse {
  user: {
    id: string;
    email: string;
    locale: string;
    mfaEnabled: boolean;
    employee: { id: string; firstName: string; lastName: string; preferredName: string | null; jobTitle: string | null; photoUrl: string | null; xp: number; level: number } | null;
  };
  activeRoles: string[];
  mfaPending: boolean;
  rules: RawRule[];
  modules: Array<{ key: string; label: string; short: string; description: string; icon: string; route: string; worldZone: string; order: number }>;
  selfService: string[];
  openWorldZones: string[];
}

export interface TodayResponse {
  schedule: { plannedStart: string; plannedEnd: string } | null;
  entries: Array<{ id: string; at: string; kind: string; source: string }>;
  day: { workedMinutes: number; breakMinutes: number; inProgress: boolean; anomalies: string[]; lateMinutes: number };
  nextAction: 'IN' | 'OUT';
}

export type { WorldSnapshot };
