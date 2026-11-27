# ADR-010 : Bureau générique, langues et second facteur

**Statut** : accepté (sprint 2)

**Contexte** : chaque ressource du gabarit doit avoir une liste et une fiche sans recopier un écran par modèle. Le bureau est en français, néerlandais et anglais, aux formats belges. Le second facteur couvre l application TOTP, les codes de secours et les clés WebAuthn. La langue ne doit pas déplacer les URL déjà utilisées par la démonstration.

**Décision**

- Les listes et les fiches passent par le gabarit. Le descripteur `GET .../meta` ne renvoie que les champs lisibles ou écrivables, jamais les secrets. Une action absente des droits n est pas affichée.
- Les filtres et les colonnes choisis sont mémorisés dans le navigateur. Au-delà de 200 lignes, le tableau ne peint qu une fenêtre.
- `next-intl` est branché sans préfixe d URL. La langue vient du cookie `temper_locale`, français par défaut. Les formats de date et de nombre utilisent `fr-BE`, `nl-BE` et `en-BE`.
- L enrôlement TOTP réutilise le code déjà présent (secret chiffré, QR en SVG). Huit codes de secours sont montrés une fois, stockés par empreinte, et consommés à la connexion.
- WebAuthn passe par `@simplewebauthn/server` et `@simplewebauthn/browser`. Le défi est gardé en mémoire et dans Redis, le nom d hôte vient de `WEB_PUBLIC_URL`. La clé publique est stockée, jamais renvoyée.
- La boîte de validation n est pas la liste générique : elle retient les demandes dont l étape courante correspond à un rôle actif, et elle refuse l auteur (quatre yeux). La décision crée une notification et la pousse dans la salle `user:<id>`.
- Dépendances ajoutées : `next-intl`, `@simplewebauthn/server`, `@simplewebauthn/browser`, `qrcode`. Le contrôle d accessibilité des parcours (`@axe-core/playwright`) reste un outil de test.

**Conséquences** : une ressource nouvelle apparaît dans le bureau dès qu elle est dans le gabarit. Les actes qui ne sont pas un formulaire de champs (pointage, libération, paiement) gardent un écran dédié.

**Alternatives écartées** : un segment `[locale]` dans toutes les routes (casse la démonstration et les liens déjà posés) ; écrire l attestation WebAuthn à la main (surface d erreur trop large pour un secret).

MAAYOUD
