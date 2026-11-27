# 16 : Revue du sprint 4

Date : 2026-11-27. Durée : 30 minutes. Participants : PO, TL, BACK, FRONT, QA, METIER-RH.

## Ordre du jour

Revue de la rotation, du calcul des journées, des circuits, des absences, des capteurs et de la charge.

## Échanges

- QA a rejoué le gabarit, le calendrier, les règles de temps et les portes : 156 tests passent.
- Le lot de 22 passages borne, type explicite, reste sous 300 ms au percentile 95.
- Le script k6 décrit les 300 passages en dix minutes. Il n a pas été exécuté ici : l outil n est pas installé, et il n est pas une dépendance.
- Les listes de démonstration restent vides. Aucune ligne inventée.

## Décisions

- D-16-1. Le sprint 4 est accepté. Le pointage brut n a pas été réécrit : la correction approuvée a ajouté un pointage `IMPORT`.
- D-16-2. Le script de charge reste documentaire tant que k6 n est pas lancé contre une API démarrée. Le critère produit, p95 sous 300 ms, est tenu par le lot automatisé.
- D-16-3. Les écrans planning et journée affichent l état vide quand l API ne renvoie aucune ligne.

## Risques

- R-16-1. Probabilité faible, impact faible. Un journal d audit a signalé une transaction déjà close pendant l arrêt du test. Les passages ont répondu 200. Parade : surveiller le journal en charge réelle, sans changer le calcul.

## Actions

- Sprint 5 : relevés, double validation, export vers le secrétariat social, jours fériés et soldes.

MAAYOUD
