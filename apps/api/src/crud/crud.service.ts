/**
 * Gabarit de persistance : liste, détail, création, modification, export, historique.
 * Le filtre de lignes vient des droits. Le filtre de colonnes est revérifié sur chaque objet.
 * Les secrets d authentification ne sont jamais lus.
 * MAAYOUD
 */
import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import {
  type Action,
  type SubjectName,
  asSubject,
  prismaWhere,
  subjectDef,
} from '@temper/permissions';
import { AuditService } from '../audit/audit.service.js';
import { AccessService } from '../permissions/access.service.js';
import { assertCan, type Principal } from '../permissions/principal.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { type FieldMeta, type ResourceMeta, resourceMeta } from './resource-meta.js';
import type { NormalizedQuery } from './query.js';

const SERVER_FIELDS = new Set(['id', 'createdAt', 'updatedAt']);
const USER_ACTORS = ['createdById', 'ownerUserId', 'requesterUserId'];
const EMPLOYEE_ACTORS = [
  'createdByEmployeeId',
  'requestedByEmployeeId',
  'reportedByEmployeeId',
  'performedByEmployeeId',
  'ownerEmployeeId',
  'salesRepEmployeeId',
  'buyerEmployeeId',
  'cashierEmployeeId',
  'driverEmployeeId',
  'assigneeEmployeeId',
  'assignedToEmployeeId',
  'hostEmployeeId',
];
const EXPORT_CAP = 5000;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface Delegate {
  findMany: (args: Record<string, unknown>) => Promise<unknown[]>;
  findFirst: (args: Record<string, unknown>) => Promise<unknown | null>;
  count: (args: Record<string, unknown>) => Promise<number>;
  create: (args: Record<string, unknown>) => Promise<unknown>;
  update: (args: Record<string, unknown>) => Promise<unknown>;
}

function andWhere(parts: Array<Record<string, unknown> | null | undefined>): Record<string, unknown> {
  const real = parts.filter((part): part is Record<string, unknown> => !!part && Object.keys(part).length > 0);
  if (real.length === 0) return {};
  if (real.length === 1) return real[0] ?? {};
  return { AND: real };
}

function selectOf(meta: ResourceMeta): Record<string, true> {
  const select: Record<string, true> = {};
  for (const field of meta.fields) {
    if (field.secret || field.kind === 'bytes') continue;
    select[field.name] = true;
  }
  select.id = true;
  return select;
}

function serialize(value: unknown): unknown {
  if (value === null || value === undefined) return value;
  if (typeof value === 'bigint') return value.toString();
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(serialize);
  if (typeof value === 'object') {
    const name = (value as object).constructor?.name;
    if (name === 'Decimal') return (value as { toString(): string }).toString();
  }
  return value;
}

