/**
 * Routes du compte : sessions, TOTP, clés de sécurité.
 * MAAYOUD
 */
import { Body, Controller, Delete, Get, HttpCode, Param, Post } from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { MfaVerifySchema, WebAuthnRegistrationSchema, type WebAuthnRegistrationInput } from '@temper/shared';
import { ZodPipe } from '../common/zod.pipe.js';
import { CurrentPrincipal } from '../permissions/decorators.js';
import type { Principal } from '../permissions/principal.js';
import { AccountService } from './account.service.js';

@ApiTags('auth')
@ApiCookieAuth('temper_session')
@Controller('auth')
export class AccountController {
  constructor(private readonly account: AccountService) {}

  @Get('sessions')
  sessions(@CurrentPrincipal() p: Principal) {
    return this.account.sessions(p);
  }

  @Post('sessions/:id/revoke')
  @HttpCode(200)
  revoke(@CurrentPrincipal() p: Principal, @Param('id') id: string) {
    return this.account.revoke(p, id);
  }

  @Post('mfa/enroll')
  enroll(@CurrentPrincipal() p: Principal) {
    return this.account.enroll(p);
  }

  @Post('mfa/confirm')
  @HttpCode(200)
  confirm(@CurrentPrincipal() p: Principal, @Body(new ZodPipe(MfaVerifySchema)) body: { code: string }) {
    return this.account.confirm(p, body.code);
  }

  @Get('webauthn')
  keys(@CurrentPrincipal() p: Principal) {
    return this.account.listKeys(p);
  }

  @Post('webauthn/register/options')
  options(@CurrentPrincipal() p: Principal) {
    return this.account.registrationOptions(p);
  }

  @Post('webauthn/register/verify')
  @HttpCode(200)
  verify(@CurrentPrincipal() p: Principal, @Body(new ZodPipe(WebAuthnRegistrationSchema)) body: WebAuthnRegistrationInput) {
    return this.account.registrationVerify(p, body);
  }

  @Delete('webauthn/:id')
  remove(@CurrentPrincipal() p: Principal, @Param('id') id: string) {
    return this.account.revokeKey(p, id);
  }
}
