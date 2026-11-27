/**
 * Journal d'audit append-only chaîné : hash(n) = sha256(contenu(n) + hash(n-1)).
 * Un verrou consultatif PostgreSQL sérialise l'écriture pour garantir une chaîne linéaire.
 * Vérification d'intégrité : AuditService.verifyChain() (tâche nocturne + bouton admin).
 * MAAYOUD
 */
import { Injectable } from '@nestjs/common';
import type { Prisma } from '@temper/db';
import { sha256 } from '../common/crypto.js';
import { PrismaService } from '../prisma/prisma.service.js';

export interface AuditEntry {
  actorType: 'USER' | 'DEVICE' | 'SYSTEM' | 'API_KEY';
  actorId?: string | null;
  onBehalfOfId?: string | null;
  action: string;
  subject: string;
  subjectId?: string | null;
  siteId?: string | null;
  before?: unknown;
  after?: unknown;
  ip?: string | null;
  userAgent?: string | null;
  reason?: string | null;
  breakGlass?: boolean;
  requestId?: string | null;
}

const AUDIT_LOCK_KEY = 727274;

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async log(entry: AuditEntry): Promise<void> {
    await this.prisma.db.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(${AUDIT_LOCK_KEY})`;
      const last = await tx.auditLog.findFirst({ orderBy: [{ at: 'desc' }, { id: 'desc' }], select: { hash: true } });
      const at = new Date();
      const prevHash = last?.hash ?? null;
      const hash = sha256(JSON.stringify({ ...entry, at: at.toISOString(), prevHash }));
      await tx.auditLog.create({
        data: {
          at,
          actorType: entry.actorType,
          actorId: entry.actorId ?? null,
          onBehalfOfId: entry.onBehalfOfId ?? null,
          action: entry.action,
          subject: entry.subject,
          subjectId: entry.subjectId ?? null,
          siteId: entry.siteId ?? null,
          before: (entry.before ?? undefined) as Prisma.InputJsonValue | undefined,
          after: (entry.after ?? undefined) as Prisma.InputJsonValue | undefined,
          ip: entry.ip ?? null,
          userAgent: entry.userAgent ?? null,
          reason: entry.reason ?? null,
          breakGlass: entry.breakGlass ?? false,
          requestId: entry.requestId ?? null,
          prevHash,
          hash,
        },
      });
    });
  }

  /** Recalcule la chaîne ; retourne l'identifiant du premier maillon altéré, ou null. */
  async verifyChain(batch = 5000): Promise<string | null> {
    let prev: string | null = null;
    let cursor: string | undefined;
    for (;;) {
      const rows: Awaited<ReturnType<typeof this.prisma.db.auditLog.findMany>> = await this.prisma.db.auditLog.findMany({
        orderBy: [{ at: 'asc' }, { id: 'asc' }],
        take: batch,
        ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      });
      if (!rows.length) return null;
      for (const r of rows) {
        if (r.prevHash !== prev) return r.id;
        prev = r.hash;
      }
      cursor = rows[rows.length - 1]!.id;
    }
  }
}
