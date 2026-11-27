/**
 * Garde globale : authentifie (session utilisateur ou appareil) puis contrôle le droit minimal de la route.
 * Toute route est protégée par défaut ; @Public() est l'exception explicite.
 * MAAYOUD
 */
import { type CanActivate, type ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { subjectDef, type Action, type SubjectName } from '@temper/permissions';
import type { Request } from 'express';
import { env } from '../config/env.js';
import { DEVICE_ONLY, IS_PUBLIC, REQUIRES } from '../permissions/decorators.js';
import type { Principal } from '../permissions/principal.js';
import { AuthService } from './auth.service.js';

export type AuthedRequest = Request & { principal?: Principal };

@Injectable()
export class AccessGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly auth: AuthService,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const targets = [ctx.getHandler(), ctx.getClass()];
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC, targets);
    const req = ctx.switchToHttp().getRequest<AuthedRequest>();

    const authz = req.headers.authorization;
    if (authz?.startsWith('Device ')) {
      req.principal = (await this.auth.authenticateDevice(authz.slice(7))) ?? undefined;
    } else {
      const cookies = (req as Request & { cookies?: Record<string, string> }).cookies;
      const token = cookies?.[env().SESSION_COOKIE] ?? (authz?.startsWith('Bearer ') ? authz.slice(7) : undefined);
      if (token) req.principal = (await this.auth.authenticateSession(token)) ?? undefined;
    }

    if (isPublic) return true;
    const p = req.principal;
    if (!p) throw new UnauthorizedException({ code: 'UNAUTHENTICATED' });

    const deviceOnly = this.reflector.getAllAndOverride<boolean>(DEVICE_ONLY, targets);
    if (deviceOnly && p.kind !== 'DEVICE') throw new ForbiddenException({ code: 'DEVICE_ONLY' });
    if (!deviceOnly && p.kind === 'DEVICE') throw new ForbiddenException({ code: 'USER_ONLY' });

    const req2 = this.reflector.getAllAndOverride<{ action: Action; subject: SubjectName } | undefined>(REQUIRES, targets);
    if (req2) {
      const forbidden = subjectDef(req2.subject).forbidden ?? [];
      if (forbidden.includes(req2.action)) {
        throw new ForbiddenException({ code: 'IMMUTABLE', action: req2.action, subject: req2.subject });
      }
      if (!p.ability.can(req2.action, req2.subject)) {
        throw new ForbiddenException({ code: p.mfaPending ? 'MFA_REQUIRED' : 'FORBIDDEN', action: req2.action, subject: req2.subject });
      }
    }
    return true;
  }
}
