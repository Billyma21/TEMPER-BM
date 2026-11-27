# ADR-011 : Portes, départ et connexion d entreprise

**Statut** : accepté (sprint 3)

**Contexte** : le gabarit CRUD ne sait pas décider un passage, clôturer un départ ni relier un fournisseur d identité. Le sas de production, le badge perdu et la date de fin sont des critères déjà écrits. Aucun émetteur OpenID n est contractualisé.

**Décision**

- Le lecteur appelle `POST /access/decide`. Le motif de refus fait partie de l événement ajouté. La formation échue prévient le manager. Un badge perdu ou volé prévient la sécurité du site et la direction.
- L attribution sensible n est pas active tant que le circuit `SENSITIVE_ROLE_ASSIGNMENT` n est pas accepté. Le refus du circuit révoque l attribution. L acceptation avance `validFrom`.
- Le départ est une action explicite, rejouable, limitée aux personnes que l appelant peut modifier au-delà de sa propre fiche.
- L évacuation nominative est refusée à qui ne lit que ses propres passages. Le monde 3D ne reçoit qu un compteur de visiteurs et un drapeau.
- `GET /auth/oidc` répond `{ enabled: false }` sans variable `OIDC_ISSUER`. Pas de nouvelle dépendance.

**Conséquences** : une zone critique sans règle d autorisation reste fermée. Une zone restreinte sans règle s appuie sur les formations et les EPI exigés. Le drapeau d évacuation vit dans Redis pendant vingt-quatre heures.

**Alternatives écartées** : stocker l UID pour reprogrammer un badge (le secret ne doit pas rester en base) ; ajouter `openid-client` avant d avoir un émetteur ; dessiner l organigramme avec une bibliothèque graphique.

MAAYOUD
