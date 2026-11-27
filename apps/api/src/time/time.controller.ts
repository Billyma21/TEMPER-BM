import { Body, Controller, Get, HttpCode, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { KioskScanSchema, SelfClockSchema, type KioskScanInput, type SelfClockInput } from '@temper/shared';
import { ZodPipe } from '../common/zod.pipe.js';
import { CurrentPrincipal, DeviceOnly, Requires } from '../permissions/decorators.js';
import type { Principal } from '../permissions/principal.js';
import { TimeService } from './time.service.js';

@ApiTags('temps')
@Controller('time')
export class TimeController {
  constructor(private readonly time: TimeService) {}

  /** Borne de pointage : badge NFC ou matricule + PIN */
  @DeviceOnly()
  @Requires('execute', 'TimeEntry')
  @Post('kiosk/scan')
  @HttpCode(200)
  scan(@CurrentPrincipal() device: Principal, @Body(new ZodPipe(KioskScanSchema)) body: KioskScanInput) {
    return this.time.kioskScan(device, body);
  }

  /** Pointage personnel (mobile, navigateur) */
  @Post('clock')
  @HttpCode(200)
  clock(@CurrentPrincipal() p: Principal, @Body(new ZodPipe(SelfClockSchema)) body: SelfClockInput) {
    return this.time.selfClock(p, body);
  }

  @Get('me/today')
  today(@CurrentPrincipal() p: Principal) {
    return this.time.myToday(p);
  }

  @Get('presence')
  presence(@CurrentPrincipal() p: Principal, @Query('siteId') siteId?: string) {
    return this.time.presence(p, siteId ?? p.employee?.siteId ?? '');
  }
}
