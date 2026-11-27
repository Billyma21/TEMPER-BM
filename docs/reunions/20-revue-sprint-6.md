# 20 : Revue du sprint 6

Date : 2026-11-27. Durée : 25 minutes. Participants : PO, TL, BACK, FRONT, QA, METIER-PROD, METIER-QUAL.

## Ordre du jour

Revue des versions de recette, de l ordre figé, de la tablette, de la généalogie, du TRS et des quêtes.

## Échanges

- QA a rejoué le gabarit et les tests de temps : la suite passe.
- Emma ne lit pas la liste des recettes. Sa tablette reçoit les étapes, sans les lignes de formulation.
- Le lot en quarantaine est refusé. Le lot produit naît en quarantaine et apparaît dans la traçabilité aval du lot consommé.
- Le changement d allergène bloque le démarrage, puis le contrôle `ALLERGEN_CHANGEOVER` le débloque.
- La quête d hygiène se termine. L événement de cadence ne fait pas bouger la progression ni l expérience.

## Décisions

- D-20-1. Le sprint 6 est accepté.
- D-20-2. Les écrans Tablette et Traçabilité affichent l état vide tant qu aucun ordre ou lot n est choisi.
- D-20-3. La libération des lots, le HACCP et les messages machines restent au sprint 7.

## Risques

- R-20-1. Probabilité faible, impact faible. Le plafond de connexion de production reste à dix essais par minute. La suite de test, qui ouvre plusieurs sessions, utilise un plafond plus haut.

## Actions

- Sprint 7 : qualité, libération, maintenance et messages machines.

MAAYOUD
