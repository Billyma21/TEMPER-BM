/**
 * Accès base de données TEMPER (Prisma 7, adaptateur PostgreSQL natif).
 * MAAYOUD
 */
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from './generated/prisma/client';

export * from './generated/prisma/client';

export interface CreateClientOptions {
  url?: string;
  /** Journalise les requêtes lentes (ms). 0 = désactivé. */
  slowQueryMs?: number;
}

export function createPrismaClient(opts: CreateClientOptions = {}) {
  const url = opts.url ?? process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL est requis');
  const adapter = new PrismaPg({ connectionString: url });
  return new PrismaClient({
    adapter,
    log: [
      { emit: 'event', level: 'query' },
      { emit: 'stdout', level: 'warn' },
      { emit: 'stdout', level: 'error' },
    ],
  });
}

export type Db = ReturnType<typeof createPrismaClient>;
