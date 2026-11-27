# Contribuer à TEMPER

## Branches

`main` protégée. Branches `feat/<module>-<sujet>`, `fix/<sujet>`, `docs/<sujet>`, `chore/<sujet>`.

## Commits (en français, impératif)

```
feat(temps): calcule les minutes de nuit par segment
fix(acces): refuse un badge expiré même hors ligne
docs(reunions): compte rendu revue sprint 2
```

Types : feat, fix, refactor, perf, test, docs, chore, ci, securite. Aucune mention d outil d assistance dans les messages, le code, les PR ou les issues.

## Revue

Une approbation minimum ; deux pour `packages/permissions`, `apps/api/src/auth`, `packages/db/prisma`. La PR suit le gabarit (droits, qualité, captures, contrôle des livrables).

## Ajouter un module métier

1. Ressources et actions dans `packages/permissions/src/catalog.ts` (avec colonnes de périmètre), droits dans `roles.ts`, tests.
2. Tables dans `schema.prisma` (colonnes de périmètre dénormalisées), migration, seed.
3. Schémas zod dans `packages/shared`.
4. Module Nest `apps/api/src/modules/<domaine>` (contrôleur, service avec `whereOrForbid` et `assertCan`), tests d intégration par rôle.
5. Écrans dans `apps/web/src/app/(app)/<route>`, représentation dans le monde si pertinent.
6. `pnpm docs:matrix`, doc du module, compte rendu de revue.

## Typographie

Pas de tiret cadratin ni demi-cadratin : utiliser deux-points, virgule, parenthèses ou trait d union. `pnpm check` le vérifie.

MAAYOUD