function csvCell(value: unknown): string {
  if (value === null || value === undefined) return '';
  const text = typeof value === 'object' ? JSON.stringify(value) : String(value);
  if (/[;"\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

@Injectable()
export class CrudService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly access: AccessService,
  ) {}

  async list(p: Principal, subject: SubjectName, query: NormalizedQuery) {
    const meta = resourceMeta(subject);
    const where = andWhere([this.rights(p, 'read', subject), this.businessWhere(meta, query)]);
    const orderBy = this.orderBy(meta, query);
    const skip = (query.page - 1) * query.pageSize;
    const [rows, total] = await Promise.all([
      this.delegate(meta).findMany({ where, orderBy, skip, take: query.pageSize, select: selectOf(meta) }),
      this.delegate(meta).count({ where }),
    ]);
    return {
      items: (rows as Record<string, unknown>[]).map((row) => this.project(p, subject, row)),
      total,
      page: query.page,
      pageSize: query.pageSize,
    };
  }

  async get(p: Principal, subject: SubjectName, id: string) {
    const row = await this.findScoped(p, subject, id, 'read');
    return this.project(p, subject, row);
  }

  async create(p: Principal, subject: SubjectName, input: unknown, requestId?: string) {
    this.ensureMutable(subject, 'create');
    const meta = resourceMeta(subject);
    const data = this.parseWrite(meta, input, 'create', p);
    assertCan(p, 'create', subject, data);
    for (const key of Object.keys(data)) assertCan(p, 'create', subject, data, key);
    const created = (await this.delegate(meta).create({ data, select: selectOf(meta) })) as Record<string, unknown>;
    await this.audit.log({
      actorType: p.kind,
      actorId: p.id,
      action: 'create',
      subject,
      subjectId: String(created.id),
      siteId: this.siteOf(created, p),
      after: this.sanitize(meta, created),
      requestId: requestId ?? null,
    });
    await this.touchAccess(subject, null, created);
    return this.project(p, subject, created);
  }

  async update(p: Principal, subject: SubjectName, id: string, input: unknown, requestId?: string) {
    this.ensureMutable(subject, 'update');
    const meta = resourceMeta(subject);
    const existing = await this.findScoped(p, subject, id, 'update');
    const data = this.parseWrite(meta, input, 'update', p);
    if (Object.keys(data).length === 0) return this.project(p, subject, existing);
    assertCan(p, 'update', subject, existing);
    assertCan(p, 'update', subject, { ...existing, ...data });
    for (const key of Object.keys(data)) assertCan(p, 'update', subject, existing, key);
    const updated = (await this.delegate(meta).update({ where: { id }, data, select: selectOf(meta) })) as Record<string, unknown>;
    await this.audit.log({
      actorType: p.kind,
      actorId: p.id,
      action: 'update',
      subject,
      subjectId: id,
      siteId: this.siteOf(updated, p),
      before: this.sanitize(meta, existing),
      after: this.sanitize(meta, updated),
      requestId: requestId ?? null,
    });
    await this.touchAccess(subject, existing, updated);
    return this.project(p, subject, updated);
  }

  async exportCsv(p: Principal, subject: SubjectName, query: NormalizedQuery) {
    const meta = resourceMeta(subject);
    const where = andWhere([this.rights(p, 'export', subject), this.rights(p, 'read', subject), this.businessWhere(meta, query)]);
    const [rows, total] = await Promise.all([
      this.delegate(meta).findMany({
        where,
        orderBy: this.orderBy(meta, query),
        take: EXPORT_CAP,
        select: selectOf(meta),
      }),
      this.delegate(meta).count({ where }),
    ]);
    const projected = (rows as Record<string, unknown>[]).map((row) => this.project(p, subject, row));
    const headers = projected.length ? this.unionKeys(meta, projected) : this.headerFields(p, subject);
    const lines = [headers.join(';')];
    for (const row of projected) lines.push(headers.map((key) => csvCell(row[key])).join(';'));
    return { csv: `\uFEFF${lines.join('\n')}\n`, truncated: total > EXPORT_CAP };
  }

  /** Historique limité à l objet. Le contenu avant / après reste réservé aux lecteurs du journal. */
  async history(p: Principal, subject: SubjectName, id: string) {
    await this.findScoped(p, subject, id, 'read');
    const full = p.ability.can('read', 'AuditLog');
    const rows = await this.prisma.db.auditLog.findMany({
      where: { subject, subjectId: id },
      orderBy: { at: 'desc' },
      take: 100,
      select: {
        id: true,
        at: true,
        action: true,
        actorType: true,
        actorId: true,
        reason: true,
        requestId: true,
        breakGlass: true,
        ...(full ? { before: true, after: true } : {}),
      },
    });
    return {
      items: rows.map((row) => ({ ...row, at: row.at.toISOString() })),
    };
  }

  /** Champs que la personne peut lire ou écrire. Les secrets et les octets restent absents. */
  describe(p: Principal, subject: SubjectName) {
    const meta = resourceMeta(subject);
    const forbidden = new Set(subjectDef(subject).forbidden ?? []);
    const fields = meta.fields
      .filter((field) => !field.secret && field.kind !== 'bytes')
      .map((field) => ({
        name: field.name,
        kind: field.kind,
        optional: field.optional || field.hasDefault,
        read: p.ability.can('read', subject, field.name),
        create: !SERVER_FIELDS.has(field.name) && !forbidden.has('create') && p.ability.can('create', subject),
        update: !SERVER_FIELDS.has(field.name) && !forbidden.has('update') && p.ability.can('update', subject),
      }))
      .filter((field) => field.read || field.create || field.update);
    return { subject, label: subjectDef(subject).label, fields };
  }

  private rights(p: Principal, action: Action, subject: SubjectName): Record<string, unknown> {
    const where = prismaWhere(p.prismaRules, action, subject, { includeFieldRestricted: true });
    if (where === null) throw new ForbiddenException({ code: 'FORBIDDEN', action, subject });
    return where;
  }

  private ensureMutable(subject: SubjectName, action: Action) {
    const forbidden = subjectDef(subject).forbidden ?? [];
    if (forbidden.includes(action)) throw new ForbiddenException({ code: 'IMMUTABLE', action, subject });
  }

  private async findScoped(p: Principal, subject: SubjectName, id: string, action: Action): Promise<Record<string, unknown>> {
    if (!UUID.test(id)) throw new NotFoundException({ code: 'NOT_FOUND', subject, id });
    const meta = resourceMeta(subject);
    const select = selectOf(meta);
    const row = (await this.delegate(meta).findFirst({
      where: andWhere([this.rights(p, action, subject), { id }]),
      select,
    })) as Record<string, unknown> | null;
    if (row) return row;
    const exists = await this.delegate(meta).findFirst({ where: { id }, select: { id: true } });
    if (exists) throw new ForbiddenException({ code: 'FORBIDDEN', action, subject });
    throw new NotFoundException({ code: 'NOT_FOUND', subject, id });
  }

  /** Une ligne visible n expose que les champs autorisés pour CET objet. */
  private project(p: Principal, subject: SubjectName, row: Record<string, unknown>, action: Action = 'read') {
    const meta = resourceMeta(subject);
    const tagged = asSubject(subject, row);
    const out: Record<string, unknown> = {};
    for (const field of meta.fields) {
      if (field.secret || field.kind === 'bytes') continue;
      if (!(field.name in row)) continue;
      if (!p.ability.can(action, tagged, field.name)) continue;
      out[field.name] = serialize(row[field.name]);
    }
    return out;
  }

  private sanitize(meta: ResourceMeta, row: Record<string, unknown>) {
    const out: Record<string, unknown> = {};
    for (const field of meta.fields) {
      if (field.secret || field.kind === 'bytes' || !(field.name in row)) continue;
      out[field.name] = serialize(row[field.name]);
    }
    return out;
  }

  private headerFields(p: Principal, subject: SubjectName): string[] {
    return resourceMeta(subject)
      .fields.filter((field) => !field.secret && field.kind !== 'bytes' && p.ability.can('read', subject, field.name))
      .map((field) => field.name);
  }

  private unionKeys(meta: ResourceMeta, rows: Array<Record<string, unknown>>): string[] {
    const present = new Set<string>();
    for (const row of rows) for (const key of Object.keys(row)) present.add(key);
    const ordered = meta.fields.map((field) => field.name).filter((name) => present.has(name));
    return ordered.length ? ordered : ['id'];
  }

  private businessWhere(meta: ResourceMeta, query: NormalizedQuery): Record<string, unknown> {
    const parts: Record<string, unknown>[] = [];
    if (query.q && meta.search.length) {
      parts.push({ OR: meta.search.map((field) => ({ [field]: { contains: query.q, mode: 'insensitive' } })) });
    }
    for (const [key, value] of Object.entries(query.filters)) {
      const field = meta.fields.find((item) => item.name === key);
      if (!field || field.secret || field.kind === 'json' || field.kind === 'bytes') {
        throw new BadRequestException({ code: 'BAD_FILTER', field: key });
      }
      parts.push({ [key]: this.coerceFilter(field, value) });
    }
    return andWhere(parts);
  }

  private orderBy(meta: ResourceMeta, query: NormalizedQuery) {
    const sort = query.sort ?? meta.defaultSort;
    const field = meta.fields.find((item) => item.name === sort);
    if (!field || field.secret || field.kind === 'json' || field.kind === 'bytes' || field.kind.endsWith('List')) {
      throw new BadRequestException({ code: 'BAD_SORT', field: sort });
    }
    return { [sort]: query.dir };
  }

  private parseWrite(meta: ResourceMeta, input: unknown, mode: 'create' | 'update', p: Principal): Record<string, unknown> {
    if (!input || typeof input !== 'object' || Array.isArray(input)) {
      throw new BadRequestException({ code: 'VALIDATION_ERROR', issues: [{ path: '', message: 'Objet JSON attendu' }] });
    }
    const source = input as Record<string, unknown>;
    const data: Record<string, unknown> = {};
    const rejected: string[] = [];
    for (const [key, value] of Object.entries(source)) {
      if (SERVER_FIELDS.has(key)) continue;
      const field = meta.fields.find((item) => item.name === key);
      if (!field || field.secret || field.kind === 'bytes' || key === 'deletedAt') {
        rejected.push(key);
        continue;
      }
      data[key] = this.coerceWrite(field, value);
    }
    if (rejected.length) {
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        issues: rejected.map((path) => ({ path, message: 'Champ non modifiable' })),
      });
    }
    if (mode === 'create') {
      this.fillActors(meta, data, p);
      const missing = meta.fields.filter(
        (field) =>
          !field.optional &&
          !field.hasDefault &&
          !field.secret &&
          field.kind !== 'bytes' &&
          !SERVER_FIELDS.has(field.name) &&
          !(field.name in data),
      );
      if (missing.length) {
        throw new BadRequestException({
          code: 'VALIDATION_ERROR',
          issues: missing.map((field) => ({ path: field.name, message: 'Champ requis' })),
        });
      }
    }
    return data;
  }

  /** L auteur et le site ne se choisissent pas : on les prend du principal quand ils manquent. */
  private fillActors(meta: ResourceMeta, data: Record<string, unknown>, p: Principal) {
    for (const name of USER_ACTORS) {
      if (this.requiredMissing(meta, data, name) && p.kind === 'USER') data[name] = p.id;
    }
    for (const name of EMPLOYEE_ACTORS) {
      if (this.requiredMissing(meta, data, name) && p.employee) data[name] = p.employee.id;
    }
    if (this.requiredMissing(meta, data, 'siteId') && p.employee?.siteId) data.siteId = p.employee.siteId;
    if (this.requiredMissing(meta, data, 'departmentId') && p.employee?.departmentId) data.departmentId = p.employee.departmentId;
    if (this.requiredMissing(meta, data, 'teamId') && p.employee?.teamId) data.teamId = p.employee.teamId;
  }

  private requiredMissing(meta: ResourceMeta, data: Record<string, unknown>, name: string) {
    const field = meta.fields.find((item) => item.name === name);
    return !!field && !field.optional && !field.hasDefault && data[name] === undefined;
  }

  private coerceFilter(field: FieldMeta, value: string): unknown {
    if (field.kind === 'bool') {
      if (value !== 'true' && value !== 'false') throw new BadRequestException({ code: 'BAD_FILTER', field: field.name });
      return value === 'true';
    }
    if (field.kind === 'int') {
      const parsed = Number(value);
      if (!Number.isInteger(parsed)) throw new BadRequestException({ code: 'BAD_FILTER', field: field.name });
      return parsed;
    }
    if (field.kind === 'datetime') {
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) throw new BadRequestException({ code: 'BAD_FILTER', field: field.name });
      return date;
    }
    if (field.kind === 'stringList' || field.kind === 'enumList') return { has: value };
    if (field.kind === 'intList') {
      const parsed = Number(value);
      if (!Number.isInteger(parsed)) throw new BadRequestException({ code: 'BAD_FILTER', field: field.name });
      return { has: parsed };
    }
    return value;
  }

  private coerceWrite(field: FieldMeta, value: unknown): unknown {
    if (value === null) {
      if (!field.optional) {
        throw new BadRequestException({ code: 'VALIDATION_ERROR', issues: [{ path: field.name, message: 'Valeur requise' }] });
      }
      return null;
    }
    if (field.kind === 'string' || field.kind === 'enum') {
      if (typeof value !== 'string') this.badType(field.name);
      return value;
    }
    if (field.kind === 'bool') {
      if (typeof value !== 'boolean') this.badType(field.name);
      return value;
    }
    if (field.kind === 'int' || field.kind === 'float') {
      if (typeof value !== 'number' || Number.isNaN(value)) this.badType(field.name);
      if (field.kind === 'int' && !Number.isInteger(value)) this.badType(field.name);
      return value;
    }
    if (field.kind === 'bigint' || field.kind === 'decimal') {
      if (typeof value !== 'string' && typeof value !== 'number') this.badType(field.name);
      return String(value);
    }
    if (field.kind === 'datetime') {
      if (typeof value !== 'string' && typeof value !== 'number') this.badType(field.name);
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) this.badType(field.name);
      return date;
    }
    if (field.kind === 'json') {
      if (typeof value === 'string') {
        try {
          return JSON.parse(value) as unknown;
        } catch {
          this.badType(field.name);
        }
      }
      if (typeof value !== 'object') this.badType(field.name);
      return value;
    }
    if (field.kind === 'stringList' || field.kind === 'enumList') {
      if (!Array.isArray(value) || value.some((item) => typeof item !== 'string')) this.badType(field.name);
      return value;
    }
    if (field.kind === 'intList') {
      if (!Array.isArray(value) || value.some((item) => typeof item !== 'number' || !Number.isInteger(item))) this.badType(field.name);
      return value;
    }
    this.badType(field.name);
  }

  private badType(path: string): never {
    throw new BadRequestException({ code: 'VALIDATION_ERROR', issues: [{ path, message: 'Type invalide' }] });
  }

  private siteOf(row: Record<string, unknown>, p: Principal): string | null {
    if (typeof row.siteId === 'string') return row.siteId;
    return p.employee?.siteId ?? null;
  }

  private async touchAccess(subject: SubjectName, before: Record<string, unknown> | null, after: Record<string, unknown>) {
    const userIds = new Set<string>();
    for (const row of [before, after]) {
      if (!row) continue;
      if (subject === 'User' && typeof row.id === 'string') userIds.add(row.id);
      if (subject === 'RoleAssignment' && typeof row.userId === 'string') userIds.add(row.userId);
    }
    for (const userId of userIds) await this.access.invalidate(userId);
    if (subject === 'Employee' && typeof after.id === 'string') await this.access.invalidateEmployee(after.id);
  }

  private delegate(meta: ResourceMeta): Delegate {
    const db = this.prisma.db as unknown as Record<string, Delegate>;
    const found = db[meta.delegate];
    if (!found) throw new Error(`Délégué Prisma absent : ${meta.delegate}`);
    return found;
  }
}
