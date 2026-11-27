/**
 * Produit le descripteur des ressources tabulées (API) et la migration d index pg_trgm.
 * Usage : node scripts/emit-crud-meta.mjs
 * MAAYOUD
 */
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const schemaPath = resolve(root, 'packages/db/prisma/schema.prisma');
const catalogPath = resolve(root, 'packages/permissions/src/catalog.ts');
const schema = readFileSync(schemaPath, 'utf8');
const catalog = readFileSync(catalogPath, 'utf8');

const VIRTUAL = new Set(['World', 'WorldPresence']);
const SCALAR = new Set(['String', 'Boolean', 'Int', 'BigInt', 'Float', 'Decimal', 'DateTime', 'Json', 'Bytes']);
const SEARCH_PRIORITY = [
  'legalName',
  'tradeName',
  'name',
  'title',
  'firstName',
  'lastName',
  'code',
  'email',
  'reference',
  'number',
  'sku',
  'label',
  'description',
  'city',
  'jobTitle',
  'subject',
  'summary',
  'notes',
];

function subjectsFromCatalog() {
  const start = catalog.indexOf('export const SUBJECTS = {');
  const end = catalog.indexOf('} as const satisfies');
  const block = catalog.slice(start, end);
  const out = [];
  const re = /^ {2}(\w+):\s*\{[^}]*?module:\s*'(\w+)'/gm;
  for (const m of block.matchAll(re)) out.push({ name: m[1], module: m[2] });
  return out;
}

function parseSchema() {
  const lines = schema.split(/\r?\n/);
  const enums = new Set();
  const modelNames = new Set();
  for (const line of lines) {
    const e = /^enum (\w+)/.exec(line);
    if (e) enums.add(e[1]);
    const m = /^model (\w+)/.exec(line);
    if (m) modelNames.add(m[1]);
  }

  const models = new Map();
  for (let i = 0; i < lines.length; i++) {
    const header = /^model (\w+) \{/.exec(lines[i]);
    if (!header) continue;
    const name = header[1];
    const fields = [];
    let table = name;
    i++;
    for (; i < lines.length && !lines[i].startsWith('}'); i++) {
      const raw = lines[i].trim();
      if (!raw || raw.startsWith('//')) continue;
      if (raw.startsWith('@@')) {
        const mapped = /@@map\("([^"]+)"\)/.exec(raw);
        if (mapped) table = mapped[1];
        continue;
      }
      const fm = /^(\w+)\s+(\w+)(\[\])?(\?)?(.*)$/.exec(raw);
      if (!fm) continue;
      const [, fieldName, type, list, optional, rest] = fm;
      if (rest.includes('@relation') || modelNames.has(type)) continue;
      if (!SCALAR.has(type) && !enums.has(type)) continue;
      let kind = 'string';
      if (type === 'String') kind = list ? 'stringList' : 'string';
      else if (type === 'Int') kind = list ? 'intList' : 'int';
      else if (type === 'BigInt') kind = 'bigint';
      else if (type === 'Float') kind = 'float';
      else if (type === 'Decimal') kind = 'decimal';
      else if (type === 'Boolean') kind = 'bool';
      else if (type === 'DateTime') kind = 'datetime';
      else if (type === 'Json') kind = 'json';
      else if (type === 'Bytes') kind = 'bytes';
      else if (enums.has(type)) kind = list ? 'enumList' : 'enum';
      const column = /@map\("([^"]+)"\)/.exec(rest)?.[1] ?? fieldName;
      const secret = /password|tokenHash|secretHash|secretEnc|pinHash|uidHash|recoveryCodes|publicKey|credentialId/i.test(fieldName);
      fields.push({
        name: fieldName,
        column,
        kind,
        optional: Boolean(optional),
        hasDefault: /@default\(/.test(rest) || /@updatedAt/.test(rest),
        secret,
      });
    }
    models.set(name, { table, fields });
  }
  return models;
}

function quote(id) {
  return `"${id.replace(/"/g, '""')}"`;
}

function indexName(table, column) {
  const raw = `trgm_${table}_${column}`.toLowerCase().replace(/[^a-z0-9_]/g, '_');
  if (raw.length <= 63) return raw;
  const hash = createHash('sha256').update(raw).digest('hex').slice(0, 8);
  return `${raw.slice(0, 54)}_${hash}`;
}

const subjects = subjectsFromCatalog();
const models = parseSchema();
const resources = [];
const indexes = [];

