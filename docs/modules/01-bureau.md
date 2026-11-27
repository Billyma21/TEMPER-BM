# Bureau

Listes et fiches de toutes les ressources du gabarit, boîte de validation, notifications et sécurité du compte.

## Parcours

- Un module n affiche que les ressources lisibles. La liste appelle `GET /api/v1/<domaine>/<ressource>`.
- La fiche est un tiroir : détail et historique. Création et export n apparaissent que si le droit existe.
- `GET /approvals/inbox` sépare ce que la personne doit décider de ses propres demandes. `POST /approvals/:id/decide` applique les quatre yeux.
- La cloche lit `communication/notifications` et écoute l événement `notification` sur la salle personnelle.
- `/securite` enrôle le TOTP, affiche les codes de secours une fois, enregistre une clé WebAuthn et révoque une session.

## Langue

Français par défaut. Néerlandais et anglais via le cookie `temper_locale`, sans changer l URL. Dates et nombres : `fr-BE`, `nl-BE`, `en-BE`.

MAAYOUD
