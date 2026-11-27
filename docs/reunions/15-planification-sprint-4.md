# 15 : Planification du sprint 4

Date : 2026-11-27. Durée : 45 minutes. Participants : PO, TL, ARCHI, BACK, FRONT, SECU, DPO, QA, METIER-RH, METIER-PROD, CE.

## Ordre du jour

Planning 3x8, calcul des journées, anomalies, corrections, congés, absences, capteurs, charge du changement d équipe.

## Échanges

- METIER-PROD veut publier la semaine du lundi au vendredi pour les trois équipes, en rotation matin, après-midi, nuit.
- CE rappelle que le pointage brut ne se corrige pas en place. Une correction ajoute un fait, ou le retire du calcul.
- DPO refuse tout champ de diagnostic sur une absence. Le certificat est une clé de fichier.
- QA veut un seuil mesurable : 300 passages en dix minutes, p95 sous 300 ms. OPS refuse une dépendance npm pour l outil de charge.
- BACK propose de réutiliser les droits du planning pour la journée calculée, les colonnes d appartenance étant les mêmes.

## Décisions

- D-15-1. Le pointage brut est immuable. Une correction `ADD` approuvée crée un nouveau pointage `IMPORT`. Une correction `VOID` approuvée est ignorée au calcul. Aucune mise à jour du pointage d origine.
- D-15-2. `POST /time/schedules/rotation` publie le lundi au vendredi pour PROD-A, PROD-B et PROD-C. La semaine demandée doit commencer un lundi. La rotation suit le numéro de semaine ISO. L opération est idempotente sur le couple personne et début prévu.
- D-15-3. `POST /time/days/close` recalcule les journées tant qu elles ne sont pas `VALIDATED`. Une personne planifiée, sans entrée, hors congé approuvé et hors absence, reçoit l anomalie `ABSENT`.
- D-15-4. Un congé réserve des jours planifiés. Le solde insuffisant répond 409. Le refus du circuit rend les jours. L acceptation marque la demande acceptée. Le passage de planifié à pris attend le relevé.
- D-15-5. Une absence stocke le type, la période, la clé du certificat et, le cas échéant, l incident. Pas de motif médical.
- D-15-6. `POST /time/sensors` est réservé à un capteur actif. Une température hors de 12 à 20 °C lève une alerte. La mesure est ajoutée, jamais modifiée.
- D-15-7. La charge de 300 passages est un script k6, hors dépendance. Le test automatisé mesure un lot de passages avec un type explicite.

## Risques

- R-15-1. Probabilité moyenne, impact moyen. Un second passage du calcul écrase une journée déjà corrigée à la main. Parade : ne pas recalculer le statut `VALIDATED`.
- R-15-2. Probabilité faible, impact fort. Un solde de test s épuise d une exécution à l autre. Parade : le test remet le solde à zéro avant la demande.

## Actions

- BACK : routes, calcul, circuits. FRONT : planning et journée, trois langues. QA : tests et script de charge. Docs : ADR-012 et module temps.

MAAYOUD