for (const subject of subjects) {
  if (VIRTUAL.has(subject.name)) continue;
  const model = models.get(subject.name);
  if (!model) {
    console.error(`Sujet sans modèle Prisma : ${subject.name}`);
    process.exit(1);
  }
  const search = SEARCH_PRIORITY.filter((n) => model.fields.some((f) => f.name === n && f.kind === 'string' && !f.secret)).slice(0, 4);
  const defaultSort = ['createdAt', 'updatedAt', 'at', 'id'].find((n) => model.fields.some((f) => f.name === n)) ?? 'id';
  const delegate = subject.name[0].toLowerCase() + subject.name.slice(1);
  resources.push({
    subject: subject.name,
    module: subject.module,
    delegate,
    table: model.table,
    defaultSort,
    search,
    fields: model.fields,
  });
  for (const name of search) {
    const field = model.fields.find((f) => f.name === name);
    indexes.push({ table: model.table, column: field.column, index: indexName(model.table, field.column) });
  }
}

const metaPath = resolve(root, 'apps/api/src/crud/resource-meta.ts');
mkdirSync(dirname(metaPath), { recursive: true });
const body = resources
  .map((r) => {
    const fields = r.fields
      .map(
        (f) =>
          `      { name: '${f.name}', column: '${f.column}', kind: '${f.kind}', optional: ${f.optional}, hasDefault: ${f.hasDefault}, secret: ${f.secret} },`,
      )
      .join('\n');
    const search = r.search.map((s) => `'${s}'`).join(', ');
    return `  ${r.subject}: {\n    subject: '${r.subject}',\n    module: '${r.module}',\n    delegate: '${r.delegate}',\n    table: '${r.table}',\n    defaultSort: '${r.defaultSort}',\n    search: [${search}],\n    fields: [\n${fields}\n    ],\n  },`;
  })
  .join('\n');

const names = resources.map((r) => `'${r.subject}'`).join(', ');
const ts = `/**
 * Descripteur des ressources tabulées.
 * Produit par packages/db/scripts/emit-crud-meta.mjs. Ne pas éditer à la main.
 * MAAYOUD
 */
import type { ModuleKey, SubjectName } from '@temper/permissions';

export type FieldKind =
  | 'string'
  | 'stringList'
  | 'int'
  | 'intList'
  | 'bigint'
  | 'float'
  | 'decimal'
  | 'bool'
  | 'datetime'
  | 'json'
  | 'bytes'
  | 'enum'
  | 'enumList';

export interface FieldMeta {
  name: string;
  column: string;
  kind: FieldKind;
  optional: boolean;
  hasDefault: boolean;
  secret: boolean;
}

export interface ResourceMeta {
  subject: SubjectName;
  module: ModuleKey;
  /** Accesseur Prisma : db.<delegate> */
  delegate: string;
  table: string;
  defaultSort: string;
  /** Colonnes texte interrogées en ILIKE, accélérées par pg_trgm. */
  search: string[];
  fields: FieldMeta[];
}

export const RESOURCE_META: Record<string, ResourceMeta> = {
${body}
};

export const CRUD_SUBJECTS = [${names}] as const satisfies readonly SubjectName[];

export function resourceMeta(subject: SubjectName): ResourceMeta {
  const meta = RESOURCE_META[subject];
  if (!meta) throw new Error(\`Ressource non tabulée : \${subject}\`);
  return meta;
}
`;
writeFileSync(metaPath, ts);

const modules = [...new Set(resources.map((r) => r.module))];
const moduleDir = resolve(root, 'apps/api/src/modules');
for (const key of modules) {
  const dir = resolve(moduleDir, key);
  mkdirSync(dir, { recursive: true });
  const label = key;
  writeFileSync(
    resolve(dir, `${key}.module.ts`),
    `/**
 * Contrôleurs CRUD du domaine ${label}.
 * MAAYOUD
 */
import { controllersFor } from '../../crud/crud.controller.js';

export const ${key}Controllers = controllersFor('${key}');
`,
  );
}

const imports = modules.map((k) => `import { ${k}Controllers } from './${k}/${k}.module.js';`).join('\n');
const spread = modules.map((k) => `  ...${k}Controllers,`).join('\n');
writeFileSync(
  resolve(moduleDir, 'all-controllers.ts'),
  `/**
 * Contrôleurs de domaine produits par la fabrique CRUD.
 * MAAYOUD
 */
${imports}

export const domainControllers = [
${spread}
];
`,
);

const sqlDir = resolve(root, 'packages/db/prisma/migrations/20261127143000_recherche_trigramme');
mkdirSync(sqlDir, { recursive: true });
const sql = `-- Index de recherche approchée (pg_trgm) pour les listes du gabarit CRUD.
-- Prisma émet ILIKE '%terme%' ; ces index GIN rendent ce motif utilisable.
-- MAAYOUD

CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;

${indexes
  .map((i) => `CREATE INDEX IF NOT EXISTS ${quote(i.index)} ON ${quote(i.table)} USING gin (${quote(i.column)} gin_trgm_ops);`)
  .join('\n')}
`;
writeFileSync(resolve(sqlDir, 'migration.sql'), sql);
console.log(`${resources.length} ressources, ${indexes.length} index, ${modules.length} domaines.`);
