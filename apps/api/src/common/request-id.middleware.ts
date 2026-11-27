/**
 * Propage un identifiant de requête (en-tête entrant sain, sinon généré).
 * MAAYOUD
 */
import { Injectable, type NestMiddleware } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';

const SAFE_ID = /^[A-Za-z0-9_.:-]{8,80}$/;

export type RequestWithId = Request & { requestId: string };

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: RequestWithId, res: Response, next: NextFunction) {
    const incoming = req.header('x-request-id');
    const requestId = incoming && SAFE_ID.test(incoming) ? incoming : randomUUID();
    req.requestId = requestId;
    res.setHeader('x-request-id', requestId);
    next();
  }
}
