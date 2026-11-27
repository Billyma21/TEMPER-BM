# 03 : Sécurité et droits d accès

**Date** : 2026-11-18, 2 h 30. **Participants** : SECU, ARCHI, BACK, FRONT, 3D, DPO, METIER-RH, METIER-QUAL, OPS.

## Échanges
- **SECU** : le risque principal d un ERP n est pas l attaque externe, c est l accès interne excessif (paie, recettes, coûts) et la fraude (IBAN, notes de crédit, inventaires). Il faut la séparation des tâches dès le socle.
- **ARCHI** : RBAC pur explose en rôles (« chef d équipe matin site 1 »...). Proposition : rôles métier composables + périmètre par attribution + portée par droit.
- **BACK** : filtrer en base, pas en mémoire. Les règles doivent produire un `where` Prisma. Les colonnes de périmètre doivent être sur les tables filtrées.
- **DPO** : le salaire, le NISS, l IBAN et l aptitude ne doivent pas être des colonnes de la fiche employé : tables séparées, droits séparés, chiffrement.
- **METIER-RH** : la direction générale n a pas besoin de la paie nominative, seulement de la masse salariale.
- **FRONT** : le front doit recevoir les règles pour masquer les menus, mais ne jamais être l autorité.
- **3D** : verrouiller visuellement les bâtiments hors fonctions (cadenas) est plus clair qu un message d erreur.
- **OPS** : un compte bris de glace est nécessaire mais doit être bruyant (notification, marquage).

## Décisions
- **D-03-1** : 41 rôles (socles inclus) dans `packages/permissions`, source unique, doc générée.
- **D-03-2** : portées own / team / department / site / all, colonnes de périmètre dénormalisées et figées.
- **D-03-3** : ressources sensibles séparées (paie, aptitude, recettes, coûts, IBAN fournisseur, clés d API).
- **D-03-4** : MFA obligatoire par rôle ; rôle sensible inactif tant que la session n a pas validé le second facteur.
- **D-03-5** : immuabilité globale prioritaire sur tous les rôles, y compris super administrateur.
- **D-03-6** : 10 règles de séparation des tâches (5 bloquantes, 5 en alerte + quatre yeux).
- **D-03-7** : circuits de validation à paliers paramétrables (commandes, remises, notes de crédit, inventaires, paiements, rôles sensibles...).
- **D-03-8** : `SUPER_ADMIN` limité à 2 personnes, clé matérielle, actions marquées bris de glace et notifiées.
- **D-03-9** : sessions opaques (ADR-005), appareils authentifiés par secret.

## Risques
- **R-03-1** Dérive des droits avec le temps : revue trimestrielle des attributions générée par TEMPER (sprint 3).
- **R-03-2** Oubli de filtre dans un nouveau service : test d intégration 403 obligatoire par route, revue à deux approbations.

MAAYOUD
