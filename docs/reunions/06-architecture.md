# 06 : Architecture technique

**Date** : 2026-11-23, 2 h. **Participants** : ARCHI, TL, BACK, FRONT, 3D, OPS, SECU, QA, DATA.

## Échanges
- **BACK** : NestJS 12 est ESM uniquement ; on passe l API en modules ES avec suffixes `.js`. Les paquets partagés restent en CommonJS pour être consommés partout.
- **TL** : TypeScript 7 est sorti mais Next, Nest CLI et ESLint doivent encore le valider ; on reste en 5.9 et on réévalue.
- **ARCHI** : Prisma 7 sans moteur natif à l exécution, adaptateur pg, client généré dans le paquet `db`. Pour filtrer par droits, on ne dépend pas d un paquet qui suppose l emplacement du client : traduction maison des règles en `where` (20 lignes, testées).
- **FRONT** : réécriture `/api` dans Next : même origine, cookie first-party, pas de CORS en production.
- **3D** : React Three Fiber dans l app ; un seul instantané filtré côté API ; temps réel par invalidation.
- **OPS** : Redis pour cache des droits, files et adaptateur Socket.IO multi-instances ; partitionnement des tables d événements.
- **QA** : un mode démo du front qui rejoue de vraies réponses d API permet aux métiers de tester sans base.

## Décisions
- **D-06-1** : ADR-001 à ADR-008 acceptés.
- **D-06-2** : chaque domaine métier = un module Nest (`apps/api/src/modules/<domaine>`) suivant le modèle `time/` : contrôleur fin, service avec `whereOrForbid` + `assertCan`, schémas zod partagés.
- **D-06-3** : mode démo `NEXT_PUBLIC_DEMO=1` avec trois profils (commerciale, opératrice, directeur).
- **D-06-4** : budgets de performance (`02-architecture.md`) suivis en CI dès le sprint 4.

MAAYOUD
