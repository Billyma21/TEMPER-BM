# Organisation, personnes, accès

Sprint 3. Les listes restent celles du gabarit. Les actes qui décident un passage, un accueil ou un départ ont leur propre chemin.

## Écrans

- Organigramme : `GET /organisation/chart`. Chaque nom ouvre la fiche.
- Fiche : identité, poste, contrats, formations, documents, équipements, badges. Chaque onglet relit l API.
- Revue trimestrielle : attributions actives de plus de 90 jours, `GET /people/roles/review`.
- Visiteurs : liste du gabarit, accueil `POST /access/visitors/:id/arrive` après les consignes. Le badge visiteur dure douze heures. L UID n est pas stocké.
- Évacuation : `GET /access/evacuation`, nominative, réservée à qui lit les passages au-delà des siens. Copie locale chiffrée, rafraîchie chaque minute.
- Sécurité du compte : la connexion d entreprise s affiche éteinte tant que `OIDC_ISSUER` n est pas défini.

## Porte

`POST /access/decide`, lecteur seulement. Motifs : `UNKNOWN_BADGE`, `BADGE_INACTIVE`, `OUT_OF_SCHEDULE`, `NO_RIGHT`, `TRAINING_EXPIRED`, `MEDICAL_RESTRICTION`, `ANTI_PASSBACK`, `ZONE_FULL`, `DEVICE_OFFLINE`. La sortie reste ouverte tant que le badge est actif.

## Départ

`POST /people/offboarding/run` prend les fiches dont la date de fin est atteinte, passe les badges à `RETURNED`, révoque rôles et sessions, ouvre la checklist de départ.

MAAYOUD
