# 02 : Atelier métier, de la fève à la tablette

**Date** : 2026-11-17, 3 h (dont visite de ligne). **Participants** : PO, ARCHI, BACK, DATA, UX, QA, METIER-PROD, METIER-QUAL, un chef d équipe, un magasinier.

## Processus cartographié
Réception des fèves (contrôle camion, humidité, échantillon) → quarantaine → tri et nettoyage → **torréfaction (CCP1)** → concassage et vannage → broyage (masse de cacao) → mélange (sucre, lait en poudre, beurre de cacao) → affinage (granulométrie inférieure à 20 microns) → conchage (24 h ou plus) → tempérage (31 à 32 °C pour le noir) → moulage ou enrobage → refroidissement → démoulage → **détection des métaux (CCP2)** → emballage → produit fini en quarantaine → libération qualité → stockage 15 à 18 °C → préparation → expédition.

## Échanges
- **METIER-QUAL** : un lot doit pouvoir être remonté jusqu à la coopérative et descendu jusqu au client. Exigence : généalogie à chaque transformation, pas seulement à l expédition.
- **METIER-PROD** : la saisonnalité écrase tout : Saint-Nicolas et Noël triplent la charge des lignes de moulage. Le plan doit voir la capacité des lignes et des équipes.
- **Chef d équipe** : à la ligne, on a des gants et du chocolat sur les doigts : gros boutons, scan, pas de clavier.
- **Magasinier** : le FEFO est vital pour les noisettes et le lait en poudre ; le système doit refuser un lot plus récent si un plus ancien est disponible, sauf dérogation tracée.
- **DATA** : le TRS est calculé par ligne et par poste ; les arrêts doivent être catégorisés à la saisie, sinon l indicateur est inutile.
- **METIER-QUAL** : un changement de production avec un allergène (lait après noir) impose un contrôle de nettoyage avant redémarrage. Le blanchiment gras est la première cause de réclamation : il faut relier réclamations, lots et paramètres de tempérage.

## Décisions
- **D-02-1** : tout lot produit naît en quarantaine ; seule la libération qualité (quatre yeux) le rend disponible.
- **D-02-2** : consommation de matière uniquement par scan de lot libéré ; FEFO imposé, dérogation tracée.
- **D-02-3** : la recette est un secret de fabrication : l opérateur voit les instructions de son OF, jamais la formulation complète.
- **D-02-4** : contrôle `ALLERGEN_CHANGEOVER` obligatoire avant tout démarrage avec un allergène différent du précédent.
- **D-02-5** : arrêt machine catégorisé à la saisie (8 catégories) ; TRS par ligne et poste.
- **D-02-6** : intervention de maintenance en zone alimentaire : remise en production après validation d hygiène par la qualité.

## Actions
- ARCHI : modéliser lots, généalogie, recettes versionnées, gammes et CCP (fait dans le schéma).
- UX : maquettes de la tablette de ligne (sprint 6).
- QA : scénario de rappel en moins de 2 minutes.

MAAYOUD
