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

/** Code TOTP à 6 chiffres, ou code de secours à 8 caractères hexadécimaux. */
export const MfaVerifySchema = z.object({
  code: z
    .string()
    .trim()
    .regex(/^(\d{6}|[a-f0-9]{8})$/i, 'Code à 6 chiffres ou code de secours'),
});

export const DecideSchema = z.object({
  decision: z.enum(['APPROVED', 'REJECTED']),
  comment: z.string().trim().max(500).optional(),
});
export type DecideInput = z.infer<typeof DecideSchema>;

/** Réponse d attestation renvoyée par le navigateur lors de l enrôlement d une clé. */
export const WebAuthnRegistrationSchema = z.object({
  id: z.string().min(8).max(1024),
  rawId: z.string().min(8).max(1024),
  type: z.literal('public-key'),
  response: z.object({
    clientDataJSON: z.string().min(8),
    attestationObject: z.string().min(8),
    transports: z.array(z.string()).optional(),
  }),
  clientExtensionResults: z.record(z.string(), z.unknown()).optional(),
  authenticatorAttachment: z.enum(['platform', 'cross-platform']).optional(),
});
export type WebAuthnRegistrationInput = z.infer<typeof WebAuthnRegistrationSchema>;

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

/** Passage devant un lecteur : l UID n est transmis qu à cet instant, jamais stocké. */
export const AccessDecideSchema = z.object({
  badgeUid: z.string().min(4).max(64),
  direction: z.enum(['IN', 'OUT']),
  wornPpe: z.array(z.string().max(80)).max(20).optional(),
});
export type AccessDecideInput = z.infer<typeof AccessDecideSchema>;

export const VisitorArriveSchema = z.object({
  safetyBriefing: z.literal(true),
  hygieneDeclared: z.boolean(),
});
export type VisitorArriveInput = z.infer<typeof VisitorArriveSchema>;

export const RoleGrantSchema = z.object({
  userId: z.uuid(),
  role: z.string().min(2).max(64),
  siteId: z.uuid().optional(),
  validUntil: z.iso.datetime().optional(),
});
export type RoleGrantInput = z.infer<typeof RoleGrantSchema>;

export const EvacuationSchema = z.object({
  active: z.boolean(),
});
export type EvacuationInput = z.infer<typeof EvacuationSchema>;

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const WeekPublishSchema = z.object({
  weekStart: isoDate,
  siteId: z.uuid().optional(),
});
export type WeekPublishInput = z.infer<typeof WeekPublishSchema>;

export const CloseDaySchema = z.object({
  date: isoDate,
  siteId: z.uuid().optional(),
});
export type CloseDayInput = z.infer<typeof CloseDaySchema>;

export const TimeCorrectionAskSchema = z.object({
  employeeId: z.uuid(),
  date: isoDate,
  kind: z.enum(['ADD', 'VOID', 'MOVE']),
  proposedAt: z.iso.datetime().optional(),
  proposedKind: z.enum(['IN', 'OUT', 'BREAK_START', 'BREAK_END']).optional(),
  reason: z.string().trim().min(3).max(500),
  targetTimeEntryId: z.uuid().optional(),
});
export type TimeCorrectionAskInput = z.infer<typeof TimeCorrectionAskSchema>;

export const LeaveAskSchema = z.object({
  leaveTypeId: z.uuid(),
  startDate: isoDate,
  endDate: isoDate,
  comment: z.string().trim().max(300).optional(),
});
export type LeaveAskInput = z.infer<typeof LeaveAskSchema>;

export const AbsenceAskSchema = z.object({
  employeeId: z.uuid().optional(),
  type: z.enum(['SICKNESS', 'WORK_ACCIDENT', 'COMMUTE_ACCIDENT', 'PRIVATE_ACCIDENT', 'UNJUSTIFIED', 'FORCE_MAJEURE', 'OTHER']),
  startDate: isoDate,
  endDate: isoDate.optional(),
  certificateKey: z.string().max(200).optional(),
  incidentId: z.uuid().optional(),
});
export type AbsenceInput = z.infer<typeof AbsenceAskSchema>;

export const SensorReadingSchema = z.object({
  at: z.iso.datetime().optional(),
  temperatureC: z.number().min(-40).max(80),
  humidityPct: z.number().min(0).max(100).optional(),
});
export type SensorReadingInput = z.infer<typeof SensorReadingSchema>;

export const PayrollPeriodSchema = z.object({
  periodStart: isoDate,
  periodEnd: isoDate,
});
export type PayrollPeriodInput = z.infer<typeof PayrollPeriodSchema>;

export const HolidayAskSchema = z.object({
  date: isoDate,
  label: z.string().trim().min(3).max(120),
  isReplacement: z.boolean().optional(),
});
export type HolidayAskInput = z.infer<typeof HolidayAskSchema>;

export const BalanceSettleSchema = z.object({
  year: z.number().int().min(2000).max(2100),
  employeeId: z.uuid().optional(),
});
export type BalanceSettleInput = z.infer<typeof BalanceSettleSchema>;

export const RecipeVersionSchema = z.object({
  notes: z.string().trim().max(500).optional(),
});
export type RecipeVersionInput = z.infer<typeof RecipeVersionSchema>;

export const OrderLaunchSchema = z.object({
  recipeId: z.uuid(),
  lineId: z.uuid(),
  teamId: z.uuid(),
  productId: z.uuid().optional(),
  plannedQtyKg: z.number().positive().max(100_000),
  plannedStart: z.iso.datetime(),
  plannedEnd: z.iso.datetime(),
});
export type OrderLaunchInput = z.infer<typeof OrderLaunchSchema>;

export const OrderStartSchema = z.object({
  changeover: z.boolean().optional(),
});
export type OrderStartInput = z.infer<typeof OrderStartSchema>;

export const ConsumeLotSchema = z.object({
  batchCode: z.string().trim().min(3).max(80),
  quantity: z.number().positive().max(100_000),
});
export type ConsumeLotInput = z.infer<typeof ConsumeLotSchema>;

export const OutputLotSchema = z.object({
  quantityKg: z.number().positive().max(100_000),
  scrapKg: z.number().min(0).max(100_000).optional(),
});
export type OutputLotInput = z.infer<typeof OutputLotSchema>;

export const LineDowntimeSchema = z.object({
  category: z.enum(['BREAKDOWN', 'CHANGEOVER', 'CLEANING', 'MATERIAL_SHORTAGE', 'STAFF_SHORTAGE', 'QUALITY_HOLD', 'MICRO_STOP', 'PLANNED']),
  reason: z.string().trim().max(300).optional(),
});
export type LineDowntimeInput = z.infer<typeof LineDowntimeSchema>;

export const QuestDrawSchema = z.object({
  employeeId: z.uuid(),
});
export type QuestDrawInput = z.infer<typeof QuestDrawSchema>;

export const QuestProgressSchema = z.object({
  event: z.string().trim().min(3).max(60),
});
export type QuestProgressInput = z.infer<typeof QuestProgressSchema>;

export interface KioskScanResult {
  ok: boolean;
  kind?: 'IN' | 'OUT' | 'BREAK_START' | 'BREAK_END';
  message: string;
  employee?: { firstName: string; photoUrl: string | null };
  at?: string;
  warnings: string[];
  duplicate?: boolean;
}
