/**
 * Contrats d'échange partagés API / web / bornes (validation zod des deux côtés).
 * MAAYOUD
 */
import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.email().transform((v) => v.trim().toLowerCase()),
  password: z.string().min(1).max(256),
});
export type LoginInput = z.infer<typeof LoginSchema>;

export const MfaVerifySchema = z.object({
  code: z.string().regex(/^\d{6}$/, 'Code à 6 chiffres'),
});

/** Scan à la borne : badge NFC, ou matricule + PIN en secours. */
export const KioskScanSchema = z
  .object({
    badgeUid: z.string().min(4).max(64).optional(),
    employeeNumber: z.string().max(16).optional(),
    pin: z.string().regex(/^\d{4,6}$/).optional(),
    /** Identifiant généré par la borne (UUID) : rend la synchronisation hors ligne idempotente */
    clientEventId: z.uuid(),
    /** Heure de l'événement côté borne (hors ligne), sinon heure serveur */
    at: z.iso.datetime().optional(),
    /** Forcer un type (pause, mission) ; sinon bascule entrée / sortie automatique */
    kind: z.enum(['IN', 'OUT', 'BREAK_START', 'BREAK_END']).optional(),
  })
  .refine((v) => !!v.badgeUid || (!!v.employeeNumber && !!v.pin), {
    message: 'Badge ou matricule et PIN requis',
  });
export type KioskScanInput = z.infer<typeof KioskScanSchema>;

/** Paramètres de liste du gabarit CRUD (pagination, tri, recherche). Les filtres d égalité sont libres. */
export const ListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).max(10_000).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
  sort: z.string().min(1).max(64).optional(),
  dir: z.enum(['asc', 'desc']).default('desc'),
  q: z.string().max(80).optional(),
});
export type ListQuery = z.infer<typeof ListQuerySchema>;

export const SelfClockSchema = z.object({
  clientEventId: z.uuid(),
  kind: z.enum(['IN', 'OUT', 'BREAK_START', 'BREAK_END']).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  accuracyM: z.number().int().nonnegative().optional(),
});
export type SelfClockInput = z.infer<typeof SelfClockSchema>;

export interface KioskScanResult {
  ok: boolean;
  kind?: 'IN' | 'OUT' | 'BREAK_START' | 'BREAK_END';
  message: string;
  employee?: { firstName: string; photoUrl: string | null };
  at?: string;
  warnings: string[];
  duplicate?: boolean;
}
