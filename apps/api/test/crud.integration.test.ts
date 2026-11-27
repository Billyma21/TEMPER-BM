/**
 * Preuve du gabarit : pour chaque ressource exposée, un accès refusé et un accès autorisé.
 * Base temper_test migrée et seedée. Les comptes sont ceux de Maison Aurum.
 * MAAYOUD
 */
import 'reflect-metadata';
import { randomUUID } from 'node:crypto';
import { execSync } from 'node:child_process';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { type INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { createPrismaClient, type Db } from '@temper/db';
import type { SubjectName } from '@temper/permissions';
import { Client } from 'pg';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { CRUD_SUBJECTS } from '../src/crud/resource-meta.js';
import { resourcePath } from '../src/crud/routes.js';
import { badgeUidHash, sha256 } from '../src/common/crypto.js';
import type { AccessService } from '../src/permissions/access.service.js';
import type { Principal } from '../src/permissions/principal.js';

const TEST_URL = 'postgresql://temper:temper@localhost:5432/temper_test?schema=public';
const ADMIN_URL = 'postgresql://temper:temper@localhost:5432/temper';
const PASSWORD = 'Temper!2026';
const ROOT = resolve(fileURLToPath(new URL('.', import.meta.url)), '../../..');

process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = TEST_URL;
process.env.REDIS_URL = process.env.REDIS_URL ?? 'redis://localhost:6379';
process.env.SESSION_SECRET = 'test-session-secret-0123456789';
process.env.FIELD_ENCRYPTION_KEY = 'test-field-key-0123456789';
process.env.BADGE_UID_PEPPER = 'test-pepper-0123456789';
process.env.AUTH_DEV_MFA_BYPASS = 'true';
process.env.WEB_PUBLIC_URL = 'http://localhost:3000';
process.env.SESSION_COOKIE = 'temper_session';

const ACTORS = [
  'secours@maison-aurum.test',
  'noa.lefevre@maison-aurum.test',
  'emma.janssens@maison-aurum.test',
  'tech@frigotech.test',
  'audit@certif-food.test',
] as const;

interface Actor {
  email: string;
  id: string;
  employeeId: string | null;
  cookie: string;
  principal: Principal;
}

let app: INestApplication;
let server: ReturnType<INestApplication['getHttpServer']>;
let db: Db;
let actors: Actor[];
let access: AccessService;

async function ensureDatabase() {
  const client = new Client({ connectionString: ADMIN_URL });
  await client.connect();
  try {
    const found = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', ['temper_test']);
    if (!found.rowCount) await client.query('CREATE DATABASE temper_test OWNER temper');
  } finally {
    await client.end();
  }
  const env = { ...process.env, DATABASE_URL: TEST_URL };
  execSync('corepack pnpm --filter @temper/db generate', { cwd: ROOT, env, stdio: 'inherit' });
  execSync('corepack pnpm --filter @temper/db migrate:deploy', { cwd: ROOT, env, stdio: 'inherit' });
  execSync('corepack pnpm --filter @temper/db seed', { cwd: ROOT, env, stdio: 'inherit' });
}

async function login(email: string): Promise<string> {
  const res = await request(server).post('/api/v1/auth/login').send({ email, password: PASSWORD });
  expect(res.status, `${email} ${JSON.stringify(res.body)}`).toBe(200);
  const raw = res.headers['set-cookie'];
  const header = Array.isArray(raw) ? raw.join(';') : (raw ?? '');
  const token = /temper_session=([^;]+)/.exec(header)?.[1];
  expect(token, email).toBeTruthy();
  return `temper_session=${token}`;
}

describe('Gabarit CRUD', () => {
  beforeAll(async () => {
    await ensureDatabase();
    const { AppModule } = await import('../src/app.module.js');
    const { default: cookieParser } = await import('cookie-parser');
    db = createPrismaClient({ url: TEST_URL });
    const compiled = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = compiled.createNestApplication();
    app.use(cookieParser());
    app.setGlobalPrefix('api/v1', { exclude: ['health'] });
    await app.init();
    server = app.getHttpServer();
    access = app.get((await import('../src/permissions/access.service.js')).AccessService);

    actors = [];
    for (const email of ACTORS) {
      const user = await db.user.findUniqueOrThrow({ where: { email }, select: { id: true, employeeId: true } });
      const principal = await access.forUser(user.id, true);
      if (!principal) throw new Error(`Principal introuvable : ${email}`);
      actors.push({ email, id: user.id, employeeId: user.employeeId, cookie: await login(email), principal });
    }
  }, 300_000);

  afterAll(async () => {
    await app?.close();
    await db?.$disconnect();
  });

  it('répond 401 en néerlandais et renvoie l identifiant de requête', async () => {
    const res = await request(server)
      .get('/api/v1/organisation/companies')
      .set('Accept-Language', 'nl')
      .set('X-Request-Id', 'req-test-12345678');
    expect(res.status).toBe(401);
    expect(res.body).toMatchObject({
      code: 'UNAUTHENTICATED',
      message: 'Authenticatie vereist',
      details: null,
      requestId: 'req-test-12345678',
    });
    expect(res.headers['x-request-id']).toBe('req-test-12345678');
  });

  it('cherche une société par trigramme et exporte le CSV', async () => {
    const secours = actors.find((actor) => actor.email.startsWith('secours'));
    expect(secours).toBeTruthy();
    const found = await request(server).get('/api/v1/organisation/companies?q=Aurum').set('Cookie', secours!.cookie);
    expect(found.status).toBe(200);
    expect(found.body.total).toBeGreaterThan(0);
    const indexes = await db.$queryRawUnsafe<Array<{ indexname: string }>>(`SELECT indexname FROM pg_indexes WHERE indexname LIKE 'trgm_%'`);
    expect(indexes.length).toBeGreaterThan(10);

    const csv = await request(server).get('/api/v1/organisation/companies/export').set('Cookie', secours!.cookie);
    expect(csv.status).toBe(200);
    expect(csv.headers['content-type']).toContain('text/csv');
    expect(csv.text).toContain('legalName');

    const tech = actors.find((actor) => actor.email.startsWith('tech'));
    const refused = await request(server).get('/api/v1/organisation/companies/export').set('Cookie', tech!.cookie);
    expect(refused.status).toBe(403);
  });

  it('refuse la modification d un pointage, même au super administrateur', async () => {
    const secours = actors.find((actor) => actor.email.startsWith('secours'));
    const res = await request(server)
      .patch('/api/v1/temps/time-entries/00000000-0000-7000-8000-000000000001')
      .set('Cookie', secours!.cookie)
      .send({});
    expect(res.status).toBe(403);
    expect(res.body.code).toBe('IMMUTABLE');
  });

  it('ne laisse pas fuir la paie d un collègue', async () => {
    const noa = actors.find((actor) => actor.email.startsWith('noa'));
    const tech = actors.find((actor) => actor.email.startsWith('tech'));
    expect(noa?.employeeId).toBeTruthy();

    const collection = await request(server).get('/api/v1/rh/employee-payrolls?pageSize=100').set('Cookie', tech!.cookie);
    expect(collection.status).toBe(403);
    expect(JSON.stringify(collection.body)).not.toContain('grossMonthly');

    const own = await request(server).get('/api/v1/rh/employee-payrolls?pageSize=100').set('Cookie', noa!.cookie);
    expect(own.status).toBe(200);
    for (const row of own.body.items as Array<{ employeeId: string }>) {
      expect(row.employeeId).toBe(noa!.employeeId);
    }

    const emma = actors.find((actor) => actor.email.startsWith('emma'));
    let foreign = await db.employeePayroll.findFirst({
      where: { employeeId: { not: noa!.employeeId! } },
      select: { id: true },
    });
    if (!foreign && emma?.employeeId) {
      const employee = await db.employee.findUniqueOrThrow({
        where: { id: emma.employeeId },
        select: { siteId: true, departmentId: true },
      });
      foreign = await db.employeePayroll.create({
        data: {
          employeeId: emma.employeeId,
          siteId: employee.siteId,
          departmentId: employee.departmentId,
          grossMonthly: '3210.50',
        },
        select: { id: true },
      });
    }
    expect(foreign).toBeTruthy();
    const hidden = await request(server).get(`/api/v1/rh/employee-payrolls/${foreign!.id}`).set('Cookie', noa!.cookie);
    expect(hidden.status).toBe(403);
    expect(hidden.body.grossMonthly).toBeUndefined();
    expect(JSON.stringify(hidden.body)).not.toContain('ibanEnc');
  });

  it('limite l annuaire aux champs publics pour les collègues', async () => {
    const emma = actors.find((actor) => actor.email.startsWith('emma'));
    const res = await request(server).get('/api/v1/rh/employees?pageSize=100').set('Cookie', emma!.cookie);
    expect(res.status).toBe(200);
    const items = res.body.items as Array<Record<string, unknown>>;
    const others = items.filter((item) => item.id !== emma!.employeeId);
    expect(others.length).toBeGreaterThan(0);
    for (const row of others) {
      expect(row.firstName).toBeTruthy();
      expect(row.personalEmail).toBeUndefined();
      expect(row.address).toBeUndefined();
    }
  });

  it('invalide le cache des droits', async () => {
    const emma = actors.find((actor) => actor.email.startsWith('emma'));
    const { Redis } = await import('ioredis');
    const redis = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379', { maxRetriesPerRequest: 1, connectTimeout: 1000 });
    try {
      const before = Number((await redis.get(`temper:accessver:${emma!.id}`)) ?? '0');
      await access.invalidate(emma!.id);
      const after = Number((await redis.get(`temper:accessver:${emma!.id}`)) ?? '0');
      expect(after).toBeGreaterThan(before);
      const keys = await redis.keys('temper:access:*');
      expect(keys.length).toBeGreaterThan(0);
    } finally {
      await redis.quit();
    }
  });

  it('crée une société puis la refuse à l opératrice', async () => {
    const secours = actors.find((actor) => actor.email.startsWith('secours'));
    const emma = actors.find((actor) => actor.email.startsWith('emma'));
    const suffix = Date.now().toString().slice(-8);
    const created = await request(server).post('/api/v1/organisation/companies').set('Cookie', secours!.cookie).send({
      legalName: 'Atelier Test SPRL',
      tradeName: 'Atelier Test',
      vatNumber: `BE${suffix}`,
      address: { street: 'Rue du Test 1', zip: '1000', city: 'Bruxelles', country: 'BE' },
    });
    expect(created.status, JSON.stringify(created.body)).toBe(201);
    expect(created.body.legalName).toBe('Atelier Test SPRL');

    const refused = await request(server).post('/api/v1/organisation/companies').set('Cookie', emma!.cookie).send({
      legalName: 'Interdit',
      tradeName: 'Interdit',
      vatNumber: 'BE0123456750',
      address: { city: 'Bruxelles' },
    });
    expect(refused.status).toBe(403);

    const audit = await request(server).get(`/api/v1/organisation/companies/${created.body.id}/audit`).set('Cookie', secours!.cookie);
    expect(audit.status).toBe(200);
    expect(audit.body.items.length).toBeGreaterThan(0);
  });

  for (const subject of CRUD_SUBJECTS) {
    it(`${subject} : un cas autorisé et un cas refusé`, async () => {
      const url = `/api/v1/${resourcePath(subject as SubjectName)}`;
      const anon = await request(server).get(url);
      expect(anon.status).toBe(401);
      expect(anon.body.code).toBe('UNAUTHENTICATED');

      const reader = actors.find((actor) => actor.principal.ability.can('read', subject));
      expect(reader, `lecteur de ${subject}`).toBeTruthy();
      const ok = await request(server).get(url).set('Cookie', reader!.cookie);
      expect(ok.status, `${subject} ${reader!.email} ${JSON.stringify(ok.body)}`).toBe(200);
      expect(Array.isArray(ok.body.items)).toBe(true);
      const payload = JSON.stringify(ok.body);
      expect(payload).not.toContain('passwordHash');
      expect(payload).not.toContain('mfaSecretEnc');
      expect(payload).not.toContain('tokenHash');

      const blind = actors.find((actor) => !actor.principal.ability.can('read', subject));
      if (blind) {
        const denied = await request(server).get(url).set('Cookie', blind.cookie);
        expect(denied.status, `${subject} ${blind.email}`).toBe(403);
        return;
      }
      const noUpdate = actors.find((actor) => !actor.principal.ability.can('update', subject));
      if (noUpdate) {
        const denied = await request(server)
          .patch(`${url}/00000000-0000-7000-8000-000000000099`)
          .set('Cookie', noUpdate.cookie)
          .send({ name: 'refus' });
        expect(denied.status, `${subject} modification ${noUpdate.email} ${JSON.stringify(denied.body)}`).toBe(403);
        return;
      }
      const noCreate = actors.find((actor) => !actor.principal.ability.can('create', subject));
      if (noCreate) {
        const denied = await request(server).post(url).set('Cookie', noCreate.cookie).send({});
        expect(denied.status, `${subject} création ${noCreate.email} ${JSON.stringify(denied.body)}`).toBe(403);
        return;
      }
      const list = await request(server).get(`${url}?pageSize=5`).set('Cookie', reader!.cookie);
      const sample = (list.body.items as Array<{ id?: string }> | undefined)?.find((row) => row.id);
      expect(sample?.id, `aucune ligne pour prouver un refus sur ${subject}`).toBeTruthy();
      let refused = false;
      for (const actor of actors) {
        if (actor.id === reader!.id) continue;
        const one = await request(server).get(`${url}/${sample!.id}`).set('Cookie', actor.cookie);
        if (one.status === 403) {
          refused = true;
          break;
        }
      }
      expect(refused, subject).toBe(true);
    });
  }

  it('décrit les champs lisibles sans secret', async () => {
    const secours = actors.find((actor) => actor.email.startsWith('secours'));
    const meta = await request(server).get('/api/v1/organisation/companies/meta').set('Cookie', secours!.cookie);
    expect(meta.status).toBe(200);
    expect(meta.body.fields.some((field: { name: string }) => field.name === 'legalName')).toBe(true);
    expect(JSON.stringify(meta.body)).not.toContain('passwordHash');
  });

  it('liste les sessions et en révoque une autre', async () => {
    const emma = actors.find((actor) => actor.email.startsWith('emma'));
    const before = await request(server).get('/api/v1/auth/sessions').set('Cookie', emma!.cookie);
    const second = await login(emma!.email);
    const list = await request(server).get('/api/v1/auth/sessions').set('Cookie', emma!.cookie);
    expect(list.status).toBe(200);
    expect(list.body.items.some((row: { current: boolean }) => row.current)).toBe(true);
    expect(JSON.stringify(list.body)).not.toContain('tokenHash');
    const known = new Set((before.body.items as Array<{ id: string }>).map((row) => row.id));
    const other = (list.body.items as Array<{ id: string }>).find((row) => !known.has(row.id));
    expect(other).toBeTruthy();
    const revoked = await request(server).post(`/api/v1/auth/sessions/${other!.id}/revoke`).set('Cookie', emma!.cookie);
    expect(revoked.status).toBe(200);
    const dead = await request(server).get('/api/v1/auth/me').set('Cookie', second);
    expect(dead.status).toBe(401);
  });

  it('enrôle le TOTP et consomme un code de secours', async () => {
    const { totp } = await import('../src/auth/totp.js');
    const emma = actors.find((actor) => actor.email.startsWith('emma'));
    await db.user.update({ where: { id: emma!.id }, data: { mfaEnabled: false, mfaSecretEnc: null, recoveryCodesHash: [] } });
    const enrolled = await request(server).post('/api/v1/auth/mfa/enroll').set('Cookie', emma!.cookie);
    expect(enrolled.status, JSON.stringify(enrolled.body)).toBe(201);
    expect(enrolled.body.qrSvg).toContain('<svg');
    const confirmed = await request(server).post('/api/v1/auth/mfa/confirm').set('Cookie', emma!.cookie).send({ code: totp(enrolled.body.secret) });
    expect(confirmed.status, JSON.stringify(confirmed.body)).toBe(200);
    expect(confirmed.body.backupCodes).toHaveLength(8);
    const backup = confirmed.body.backupCodes[0] as string;
    const first = await request(server).post('/api/v1/auth/mfa/verify').set('Cookie', emma!.cookie).send({ code: backup });
    expect(first.status).toBe(200);
    const replay = await request(server).post('/api/v1/auth/mfa/verify').set('Cookie', emma!.cookie).send({ code: backup });
    expect(replay.status).toBe(401);
    await db.user.update({ where: { id: emma!.id }, data: { mfaEnabled: false, mfaSecretEnc: null, recoveryCodesHash: [] } });
  });

  it('refuse une demande à son auteur et l accepte au manager', async () => {
    const emma = actors.find((actor) => actor.email.startsWith('emma'));
    const marc = await db.user.findUniqueOrThrow({ where: { email: 'marc.dubois@maison-aurum.test' }, select: { id: true } });
    const marcCookie = await login('marc.dubois@maison-aurum.test');
    const own = await db.approvalRequest.create({
      data: {
        policy: 'LEAVE_REQUEST',
        subjectType: 'LeaveRequest',
        subjectId: '00000000-0000-7000-8000-000000000011',
        requesterUserId: marc.id,
        steps: [['MANAGER_EQUIPE']],
        status: 'PENDING',
      },
    });
    const self = await request(server).post(`/api/v1/approvals/${own.id}/decide`).set('Cookie', marcCookie).send({ decision: 'APPROVED' });
    expect(self.status).toBe(403);

    const anon = await request(server).get('/api/v1/approvals/inbox');
    expect(anon.status).toBe(401);
    const foreign = await db.approvalRequest.create({
      data: {
        policy: 'LEAVE_REQUEST',
        subjectType: 'LeaveRequest',
        subjectId: '00000000-0000-7000-8000-000000000012',
        requesterUserId: emma!.id,
        requesterEmployeeId: emma!.employeeId,
        steps: [['MANAGER_EQUIPE']],
        status: 'PENDING',
      },
    });
    const inbox = await request(server).get('/api/v1/approvals/inbox').set('Cookie', marcCookie);
    expect(inbox.status).toBe(200);
    expect(inbox.body.toDecide.some((row: { id: string }) => row.id === foreign.id)).toBe(true);
    const mine = await request(server).get('/api/v1/approvals/inbox').set('Cookie', emma!.cookie);
    expect(mine.body.toDecide.some((row: { id: string }) => row.id === foreign.id)).toBe(false);
    const decided = await request(server).post(`/api/v1/approvals/${foreign.id}/decide`).set('Cookie', marcCookie).send({ decision: 'APPROVED', comment: 'Accord' });
    expect(decided.status, JSON.stringify(decided.body)).toBe(200);
    expect(decided.body.status).toBe('APPROVED');
    const note = await db.notification.findFirst({ where: { userId: emma!.id, kind: 'APPROVAL' } });
    expect(note?.title).toBe('Demande acceptée');
  });

  it('prépare une clé WebAuthn et refuse une attestation vide', async () => {
    const secours = actors.find((actor) => actor.email.startsWith('secours'));
    const options = await request(server).post('/api/v1/auth/webauthn/register/options').set('Cookie', secours!.cookie);
    expect(options.status, JSON.stringify(options.body)).toBe(201);
    expect(typeof options.body.challenge).toBe('string');
    const refused = await request(server).post('/api/v1/auth/webauthn/register/verify').set('Cookie', secours!.cookie).send({
      id: 'aaaaaaaaaaaa',
      rawId: 'aaaaaaaaaaaa',
      type: 'public-key',
      response: { clientDataJSON: 'aaaaaaaa', attestationObject: 'aaaaaaaa' },
    });
    expect(refused.status).toBe(400);
  });

  it('publie l organigramme et refuse l auto-attribution', async () => {
    const secours = actors.find((actor) => actor.email.startsWith('secours'))!;
    const emma = actors.find((actor) => actor.email.startsWith('emma'))!;
    const chart = await request(server).get('/api/v1/organisation/chart').set('Cookie', secours.cookie);
    expect(chart.status, JSON.stringify(chart.body)).toBe(200);
    expect(chart.body.people.length).toBeGreaterThan(0);
    expect(chart.body.people[0].personalEmail).toBeUndefined();
    const oidc = await request(server).get('/api/v1/auth/oidc');
    expect(oidc.status).toBe(200);
    expect(oidc.body.enabled).toBe(false);
    const self = await request(server).post('/api/v1/people/roles').set('Cookie', secours.cookie).send({ userId: secours.id, role: 'EMPLOYE' });
    expect(self.status).toBe(403);
    expect(self.body.details.reason).toBe('SELF');
    await db.employee.update({ where: { id: emma.employeeId! }, data: { employmentType: 'STUDENT', status: 'ACTIVE', endDate: null } });
    const student = await request(server).post('/api/v1/people/roles').set('Cookie', secours.cookie).send({ userId: emma.id, role: 'MAGASINIER' });
    expect(student.status, JSON.stringify(student.body)).toBe(400);
    expect(student.body.details.field).toBe('validUntil');
    await db.employee.update({ where: { id: emma.employeeId! }, data: { employmentType: 'PERMANENT' } });
    const sensitive = await request(server).post('/api/v1/people/roles').set('Cookie', secours.cookie).send({ userId: emma.id, role: 'ADMIN_IT' });
    expect(sensitive.status, JSON.stringify(sensitive.body)).toBe(201);
    expect(sensitive.body.pending).toBe(true);
    const arrival = await request(server).post(`/api/v1/people/employees/${emma.employeeId}/onboarding`).set('Cookie', secours.cookie);
    expect(arrival.status, JSON.stringify(arrival.body)).toBe(201);
    expect(arrival.body.checklist.some((step: { key: string }) => step.key === 'training:FOOD_HYGIENE')).toBe(true);
  });

  it('refuse le sas sans formation, signale le manager, puis un badge perdu', async () => {
    const secours = actors.find((actor) => actor.email.startsWith('secours'))!;
    const emma = actors.find((actor) => actor.email.startsWith('emma'))!;
    const zone = await db.accessZone.findFirstOrThrow({ where: { code: 'PROD' } });
    const marc = await db.employee.findFirstOrThrow({ where: { workEmail: 'marc.dubois@maison-aurum.test' } });
    const future = new Date(Date.now() + 30 * 86400_000);
    await db.employee.update({ where: { id: emma.employeeId! }, data: { status: 'ACTIVE', endDate: null, managerId: marc.id } });
    const refreshed = await db.training.updateMany({
      where: { employeeId: emma.employeeId!, type: 'FOOD_HYGIENE' },
      data: { status: 'COMPLETED', validUntil: future },
    });
    if (!refreshed.count) {
      await db.training.create({
        data: { employeeId: emma.employeeId!, siteId: zone.siteId, type: 'FOOD_HYGIENE', title: 'Formation FOOD_HYGIENE', status: 'COMPLETED', validUntil: future },
      });
    }
    const secret = 'lecteur-sprint3';
    const device = await db.device.create({
      data: {
        siteId: zone.siteId,
        accessZoneId: zone.id,
        kind: 'BADGE_READER',
        name: 'Lecteur test sas',
        serial: `READER-S3-${Date.now()}`,
        secretHash: sha256(secret),
        status: 'ACTIVE',
      },
    });
    const uid = `04A1${Date.now().toString(16).slice(-8).toUpperCase().padStart(8, 'A')}B2C3`;
    const badge = await db.badge.create({
      data: {
        holderEmployeeId: emma.employeeId!,
        siteId: zone.siteId,
        uidHash: badgeUidHash(uid, process.env.BADGE_UID_PEPPER ?? ''),
        uidLast4: '0003',
        technology: 'MIFARE_DESFIRE',
        kind: 'PERMANENT',
        status: 'ACTIVE',
        issuedById: 'test',
      },
    });
    const auth = `Device ${device.id}.${secret}`;
    const ppe = ['charlotte', 'blouse', 'chaussures de sécurité'];
    const asUser = await request(server).post('/api/v1/access/decide').set('Cookie', secours.cookie).send({ badgeUid: uid, direction: 'IN', wornPpe: ppe });
    expect(asUser.status).toBe(403);
    await request(server).post('/api/v1/access/decide').set('Authorization', auth).send({ badgeUid: uid, direction: 'OUT', wornPpe: ppe });
    const granted = await request(server).post('/api/v1/access/decide').set('Authorization', auth).send({ badgeUid: uid, direction: 'IN', wornPpe: ppe });
    expect(granted.status, JSON.stringify(granted.body)).toBe(200);
    expect(granted.body.result).toBe('GRANTED');
    const twice = await request(server).post('/api/v1/access/decide').set('Authorization', auth).send({ badgeUid: uid, direction: 'IN', wornPpe: ppe });
    expect(twice.body.denyReason).toBe('ANTI_PASSBACK');
    const roll = await request(server).get('/api/v1/access/evacuation').set('Cookie', secours.cookie);
    expect(roll.status, JSON.stringify(roll.body)).toBe(200);
    expect(JSON.stringify(roll.body)).toContain('Emma Janssens');
    const hidden = await request(server).get('/api/v1/access/evacuation').set('Cookie', emma.cookie);
    expect(hidden.status).toBe(403);
    await db.training.updateMany({ where: { employeeId: emma.employeeId!, type: 'FOOD_HYGIENE' }, data: { validUntil: new Date('2020-01-01') } });
    await request(server).post('/api/v1/access/decide').set('Authorization', auth).send({ badgeUid: uid, direction: 'OUT', wornPpe: ppe });
    const expired = await request(server).post('/api/v1/access/decide').set('Authorization', auth).send({ badgeUid: uid, direction: 'IN', wornPpe: ppe });
    expect(expired.body.denyReason).toBe('TRAINING_EXPIRED');
    const marcUser = await db.user.findFirstOrThrow({ where: { employeeId: marc.id } });
    const note = await db.notification.findFirst({ where: { userId: marcUser.id, title: 'Formation expirée' } });
    expect(note).toBeTruthy();
    await db.badge.update({ where: { id: badge.id }, data: { status: 'LOST' } });
    const lost = await request(server).post('/api/v1/access/decide').set('Authorization', auth).send({ badgeUid: uid, direction: 'IN', wornPpe: ppe });
    expect(lost.body.denyReason).toBe('BADGE_INACTIVE');
    const alert = await db.notification.findFirst({ where: { title: 'Badge inactif présenté' } });
    expect(alert).toBeTruthy();
  });

  it('publie la rotation, calcule la journée et n altère pas le pointage brut', async () => {
    const secours = actors.find((actor) => actor.email.startsWith('secours'))!;
    const emma = actors.find((actor) => actor.email.startsWith('emma'))!;
    const refused = await request(server).post('/api/v1/time/schedules/rotation').set('Cookie', emma.cookie).send({ weekStart: '2027-01-04' });
    expect(refused.status).toBe(403);
    const published = await request(server).post('/api/v1/time/schedules/rotation').set('Cookie', secours.cookie).send({ weekStart: '2027-01-04' });
    expect(published.status, JSON.stringify(published.body)).toBe(201);
    const team = await db.team.findFirstOrThrow({ where: { code: 'PROD-A' } });
    const week = await request(server).get(`/api/v1/time/schedules/week?teamId=${team.id}&from=2027-01-04`).set('Cookie', secours.cookie);
    expect(week.status).toBe(200);
    expect(week.body.items.length).toBeGreaterThan(0);

    const { brusselsInstant } = await import('../src/time/calendar.js');
    const day = new Date('2026-03-03T00:00:00.000Z');
    const employee = await db.employee.findUniqueOrThrow({ where: { id: emma.employeeId! } });
    const planned = await db.schedule.findFirst({ where: { employeeId: employee.id, date: day } });
    if (!planned) {
      await db.schedule.create({
        data: {
          employeeId: employee.id,
          siteId: employee.siteId,
          departmentId: employee.departmentId,
          teamId: employee.teamId,
          date: day,
          plannedStart: brusselsInstant('2026-03-03', '06:00'),
          plannedEnd: brusselsInstant('2026-03-03', '14:00'),
          plannedBreakMin: 30,
          status: 'PUBLISHED',
          createdById: 'test',
        },
      });
    }
    const boundsStart = brusselsInstant('2026-03-03', '00:00');
    const boundsEnd = brusselsInstant('2026-03-04', '00:00');
    const punches = await db.timeEntry.count({ where: { employeeId: employee.id, at: { gte: boundsStart, lt: boundsEnd } } });
    if (!punches) {
      await db.timeEntry.create({
        data: { employeeId: employee.id, siteId: employee.siteId, departmentId: employee.departmentId, teamId: employee.teamId, at: brusselsInstant('2026-03-03', '06:05'), kind: 'IN', source: 'BADGE', clientEventId: `s4-in-${employee.id}` },
      });
      await db.timeEntry.create({
        data: { employeeId: employee.id, siteId: employee.siteId, departmentId: employee.departmentId, teamId: employee.teamId, at: brusselsInstant('2026-03-03', '14:00'), kind: 'OUT', source: 'BADGE', clientEventId: `s4-out-${employee.id}` },
      });
    }
    const other = await db.employee.findFirstOrThrow({ where: { team: { code: 'PROD-B' }, status: 'ACTIVE', id: { not: employee.id } } });
    const otherPlan = await db.schedule.findFirst({ where: { employeeId: other.id, date: day } });
    if (!otherPlan) {
      await db.schedule.create({
        data: {
          employeeId: other.id,
          siteId: other.siteId,
          departmentId: other.departmentId,
          teamId: other.teamId,
          date: day,
          plannedStart: brusselsInstant('2026-03-03', '14:00'),
          plannedEnd: brusselsInstant('2026-03-03', '22:00'),
          status: 'PUBLISHED',
          createdById: 'test',
        },
      });
    }
    const closed = await request(server).post('/api/v1/time/days/close').set('Cookie', secours.cookie).send({ date: '2026-03-03' });
    expect(closed.status, JSON.stringify(closed.body)).toBe(200);
    const mine = await db.dailyAttendance.findUniqueOrThrow({ where: { employeeId_date: { employeeId: employee.id, date: day } } });
    expect(mine.workedMinutes).toBeGreaterThan(400);
    expect(mine.lateMinutes).toBeGreaterThanOrEqual(5);
    expect(mine.anomalies).not.toContain('MISSING_OUT');
    const absent = await db.dailyAttendance.findUniqueOrThrow({ where: { employeeId_date: { employeeId: other.id, date: day } } });
    expect(absent.anomalies).toContain('ABSENT');

    const before = await db.timeEntry.count({ where: { employeeId: employee.id } });
    const correction = await request(server).post('/api/v1/time/corrections').set('Cookie', emma.cookie).send({
      employeeId: employee.id,
      date: '2026-03-02',
      kind: 'ADD',
      proposedAt: '2026-03-02T16:00:00.000Z',
      proposedKind: 'OUT',
      reason: 'Oubli de badge en fin de poste',
    });
    expect(correction.status, JSON.stringify(correction.body)).toBe(201);
    expect(await db.timeEntry.count({ where: { employeeId: employee.id } })).toBe(before);
    const marcCookie = await login('marc.dubois@maison-aurum.test');
    const decided = await request(server).post(`/api/v1/approvals/${correction.body.requestId}/decide`).set('Cookie', marcCookie).send({ decision: 'APPROVED', comment: 'Oubli confirmé' });
    expect(decided.status, JSON.stringify(decided.body)).toBe(200);
    const added = await db.timeEntry.findUniqueOrThrow({ where: { clientEventId: `correction-${correction.body.id}` } });
    expect(added.source).toBe('IMPORT');

    const type = await db.leaveType.findFirstOrThrow({ where: { code: 'LEGAL_HOLIDAY' } });
    await db.leaveBalance.updateMany({ where: { employeeId: employee.id, leaveTypeId: type.id, year: 2026 }, data: { plannedDays: 0, takenDays: 0 } });
    const leave = await request(server).post('/api/v1/time/leave').set('Cookie', emma.cookie).send({ leaveTypeId: type.id, startDate: '2026-12-07', endDate: '2026-12-07' });
    expect(leave.status, JSON.stringify(leave.body)).toBe(201);
    expect(Number(leave.body.days)).toBe(1);
    const leaveDecision = await request(server).post(`/api/v1/approvals/${leave.body.requestId}/decide`).set('Cookie', marcCookie).send({ decision: 'APPROVED' });
    expect(leaveDecision.body.status).toBe('APPROVED');

    const absence = await request(server).post('/api/v1/time/absences').set('Cookie', emma.cookie).send({
      type: 'SICKNESS',
      startDate: '2026-04-01',
      endDate: '2026-04-02',
      certificateKey: 'certificats/emma-2026-04.pdf',
    });
    expect(absence.status, JSON.stringify(absence.body)).toBe(201);
    const storedAbsence = await db.absence.findUniqueOrThrow({ where: { id: absence.body.id } });
    expect(storedAbsence.type).toBe('SICKNESS');
    expect(storedAbsence.comment).toBeNull();
  });

  it('tient le p95 du pointage sous 300 ms et alerte un capteur chaud', async () => {
    const secours = actors.find((actor) => actor.email.startsWith('secours'))!;
    const emma = actors.find((actor) => actor.email.startsWith('emma'))!;
    const zone = await db.accessZone.findFirstOrThrow({ where: { code: 'ACCUEIL' } });
    const secret = 'capteur-sprint4';
    const sensor = await db.device.create({
      data: { siteId: zone.siteId, kind: 'ENV_SENSOR', name: 'Capteur test', serial: `SENSOR-S4-${Date.now()}`, secretHash: sha256(secret), status: 'ACTIVE' },
    });
    const hot = await request(server).post('/api/v1/time/sensors').set('Authorization', `Device ${sensor.id}.${secret}`).send({ temperatureC: 21.5, humidityPct: 55 });
    expect(hot.status, JSON.stringify(hot.body)).toBe(200);
    expect(hot.body.alert).toBe(true);
    const asUser = await request(server).post('/api/v1/time/sensors').set('Cookie', secours.cookie).send({ temperatureC: 16 });
    expect(asUser.status).toBe(403);

    const employee = await db.employee.findUniqueOrThrow({ where: { id: emma.employeeId! } });
    const badgeSecret = `04S4${Date.now().toString(16).slice(-6).toUpperCase()}B2`;
    await db.badge.create({
      data: {
        holderEmployeeId: employee.id,
        siteId: employee.siteId,
        uidHash: badgeUidHash(badgeSecret, process.env.BADGE_UID_PEPPER ?? ''),
        uidLast4: '4404',
        technology: 'MIFARE_DESFIRE',
        kind: 'PERMANENT',
        status: 'ACTIVE',
        issuedById: 'test',
      },
    });
    const readerSecret = 'lecteur-sprint4';
    const reader = await db.device.create({
      data: { siteId: zone.siteId, accessZoneId: zone.id, kind: 'CLOCK_KIOSK', name: 'Borne test charge', serial: `KIOSK-S4-${Date.now()}`, secretHash: sha256(readerSecret), status: 'ACTIVE' },
    });
    const durations: number[] = [];
    for (let index = 0; index < 22; index += 1) {
      const started = performance.now();
      const scan = await request(server)
        .post('/api/v1/time/kiosk/scan')
        .set('Authorization', `Device ${reader.id}.${readerSecret}`)
        .send({
          badgeUid: badgeSecret,
          clientEventId: randomUUID(),
          kind: index % 2 === 0 ? 'IN' : 'OUT',
        });
      durations.push(performance.now() - started);
      expect(scan.status, JSON.stringify(scan.body)).toBe(200);
      expect(scan.body.ok).toBe(true);
    }
    durations.sort((a, b) => a - b);
    const p95 = durations[Math.ceil(durations.length * 0.95) - 1] ?? durations.at(-1)!;
    expect(p95).toBeLessThan(300);
  });

  it('accueille un visiteur puis clôture un départ', async () => {
    const secours = actors.find((actor) => actor.email.startsWith('secours'))!;
    const emma = actors.find((actor) => actor.email.startsWith('emma'))!;
    const employee = await db.employee.findUniqueOrThrow({ where: { id: emma.employeeId! } });
    const visitor = await db.visitor.create({
      data: {
        siteId: employee.siteId,
        hostEmployeeId: employee.id,
        firstName: 'Léa',
        lastName: `Visite${Date.now().toString().slice(-4)}`,
        purpose: 'Audit client',
        expectedAt: new Date(),
        retentionUntil: new Date(Date.now() + 90 * 86400_000),
      },
    });
    const arrived = await request(server).post(`/api/v1/access/visitors/${visitor.id}/arrive`).set('Cookie', secours.cookie).send({ safetyBriefing: true, hygieneDeclared: true });
    expect(arrived.status, JSON.stringify(arrived.body)).toBe(200);
    expect(arrived.body.uidLast4).toHaveLength(4);
    const stored = await db.badge.findUniqueOrThrow({ where: { id: arrived.body.badgeId } });
    expect(stored.uidHash).toHaveLength(64);
    expect(stored.uidHash).not.toBe(arrived.body.uid);
    await db.employee.update({ where: { id: employee.id }, data: { status: 'ACTIVE', endDate: new Date('2020-01-01') } });
    const closed = await request(server).post('/api/v1/people/offboarding/run').set('Cookie', secours.cookie);
    expect(closed.status, JSON.stringify(closed.body)).toBe(200);
    expect(closed.body.processed).toBeGreaterThan(0);
    const after = await db.employee.findUniqueOrThrow({ where: { id: employee.id } });
    expect(after.status).toBe('LEFT');
    const badges = await db.badge.findMany({ where: { holderEmployeeId: employee.id } });
    expect(badges.every((row) => row.status === 'RETURNED')).toBe(true);
    const session = await db.session.findFirst({ where: { userId: emma.id, revokedAt: null } });
    expect(session).toBeNull();
    const denied = await request(server).post('/api/v1/people/offboarding/run').set('Cookie', emma.cookie);
    expect(denied.status).toBe(401);
    await db.employee.update({ where: { id: employee.id }, data: { status: 'ACTIVE', endDate: null, employmentType: 'PERMANENT' } });
    await db.roleAssignment.updateMany({
      where: { userId: emma.id, revokedById: 'offboarding', role: 'OPERATEUR' },
      data: { revokedAt: null, revokedById: null },
    });
  });
});
