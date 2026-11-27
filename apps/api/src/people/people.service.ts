/**
 * Organigramme, arrivée, départ et attribution de rôles.
 * Le départ révoque. Il ne supprime pas l historique.
 * MAAYOUD
 */
import { HttpException, Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { ROLE_KEYS, type RoleKey, ROLES, approvalSteps, prismaWhere } from '@temper/permissions';
import type { RoleGrantInput } from '@temper/shared';
import { assertCan, whereOrForbid, type Principal } from '../permissions/principal.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { AccessService } from '../permissions/access.service.js';
import { PENDING_FROM, judgeAssignment } from './assignment.js';

const isRole = (value: string): value is RoleKey => (ROLE_KEYS as readonly string[]).includes(value);

@Injectable()
export class PeopleService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: AccessService,
  ) {}

  async chart(p: Principal) {
    const where = whereOrForbid(p, 'read', 'Employee', true);
    const rows = await this.prisma.db.employee.findMany({
      where,
      select: { id: true, firstName: true, lastName: true, jobTitle: true, managerId: true, departmentId: true, siteId: true, status: true },
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
      take: 500,
    });
    return { people: rows };
  }

  async grant(p: Principal, input: RoleGrantInput) {
    if (!isRole(input.role)) throw new HttpException({ code: 'VALIDATION_ERROR', field: 'role' }, 400);
    const db = this.prisma.db;
    const user = await db.user.findUnique({
      where: { id: input.userId },
      include: { employee: true, roleAssignments: { where: { revokedAt: null } } },
    });
    if (!user || user.status !== 'ACTIVE') throw new NotFoundException({ code: 'NOT_FOUND' });
    const existing = user.roleAssignments.map((row) => row.role).filter(isRole);
    const verdict = judgeAssignment({
      actorId: p.id,
      targetUserId: user.id,
      existingRoles: existing,
      next: input.role,
      employmentType: user.employee?.employmentType ?? null,
      validUntil: input.validUntil ?? null,
      requiresMfa: ROLES[input.role].requiresMfa,
    });
    if (!verdict.ok) throw new HttpException({ code: verdict.code, ...(verdict.details ?? {}) }, verdict.status);
    const siteId = input.siteId ?? user.employee?.siteId ?? null;
    assertCan(p, 'create', 'RoleAssignment', { siteId, userId: user.id });
    const assignment = await db.roleAssignment.create({
      data: {
        userId: user.id,
        role: input.role,
        siteId,
        siteIds: siteId ? [siteId] : [],
        validFrom: verdict.pending ? PENDING_FROM : new Date(),
        validUntil: input.validUntil ? new Date(input.validUntil) : null,
        createdById: p.id,
        reason: verdict.pending ? 'En attente du circuit sensible' : 'Attribution',
      },
    });
    if (!verdict.pending) {
      await this.access.invalidate(user.id);
      return { id: assignment.id, pending: false };
    }
    const request = await db.approvalRequest.create({
      data: {
        policy: 'SENSITIVE_ROLE_ASSIGNMENT',
        subjectType: 'RoleAssignment',
        subjectId: assignment.id,
        requesterUserId: p.id,
        requesterEmployeeId: p.employee?.id,
        steps: approvalSteps('SENSITIVE_ROLE_ASSIGNMENT'),
        siteId,
      },
    });
    await db.roleAssignment.update({ where: { id: assignment.id }, data: { approvalRequestId: request.id } });
    return { id: assignment.id, pending: true, requestId: request.id };
  }

  async review(p: Principal) {
    const where = whereOrForbid(p, 'read', 'RoleAssignment');
    const cutoff = new Date(Date.now() - 90 * 24 * 3600_000);
    const rows = await this.prisma.db.roleAssignment.findMany({
      where: { AND: [where, { revokedAt: null, createdAt: { lt: cutoff } }] },
      include: { user: { select: { email: true } } },
      orderBy: { createdAt: 'asc' },
      take: 500,
    });
    return {
      generatedAt: new Date().toISOString(),
      items: rows.map((row) => ({
        id: row.id,
        role: row.role,
        email: row.user.email,
        since: row.createdAt.toISOString(),
        validUntil: row.validUntil?.toISOString() ?? null,
      })),
    };
  }

  async startOnboarding(p: Principal, employeeId: string) {
    const db = this.prisma.db;
    const employee = await db.employee.findUnique({ where: { id: employeeId }, include: { position: true } });
    if (!employee) throw new NotFoundException({ code: 'NOT_FOUND' });
    assertCan(p, 'create', 'Onboarding', { employeeId: employee.id, siteId: employee.siteId, departmentId: employee.departmentId });
    const trainings = employee.position?.requiredTrainings ?? [];
    const checklist = [
      { key: 'account', label: 'Compte et accès', done: false },
      { key: 'roles', label: 'Rôles proposés par la fiche de poste', done: false },
      { key: 'badge', label: 'Badge', done: false },
      { key: 'ppe', label: 'Équipements de protection', done: false },
      { key: 'dimona', label: 'Dimona', done: false },
      { key: 'tools', label: 'Matériel', done: false },
      ...trainings.map((type) => ({ key: `training:${type}`, label: `Formation ${type}`, done: false })),
    ];
    const row = await db.onboarding.create({
      data: {
        employeeId: employee.id,
        siteId: employee.siteId,
        departmentId: employee.departmentId,
        kind: 'ARRIVAL',
        dueDate: employee.hireDate,
        checklist,
      },
    });
    return { id: row.id, kind: row.kind, checklist };
  }

  async runOffboarding(p: Principal, now = new Date()) {
    const where = prismaWhere(p.prismaRules, 'update', 'Employee');
    if (!where || !wideEnough(where)) throw new ForbiddenException({ code: 'FORBIDDEN' });
    const db = this.prisma.db;
    const due = await db.employee.findMany({
      where: { AND: [where, { endDate: { lte: now }, status: { not: 'LEFT' }, anonymizedAt: null }] },
    });
    for (const employee of due) {
      await db.$transaction(async (tx) => {
        await tx.employee.update({ where: { id: employee.id }, data: { status: 'LEFT' } });
        await tx.badge.updateMany({
          where: { holderEmployeeId: employee.id, status: { not: 'RETURNED' } },
          data: { status: 'RETURNED', returnedAt: now },
        });
        const user = await tx.user.findUnique({ where: { employeeId: employee.id } });
        if (user) {
          await tx.roleAssignment.updateMany({
            where: { userId: user.id, revokedAt: null },
            data: { revokedAt: now, revokedById: 'offboarding' },
          });
          await tx.session.updateMany({ where: { userId: user.id, revokedAt: null }, data: { revokedAt: now } });
        }
        await tx.onboarding.create({
          data: {
            employeeId: employee.id,
            siteId: employee.siteId,
            departmentId: employee.departmentId,
            kind: 'DEPARTURE',
            dueDate: now,
            status: 'OPEN',
            checklist: [
              { key: 'roles', label: 'Rôles révoqués', done: true },
              { key: 'badges', label: 'Badges restitués ou suspendus', done: true },
              { key: 'sessions', label: 'Sessions révoquées', done: true },
              { key: 'tools', label: 'Outils et EPI à restituer', done: false },
              { key: 'settlement', label: 'Solde de tout compte', done: false },
            ],
          },
        });
      });
      await this.access.invalidateEmployee(employee.id);
    }
    return { processed: due.length };
  }
}

function wideEnough(where: Record<string, unknown>): boolean {
  if (Object.keys(where).length === 0) return true;
  return JSON.stringify(where).includes('siteId');
}
