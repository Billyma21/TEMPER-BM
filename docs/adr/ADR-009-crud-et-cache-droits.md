# ADR-009 : Gabarit CRUD sûr et cache des droits

**Statut** : accepté (sprint 1)

**Contexte** : 118 ressources partagent les mêmes besoins (liste filtrée, détail, création, modification, export, historique) et le même risque (oubli du filtre de droits). Le calcul des droits lit plusieurs tables à chaque requête. La recherche textuelle doit rester correcte sans SQL concaténé.

**Décision**

- Une fabrique unique (`apps/api/src/crud`) produit un contrôleur par ressource tabulée. Les modules de `src/modules/<domaine>` ne font que grouper ces contrôleurs. `World` et `WorldPresence` restent des projections, pas des tables.
- Le filtre de lignes est `prismaWhere` (droits de champ inclus). Le filtre de colonnes est `ability.can(action, objet, champ)` sur chaque ligne. Les secrets d authentification ne sont pas sélectionnés.
- Aucune suppression générique. Les interdits du catalogue répondent `IMMUTABLE`.
- Recherche : `contains` Prisma (ILIKE). Migration `recherche_trigramme` : extensions `pg_trgm` et `unaccent`, index GIN `gin_trgm_ops` sur les colonnes textuelles de recherche. La saisie utilisateur reste un paramètre lié, jamais un identifiant SQL.
- Cache Redis des règles déjà résolues, clé par utilisateur, version et état MFA. Invalidation par incrément de version. Si Redis ne répond pas, le calcul direct reste la référence.
- Erreurs `{ code, message, details, requestId }`, message selon `Accept-Language` (fr, nl, en).
- Dépendance d exécution ajoutée : `ioredis` (client léger, timeouts courts). Les outils de test (`supertest`, compilateur de tests aware des décorateurs) restent en dépendances de développement.

**Conséquences** : un nouveau modèle exposé passe par le catalogue, le schéma, puis la régénération `pnpm --filter @temper/db crud-meta`. Les actes métier qui ne sont pas un CRUD (pointage, libération, paiement) gardent un service dédié et réutilisent les mêmes gardes.

**Alternatives écartées** : un contrôleur fourre-tout unique (OpenAPI illisible, droits déclarés loin de la route) ; une requête SQL brute mélangeant le `where` des droits et la recherche (risque d injection et de divergence avec Prisma).

MAAYOUD
