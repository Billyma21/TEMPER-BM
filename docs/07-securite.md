# Sécurité

Référentiel visé : OWASP ASVS 4 niveau 2 (niveau 3 pour l authentification, la paie et l audit).

## Modèle de menaces (STRIDE, extraits)

| Menace | Exemple chocolaterie | Contre-mesure |
|---|---|---|
| Usurpation | Badge cloné pour pointer à la place d un collègue | UID haché, badges DESFire chiffrés, photo affichée à la borne, alerte double présence, anti-retour |
| Usurpation | Vol de session d un DAF | Cookie httpOnly SameSite, session opaque révocable, MFA, durée courte, inactivité 30 min |
| Altération | Modifier un pointage ou un mouvement de stock | Immuabilité forcée par les droits et les services, corrections tracées |
| Altération | Changer l IBAN d un fournisseur | Ressource séparée, double validation, contre-appel, SoD-02 |
| Répudiation | « Ce n est pas moi qui ai libéré le lot » | Journal d audit chaîné, quatre yeux, horodatage serveur |
| Divulgation | Recette ou coût de revient exfiltré | Ressources « secret », rôles restreints, export journalisé, filigrane des exports |
| Divulgation | Qui est présent, où (vie privée) | Présence nominative réservée aux managers concernés, silhouettes anonymes |
| Déni de service | Borne inutilisable au changement d équipe | File hors ligne, limitation de débit par appareil, montée en charge testée |
| Élévation | S attribuer un rôle | Jamais d auto-attribution, circuit pour rôles sensibles, SoD bloquante |

## Authentification

- Mots de passe argon2id (m=19 MiB, t=2), 12 caractères minimum, vérification contre listes de mots de passe compromis (k-anonymat), pas de règles de composition absurdes.
- Verrouillage progressif (5 échecs, 15 minutes), message identique compte existant ou non, temps de réponse constant.
- **MFA** : TOTP (implémenté), WebAuthn / clés de sécurité (table prête, à implémenter), obligatoire pour tout rôle `requiresMfa`, clé matérielle pour `SUPER_ADMIN`.
- SSO OIDC (Entra ID) optionnel pour les bureaux ; les comptes terrain restent badge + PIN.
- Sessions : jeton aléatoire 256 bits, seul son SHA-256 est stocké, durée maximale = la plus courte des rôles actifs, révocation à la déconnexion, au changement de mot de passe, au départ.
- Appareils : identifiant + secret affiché une seule fois, haché en base, rotation possible, accès limité aux routes `@DeviceOnly`.

## Autorisation

- Toutes les routes protégées par défaut (`AccessGuard` global), `@Public()` explicite.
- Droit minimal de route (`@Requires`) + filtre de lignes (`whereOrForbid`) + contrôle objet (`assertCan`). Les trois sont obligatoires pour toute écriture.
- Tests de non-régression des droits : chaque rôle, chaque ressource, chaque portée (`packages/permissions/test`) + tests d API par rôle (sprint 2).

## Données

- TLS partout ; HSTS ; en-têtes de sécurité (helmet côté API, en-têtes Next côté web) ; CSP stricte à finaliser (sprint 3).
- Chiffrement applicatif AES-256-GCM des champs sensibles ; clé dans un coffre (variables d environnement en dev, gestionnaire de secrets en production) ; rotation documentée.
- Sauvegardes chiffrées, restauration testée chaque trimestre, PITR 7 jours.
- Exports : journalisés, nominatifs, limités par droit `export`.

## Journal d audit

Append-only, chaîné par empreinte, verrou consultatif pour l ordre, vérification nocturne de la chaîne, alerte en cas de rupture, copie quotidienne vers un stockage WORM. Toute action d un `SUPER_ADMIN` est marquée `breakGlass` et notifiée à la direction.

## Développement sécurisé

- Dépendances surveillées (Dependabot), audit `pnpm audit` en CI, versions épinglées.
- Revue de code obligatoire, deux approbations pour `packages/permissions`, `apps/api/src/auth`, migrations.
- Secrets jamais dans le dépôt (`.env` ignoré), détection de secrets en CI.
- Test d intrusion externe avant mise en production, puis annuel.

## Réponse à incident

Procédure dans `11-exploitation.md` : détection, confinement (révocation des sessions, désactivation de comptes ou d appareils), analyse via l audit, notification (APD sous 72 h si violation de données, CCB / NIS2 si applicable), retour d expérience.

MAAYOUD
