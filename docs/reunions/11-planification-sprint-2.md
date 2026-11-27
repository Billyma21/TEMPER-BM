# 11 : Planification du sprint 2

Date : 2026-11-27. Durée : 45 minutes. Participants : PO, TL, ARCHI, BACK, FRONT, UX, SECU, DPO, QA.

## Ordre du jour

1. Bibliothèque d interface et listes du gabarit.
2. Validations, notifications, second facteur.
3. Langues et parcours automatisés.

## Échanges

FRONT veut un écran par ressource pour coller au métier. UX rappelle que le sprint 1 a déjà un contrat unique : recopier 116 formulaires avant d avoir vu un utilisateur produirait de la dette. Décision : un bureau générique maintenant, les écrans métier aux sprints où le geste n est pas un simple enregistrement.

SECU refuse que le descripteur de formulaire révèle un secret, et que la liste des validations soit le CRUD de `ApprovalRequest` (un commercial y verrait les demandes des autres). DPO confirme : la notification ne porte pas de donnée de santé, seulement l issue de la demande.

QA demande un parcours par profil et un contrôle d accessibilité sur la connexion et l accueil. ARCHI écarte le préfixe de langue dans l URL pour ne pas casser la démonstration.

## Décisions

- D-11-1. Listes, fiches, création et export passent par le gabarit. Les actions non permises sont masquées.
- D-11-2. `GET /approvals/inbox` et `POST /approvals/:id/decide`. Quatre yeux. Notification in-app et salle personnelle.
- D-11-3. TOTP, codes de secours à usage unique, WebAuthn, sessions révocables. Voir ADR-010.
- D-11-4. `next-intl` sans préfixe d URL. Cookie `temper_locale`. Formats `fr-BE`, `nl-BE`, `en-BE`.
- D-11-5. Playwright en mode démonstration : Noa voit les ventes, Emma ne voit pas la finance, Marc voit la production. axe-core sur la connexion et l accueil.

## Risques

- R-11-1. Probabilité moyenne, impact moyen. Le formulaire générique ne devine pas chaque colonne obligatoire. Parade : l API répond `VALIDATION_ERROR` et le bureau affiche le message. Les actes métier complexes restent dédiés.
- R-11-2. Probabilité faible, impact fort. Un défi WebAuthn rejoué. Parade : le défi est à usage unique, 5 minutes, vérifié par la bibliothèque.
- R-11-3. Probabilité moyenne, impact faible. La démonstration n a pas encore toutes les listes capturées. Parade : liste vide, jamais de lignes inventées.

## Actions

- BACK : inbox, compte, descripteur de champs, tests 401 et 403.
- FRONT : tableau, tiroir, pages, langues.
- QA : Playwright et axe.
- ARCHI : ADR-010.

MAAYOUD
