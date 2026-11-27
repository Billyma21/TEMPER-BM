import { Body, Controller, Get, HttpCode, Param, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  AbsenceAskSchema,
  BalanceSettleSchema,
  CloseDaySchema,
  HolidayAskSchema,
  KioskScanSchema,
  LeaveAskSchema,
  PayrollPeriodSchema,
  SelfClockSchema,
  SensorReadingSchema,
  TimeCorrectionAskSchema,
  WeekPublishSchema,
  type AbsenceInput,
  type BalanceSettleInput,
  type CloseDayInput,
  type HolidayAskInput,
  type KioskScanInput,
  type LeaveAskInput,
  type PayrollPeriodInput,
  type SelfClockInput,
  type SensorReadingInput,
  type TimeCorrectionAskInput,
  type WeekPublishInput,
} from '@temper/shared';
import { ZodPipe } from '../common/zod.pipe.js';
import { CurrentPrincipal, DeviceOnly, Requires } from '../permissions/decorators.js';
import type { Principal } from '../permissions/principal.js';
import { TimeDeskService } from './desk.service.js';
import { PayrollService } from './payroll.service.js';
import { TimeService } from './time.service.js';

@ApiTags('temps')
@Controller('time')
export class TimeController {
  constructor(
    private readonly time: TimeService,
    private readonly desk: TimeDeskService,
    private readonly payroll: PayrollService,
  ) {}

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

  @Post('schedules/rotation')
  @Requires('create', 'Schedule')
  rotation(@CurrentPrincipal() p: Principal, @Body(new ZodPipe(WeekPublishSchema)) body: WeekPublishInput) {
    return this.desk.publishRotation(p, body);
  }

  @Get('schedules/week')
  @Requires('read', 'Schedule')
  week(@CurrentPrincipal() p: Principal, @Query('teamId') teamId: string, @Query('from') from: string) {
    return this.desk.week(p, teamId || undefined, from);
  }

  @Post('days/close')
  @Requires('update', 'Schedule')
  @HttpCode(200)
  closeDay(@CurrentPrincipal() p: Principal, @Body(new ZodPipe(CloseDaySchema)) body: CloseDayInput) {
    return this.desk.closeDay(p, body);
  }

  @Get('anomalies')
  @Requires('read', 'Schedule')
  anomalies(@CurrentPrincipal() p: Principal, @Query('date') date: string) {
    return this.desk.anomalies(p, date);
  }

  @Post('corrections')
  @Requires('create', 'TimeCorrection')
  correction(@CurrentPrincipal() p: Principal, @Body(new ZodPipe(TimeCorrectionAskSchema)) body: TimeCorrectionAskInput) {
    return this.desk.askCorrection(p, body);
  }

  @Post('leave')
  @Requires('create', 'LeaveRequest')
  leave(@CurrentPrincipal() p: Principal, @Body(new ZodPipe(LeaveAskSchema)) body: LeaveAskInput) {
    return this.desk.askLeave(p, body);
  }

  @Post('absences')
  @Requires('create', 'Absence')
  absence(@CurrentPrincipal() p: Principal, @Body(new ZodPipe(AbsenceAskSchema)) body: AbsenceInput) {
    return this.desk.declareAbsence(p, body);
  }

  @Post('sensors')
  @DeviceOnly()
  @HttpCode(200)
  sensor(@CurrentPrincipal() p: Principal, @Body(new ZodPipe(SensorReadingSchema)) body: SensorReadingInput) {
    return this.desk.sensor(p, body);
  }

  @Post('timesheets/build')
  @Requires('create', 'Timesheet')
  buildSheets(@CurrentPrincipal() p: Principal, @Body(new ZodPipe(PayrollPeriodSchema)) body: PayrollPeriodInput) {
    return this.payroll.build(p, body);
  }

  @Get('timesheets')
  @Requires('read', 'Timesheet')
  sheets(@CurrentPrincipal() p: Principal, @Query('from') from?: string) {
    return this.payroll.list(p, from);
  }

  @Post('timesheets/:id/submit')
  @Requires('update', 'Timesheet')
  @HttpCode(200)
  submitSheet(@CurrentPrincipal() p: Principal, @Param('id') id: string) {
    return this.payroll.submit(p, id);
  }

  @Post('timesheets/:id/manager')
  @Requires('approve', 'Timesheet')
  @HttpCode(200)
  managerSheet(@CurrentPrincipal() p: Principal, @Param('id') id: string) {
    return this.payroll.managerApprove(p, id);
  }

  @Post('timesheets/:id/payroll')
  @Requires('export', 'Timesheet')
  @HttpCode(200)
  payrollSheet(@CurrentPrincipal() p: Principal, @Param('id') id: string) {
    return this.payroll.payrollApprove(p, id);
  }

  @Post('payroll-exports')
  @Requires('export', 'Timesheet')
  exportSheets(@CurrentPrincipal() p: Principal, @Body(new ZodPipe(PayrollPeriodSchema)) body: PayrollPeriodInput) {
    return this.payroll.exportSecretariat(p, body);
  }

  @Get('holidays')
  @Requires('read', 'Schedule')
  holidayList(@CurrentPrincipal() p: Principal, @Query('year') year?: string) {
    return this.payroll.holidays(p, year);
  }

  @Post('holidays')
  @Requires('update', 'Schedule')
  @HttpCode(200)
  holiday(@CurrentPrincipal() p: Principal, @Body(new ZodPipe(HolidayAskSchema)) body: HolidayAskInput) {
    return this.payroll.declareHoliday(p, body);
  }

  @Post('balances/settle')
  @Requires('update', 'LeaveBalance')
  @HttpCode(200)
  settle(@CurrentPrincipal() p: Principal, @Body(new ZodPipe(BalanceSettleSchema)) body: BalanceSettleInput) {
    return this.payroll.settle(p, body);
  }
}
