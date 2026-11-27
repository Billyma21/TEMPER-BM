# 13 : Planification du sprint 3

Date : 2026-11-27. Durée : 45 minutes. Participants : PO, TL, ARCHI, BACK, FRONT, 3D, UX, SECU, DPO, QA, METIER-RH.

## Ordre du jour

Organigramme, fiche employé, arrivée et départ, badges, visiteurs, décision de porte, évacuation, connexion d entreprise.

## Échanges

BACK propose un endpoint de lecteur, distinct du gabarit, parce qu un passage n est pas une mise à jour. DPO rappelle que l UID brut ne se stocke pas et que la liste d évacuation est nominative. METIER-RH veut le départ automatique à la date de fin, sans effacer l historique. SECU refuse l auto-attribution et veut le circuit déjà décrit pour les rôles sensibles. 3D ajoute les visiteurs au poste de garde et rassemble les avatars quand l évacuation est déclenchée. Personne ne retient de bibliothèque d organigramme ni de client OpenID tant qu un émetteur n est pas choisi.

## Décisions

- D-13-1. `POST /access/decide` est réservé au lecteur. La décision est une fonction pure. Chaque passage ajoute un `AccessEvent`.
- D-13-2. L UID est reçu puis oublié. Seuls le HMAC et les quatre derniers caractères sont gardés.
- D-13-3. Pas d auto-attribution. Intérim, étudiant, stagiaire et flexi-job exigent `validUntil`. Un cumul bloquant est refusé. Un rôle à MFA crée une attribution en attente (`validFrom` au 1er janvier 2999) et une demande `SENSITIVE_ROLE_ASSIGNMENT`, activée seulement quand le circuit est accepté.
- D-13-4. Le départ remet les badges à `RETURNED`, révoque les rôles et les sessions, et ouvre une checklist. Il ne supprime rien.
- D-13-5. La liste d évacuation n est servie que si la lecture des passages dépasse sa propre ligne. La tablette en garde une copie chiffrée localement, rafraîchie chaque minute.
- D-13-6. La connexion d entreprise reste éteinte tant que `OIDC_ISSUER` n est pas posé. Aucune bibliothèque ajoutée.
- D-13-7. L organigramme et la fiche relisent les API existantes. Le poste de garde compte les visiteurs présents. L évacuation déplace les avatars devant le poste de garde.

## Risques

- R-13-1. Probabilité moyenne, impact haut : un lecteur hors ligne. Parade : le refus `DEVICE_OFFLINE` est journalisé, la copie locale d évacuation reste lisible.
- R-13-2. Probabilité basse, impact haut : une zone critique sans règle s ouvrirait. Parade : sans règle positive, une zone critique reste fermée. Une zone restreinte sans règle s ouvre seulement si formation et EPI sont valides, comme le sas de production déjà décrit.

## Actions

BACK livre la décision, le départ et les tests d acceptation. FRONT livre l organigramme, la fiche, l accueil et l évacuation. 3D livre le rassemblement. QA rejoue formation échue, badge perdu et départ.

MAAYOUD
