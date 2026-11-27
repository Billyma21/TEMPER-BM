/**
 * Boîte de validation et décision d étape.
 * MAAYOUD
 */
import { Body, Controller, Get, HttpCode, Param, Post, Req } from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { DecideSchema, type DecideInput } from '@temper/shared';
import type { Request } from 'express';
import { ZodPipe } from '../common/zod.pipe.js';
import { CurrentPrincipal } from '../permissions/decorators.js';
import type { Principal } from '../permissions/principal.js';
import { ApprovalsService } from './approvals.service.js';

@ApiTags('validations')
@ApiCookieAuth('temper_session')
@Controller('approvals')
export class ApprovalsController {
  constructor(private readonly approvals: ApprovalsService) {}

  @Get('inbox')
  inbox(@CurrentPrincipal() p: Principal) {
    return this.approvals.inbox(p);
  }

  @Post(':id/decide')
  @HttpCode(200)
  decide(
    @CurrentPrincipal() p: Principal,
    @Param('id') id: string,
    @Body(new ZodPipe(DecideSchema)) body: DecideInput,
    @Req() req: Request & { requestId?: string },
  ) {
    return this.approvals.decide(p, id, body, req.requestId);
  }
}
