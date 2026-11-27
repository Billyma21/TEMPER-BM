import type { AvatarOutfit, LeadRoom, WorldMachine } from '@temper/shared';

/** Palette pastel du monde (lisible, calme, daltonien-compatible pour les statuts). */
export const WORLD = {
  sky: '#eceef6',
  ground: '#f4f5fa',
  campus: '#e9ebf3',
  road: '#d9dce8',
  roadLine: '#ffffff',
  grass: '#dcefdc',
  tree: '#8fcf8f',
  treeDark: '#6fb87a',
  trunk: '#b08968',
  wall: '#ffffff',
  wallSide: '#eef0f7',
  window: '#c9d3f2',
  roof: '#8f84f3',
  roofLocked: '#b8bccb',
  locked: '#d5d8e3',
  floorRoom: '#f7f7fc',
};

export const OUTFIT_COLORS: Record<AvatarOutfit, { body: string; accent: string }> = {
  chemise: { body: '#5b6ee1', accent: '#2f3a8f' },
  costume: { body: '#2f3150', accent: '#c8a24a' },
  'blouse-blanche': { body: '#fbfbff', accent: '#9aa3c7' },
  'blouse-verte': { body: '#7dd3a7', accent: '#2f7d5a' },
  'combinaison-bleue': { body: '#3b82f6', accent: '#1e3a8a' },
  'gilet-orange': { body: '#f59e42', accent: '#9a4a00' },
  'tablier-boutique': { body: '#e58fb0', accent: '#8a2d55' },
  'gilet-securite': { body: '#e6e85a', accent: '#3c3c3c' },
  visiteur: { body: '#b9bfd0', accent: '#6b7280' },
};

export const SKIN = ['#f2d3b8', '#e0b392', '#c68a62', '#9c6644', '#6e4630'];

export const MACHINE_STATUS: Record<WorldMachine['status'], { color: string; label: string; blink: boolean }> = {
  RUNNING: { color: '#22a06b', label: 'En marche', blink: false },
  IDLE: { color: '#a0a7bd', label: 'À l arrêt', blink: false },
  CLEANING: { color: '#3aa8e8', label: 'Nettoyage', blink: false },
  MAINTENANCE: { color: '#e8a33d', label: 'Maintenance', blink: false },
  BREAKDOWN: { color: '#e5484d', label: 'En panne', blink: true },
  OUT_OF_SERVICE: { color: '#5b5f70', label: 'Hors service', blink: false },
};

/** Pièces du bureau commercial, dans l'ordre du parcours prospect. */
export const LEAD_ROOMS: Array<{ stage: LeadRoom; label: string; color: string }> = [
  { stage: 'TO_CALL', label: 'à appeler', color: '#8f84f3' },
  { stage: 'NO_ANSWER', label: 'pas de réponse', color: '#a0a7bd' },
  { stage: 'FOLLOW_UP', label: 'à relancer', color: '#f59e42' },
  { stage: 'MEETING', label: 'rendez-vous', color: '#3aa8e8' },
  { stage: 'QUALIFIED', label: 'qualifiés', color: '#c8a24a' },
  { stage: 'WON', label: 'signés', color: '#22a06b' },
  { stage: 'ARCHIVED', label: 'archives', color: '#6b7280' },
];

/** Générateur pseudo-aléatoire déterministe : le monde est identique à chaque visite. */
export function seeded(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}
