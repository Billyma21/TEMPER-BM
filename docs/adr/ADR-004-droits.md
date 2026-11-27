# ADR-004 : Droits RBAC composables + ABAC par portée, partagés front / API

**Statut** : accepté

**Décision**
- Rôles métier composables, chacun attribué sur un périmètre (sites, départements, équipes) et une période ; socle EMPLOYE / EXTERNE automatique.
- Portées `own`, `team`, `department`, `site`, `all` traduites en conditions sur des colonnes de périmètre dénormalisées.
- CASL 6 pour les vérifications objet (dialecte mongo) ; traduction maison des mêmes règles en `where` Prisma (`prismaWhere`) pour filtrer en base, sans dépendre du chemin du client généré.
- Données sensibles = ressources distinctes ; interdits globaux (immuabilité) prioritaires.
- MFA par rôle, séparation des tâches bloquante ou en alerte, circuits de validation à paliers paramétrables.

**Conséquences** : un seul fichier fait foi ; la doc des droits est générée ; tout ajout de ressource exige ses colonnes de périmètre et ses tests.

MAAYOUD
