/**
 * Relevés de prestations, double validation et export vers le secrétariat social.
 * Un relevé exporté est verrouillé. Le solde se recalcule depuis les demandes.
 * MAAYOUD
 */
import { ForbiddenException, HttpException, Injectable } from '@nestjs/common';
import type { BalanceSettleInput, HolidayAskInput, PayrollPeriodInput } from '@temper/shared';
import { sha256 } from '../common/crypto.js';
import { assertCan, whereOrForbid, type Principal } from '../permissions/principal.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { utcDay } from './calendar.js';

type Totals = {
  workedMinutes: number;
  overtimeMinutes: number;
  nightMinutes: number;
  sundayMinutes: number;
  holidayMinutes: number;
  lateMinutes: number;
  absentDays: number;
  regularizationOf?: string;
  sourceCorrectionId?: string;
};

function coversSite(where: unknown): boolean {
  if (where && typeof where === 'object' && Object.keys(where as object).length === 0) return true;
  return JSON.stringify(where).includes('"siteId"');
}

function belgianDate(iso: string): string {
  const [year, month, day] = iso.split('-');
  return `${day}/${month}/${year}`;
}

function belgianHours(minutes: number): string {
  const negative = minutes < 0;
  const abs = Math.abs(Math.round(minutes));
  const whole = Math.floor(abs / 60);
  const hundredths = Math.round(((abs % 60) / 60) * 100);
  return `${negative ? '-' : ''}${whole},${String(hundredths).padStart(2, '0')}`;
}

@Injectable()
export class PayrollService {
  constructor(private readonly prisma: PrismaService) {}

  async build(p: Principal, input: PayrollPeriodInput) {
    if (input.periodEnd < input.periodStart) throw new HttpException({ code: 'VALIDATION_ERROR', field: 'periodEnd' }, 400);
    const where = whereOrForbid(p, 'create', 'Timesheet');
    const start = utcDay(input.periodStart);
    const end = utcDay(input.periodEnd);
    const rows = await this.prisma.db.dailyAttendance.findMany({
      where: { AND: [where, { date: { gte: start, lte: end } }] },
    });
    const buckets = new Map<string, Totals & { siteId: string; departmentId: string | null; teamId: string | null }>();
    for (const row of rows) {
      const current = buckets.get(row.employeeId) ?? {
        siteId: row.siteId,
        departmentId: row.departmentId,
        teamId: row.teamId,
        workedMinutes: 0,
        overtimeMinutes: 0,
        nightMinutes: 0,
        sundayMinutes: 0,
        holidayMinutes: 0,
        lateMinutes: 0,
        absentDays: 0,
      };
      current.workedMinutes += row.workedMinutes;
      current.overtimeMinutes += row.overtimeMinutes;
      current.nightMinutes += row.nightMinutes;
      current.sundayMinutes += row.sundayMinutes;
      current.holidayMinutes += row.holidayMinutes;
      current.lateMinutes += row.lateMinutes;
      if (row.anomalies.includes('ABSENT')) current.absentDays += 1;
      buckets.set(row.employeeId, current);
    }
    let written = 0;
    let skipped = 0;
    for (const [employeeId, bucket] of buckets) {
      const existing = await this.prisma.db.timesheet.findUnique({
        where: { employeeId_periodStart: { employeeId, periodStart: start } },
      });
      if (existing && existing.status !== 'OPEN') {
        skipped += 1;
        continue;
      }
      const previous = existing?.totals && typeof existing.totals === 'object' && !Array.isArray(existing.totals) ? (existing.totals as Totals) : undefined;
      const totals: Totals = {
        workedMinutes: bucket.workedMinutes,
        overtimeMinutes: bucket.overtimeMinutes,
        nightMinutes: bucket.nightMinutes,
        sundayMinutes: bucket.sundayMinutes,
        holidayMinutes: bucket.holidayMinutes,
        lateMinutes: bucket.lateMinutes,
        absentDays: bucket.absentDays,
        ...(previous?.regularizationOf ? { regularizationOf: previous.regularizationOf, sourceCorrectionId: previous.sourceCorrectionId } : {}),
      };
      const data = {
        employeeId,
        siteId: bucket.siteId,
        departmentId: bucket.departmentId,
        teamId: bucket.teamId,
        periodStart: start,
        periodEnd: end,
        totals,
        status: 'OPEN' as const,
      };
      assertCan(p, 'create', 'Timesheet', data);
      if (existing) await this.prisma.db.timesheet.update({ where: { id: existing.id }, data });
      else await this.prisma.db.timesheet.create({ data });
      written += 1;
    }
    return { periodStart: input.periodStart, periodEnd: input.periodEnd, written, skipped };
  }

