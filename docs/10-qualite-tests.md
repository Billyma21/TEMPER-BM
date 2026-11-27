# Qualité et tests

## Pyramide

| Niveau | Outil | Cible | Déjà en place |
|---|---|---|---|
| Unitaires purs | Vitest | 90 % sur `packages/permissions`, moteur de temps, calculs (coûts, TRS, FEFO, MRP) | 21 tests permissions, 11 tests temps / TOTP / chiffrement |
| Intégration API | Vitest + Supertest + PostgreSQL de test (conteneur) | Chaque route : 401, 403 par rôle, 200 périmètre, validation | À faire sprint 1 |
| Droits | Matrice générée : pour chaque rôle et ressource, un cas autorisé et un cas refusé | 100 % des ressources | Base en place |
| Bout en bout | Playwright | Parcours par persona (opératrice, chef d équipe, qualité, magasinier, commerciale, DRH, admin) | À faire sprint 2 |
| Visuel | Playwright (captures du Bureau et du Monde, WebGL logiciel) | Pages clés, monde par profil | Script de démonstration utilisé pour la recette |
| Charge | k6 | 300 scans de borne en 10 min ; 200 utilisateurs simultanés | Sprint 4 |
| Accessibilité | axe-core dans Playwright | Zéro violation sérieuse | Sprint 2 |
| Sécurité | Analyse de dépendances, analyse statique, test d intrusion | Zéro vulnérabilité haute ouverte | CI à compléter |

## Définition de terminé

1. Code typé strict, sans `any` non justifié, lint propre.
2. Droits : `@Requires` + `whereOrForbid` + `assertCan` sur toute écriture, tests 403 inclus.
3. Validation zod partagée (front et API).
4. Audit métier pour les objets sensibles.
5. Tests unitaires et d intégration verts, scénario bout en bout du parcours concerné.
6. Interface en FR, NL, EN ; accessibilité vérifiée ; mobile et tablette vérifiés.
7. Monde 3D mis à jour si le module y est représenté.
8. Documentation (`docs/modules`, ADR si décision) et compte rendu de revue de sprint.
9. Aucune mention d outil d assistance dans le code, les commits, les PR ; signature MAAYOUD ; aucun tiret cadratin.

## Scénarios de recette clés

- Rappel : bloquer un lot de fèves, obtenir la liste des clients livrés en moins de 2 minutes.
- Changement d équipe : 300 scans en 10 minutes, zéro perte, file hors ligne rejouée.
- Intérimaire : accès automatiquement coupé à la fin de mission.
- Sécurité : opératrice qui tente de lire une recette, commerciale qui tente de lire la paie, DAF qui tente de s attribuer un rôle : 403 et audit.
- Monde : la commerciale ne voit pas les noms des personnes présentes ; le chef d équipe voit son équipe ; le directeur voit tout son site.

MAAYOUD
