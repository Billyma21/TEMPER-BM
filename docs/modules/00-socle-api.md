# Socle API

Chaque ressource du catalogue, sauf `World` et `WorldPresence`, est exposée par le gabarit CRUD.

| Méthode | Chemin | Droit |
|---|---|---|
| GET | `/api/v1/<domaine>/<ressources>` | `read` |
| GET | `/api/v1/<domaine>/<ressources>/:id` | `read` |
| POST | `/api/v1/<domaine>/<ressources>` | `create` |
| PATCH | `/api/v1/<domaine>/<ressources>/:id` | `update` |
| GET | `/api/v1/<domaine>/<ressources>/export` | `export` et `read` |
| GET | `/api/v1/<domaine>/<ressources>/:id/audit` | `read` |

Paramètres de liste : `page`, `pageSize` (max 100), `sort`, `dir` (`asc` ou `desc`), `q` (recherche, index `pg_trgm`), et des filtres d égalité sur les colonnes scalaires (`siteId`, `status`, ...).

Réponse de liste : `{ items, total, page, pageSize }`. Les champs renvoyés dépendent de l objet (annuaire limité, dossier propre complet). Les secrets d authentification ne sortent jamais.

Erreur : `{ code, message, details, requestId }`. La langue du `message` suit `Accept-Language` (`fr` par défaut, `nl`, `en`). Une action interdite par le catalogue (`pointage`, `passage`, `mouvement`, `libération`, `preuve`, `mesure`, `audit`) répond `IMMUTABLE`.

L export CSV utilise le point-virgule et un BOM UTF-8, et s arrête à 5 000 lignes (`X-Export-Truncated: 1`).

Le descripteur est régénéré avec `pnpm --filter @temper/db crud-meta` après un changement de schéma ou de catalogue.

MAAYOUD
