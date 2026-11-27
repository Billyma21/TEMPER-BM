# 04 : RH, temps, badges

**Date** : 2026-11-19, 2 h. **Participants** : METIER-RH, gestionnaire de paie, conseiller en prévention, CE (invité), DPO, BACK, FRONT, UX, SECU, QA.

## Échanges
- **CE** : le personnel craint le flicage. Qui voit mes heures, mes absences, où je suis ? Demande : transparence et limitation.
- **DPO** : AIPD obligatoire ; information et concertation du conseil d entreprise avant déploiement (nouvelle technologie).
- **Gestionnaire de paie** : aujourd hui 2 jours de ressaisie par mois. Besoin : relevé validé par le manager puis par la paie, export au format du secrétariat social, anomalies avant clôture.
- **METIER-RH** : les postes de nuit chevauchent minuit ; les intérimaires doivent perdre leurs accès automatiquement.
- **Conseiller en prévention** : en cas d évacuation, il faut la liste des présents même si le serveur est tombé.
- **SECU** : badges DESFire chiffrés, UID jamais stocké en clair, alerte en cas de double présence.
- **UX** : la borne doit répondre en moins d une seconde, avec le prénom, et un message clair en cas de refus.
- **QA** : 300 personnes badgent entre 13:50 et 14:10.

## Décisions
- **D-04-1** : pointages bruts immuables, corrections par demande validée ; aucun arrondi en défaveur du travailleur.
- **D-04-2** : le travailleur voit tous ses pointages, son calcul et ses anomalies dans Mon espace.
- **D-04-3** : le manager voit les absences de son équipe **sans** motif médical ; personne ne voit de diagnostic.
- **D-04-4** : pointage mobile désactivé par défaut, ouvert par rôle (commerciaux, chauffeurs, techniciens) et géorepéré sauf rôles itinérants.
- **D-04-5** : borne hors ligne avec file idempotente (ADR-008) ; secours matricule + PIN.
- **D-04-6** : moteur de calcul des journées en fonctions pures testées, règles paramétrables (`time.rules`).
- **D-04-7** : accès zone production refusé si formation hygiène expirée, avertissement dès le pointage.
- **D-04-8** : mode évacuation avec copie locale chiffrée de la liste des présents.
- **D-04-9** : présentation au conseil d entreprise avant mise en service ; AIPD signée.

## Actions
- BACK : moteur de journées et tests (fait, 8 cas) ; scan borne (fait) ; export paie (sprint 5).
- DPO : AIPD pointage et badges (sprint 1).
- QA : test de charge k6 (sprint 4).

MAAYOUD
