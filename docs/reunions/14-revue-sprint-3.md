# 14 : Revue du sprint 3

Date : 2026-11-27. Durée : 30 minutes. Participants : PO, TL, BACK, FRONT, 3D, SECU, DPO, QA, METIER-RH.

## Ordre du jour

Vérifier les critères du sas, du badge perdu et du départ. Regarder l organigramme, la fiche, l accueil et l évacuation.

## Échanges

QA a rejoué la décision de porte sur la base de test : entrée accordée, seconde entrée `ANTI_PASSBACK`, formation échue `TRAINING_EXPIRED` avec notification au manager, badge perdu `BADGE_INACTIVE` avec alerte. Le départ remet les badges à `RETURNED` et révoque les sessions. Le test remet ensuite la fiche d Emma en activité, pour que la suite reste rejouable. DPO confirme que l UID n est pas en base et que l évacuation nominative est refusée à l opératrice. SECU confirme le refus d auto-attribution, la date de fin pour un étudiant, et le circuit pour `ADMIN_IT`.

## Décisions

- D-14-1. Le sprint 3 est accepté. Les critères écrits sont couverts par les tests.
- D-14-2. La connexion d entreprise reste éteinte. Elle s allumera quand un émetteur sera nommé.
- D-14-3. Les listes de démonstration restent vides tant qu une capture réelle n est pas refaite. Les écrans montrent l état vide, pas des lignes inventées.

## Risques

- R-14-1. Probabilité basse, impact moyen : Redis arrêté, le drapeau d évacuation retombe. Parade : la copie locale de la tablette reste lisible, le journal des passages reste dans PostgreSQL.

## Actions

FRONT vérifie les écrans dans le navigateur. Le sprint 4 (temps, anomalies, congés) peut démarrer.

MAAYOUD
