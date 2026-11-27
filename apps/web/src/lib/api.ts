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
  if (DEMO) return demoResponse<T>(path, init);
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

export async function downloadCsv(path: string, filename: string) {
  if (DEMO) throw new ApiError(409, { code: 'CONFLICT', message: 'Export indisponible en démonstration' });
  const res = await fetch(`/api/v1${path}`, { credentials: 'include' });
  if (!res.ok) throw new ApiError(res.status, await res.json().catch(() => null));
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function demoResponse<T>(path: string, init?: RequestInit): T {
  const method = (init?.method ?? 'GET').toUpperCase();
  const p = DEMO_PROFILES[demoProfile()];
  if (path.startsWith('/auth/me')) return p.me as unknown as T;
  if (path.startsWith('/world/snapshot')) return p.world as unknown as T;
  if (path.startsWith('/time/me/today')) return p.today as unknown as T;
  if (path.startsWith('/auth/login')) return { mfaRequired: false } as T;
  if (path.startsWith('/auth/logout')) return undefined as T;
  if (method !== 'GET') throw new ApiError(409, { code: 'CONFLICT', message: 'Action indisponible en démonstration' });
  if (path.startsWith('/approvals/inbox')) return { toDecide: [], mine: [] } as T;
  if (path.startsWith('/auth/sessions') || path.startsWith('/auth/webauthn')) return { items: [] } as T;
  if (path.startsWith('/auth/oidc')) return { enabled: false, issuer: null } as T;
  if (path.startsWith('/organisation/chart')) return { people: [] } as T;
  if (path.startsWith('/access/evacuation')) return { generatedAt: new Date().toISOString(), muster: 'Point de rassemblement du parking nord', zones: [], evacuation: false } as T;
  if (path.startsWith('/people/roles/review')) return { items: [] } as T;
  if (path.startsWith('/time/schedules/week')) return { from: '', items: [] } as T;
  if (path.startsWith('/time/anomalies')) return { items: [] } as T;
  if (path.startsWith('/time/timesheets')) return { items: [] } as T;
  if (path.startsWith('/time/holidays')) return { items: [] } as T;
  const clean = path.split('?')[0] ?? path;
  if (clean.endsWith('/meta')) return { subject: '', label: '', fields: [] } as T;
  if (clean.endsWith('/audit')) return { items: [] } as T;
  const parts = clean.split('/').filter(Boolean);
  if (parts.length === 2) return { items: [], total: 0, page: 1, pageSize: 25 } as T;
  if (parts.length >= 3) return {} as T;
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
