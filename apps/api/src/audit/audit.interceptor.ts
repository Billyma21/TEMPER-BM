/**
 * Journalise automatiquement toute écriture (POST, PUT, PATCH, DELETE) réussie ou refusée.
 * Les services ajoutent en plus un audit métier détaillé (avant / après) pour les objets sensibles.
 * MAAYOUD
 */
import { type CallHandler, type ExecutionContext, Injectable, type NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { randomUUID } from 'node:crypto';
import { type Observable, tap } from 'rxjs';
import type { AuthedRequest } from '../auth/access.guard.js';
import { REQUIRES } from '../permissions/decorators.js';
import { AuditService } from './audit.service.js';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private readonly audit: AuditService,
    private readonly reflector: Reflector,
  ) {}

  intercept(ctx: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = ctx.switchToHttp().getRequest<AuthedRequest>();
    if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') return next.handle();
    const requestId = (req as AuthedRequest & { requestId?: string }).requestId ?? (req.headers['x-request-id'] as string | undefined) ?? randomUUID();
    const meta = this.reflector.getAllAndOverride<{ action: string; subject: string } | undefined>(REQUIRES, [ctx.getHandler(), ctx.getClass()]);
    const write = (outcome: string) => {
      const p = req.principal;
      void this.audit
        .log({
          actorType: p?.kind ?? 'SYSTEM',
          actorId: p?.id ?? null,
          action: `${meta?.action ?? req.method}:${outcome}`,
          subject: meta?.subject ?? (req.route?.path as string | undefined) ?? req.path,
          subjectId: (req.params?.['id'] as string | undefined) ?? null,
          ip: req.ip ?? null,
          userAgent: req.headers['user-agent'] ?? null,
          breakGlass: !!p?.activeRoles.includes('SUPER_ADMIN'),
          requestId,
        })
        .catch(() => undefined);
    };
    return next.handle().pipe(
      tap({
        next: () => write('OK'),
        error: (e: { status?: number }) => write(`ERR_${e?.status ?? 500}`),
      }),
    );
  }
}
