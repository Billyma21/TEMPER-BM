# 01 : Lancement du projet

**Date** : 2026-11-16, 2 h. **Participants** : PO, TL, ARCHI, BACK, FRONT, 3D, UX, SECU, DPO, QA, OPS, DATA, METIER-PROD, METIER-QUAL, METIER-RH.

## Ordre du jour
1. Ambition et périmètre. 2. Ce qui fait échouer un ERP. 3. Organisation de l équipe. 4. Démo de référence (vidéo « j ai remplacé mon CRM par un jeu vidéo »).

## Échanges
- **PO** : l ambition est « toute la société », pas un module. Le risque est de faire 19 modules à moitié. Proposition : un socle irréprochable (droits, audit, données) puis des tranches verticales complètes.
- **METIER-PROD** : la vraie douleur de l usine est la traçabilité lors d un rappel et les pannes non visibles. Le pointage vient ensuite.
- **METIER-RH** : sans pointage fiable et export paie, l outil ne sera pas adopté par la direction.
- **3D** : la vidéo de référence fonctionne parce que chaque objet du monde a un sens métier (un prospect = un bonhomme, une étape = une pièce, un client signé = un chantier). On ne fait pas de décor gratuit.
- **SECU** : un monde 3D qui montre qui est où est une donnée personnelle ; il doit obéir aux mêmes droits que le reste.
- **UX** : deux modes, une seule application : Bureau pour agir, Monde pour comprendre. Bascule en un clic.

## Décisions
- **D-01-1** : nom de code TEMPER ; société de démonstration fictive « Maison Aurum Chocolatier » (4 sites).
- **D-01-2** : socle d abord (droits, audit, schéma complet, seed réaliste), puis tranches verticales par sprint.
- **D-01-3** : deux modes d interface dans la même application ; le Monde n affiche rien que le Bureau ne montrerait pas au même utilisateur.
- **D-01-4** : français, néerlandais, anglais dès le socle.
- **D-01-5** : tout livrable signé MAAYOUD ; conventions de commit en français ; aucun tiret cadratin dans les textes.

## Risques
- **R-01-1** Effet tunnel (19 modules) : probable, critique. Parade : démo toutes les deux semaines aux métiers.
- **R-01-2** Rejet du pointage par le personnel : possible, élevé. Parade : concertation du conseil d entreprise (réunion 04), transparence (Mon espace).

## Actions
- PO : feuille de route 12 sprints (fait, `12-feuille-de-route.md`).
- ARCHI : architecture et ADR (réunion 06).
- METIER-PROD et METIER-QUAL : atelier processus (réunion 02).

MAAYOUD
