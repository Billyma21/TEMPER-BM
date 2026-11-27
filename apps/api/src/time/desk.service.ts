/**
 * Planning 3x8, journée calculée, correction, congé, absence et capteur.
 * Le pointage brut n est jamais modifié : une correction approuvée ajoute un fait, ou en neutralise un au calcul.
 * MAAYOUD
 */
import { ForbiddenException, HttpException, Injectable } from '@nestjs/common';
import { approvalSteps } from '@temper/permissions';
import type { AbsenceInput, CloseDayInput, LeaveAskInput, SensorReadingInput, TimeCorrectionAskInput, WeekPublishInput } from '@temper/shared';
import { assertCan, whereOrForbid, type Principal } from '../permissions/principal.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { addDays, brusselsBounds, brusselsInstant, isMonday, rotationCode, utcDay, workingDays } from './calendar.js';
import { DEFAULT_RULES, computeDay } from './time-rules.js';

const SLOTS = ['PROD-A', 'PROD-B', 'PROD-C'] as const;

@Injectable()
export class TimeDeskService {
  constructor(private readonly prisma: PrismaService) {}

  async publishRotation(p: Principal, input: WeekPublishInput) {
    if (!isMonday(input.weekStart)) throw new HttpException({ code: 'VALIDATION_ERROR', field: 'weekStart' }, 400);
    const db = this.prisma.db;
    const site = input.siteId
      ? await db.site.findUnique({ where: { id: input.siteId } })
      : await db.site.findFirst({ where: { kind: 'FACTORY' } });
    if (!site) throw new HttpException({ code: 'NOT_FOUND' }, 404);
    const teams = await db.team.findMany({ where: { siteId: site.id, code: { in: [...SLOTS] } } });
    const patterns = await db.shiftPattern.findMany({ where: { siteId: site.id, code: { in: ['MATIN', 'APREM', 'NUIT'] } } });
    const byCode = new Map(patterns.map((row) => [row.code, row]));
    let created = 0;
    for (const [slot, code] of SLOTS.entries()) {
      const team = teams.find((row) => row.code === code);
      const pattern = byCode.get(rotationCode(slot, input.weekStart));
      if (!team || !pattern) continue;
      const people = await db.employee.findMany({ where: { teamId: team.id, status: 'ACTIVE' } });
      for (const person of people) {
        for (let offset = 0; offset < 5; offset += 1) {
          const iso = addDays(input.weekStart, offset);
          const start = brusselsInstant(iso, pattern.startTime);
          const endDay = pattern.isNight ? addDays(iso, 1) : iso;
          const end = brusselsInstant(endDay, pattern.endTime);
          const existing = await db.schedule.findFirst({ where: { employeeId: person.id, plannedStart: start } });
          if (existing) continue;
          const row = {
            employeeId: person.id,
            siteId: person.siteId,
            departmentId: person.departmentId,
            teamId: person.teamId,
            date: utcDay(iso),
            shiftPatternId: pattern.id,
            plannedStart: start,
            plannedEnd: end,
            plannedBreakMin: pattern.breakMinutes,
            status: 'PUBLISHED' as const,
            publishedAt: new Date(),
            createdById: p.id,
          };
          assertCan(p, 'create', 'Schedule', row);
          await db.schedule.create({ data: row });
          created += 1;
        }
      }
    }
    return { weekStart: input.weekStart, created };
  }

