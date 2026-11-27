/**
 * Normalise la query string des listes : pagination, tri, recherche, filtres d égalité.
 * MAAYOUD
 */
import { BadRequestException } from '@nestjs/common';
import { ListQuerySchema, type ListQuery } from '@temper/shared';

export interface NormalizedQuery extends ListQuery {
  filters: Record<string, string>;
}

const RESERVED = new Set(['page', 'pageSize', 'sort', 'dir', 'q']);

function one(value: unknown): string | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  if (typeof raw !== 'string') return undefined;
  const trimmed = raw.trim();
  return trimmed.length ? trimmed : undefined;
}

export function normalizeQuery(query: Record<string, unknown>): NormalizedQuery {
  const raw: Record<string, string> = {};
  for (const key of ['page', 'pageSize', 'sort', 'dir', 'q'] as const) {
    const value = one(query[key]);
    if (value !== undefined) raw[key] = value;
  }
  const parsed = ListQuerySchema.safeParse(raw);
  if (!parsed.success) {
    throw new BadRequestException({
      code: 'VALIDATION_ERROR',
      issues: parsed.error.issues.map((issue) => ({ path: issue.path.join('.'), message: issue.message })),
    });
  }
  const filters: Record<string, string> = {};
  for (const [key, value] of Object.entries(query)) {
    if (RESERVED.has(key)) continue;
    const scalar = one(value);
    if (scalar === undefined) continue;
    if (!/^[A-Za-z][A-Za-z0-9_]{0,63}$/.test(key)) {
      throw new BadRequestException({ code: 'BAD_FILTER', field: key });
    }
    filters[key] = scalar;
  }
  return { ...parsed.data, q: parsed.data.q?.trim() || undefined, filters };
}
