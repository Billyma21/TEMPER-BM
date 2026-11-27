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
    return { id: updated.id, status: updated.status, currentStep: updated.currentStep };
  }
}
