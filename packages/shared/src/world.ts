/**
 * Instantané du monde 3D, filtré par les droits de l'utilisateur côté API.
 * Le client ne reçoit jamais une donnée qu'il n'a pas le droit de voir :
 * le monde est une autre vue des mêmes données, pas une porte dérobée.
 *
 * MAAYOUD
 */

export type AvatarOutfit =
  | 'chemise'
  | 'costume'
  | 'blouse-blanche'
  | 'blouse-verte'
  | 'combinaison-bleue'
  | 'gilet-orange'
  | 'tablier-boutique'
  | 'gilet-securite'
  | 'visiteur';

export interface WorldBuilding {
  id: string;
  code: string;
  name: string;
  kind: string;
  x: number;
  z: number;
  width: number;
  depth: number;
  floors: number;
  color: string | null;
  /** Zone du monde (cf. MODULES.worldZone) : la porte est verrouillée si la zone n'est pas ouverte */
  zone: string;
  locked: boolean;
  /** Nombre de personnes présentes (toujours visible, agrégé) */
  occupancy: number;
  route: string | null;
}

export interface WorldMachine {
  id: string;
  code: string;
  name: string;
  type: string;
  status: 'RUNNING' | 'IDLE' | 'BREAKDOWN' | 'MAINTENANCE' | 'CLEANING' | 'OUT_OF_SERVICE';
  lineCode: string | null;
  x: number;
  z: number;
}

export interface WorldAvatar {
  id: string;
  /** null = silhouette anonyme (pas le droit de voir la présence nominative) */
  name: string | null;
  outfit: AvatarOutfit;
  buildingCode: string;
  isMe: boolean;
  level?: number;
}

export type LeadRoom = 'TO_CALL' | 'NO_ANSWER' | 'FOLLOW_UP' | 'MEETING' | 'QUALIFIED' | 'WON' | 'ARCHIVED';

export interface WorldLead {
  id: string;
  company: string;
  stage: LeadRoom;
  score: number;
  mine: boolean;
}

export interface WorldCityLot {
  customerId: string;
  name: string;
  segment: string;
  x: number;
  z: number;
  style: string | null;
  /** Commande la plus avancée en cours : le bâtiment monte avec la progression */
  orderNumber: string | null;
  progress: number;
  status: string | null;
  delivered: boolean;
}

export interface WorldQuest {
  id: string;
  title: string;
  progress: number;
  target: number;
  status: 'ACTIVE' | 'COMPLETED' | 'EXPIRED';
  xp: number;
}

export interface WorldAlert {
  id: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  label: string;
  buildingCode: string | null;
  route: string | null;
}

export interface WorldSnapshot {
  generatedAt: string;
  site: { id: string; name: string; code: string };
  me: {
    firstName: string;
    level: number;
    xp: number;
    xpToNext: number;
    outfit: AvatarOutfit;
    streakDays: number;
  } | null;
  openZones: string[];
  buildings: WorldBuilding[];
  machines: WorldMachine[];
  avatars: WorldAvatar[];
  /** null = pas d'accès au module ventes */
  leads: WorldLead[] | null;
  city: WorldCityLot[] | null;
  quests: WorldQuest[];
  alerts: WorldAlert[];
  kpis: Array<{ label: string; value: string; trend?: 'up' | 'down' | 'flat' }>;
  /** Visiteurs présents au poste de garde, et état d évacuation du site. Jamais de noms ici. */
  gate?: { visitorsOnSite: number; evacuation: boolean };
}

export const REALTIME_EVENTS = {
  presenceChanged: 'presence.changed',
  machineStatus: 'machine.status',
  orderProgress: 'order.progress',
  questProgress: 'quest.progress',
  alertRaised: 'alert.raised',
  leadMoved: 'lead.moved',
} as const;
