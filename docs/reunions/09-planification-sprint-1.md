# 09 : Planification du sprint 1

**Date** : 2026-11-27, 2 h. **Participants** : PO, TL, ARCHI, BACK, FRONT, SECU, DPO, QA, OPS, DATA, METIER-PROD, METIER-RH, METIER-QUAL.

## Ordre du jour

1. Gabarit d API sûr pour les 118 ressources.
2. Cache des droits et erreurs normalisées.
3. Preuve par les tests : un cas autorisé et un cas refusé par ressource exposée.
4. Ce qui reste hors du sprint (écrans, circuits métier).

## Échanges

- **PO** : le sprint 0 prouve le pointage et le monde. Le sprint 1 doit rendre chaque ressource adressable, sinon les sprints métier recopieront des contrôleurs. Critère d acceptation : une liste, un détail, une création, une modification, un export, l historique d audit, et un test 200 plus un test 403 par ressource.
- **BACK** : un contrôleur par table écrite à la main ferait 116 copies du même oubli de `where`. Une fabrique unique, les modules Nest ne font que l exposer.
- **SECU** : la fabrique est acceptable seulement si elle ne peut pas oublier le filtre. `prismaWhere` est obligatoire, la projection se fait champ par champ (`ability.can` sur le champ), et les secrets d authentification (mot de passe, jetons, secret TOTP, empreintes) ne sortent jamais, même pour le super administrateur.
- **UX** : l annuaire doit rester lisible. Un opérateur voit les collègues (nom, poste, site) et son propre dossier complet. SECU accepte : la ligne est filtrée, puis les colonnes.
- **DPO** : la paie de soi est un droit d accès de la personne. Un commercial lit sa fiche, jamais celle d un collègue. Un externe sans dossier n a aucun droit sur `EmployeePayroll` : la collection répond 403. Pas de diagnostic dans `EmployeeMedical` (déjà le cas dans le schéma : aptitude seulement).
- **METIER-RH** : pas de suppression physique dans le gabarit. Les faits (pointage, passage, mouvement, libération, preuve, mesure, audit) restent corrigés par contre-écriture. Le code d erreur est `IMMUTABLE`, y compris pour le super administrateur.
- **TL** : pas d endpoint `DELETE` dans ce socle. Les sujets supprimables recevront un acte métier plus tard, pas un effacement générique.
- **ARCHI** : la recherche reste dans Prisma (`contains`, donc `ILIKE`). L extension `pg_trgm` et les index GIN rendent ces `ILIKE '%terme%'` indexables. Pas de SQL dynamique assemblé avec la saisie utilisateur. Décision tracée dans l ADR-009. `ioredis` est la seule dépendance d exécution ajoutée : le client Redis officiel est plus lourd pour le même besoin, et nous n introduisons pas de file de messages dans ce sprint.
- **OPS** : si Redis est indisponible, l API calcule les droits sans cache et le signale dans `/health` (`cache: down`). Le délai de commande est plafonné pour qu une panne Redis ne bloque pas l authentification.
- **QA** : base `temper_test`, migrée et seedée, Supertest sur l application Nest réelle. Pas de doublon de logique de droits dans le test : le test cherche, parmi les comptes seedés, qui peut et qui ne peut pas.
- **DATA** : la pagination est stable (`page`, `pageSize` max 100, tri limité aux colonnes scalaires). L export CSV (séparateur point-virgule, BOM UTF-8, plafond 5 000 lignes) est un droit `export`, pas un contournement du `read`.
- **FRONT** : les écrans génériques attendent le sprint 2. Le contrat de liste `{ items, total, page, pageSize }` et l erreur `{ code, message, details, requestId }` sont figés maintenant. Messages FR, NL, EN selon `Accept-Language`.
- **METIER-PROD** : le monde et la borne ne bougent pas dans ce sprint. Aucune régression sur le pointage.

## Décisions

- **D-09-1** : une fabrique `createResourceController` enregistre, pour chaque ressource tabulée, liste, détail, création, modification, export CSV et historique d audit. `World` et `WorldPresence` ne sont pas des tables : elles restent sur le contrôleur du monde.
- **D-09-2** : toute lecture combine le `where` des droits (y compris les droits limités à des champs) et les filtres métier. Chaque ligne est ensuite projetée champ par champ. Les secrets d authentification sont exclus du `select`.
- **D-09-3** : le socle EMPLOYE conserve la lecture de sa propre paie. Le test de non-fuite vérifie qu un commercial ne reçoit aucune fiche autre que la sienne, et qu un externe reçoit 403 sur la collection, sans montant.
- **D-09-4** : pas de `DELETE` générique. Une action globalement interdite (`forbidden`) répond `IMMUTABLE`.
- **D-09-5** : cache Redis `temper:access:<user>:<version>:<mfa>`, TTL 120 s, version incrémentée à la déconnexion et à chaque écriture de `User`, `Employee`, `RoleAssignment` ou `Session`.
- **D-09-6** : erreur unique `{ code, message, details, requestId }`. L identifiant de requête reprend `X-Request-Id` s il est sain, sinon il est généré, et il est renvoyé dans la réponse et le journal.
- **D-09-7** : à la création, les champs d acteur requis et vides (`createdById`, `siteId` quand le principal n a qu un site, etc.) sont remplis depuis le principal. Le client ne choisit pas l auteur.

## Risques

- **R-09-1** (moyenne, fort) : une colonne de portée absente du modèle ferait échouer le `where` au runtime. Parade : test unitaire qui compare `ownership` et les colonnes générées.
- **R-09-2** (faible, fort) : oubli de projection et fuite de champ. Parade : test annuaire (pas d e-mail personnel sur le collègue) et absence de `passwordHash` dans toutes les listes du super administrateur.
- **R-09-3** (faible, moyen) : Redis lent. Parade : délais courts, file désactivée, repli sans cache.
- **R-09-4** (moyenne, moyen) : la création générique refuse les objets dont les colonnes obligatoires ne sont pas devinables. Parade : 400 explicite (`issues`), les actes métier riches resteront dans les services des sprints suivants.

## Actions

- BACK : fabrique, filtre d exception, cache, migration `recherche_trigramme`.
- QA : test d intégration par ressource, non-fuite paie, immuabilité d un pointage.
- OPS : vérifier PostgreSQL, Redis, base `temper_test`.
- DPO : relire D-09-3 avant la revue.

MAAYOUD