  async week(p: Principal, teamId: string | undefined, from: string) {
    if (!from || !/^\d{4}-\d{2}-\d{2}$/.test(from)) throw new HttpException({ code: 'VALIDATION_ERROR', field: 'from' }, 400);
    const where = whereOrForbid(p, 'read', 'Schedule', true);
    const start = utcDay(from);
    const end = utcDay(addDays(from, 7));
    const rows = await this.prisma.db.schedule.findMany({
      where: { AND: [where, { ...(teamId ? { teamId } : {}), date: { gte: start, lt: end }, status: { not: 'CANCELLED' } }] },
      select: {
        id: true,
        date: true,
        plannedStart: true,
        plannedEnd: true,
        status: true,
        employee: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: [{ date: 'asc' }, { plannedStart: 'asc' }],
    });
    return {
      from,
      items: rows.map((row) => ({
        id: row.id,
        date: row.date.toISOString().slice(0, 10),
        start: row.plannedStart.toISOString(),
        end: row.plannedEnd.toISOString(),
        status: row.status,
        employeeId: row.employee.id,
        name: `${row.employee.firstName} ${row.employee.lastName}`,
      })),
    };
  }

  async closeDay(p: Principal, input: CloseDayInput) {
    const where = whereOrForbid(p, 'update', 'Schedule');
    const db = this.prisma.db;
    const { start, end } = brusselsBounds(input.date);
    const day = utcDay(input.date);
    const schedules = await db.schedule.findMany({
      where: { AND: [where, { date: day, status: { not: 'CANCELLED' } }] },
    });
    const entries = await db.timeEntry.findMany({
      where: { AND: [where, { at: { gte: start, lt: end } }] },
      orderBy: { at: 'asc' },
    });
    const ids = new Set<string>([...schedules.map((row) => row.employeeId), ...entries.map((row) => row.employeeId)]);
    const voids = await db.timeCorrection.findMany({
      where: { employeeId: { in: [...ids] }, kind: 'VOID', status: 'APPROVED', date: day },
      select: { targetTimeEntryId: true },
    });
    const voided = new Set(voids.flatMap((row) => (row.targetTimeEntryId ? [row.targetTimeEntryId] : [])));
    const companyId = schedules[0] ? (await db.employee.findUnique({ where: { id: schedules[0].employeeId }, select: { companyId: true } }))?.companyId : undefined;
    const holiday = companyId
      ? await db.publicHoliday.findFirst({ where: { companyId, date: day } })
      : null;
    let written = 0;
    for (const employeeId of ids) {
      const employee = await db.employee.findUnique({ where: { id: employeeId } });
      if (!employee) continue;
      const existing = await db.dailyAttendance.findUnique({ where: { employeeId_date: { employeeId, date: day } } });
      if (existing?.status === 'VALIDATED') continue;
      const planRow = schedules.find((row) => row.employeeId === employeeId) ?? null;
      const mine = entries.filter((row) => row.employeeId === employeeId && !voided.has(row.id));
      const previous = await db.timeEntry.findFirst({
        where: { employeeId, kind: 'OUT', at: { lt: start } },
        orderBy: { at: 'desc' },
      });
      const plan = planRow ? { start: planRow.plannedStart, end: planRow.plannedEnd, breakMinutes: planRow.plannedBreakMin } : null;
      const computed = computeDay(
        mine.map((row) => ({ at: row.at, kind: row.kind })),
        plan,
        DEFAULT_RULES,
        previous?.at ?? null,
        new Date(),
      );
      const excused = await this.excused(employeeId, day);
      const anomalies = [...computed.anomalies];
      if (!computed.firstIn && planRow && !excused && !computed.inProgress) anomalies.push('ABSENT');
      if (holiday && computed.workedMinutes > 0) anomalies.push('HOLIDAY');
      if (day.getUTCDay() === 0 && computed.workedMinutes > 0) anomalies.push('SUNDAY');
      const data = {
        employeeId,
        siteId: employee.siteId,
        departmentId: employee.departmentId,
        teamId: employee.teamId,
        date: day,
        scheduleId: planRow?.id,
        firstIn: computed.firstIn,
        lastOut: computed.lastOut,
        workedMinutes: computed.workedMinutes,
        breakMinutes: computed.breakMinutes,
        overtimeMinutes: computed.overtimeMinutes,
        nightMinutes: computed.nightMinutes,
        sundayMinutes: day.getUTCDay() === 0 ? computed.workedMinutes : 0,
        holidayMinutes: holiday ? computed.workedMinutes : 0,
        lateMinutes: computed.lateMinutes,
        earlyLeaveMinutes: computed.earlyLeaveMinutes,
        anomalies,
        status: anomalies.length ? ('ANOMALY' as const) : ('OK' as const),
        computedAt: new Date(),
      };
      if (existing) await db.dailyAttendance.update({ where: { id: existing.id }, data });
      else await db.dailyAttendance.create({ data });
      written += 1;
    }
    return { date: input.date, written };
  }

  async anomalies(p: Principal, date: string) {
    const where = whereOrForbid(p, 'read', 'Schedule', true);
    const rows = await this.prisma.db.dailyAttendance.findMany({
      where: { AND: [where, { date: utcDay(date) }] },
      select: { id: true, employeeId: true, anomalies: true, lateMinutes: true, status: true, workedMinutes: true },
      take: 300,
    });
    return { items: rows.filter((row) => row.anomalies.length > 0) };
  }

  async askCorrection(p: Principal, input: TimeCorrectionAskInput) {
    const db = this.prisma.db;
    const employee = await db.employee.findUnique({ where: { id: input.employeeId } });
    if (!employee) throw new HttpException({ code: 'NOT_FOUND' }, 404);
    const row = {
      employeeId: employee.id,
      siteId: employee.siteId,
      departmentId: employee.departmentId,
      teamId: employee.teamId,
      date: utcDay(input.date),
      kind: input.kind,
      reason: input.reason,
      requestedById: p.id,
    };
    assertCan(p, 'create', 'TimeCorrection', row);
    const correction = await db.timeCorrection.create({
      data: {
        ...row,
        targetTimeEntryId: input.targetTimeEntryId,
        proposedAt: input.proposedAt ? new Date(input.proposedAt) : null,
        proposedKind: input.proposedKind,
      },
    });
    const request = await db.approvalRequest.create({
      data: {
        policy: 'TIME_CORRECTION',
        subjectType: 'TimeCorrection',
        subjectId: correction.id,
        requesterUserId: p.id,
        requesterEmployeeId: p.employee?.id,
        steps: approvalSteps('TIME_CORRECTION'),
        siteId: employee.siteId,
      },
    });
    return { id: correction.id, pending: true, requestId: request.id };
  }

  async askLeave(p: Principal, input: LeaveAskInput) {
    const employeeId = p.employee?.id;
    if (!employeeId) throw new ForbiddenException({ code: 'FORBIDDEN' });
    if (input.endDate < input.startDate) throw new HttpException({ code: 'VALIDATION_ERROR', field: 'endDate' }, 400);
    const db = this.prisma.db;
    const employee = await db.employee.findUniqueOrThrow({ where: { id: employeeId } });
    const holidays = await db.publicHoliday.findMany({ where: { companyId: employee.companyId }, select: { date: true } });
    const days = workingDays(input.startDate, input.endDate, new Set(holidays.map((row) => row.date.toISOString().slice(0, 10))));
    if (days <= 0) throw new HttpException({ code: 'VALIDATION_ERROR', field: 'startDate' }, 400);
    const year = utcDay(input.startDate).getUTCFullYear();
    const balance = await db.leaveBalance.findUnique({
      where: { employeeId_leaveTypeId_year: { employeeId, leaveTypeId: input.leaveTypeId, year } },
    });
    if (!balance) throw new HttpException({ code: 'VALIDATION_ERROR', field: 'leaveTypeId' }, 400);
    const remaining = Number(balance.entitledDays) + Number(balance.carriedOverDays) - Number(balance.takenDays) - Number(balance.plannedDays);
    if (remaining < days) throw new HttpException({ code: 'CONFLICT', field: 'days' }, 409);
    const leave = await db.$transaction(async (tx) => {
      const created = await tx.leaveRequest.create({
        data: {
          employeeId,
          siteId: employee.siteId,
          departmentId: employee.departmentId,
          teamId: employee.teamId,
          leaveTypeId: input.leaveTypeId,
          startDate: utcDay(input.startDate),
          endDate: utcDay(input.endDate),
          days,
          comment: input.comment,
        },
      });
      await tx.leaveBalance.update({ where: { id: balance.id }, data: { plannedDays: { increment: days } } });
      const request = await tx.approvalRequest.create({
        data: {
          policy: 'LEAVE_REQUEST',
          subjectType: 'LeaveRequest',
          subjectId: created.id,
          requesterUserId: p.id,
          requesterEmployeeId: employeeId,
          steps: approvalSteps('LEAVE_REQUEST', days),
          siteId: employee.siteId,
        },
      });
      return tx.leaveRequest.update({ where: { id: created.id }, data: { approvalId: request.id } });
    });
    return { id: leave.id, days, pending: true, requestId: leave.approvalId };
  }

  async declareAbsence(p: Principal, input: AbsenceInput) {
    const employeeId = input.employeeId ?? p.employee?.id;
    if (!employeeId) throw new ForbiddenException({ code: 'FORBIDDEN' });
    const employee = await this.prisma.db.employee.findUnique({ where: { id: employeeId } });
    if (!employee) throw new HttpException({ code: 'NOT_FOUND' }, 404);
    const row = {
      employeeId: employee.id,
      siteId: employee.siteId,
      departmentId: employee.departmentId,
      teamId: employee.teamId,
      type: input.type,
      startDate: utcDay(input.startDate),
    };
    assertCan(p, 'create', 'Absence', row);
    const absence = await this.prisma.db.absence.create({
      data: {
        ...row,
        endDate: input.endDate ? utcDay(input.endDate) : null,
        certificateKey: input.certificateKey,
        certificateReceivedAt: input.certificateKey ? new Date() : null,
        incidentId: input.incidentId,
      },
    });
    return { id: absence.id, type: absence.type };
  }

  async sensor(p: Principal, input: SensorReadingInput) {
    const device = await this.prisma.db.device.findUnique({ where: { id: p.id } });
    if (!device || device.kind !== 'ENV_SENSOR' || device.status !== 'ACTIVE') throw new ForbiddenException({ code: 'FORBIDDEN' });
    const temperature = input.temperatureC;
    const alert = temperature > 20 || temperature < 12;
    const reading = await this.prisma.db.environmentReading.create({
      data: {
        siteId: device.siteId,
        deviceId: device.id,
        zoneId: device.accessZoneId,
        at: input.at ? new Date(input.at) : new Date(),
        temperatureC: temperature,
        humidityPct: input.humidityPct,
        alert,
      },
    });
    return { id: reading.id, alert };
  }

  private async excused(employeeId: string, day: Date): Promise<boolean> {
    const absence = await this.prisma.db.absence.findFirst({
      where: { employeeId, startDate: { lte: day }, OR: [{ endDate: null }, { endDate: { gte: day } }] },
    });
    if (absence) return true;
    const leave = await this.prisma.db.leaveRequest.findFirst({
      where: { employeeId, status: 'APPROVED', startDate: { lte: day }, endDate: { gte: day } },
    });
    return Boolean(leave);
  }
}
