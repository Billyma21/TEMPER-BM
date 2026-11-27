# 18 : Revue du sprint 5

Date : 2026-11-27. Durée : 25 minutes. Participants : PO, TL, BACK, FRONT, QA, METIER-RH.

## Ordre du jour

Revue du relevé, de la double validation, de l export, des fériés et des soldes.

## Échanges

- QA a rejoué le gabarit, le calendrier, les règles de temps et les portes : 158 tests passent.
- Le relevé d Emma passe par le manager, puis par une autre personne pour la paie. Le CSV contient le matricule et une virgule pour les heures. Il ne contient pas de diagnostic.
- Un second calcul laisse le relevé exporté intact. La correction acceptée ensuite ouvre un relevé ouvert au 9 mars 2026.
- Le directeur d équipe ne déclare pas le férié. Le compte de secours le déclare. Le recalcul du solde donne deux fois le même résultat.

## Décisions

- D-18-1. Le sprint 5 est accepté.
- D-18-2. Les écrans Relevés et Jours fériés affichent l état vide quand l API ne renvoie aucune ligne.
- D-18-3. Le connecteur réel du secrétariat social attend le prestataire. Le CSV est le livrable de ce sprint.

## Risques

- R-18-1. Probabilité faible, impact faible. Un journal d audit signale parfois une transaction déjà close à l arrêt du test. Les actes du relevé ont répondu comme prévu. Parade : surveiller le journal en charge réelle.

## Actions

- Sprint 6 : production, recettes, ordres de fabrication et tablette de ligne.

MAAYOUD
