/**
 * Boîte de validation : les demandes dont l étape courante correspond à un rôle actif.
 * L auteur ne valide jamais sa propre demande. La décision prévient le demandeur.
 * MAAYOUD
 */
import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { APPROVAL_POLICIES, type ApprovalPolicy } from '@temper/permissions';
import type { DecideInput } from '@temper/shared';
import { AuditService } from '../audit/audit.service.js';
import { AccessService } from '../permissions/access.service.js';
import type { Principal } from '../permissions/principal.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { RealtimeGateway } from '../realtime/realtime.gateway.js';
import { addDays, utcDay } from '../time/calendar.js';
import { mayDecide, stepRoles } from './decision.js';

const POLICIES = APPROVAL_POLICIES as Record<string, ApprovalPolicy>;

@Injectable()
export class ApprovalsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly realtime: RealtimeGateway,
    private readonly access: AccessService,
  ) {}

  async inbox(p: Principal) {
    const [pending, mine, assignments] = await Promise.all([
      this.prisma.db.approvalRequest.findMany({ where: { status: 'PENDING' }, orderBy: { createdAt: 'asc' }, take: 200 }),
      this.prisma.db.approvalRequest.findMany({
        where: { requesterUserId: p.id },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      this.prisma.db.roleAssignment.findMany({
        where: { userId: p.id, revokedAt: null, source: 'DELEGATION' },
        select: { role: true },
      }),
    ]);
    const delegatedRoles = new Set(assignments.map((row) => row.role));
    const toDecide = pending.flatMap((row) => {
      const policy = POLICIES[row.policy];
      if (!policy) return [];
      if (!mayDecide({ roles: p.activeRoles, steps: row.steps, currentStep: row.currentStep, requesterUserId: row.requesterUserId, userId: p.id, fourEyes: policy.fourEyes })) {
        return [];
      }
      const needed = stepRoles(row.steps, row.currentStep);
      return [
        {
          id: row.id,
          policy: row.policy,
          label: policy.label,
          subjectType: row.subjectType,
          subjectId: row.subjectId,
          amount: row.amount?.toString() ?? null,
          currentStep: row.currentStep,
          stepsCount: Array.isArray(row.steps) ? row.steps.length : 0,
          createdAt: row.createdAt.toISOString(),
          delegated: needed.some((role) => delegatedRoles.has(role)),
        },
      ];
    });
    return {
      toDecide,
      mine: mine.map((row) => ({
        id: row.id,
        policy: row.policy,
        label: POLICIES[row.policy]?.label ?? row.policy,
        status: row.status,
        currentStep: row.currentStep,
        createdAt: row.createdAt.toISOString(),
      })),
    };
  }

  async decide(p: Principal, id: string, input: DecideInput, requestId?: string) {
    const row = await this.prisma.db.approvalRequest.findUnique({ where: { id } });
    if (!row) throw new NotFoundException({ code: 'NOT_FOUND' });
    const policy = POLICIES[row.policy];
    if (!policy || row.status !== 'PENDING') throw new ForbiddenException({ code: 'FORBIDDEN' });
    if (!mayDecide({ roles: p.activeRoles, steps: row.steps, currentStep: row.currentStep, requesterUserId: row.requesterUserId, userId: p.id, fourEyes: policy.fourEyes })) {
      throw new ForbiddenException({ code: 'FORBIDDEN' });
    }
    const last = row.currentStep + 1 >= (Array.isArray(row.steps) ? row.steps.length : 1);
    const accepted = input.decision === 'APPROVED';
    const closed = !accepted || last;
    const updated = await this.prisma.db.$transaction(async (tx) => {
      await tx.approvalDecision.create({
        data: {
          requestId: row.id,
          step: row.currentStep,
          deciderUserId: p.id,
          decision: input.decision,
          comment: input.comment,
        },
      });
      return tx.approvalRequest.update({
        where: { id: row.id },
        data: {
          status: closed ? (accepted ? 'APPROVED' : 'REJECTED') : 'PENDING',
          currentStep: closed ? row.currentStep : row.currentStep + 1,
          closedAt: closed ? new Date() : null,
        },
      });
    });
    const title = accepted ? 'Demande acceptée' : 'Demande refusée';
    const note = await this.prisma.db.notification.create({
      data: {
        userId: row.requesterUserId,
        kind: 'APPROVAL',
        title,
        body: input.comment ?? policy.label,
        link: '/validations',
        severity: accepted ? 'INFO' : 'WARNING',
      },
    });
    this.realtime.toUser(row.requesterUserId, 'notification', { id: note.id, title, link: '/validations' });
    await this.audit.log({
      actorType: 'USER',
      actorId: p.id,
      action: 'approve',
      subject: policy.subject,
      subjectId: row.subjectId,
      reason: input.decision,
      requestId: requestId ?? null,
      after: { requestId: row.id, status: updated.status },
    });
    if (closed && row.policy === 'SENSITIVE_ROLE_ASSIGNMENT') {
      await this.prisma.db.roleAssignment.updateMany({
        where: { approvalRequestId: row.id, revokedAt: null },
        data: accepted ? { validFrom: new Date(), reason: 'Circuit sensible accepté' } : { revokedAt: new Date(), revokedById: p.id },
      });
      const assignment = await this.prisma.db.roleAssignment.findFirst({ where: { approvalRequestId: row.id }, select: { userId: true } });
      if (assignment) await this.access.invalidate(assignment.userId);
    }
    if (closed && row.policy === 'LEAVE_REQUEST') await this.applyLeave(row.subjectId, accepted);
    if (closed && row.policy === 'TIME_CORRECTION') await this.applyCorrection(row.subjectId, accepted);
    if (closed && row.policy === 'RECIPE_VERSION') await this.applyRecipe(row.subjectId, accepted);
    return { id: updated.id, status: updated.status, currentStep: updated.currentStep };
  }

  private async applyLeave(id: string, accepted: boolean) {
    const leave = await this.prisma.db.leaveRequest.findUnique({ where: { id } });
    if (!leave) return;
    await this.prisma.db.leaveRequest.update({
      where: { id },
      data: { status: accepted ? 'APPROVED' : 'REJECTED', decidedAt: new Date() },
    });
    if (!accepted) {
      await this.prisma.db.leaveBalance.updateMany({
        where: { employeeId: leave.employeeId, leaveTypeId: leave.leaveTypeId, year: leave.startDate.getUTCFullYear() },
        data: { plannedDays: { decrement: leave.days } },
      });
    }
  }

  /** Une correction acceptée ajoute un pointage. Elle ne réécrit jamais le pointage d origine. */
  private async applyCorrection(id: string, accepted: boolean) {
    const correction = await this.prisma.db.timeCorrection.findUnique({ where: { id } });
    if (!correction) return;
    await this.prisma.db.timeCorrection.update({
      where: { id },
      data: { status: accepted ? 'APPROVED' : 'REJECTED', decidedAt: new Date() },
    });
    if (!accepted) return;
    if (correction.kind === 'ADD' && correction.proposedAt && correction.proposedKind) {
      const employee = await this.prisma.db.employee.findUnique({ where: { id: correction.employeeId } });
      if (employee) {
        await this.prisma.db.timeEntry.create({
          data: {
            employeeId: employee.id,
            siteId: employee.siteId,
            departmentId: employee.departmentId,
            teamId: employee.teamId,
            at: correction.proposedAt,
            kind: correction.proposedKind,
            source: 'IMPORT',
            clientEventId: `correction-${correction.id}`,
          },
        });
      }
    }
    await this.regularize(correction);
  }

  /** Un relevé déjà exporté ne bouge plus. La correction ouvre une ligne sur la période suivante. */
  private async regularize(correction: {
    id: string;
    employeeId: string;
    siteId: string;
    departmentId: string | null;
    teamId: string | null;
    date: Date;
  }) {
    const locked = await this.prisma.db.timesheet.findFirst({
      where: {
        employeeId: correction.employeeId,
        status: { in: ['EXPORTED', 'LOCKED'] },
        periodStart: { lte: correction.date },
        periodEnd: { gte: correction.date },
      },
    });
    if (!locked) return;
    const startIso = locked.periodStart.toISOString().slice(0, 10);
    const endIso = locked.periodEnd.toISOString().slice(0, 10);
    let span = 0;
    for (let cursor = startIso; cursor < endIso; cursor = addDays(cursor, 1)) span += 1;
    const nextStart = utcDay(addDays(endIso, 1));
    const existing = await this.prisma.db.timesheet.findUnique({
      where: { employeeId_periodStart: { employeeId: correction.employeeId, periodStart: nextStart } },
    });
    if (existing) return;
    await this.prisma.db.timesheet.create({
      data: {
        employeeId: correction.employeeId,
        siteId: correction.siteId,
        departmentId: correction.departmentId,
        teamId: correction.teamId,
        periodStart: nextStart,
        periodEnd: utcDay(addDays(endIso, 1 + span)),
        status: 'OPEN',
        totals: {
          regularizationOf: locked.id,
          sourceCorrectionId: correction.id,
          workedMinutes: 0,
          overtimeMinutes: 0,
          nightMinutes: 0,
          sundayMinutes: 0,
          holidayMinutes: 0,
          lateMinutes: 0,
          absentDays: 0,
        },
      },
    });
  }

  /** La double validation qualité puis production rend la version active et classe l ancienne. */
  private async applyRecipe(id: string, accepted: boolean) {
    const recipe = await this.prisma.db.recipe.findUnique({ where: { id } });
    if (!recipe) return;
    if (!accepted) {
      await this.prisma.db.recipe.update({ where: { id }, data: { status: 'DRAFT' } });
      return;
    }
    const request = await this.prisma.db.approvalRequest.findFirst({
      where: { subjectId: id, policy: 'RECIPE_VERSION', status: 'APPROVED' },
      include: { decisions: true },
    });
    const quality = request?.decisions.find((decision) => decision.step === 0)?.deciderUserId;
    const production = request?.decisions.find((decision) => decision.step === 1)?.deciderUserId ?? request?.decisions.at(-1)?.deciderUserId;
    await this.prisma.db.recipe.update({
      where: { id },
      data: {
        status: 'APPROVED',
        qualityApprovedById: quality,
        qualityApprovedAt: quality ? new Date() : null,
        productionApprovedById: production,
        productionApprovedAt: production ? new Date() : null,
      },
    });
    await this.prisma.db.recipe.updateMany({
      where: { code: recipe.code, status: 'APPROVED', id: { not: id }, version: { lt: recipe.version } },
      data: { status: 'OBSOLETE' },
    });
  }
}