  async list(p: Principal, from?: string) {
    const where = whereOrForbid(p, 'read', 'Timesheet', true);
    const rows = await this.prisma.db.timesheet.findMany({
      where: { AND: [where, from && /^\d{4}-\d{2}-\d{2}$/.test(from) ? { periodStart: utcDay(from) } : {}] },
      include: { employee: { select: { firstName: true, lastName: true } } },
      orderBy: { periodStart: 'desc' },
      take: 100,
    });
    return {
      items: rows.map((row) => ({
        id: row.id,
        employeeId: row.employeeId,
        name: `${row.employee.firstName} ${row.employee.lastName}`,
        periodStart: row.periodStart.toISOString().slice(0, 10),
        periodEnd: row.periodEnd.toISOString().slice(0, 10),
        status: row.status,
      })),
    };
  }

  async submit(p: Principal, id: string) {
    const row = await this.sheet(id);
    if (row.status !== 'OPEN') throw new HttpException({ code: 'CONFLICT', field: 'status' }, 409);
    assertCan(p, 'update', 'Timesheet', row);
    const updated = await this.prisma.db.timesheet.update({ where: { id }, data: { status: 'SUBMITTED' } });
    return { id: updated.id, status: updated.status };
  }

  async managerApprove(p: Principal, id: string) {
    const row = await this.sheet(id);
    if (row.status !== 'SUBMITTED') throw new HttpException({ code: 'CONFLICT', field: 'status' }, 409);
    if (p.employee?.id === row.employeeId) throw new ForbiddenException({ code: 'FORBIDDEN', reason: 'SELF' });
    assertCan(p, 'approve', 'Timesheet', row);
    const updated = await this.prisma.db.timesheet.update({
      where: { id },
      data: { status: 'MANAGER_APPROVED', managerApprovedById: p.id, managerApprovedAt: new Date() },
    });
    return { id: updated.id, status: updated.status };
  }

  async payrollApprove(p: Principal, id: string) {
    const row = await this.sheet(id);
    if (row.status !== 'MANAGER_APPROVED') throw new HttpException({ code: 'CONFLICT', field: 'status' }, 409);
    if (p.id === row.managerApprovedById || p.employee?.id === row.employeeId) {
      throw new ForbiddenException({ code: 'FORBIDDEN', reason: 'SELF' });
    }
    assertCan(p, 'export', 'Timesheet', row);
    const updated = await this.prisma.db.timesheet.update({
      where: { id },
      data: { status: 'PAYROLL_APPROVED', payrollApprovedById: p.id, payrollApprovedAt: new Date() },
    });
    return { id: updated.id, status: updated.status };
  }

  /** Fichier du secrétariat : heures en virgule, dates belges, aucun motif médical. */
  async exportSecretariat(p: Principal, input: PayrollPeriodInput) {
    if (input.periodEnd < input.periodStart) throw new HttpException({ code: 'VALIDATION_ERROR', field: 'periodEnd' }, 400);
    const where = whereOrForbid(p, 'export', 'Timesheet');
    const start = utcDay(input.periodStart);
    const end = utcDay(input.periodEnd);
    const rows = await this.prisma.db.timesheet.findMany({
      where: { AND: [where, { status: 'PAYROLL_APPROVED', periodStart: start, periodEnd: end }] },
      include: { employee: { select: { employeeNumber: true, firstName: true, lastName: true } } },
      orderBy: { employee: { employeeNumber: 'asc' } },
    });
    if (!rows.length) throw new HttpException({ code: 'CONFLICT', field: 'period' }, 409);
    const header = 'matricule;nom;debut;fin;heures;supplementaires;nuit;dimanche;ferie;absences';
    const lines = rows.map((row) => {
      const totals = row.totals as Totals;
      return [
        row.employee.employeeNumber,
        `${row.employee.firstName} ${row.employee.lastName}`,
        belgianDate(input.periodStart),
        belgianDate(input.periodEnd),
        belgianHours(totals.workedMinutes ?? 0),
        belgianHours(totals.overtimeMinutes ?? 0),
        belgianHours(totals.nightMinutes ?? 0),
        belgianHours(totals.sundayMinutes ?? 0),
        belgianHours(totals.holidayMinutes ?? 0),
        String(totals.absentDays ?? 0),
      ].join(';');
    });
    const csv = `${header}\n${lines.join('\n')}\n`;
    const siteId = rows[0]!.siteId;
    assertCan(p, 'create', 'PayrollExport', { siteId, provider: 'SECRETARIAT' });
    const created = await this.prisma.db.$transaction(async (tx) => {
      const exp = await tx.payrollExport.create({
        data: {
          siteId,
          provider: 'SECRETARIAT',
          periodStart: start,
          periodEnd: end,
          status: 'GENERATED',
          fileKey: `secretariat/${input.periodStart}.csv`,
          checksum: sha256(csv),
          lineCount: rows.length,
          generatedById: p.id,
        },
      });
      await tx.timesheet.updateMany({
        where: { id: { in: rows.map((row) => row.id) } },
        data: { status: 'EXPORTED', lockedAt: new Date(), payrollExportId: exp.id },
      });
      return exp;
    });
    return { id: created.id, lineCount: created.lineCount, checksum: created.checksum, csv };
  }

