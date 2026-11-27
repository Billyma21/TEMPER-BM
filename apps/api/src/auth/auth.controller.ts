import { Body, Controller, Get, HttpCode, Param, Post, Req, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { LoginSchema, MfaVerifySchema, type LoginInput } from '@temper/shared';
import type { Request, Response } from 'express';
import { randomToken, sha256 } from '../common/crypto.js';
import { ZodPipe } from '../common/zod.pipe.js';
import { env } from '../config/env.js';
import { CurrentPrincipal, Public, Requires } from '../permissions/decorators.js';
import type { Principal } from '../permissions/principal.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuthService } from './auth.service.js';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('login')
  @HttpCode(200)
  async login(@Body(new ZodPipe(LoginSchema)) body: LoginInput, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const result = await this.auth.login(body, req.ip, req.headers['user-agent']);
    res.cookie(env().SESSION_COOKIE, result.token, {
      httpOnly: true,
      secure: env().NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: result.expiresAt,
    });
    return { mfaRequired: result.mfaRequired, expiresAt: result.expiresAt };
  }

  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('mfa/verify')
  @HttpCode(200)
  verify(@CurrentPrincipal() p: Principal, @Body(new ZodPipe(MfaVerifySchema)) body: { code: string }) {
    return this.auth.verifyMfa(p, body.code);
  }

  @Post('logout')
  @HttpCode(204)
  async logout(@CurrentPrincipal() p: Principal, @Res({ passthrough: true }) res: Response) {
    await this.auth.logout(p);
    res.clearCookie(env().SESSION_COOKIE, { path: '/' });
  }

  @Get('me')
  me(@CurrentPrincipal() p: Principal) {
    return this.auth.me(p);
  }

  @Public()
  @Get('oidc')
  oidc() {
    const issuer = process.env.OIDC_ISSUER?.trim() || null;
    return { enabled: Boolean(issuer), issuer };
  }
}

/** Provisionnement des appareils : le secret n'est affiché qu'une seule fois. */
@ApiTags('auth')
@Controller('devices')
export class DevicesController {
  constructor(private readonly prisma: PrismaService) {}

  @Requires('manage', 'Device')
  @Post(':id/secret')
  async rotateSecret(@Param('id') id: string) {
    const secret = randomToken(32);
    await this.prisma.db.device.update({ where: { id }, data: { secretHash: sha256(secret), status: 'ACTIVE' } });
    return { credential: `${id}.${secret}`, notice: 'À saisir dans la borne. Ce secret ne sera plus jamais affiché.' };
  }
}
