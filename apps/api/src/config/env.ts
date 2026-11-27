/**
 * Configuration validée au démarrage : l'API refuse de démarrer avec une configuration invalide.
 * MAAYOUD
 */
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { z } from 'zod';

for (const candidate of [resolve(process.cwd(), '.env'), resolve(process.cwd(), '../../.env')]) {
  if (existsSync(candidate)) {
    process.loadEnvFile(candidate);
    break;
  }
}

const EnvSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    DATABASE_URL: z.string().min(1),
    REDIS_URL: z.string().default('redis://localhost:6379'),
    API_PORT: z.coerce.number().int().default(4000),
    WEB_PUBLIC_URL: z.string().default('http://localhost:3000'),
    SESSION_SECRET: z.string().min(8),
    FIELD_ENCRYPTION_KEY: z.string().min(8),
    BADGE_UID_PEPPER: z.string().min(8),
    /** Développement uniquement : considère le second facteur comme validé */
    AUTH_DEV_MFA_BYPASS: z.stringbool().default(false),
    SESSION_COOKIE: z.string().default('temper_session'),
  })
  .refine((e) => !(e.NODE_ENV === 'production' && e.AUTH_DEV_MFA_BYPASS), {
    message: 'AUTH_DEV_MFA_BYPASS est interdit en production',
  })
  .refine((e) => e.NODE_ENV !== 'production' || e.SESSION_SECRET.length >= 64, {
    message: 'SESSION_SECRET doit faire au moins 64 caractères en production',
  });

export type Env = z.infer<typeof EnvSchema>;

let cached: Env | undefined;
export function env(): Env {
  cached ??= EnvSchema.parse(process.env);
  return cached;
}
