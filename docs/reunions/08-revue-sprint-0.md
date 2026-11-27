# 08 : Revue de sprint 0 et planification du sprint 1

**Date** : 2026-11-27, 1 h 30. **Participants** : toute l équipe, METIER-PROD, METIER-QUAL, METIER-RH.

## Démontré
- Base PostgreSQL : 146 tables créées par la migration initiale ; seed Maison Aurum (47 employés, 4 sites, recettes, lignes, lots, clients, prospects, quêtes).
- Droits : 41 rôles, 118 ressources, 21 tests ; doc des droits générée ; séparation des tâches vérifiée (aucun rôle seul ne viole une règle bloquante).
- API : connexion, sessions, MFA TOTP, appareils, audit chaîné, pointage borne (badge, PIN, idempotence, double scan, avertissement formation expirée), pointage mobile géorepéré, présence filtrée, instantané du monde filtré.
- Vérifié en direct : l opératrice voit 36 présents sans noms ; le chef d équipe voit les 6 personnes de son équipe ; le directeur de site voit les 36 noms ; un badge inconnu est refusé et journalisé ; un rejeu hors ligne ne crée pas de doublon.
- Front : Mon espace, navigation selon droits, pages de modules (actions permises par ressource), monde 3D isométrique (bureau commercial à pièces, ville des clients avec chantiers, hall de production, cadenas), borne, connexion, mode démo à 3 profils.

## Retours métiers
- **METIER-PROD** : « je vois ma panne d emballeuse depuis le monde, c est exactement ce qu il faut ». Demande : TRS en direct par ligne.
- **METIER-QUAL** : demande la traçabilité aval dès le sprint 6.
- **METIER-RH** : valide le principe des silhouettes anonymes ; demande l export paie en priorité après le temps.

## Sprint 1 (engagé)
1. Modules Nest par domaine avec gabarit CRUD sûr (liste paginée filtrée par droits, détail, création, modification, export).
2. Tests d intégration API par rôle (base de test en conteneur).
3. Cache des droits dans Redis et invalidation.
4. i18n FR / NL / EN.
5. AIPD pointage et badges (DPO).

MAAYOUD
