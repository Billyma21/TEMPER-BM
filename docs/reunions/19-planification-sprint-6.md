# 19 : Planification du sprint 6

Date : 2026-11-27. Durée : 45 minutes. Participants : PO, TL, BACK, FRONT, SECU, METIER-PROD, METIER-QUAL, QA.

## Ordre du jour

Recettes versionnées, ordres de fabrication, tablette de ligne, consommations, généalogie, TRS, quêtes.

## Échanges

- METIER-QUAL veut deux accords sur une nouvelle version : la qualité, puis la production. L ancienne version approuvée devient obsolète.
- METIER-PROD rappelle que l ordre fige la version au lancement. L opérateur voit la gamme, pas les quantités de la recette.
- Un lot en quarantaine ou bloqué ne se consomme pas. Le lot produit naît en quarantaine.
- Un changement d allergène sur la ligne exige un contrôle de changement avant le démarrage.
- Les quêtes récompensent l hygiène et le signalement. La cadence et le silence sur un incident sont exclus.

## Décisions

- D-19-1. `POST /production/recipes/:id/versions` copie la recette et ouvre le circuit `RECIPE_VERSION`.
- D-19-2. `POST /production/orders` n accepte qu une recette `APPROVED` et enregistre son numéro de version.
- D-19-3. `GET /production/orders/:id/sheet` renvoie les étapes, sans les lignes de formulation.
- D-19-4. Le démarrage refuse un changement d allergène tant que le contrôle `ALLERGEN_CHANGEOVER` n est pas déclaré.
- D-19-5. La consommation exige un lot `RELEASED`. La sortie crée un lot `QUARANTINE` et les liens de généalogie.
- D-19-6. Le TRS du jour est recalculé et stocké. Une quête dont l événement est une cadence ou un silence répond 409.

## Risques

- R-19-1. Probabilité faible, impact moyen. Réserver plus que le stock libre. Parade : la réservation s arrête à la quantité libre, en FEFO, lots libérés d abord.
- R-19-2. Probabilité faible, impact faible. La traçabilité aval ne liste pas encore les clients livrés quand aucune préparation n est liée au lot. Parade : le tableau `customers` reste vide et prêt.

## Actions

- BACK : circuit, tablette, généalogie, TRS, quêtes. FRONT : tablette et traçabilité, trois langues. QA : secret de recette et lot refusé.

MAAYOUD
