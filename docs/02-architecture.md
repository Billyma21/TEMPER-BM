# Architecture technique

## Vue d ensemble

```
                 ┌─────────────────────────── Navigateur / tablette / mobile (PWA) ───────────────────────────┐
                 │  apps/web (Next.js 16, React 19)                                                            │
                 │   ├─ mode Bureau (App Router, Tailwind 4, TanStack Query)                                   │
                 │   ├─ mode Monde (React Three Fiber, drei, caméra orthographique isométrique)                │
                 │   └─ /borne (kiosque, file hors ligne idempotente)                                          │
                 └──────────────┬───────────────────────────────────────────────┬──────────────────────────────┘
                                │ HTTPS /api/v1 (même origine, réécriture)       │ WebSocket /world (Socket.IO)
                 ┌──────────────▼───────────────────────────────────────────────▼──────────────────────────────┐
                 │  apps/api (NestJS 12, ESM)                                                                   │
                 │   AccessGuard (session ou appareil + droit minimal)  →  services métier  →  AuditInterceptor │
                 │   packages/permissions : resolveAccess() → règles CASL (mongo pour objets, prisma pour where)│
                 └───────┬───────────────────┬──────────────────────┬───────────────────────┬──────────────────┘
                         │                   │                      │                       │
                   PostgreSQL 16        Redis 7               Stockage objet S3        Intégrations
                   (Prisma 7,           (sessions, cache       (documents, photos,     (secrétariat social,
                   adaptateur pg,       droits, files          preuves, exports)        comptabilité, Peppol,
                   journal chaîné)      BullMQ, Socket.IO)                              EDI, MQTT machines)
```

## Monorepo

| Chemin | Rôle |
|---|---|
| `packages/permissions` | Catalogue des ressources et actions, 41 rôles, calcul des règles, filtre Prisma, séparation des tâches, circuits de validation. Testé. Source de la doc générée. |
| `packages/db` | Schéma Prisma (146 tables), migration initiale, client, données de démonstration. |
| `packages/shared` | Contrats zod partagés (connexion, borne, pointage) et types du monde 3D. |
| `apps/api` | API NestJS : authentification, droits, audit, temps, monde, temps réel. Chaque domaine devient un module. |
| `apps/web` | Interface : coquille, Mon espace, pages de modules, monde 3D, connexion, borne. |
| `docs` | Vision, modules, architecture, données, droits, monde 3D, sécurité, conformité, intégrations, qualité, exploitation, feuille de route, ADR, comptes rendus de réunions. |

## Flux d une requête

1. Le navigateur appelle `/api/v1/...` sur l origine du front ; Next réécrit vers l API (cookie de session first-party, pas de CORS en production).
2. `AccessGuard` authentifie (cookie `temper_session` opaque, ou `Authorization: Device <id>.<secret>` pour les bornes), construit le **principal** (rôles actifs, règles mongo et prisma), refuse si la route exige un droit absent (`@Requires`).
3. Le service combine **toujours** `whereOrForbid(principal, action, ressource)` avec ses filtres métier, puis vérifie objet par objet avec `assertCan` avant écriture.
4. `AuditInterceptor` journalise toute écriture ; les services ajoutent un audit métier avant / après sur les objets sensibles.
5. Les changements notables publient un événement temps réel : compteurs vers `site:<id>`, nominatif vers `presence:*` uniquement pour les ayants droit.

## Droits (résumé)

- **RBAC composable** : un utilisateur cumule des rôles, chacun borné à des sites, départements, équipes et une période.
- **ABAC** : portées `own`, `team`, `department`, `site`, `all` traduites en conditions sur des colonnes de périmètre **dénormalisées** (figées au moment de l événement).
- **Champs** : annuaire limité, profil personnel partiellement modifiable.
- **Données sensibles = ressources séparées** (paie, aptitude, recettes, coûts, IBAN fournisseur).
- **Immuabilité globale** prioritaire sur tout rôle, y compris super administrateur.
- **MFA** : un rôle sensible reste inactif tant que la session n a pas validé le second facteur.

## Temps réel

Socket.IO, espace `/world`, adaptateur Redis en production (plusieurs instances d API). Les clients invalident l instantané du monde par paquets d une seconde ; le monde se recharge aussi toutes les 30 secondes en secours.

## Borne hors ligne

La borne génère un `clientEventId` (UUID) par scan, met en file locale en cas d échec réseau et rejoue ; l API garantit l idempotence par contrainte d unicité. L heure de la borne est contrôlée (écart maximal 72 h) et marquée `isOffline`.

## Machines et capteurs

Automates et capteurs remontent via une passerelle OPC UA vers MQTT (`aurum/<site>/<ligne>/<machine>`). Un service d ingestion (à créer, `apps/ingest`) écrit les mesures en base (table partitionnée ou TimescaleDB), met à jour l état des machines et publie `machine.status`.

## Performance (budgets)

| Élément | Cible |
|---|---|
| Scan borne, p95 serveur | < 300 ms |
| Page Bureau, interaction | < 200 ms perçus (requêtes en cache, squelettes) |
| Monde 3D, première image | < 2,5 s sur portable de bureau ; 60 i/s, 30 i/s minimum sur tablette |
| Instantané du monde | < 400 ms, < 200 Ko |
| Changement d équipe | 300 scans en 10 min sans dégradation |

## Évolutivité

API sans état (sessions en base, cache Redis), plusieurs instances derrière un répartiteur ; tables à fort volume (`access_events`, `time_entries`, `environment_readings`, `audit_logs`) partitionnées par mois ; lectures lourdes de pilotage sur réplique en lecture.

MAAYOUD
