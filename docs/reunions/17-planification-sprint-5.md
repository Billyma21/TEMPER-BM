# 17 : Planification du sprint 5

Date : 2026-11-27. Durée : 40 minutes. Participants : PO, TL, BACK, FRONT, SECU, DPO, QA, METIER-RH.

## Ordre du jour

Relevés de prestations, double validation, export vers le secrétariat social, jours fériés, soldes.

## Échanges

- METIER-RH veut un relevé par personne et par période, puis deux accords distincts : le manager, ensuite la paie.
- CE rappelle qu un relevé exporté ne se réécrit pas. Une correction tardive ouvre une régularisation sur la période suivante.
- DPO refuse tout motif médical dans le fichier envoyé au secrétariat. Le matricule, le nom et les heures suffisent.
- BACK propose de recalculer les soldes depuis les demandes, pour que l opération soit rejouable.

## Décisions

- D-17-1. `POST /time/timesheets/build` additionne les journées de la période. Un relevé qui n est plus `OPEN` est laissé tel quel.
- D-17-2. Le passage est `OPEN`, `SUBMITTED`, `MANAGER_APPROVED`, `PAYROLL_APPROVED`, `EXPORTED`. Le manager n est pas la personne du relevé. La paie n est pas le manager.
- D-17-3. L export produit un CSV point-virgule, dates `JJ/MM/AAAA`, heures avec virgule. Il verrouille les relevés. Un second export de la même période sans relevé prêt répond 409.
- D-17-4. Une correction acceptée sur une période déjà exportée crée un relevé `OPEN` sur la période suivante, avec `regularizationOf`.
- D-17-5. Un jour férié se déclare au niveau du site ou de toute l entreprise. Une portée limitée à l équipe est refusée.
- D-17-6. `POST /time/balances/settle` remet pris et planifié d après les demandes de l année. Un congé approuvé déjà terminé est pris. Le reste est planifié.

## Risques

- R-17-1. Probabilité faible, impact moyen. Recalculer tous les soldes sans filtre écraserait des chiffres de démonstration. Parade : le corps peut viser une seule personne.
- R-17-2. Probabilité faible, impact moyen. Deux corrections après export ne créent qu une ligne de régularisation. Parade : la ligne reste `OPEN` et sera reprise au prochain relevé.

## Actions

- BACK : circuit, export, fériés, soldes. FRONT : relevés et fériés, trois langues. QA : double validation et verrou.

MAAYOUD
