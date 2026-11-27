# ADR-014 : Fabrication et secret de recette

**Statut** : accepté (sprint 6)

**Contexte** : la recette est un secret. L opérateur exécute un ordre. Le lot produit attend la qualité. Le changement d allergène et la généalogie sont déjà dans le modèle.

**Décision**

- Une nouvelle version part en revue. La qualité accepte, puis la production. La version approuvée remplace les versions approuvées plus anciennes du même code, qui passent `OBSOLETE`.
- L ordre copie le numéro de version et les étapes. La feuille de tablette ne contient pas les lignes de formulation.
- Le démarrage compare les allergènes du produit avec le précédent ordre de la ligne. S ils diffèrent, un arrêt `CHANGEOVER` de motif `ALLERGEN_CHANGEOVER` est exigé.
- La consommation décrémente un lot `RELEASED` et écrit un mouvement immuable. La sortie crée un lot `QUARANTINE` et relie les lots consommés.
- Le TRS du poste de jour se recalcule. Les quêtes ignorent la cadence et le silence.

**Conséquences** : la libération qualité, le HACCP et les messages machines restent au sprint suivant. La réservation FEFO prépare le stock sans le mouvement de sortie.

**Alternatives écartées** : montrer la recette à l opérateur avec des champs masqués côté écran seulement ; récompenser les kilogrammes produits ; consommer un lot en quarantaine avec un avertissement.

MAAYOUD
