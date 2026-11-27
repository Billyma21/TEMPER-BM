# 12 : Revue du sprint 2

Date : 2026-11-27. Durée : 30 minutes. Participants : PO, TL, FRONT, BACK, SECU, QA, UX.

## Démontré

- Liste et fiche génériques sur le gabarit, recherche dans l URL, colonnes mémorisées, export masqué sans le droit.
- Boîte de validation : l auteur ne décide pas, le manager accepte, le demandeur reçoit une notification.
- Sessions révocables, enrôlement TOTP avec codes de secours à usage unique, préparation WebAuthn (attestation vide refusée).
- Français, néerlandais et anglais sans changer l URL. Parcours Playwright : Noa voit les ventes, Emma ne voit pas la finance, Marc voit la production. axe-core sans violation grave sur la connexion et l accueil.

## Chiffres

- 147 tests API, dont le non-contournement des quatre yeux et la consommation d un code de secours.
- Construction web verte. Deux parcours Playwright verts.

## Retours

- METIER : la liste vide en démonstration est honnête. Les fiches métier (congé, commande) viendront avec leur sprint, le bureau suffit pour consulter.
- SECU : le descripteur de champs ne renvoie pas les secrets. Le défi WebAuthn est à usage unique.
- DPO : la notification dit « demande acceptée » ou « demande refusée », sans donnée de santé.
- QA : le contraste des textes secondaires du bureau a été relevé pour passer AA sur l accueil. Le monde 3D n est pas dans ce contrôle.

## Dette

- Le formulaire générique ne couvre pas les actes à effet (libération, paiement, pointage). Ils restent des services dédiés.
- Les listes de démonstration ne sont pas encore recapturées : l état vide est affiché, aucune ligne n est inventée.
- Le fuseau `Europe/Brussels` est fixé. La construction web ne journalise plus d avertissement.

## Suite

Sprint 3 : organigramme, fiche employé, arrivée et départ, badges, visiteurs, évacuation, décision de porte.

MAAYOUD
