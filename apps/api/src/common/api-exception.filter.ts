/**
 * Toute erreur sort sous la forme { code, message, details, requestId }.
 * Le message suit Accept-Language. Le détail technique Prisma n est pas renvoyé.
 * MAAYOUD
 */
import { type ArgumentsHost, Catch, type ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import type { Request, Response } from 'express';
import { message, negotiate } from './i18n.js';

function requestIdOf(req: Request): string {
  const fromReq = (req as Request & { requestId?: string }).requestId;
  if (fromReq) return fromReq;
  const header = req.headers['x-request-id'];
  return typeof header === 'string' ? header : 'inconnu';
}

function prismaInfo(exception: unknown): { code: string; target?: unknown } | null {
  if (typeof exception !== 'object' || exception === null) return null;
  const named = exception as { name?: string; code?: unknown; clientVersion?: unknown; meta?: { target?: unknown } };
  if (named.name === 'PrismaClientValidationError') return { code: 'VALIDATION' };
  if (typeof named.code !== 'string' || !named.clientVersion) return null;
  return { code: named.code, target: named.meta?.target };
}

function httpParts(exception: HttpException): { code: string; details: unknown } {
  const status = exception.getStatus();
  const body = exception.getResponse();
  const fallback =
    status === 401 ? 'UNAUTHENTICATED' : status === 403 ? 'FORBIDDEN' : status === 404 ? 'NOT_FOUND' : status === 409 ? 'CONFLICT' : status === 429 ? 'RATE_LIMITED' : status === 400 ? 'VALIDATION_ERROR' : 'INTERNAL';
  if (typeof body === 'string') return { code: fallback, details: null };
  const record = body as Record<string, unknown>;
  const code = typeof record.code === 'string' ? record.code : fallback;
  const details: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(record)) {
    if (key === 'code' || key === 'message' || key === 'statusCode' || key === 'error') continue;
    details[key] = value;
  }
  return { code, details: Object.keys(details).length ? details : null };
}

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  private readonly log = new Logger(ApiExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const http = host.switchToHttp();
    const res = http.getResponse<Response>();
    const req = http.getRequest<Request>();
    if (res.headersSent) return;

    const lang = negotiate(typeof req.headers['accept-language'] === 'string' ? req.headers['accept-language'] : undefined);
    let status: number = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'INTERNAL';
    let details: unknown = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const parts = httpParts(exception);
      code = parts.code;
      details = parts.details;
    } else {
      const prisma = prismaInfo(exception);
      if (prisma?.code === 'P2002') {
        status = HttpStatus.CONFLICT;
        code = 'CONFLICT';
        details = { target: prisma.target ?? null };
      } else if (prisma?.code === 'P2025') {
        status = HttpStatus.NOT_FOUND;
        code = 'NOT_FOUND';
      } else if (prisma) {
        status = HttpStatus.BAD_REQUEST;
        code = 'VALIDATION_ERROR';
        details = { target: prisma.target ?? null };
      } else {
        this.log.error(exception instanceof Error ? exception.stack : exception);
      }
    }

    if (status >= 500 && exception instanceof HttpException) this.log.error(exception);

    const requestId = requestIdOf(req);
    res.setHeader('x-request-id', requestId);
    res.status(status).json({ code, message: message(code, lang), details, requestId });
  }
}