  async holidays(p: Principal, year?: string) {
    whereOrForbid(p, 'read', 'Schedule', true);
    const companyId = await this.companyId(p);
    const y = year && /^\d{4}$/.test(year) ? year : String(new Date().getUTCFullYear());
    const rows = await this.prisma.db.publicHoliday.findMany({
      where: { companyId, date: { gte: utcDay(`${y}-01-01`), lte: utcDay(`${y}-12-31`) } },
      orderBy: { date: 'asc' },
    });
    return {
      items: rows.map((row) => ({
        id: row.id,
        date: row.date.toISOString().slice(0, 10),
        label: row.label,
        isReplacement: row.isReplacement,
      })),
    };
  }

  async declareHoliday(p: Principal, input: HolidayAskInput) {
    const where = whereOrForbid(p, 'update', 'Schedule');
    if (!coversSite(where)) throw new ForbiddenException({ code: 'FORBIDDEN', reason: 'SITE' });
    const companyId = await this.companyId(p);
    const date = utcDay(input.date);
    const existing = await this.prisma.db.publicHoliday.findUnique({ where: { companyId_date: { companyId, date } } });
    if (existing) return { id: existing.id, date: input.date, created: false };
    const created = await this.prisma.db.publicHoliday.create({
      data: { companyId, date, label: input.label, isReplacement: input.isReplacement ?? false },
    });
    return { id: created.id, date: input.date, created: true };
  }

  /** Recalcule pris et planifié depuis les demandes. Rejouable. */
  async settle(p: Principal, input: BalanceSettleInput) {
    const where = whereOrForbid(p, 'update', 'LeaveBalance');
    const start = utcDay(`${input.year}-01-01`);
    const end = utcDay(`${input.year}-12-31`);
    const today = utcDay(new Date().toISOString().slice(0, 10));
    const balances = await this.prisma.db.leaveBalance.findMany({
      where: { AND: [where, { year: input.year, ...(input.employeeId ? { employeeId: input.employeeId } : {}) }] },
    });
    const touched: Array<{ leaveTypeId: string; takenDays: number; plannedDays: number }> = [];
    for (const balance of balances) {
      assertCan(p, 'update', 'LeaveBalance', balance);
      const requests = await this.prisma.db.leaveRequest.findMany({
        where: {
          employeeId: balance.employeeId,
          leaveTypeId: balance.leaveTypeId,
          startDate: { gte: start, lte: end },
          status: { in: ['PENDING', 'APPROVED'] },
        },
      });
      let taken = 0;
      let planned = 0;
      for (const request of requests) {
        const days = Number(request.days);
        if (request.status === 'APPROVED' && request.endDate < today) taken += days;
        else planned += days;
      }
      await this.prisma.db.leaveBalance.update({
        where: { id: balance.id },
        data: { takenDays: taken, plannedDays: planned },
      });
      touched.push({ leaveTypeId: balance.leaveTypeId, takenDays: taken, plannedDays: planned });
    }
    return { year: input.year, updated: touched.length, balances: touched };
  }

  private async sheet(id: string) {
    const row = await this.prisma.db.timesheet.findUnique({ where: { id } });
    if (!row) throw new HttpException({ code: 'NOT_FOUND' }, 404);
    return row;
  }

  private async companyId(p: Principal): Promise<string> {
    if (p.employee) {
      const employee = await this.prisma.db.employee.findUnique({ where: { id: p.employee.id }, select: { companyId: true } });
      if (employee) return employee.companyId;
    }
    const company = await this.prisma.db.company.findFirst({ select: { id: true } });
    if (!company) throw new HttpException({ code: 'NOT_FOUND' }, 404);
    return company.id;
  }
}
