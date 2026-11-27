/**
 * Preuve du gabarit : pour chaque ressource exposée, un accès refusé et un accès autorisé.
 * Base temper_test migrée et seedée. Les comptes sont ceux de Maison Aurum.
 * MAAYOUD
 */
import 'reflect-metadata';
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
});
