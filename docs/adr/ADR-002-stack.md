# ADR-002 : NestJS 12 (ESM), Next.js 16, TypeScript 5.9

**Statut** : accepté

**Contexte** : ERP à longue durée de vie, nombreux modules, équipe qui tourne, bornes et tablettes, temps réel.

**Décision**
- API **NestJS 12** : modules, injection, gardes, intercepteurs, WebSocket intégrés ; la version 12 est ESM uniquement, l API est donc en `"type": "module"` avec imports relatifs suffixés `.js`.
- Front **Next.js 16** (App Router, React 19), Tailwind 4, TanStack Query, zustand.
- **TypeScript 5.9** (et non 7) tant que tout l outillage (Next, Nest CLI, ESLint) n a pas validé la nouvelle génération du compilateur. Réévaluation au sprint 6.
- Validation **zod 4** partagée front / API.

**Alternatives écartées** : API dans Next (couplage, bornes et intégrations à l étroit), Fastify nu (trop de socle à réécrire), GraphQL (droits par champ plus complexes à auditer).

MAAYOUD
