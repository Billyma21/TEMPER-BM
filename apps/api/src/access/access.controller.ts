/**
 * Portes, accueil et évacuation. Le lecteur seul décide un passage.
 * MAAYOUD
 */
import { Body, Controller, Get, HttpCode, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AccessDecideSchema, EvacuationSchema, VisitorArriveSchema, type AccessDecideInput, type EvacuationInput, type VisitorArriveInput } from '@temper/shared';
import { ZodPipe } from '../common/zod.pipe.js';
import { CurrentPrincipal, DeviceOnly, Requires } from '../permissions/decorators.js';
import type { Principal } from '../permissions/principal.js';
import { AccessDeskService } from './access.service.js';

@ApiTags('access')
@Controller('access')
export class AccessDeskController {
  constructor(private readonly desk: AccessDeskService) {}

  @Post('decide')
  @DeviceOnly()
  @HttpCode(200)
  decide(@CurrentPrincipal() p: Principal, @Body(new ZodPipe(AccessDecideSchema)) body: AccessDecideInput) {
    return this.desk.decide(p, body);
  }

  @Post('badges/:id/loss')
  @Requires('update', 'Badge')
  @HttpCode(200)
  loss(@CurrentPrincipal() p: Principal, @Param('id') id: string) {
    return this.desk.reportLoss(p, id);
  }

  @Post('visitors/:id/arrive')
  @Requires('update', 'Visitor')
  @HttpCode(200)
  arrive(@CurrentPrincipal() p: Principal, @Param('id') id: string, @Body(new ZodPipe(VisitorArriveSchema)) body: VisitorArriveInput) {
    return this.desk.arrive(p, id, body);
  }

  @Post('visitors/:id/leave')
  @Requires('update', 'Visitor')
  @HttpCode(200)
  leave(@CurrentPrincipal() p: Principal, @Param('id') id: string) {
    return this.desk.leave(p, id);
  }

  @Get('evacuation')
  @Requires('read', 'AccessEvent')
  evacuation(@CurrentPrincipal() p: Principal) {
    return this.desk.evacuation(p);
  }

  @Post('evacuation')
  @Requires('update', 'AccessZone')
  @HttpCode(200)
  setEvacuation(@CurrentPrincipal() p: Principal, @Body(new ZodPipe(EvacuationSchema)) body: EvacuationInput) {
    return this.desk.setEvacuation(p, body);
  }
}
