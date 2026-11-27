# ADR-003 : PostgreSQL 16 + Prisma 7 (adaptateur pg)

**Statut** : accepté

**Décision** : PostgreSQL (transactions, contraintes, JSONB, partitionnement, verrous consultatifs, RLS possible). Prisma 7 avec le générateur `prisma-client` (sortie dans `packages/db/src/generated`, format CommonJS) et l adaptateur `@prisma/adapter-pg`. Migrations versionnées, jamais réécrites.

**Règles** : `Decimal` pour l argent et les quantités ; requêtes de reporting lourdes en SQL typé ou vues matérialisées ; aucune requête sans filtre de droits (`whereOrForbid`).

MAAYOUD
