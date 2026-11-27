# Conformité (Belgique et Union européenne)

> Ce document fixe les exigences produit. Chaque point marqué « à valider » doit être confirmé par le conseil juridique, le DPO et le secrétariat social de l entreprise cliente avant mise en production.

## RGPD

**Registre des traitements** (à tenir dans TEMPER, module Administration) : gestion du personnel, temps et présences, contrôle d accès, visiteurs, vidéosurveillance (hors périmètre, non traitée), paie, prospection B2B, fidélité boutique, sécurité des systèmes (journaux).

**Bases légales** : contrat de travail et obligations légales (paie, temps, sécurité au travail, sécurité alimentaire), intérêt légitime (contrôle d accès, journaux de sécurité, prospection B2B avec droit d opposition), consentement (fidélité marketing, classement nominatif de la progression).

**Analyses d impact (AIPD) obligatoires** avant mise en service : badges et contrôle d accès, pointage, géolocalisation du pointage mobile, présence nominative dans le monde 3D, gamification. Modèles à rédiger au sprint 1.

**Minimisation et vie privée par conception** (déjà dans le code) : UID de badge haché, pas de diagnostic médical, aptitude seulement, absences sans motif médical pour les managers, présence nominative restreinte, silhouettes anonymes, classement sur consentement, géolocalisation uniquement à l instant du pointage.

**Durées de conservation par défaut** (paramètre `retention`, à valider) : passages 6 mois, visiteurs 3 mois, pointages et relevés 5 ans, paie 5 ans, audit 10 ans, candidats non retenus 1 an. Purge et anonymisation par tâche planifiée.

**Droits des personnes** : demandes depuis Mon espace (`DataRequest`), délai d un mois, export structuré, journalisation.

## Droit social belge (à valider avec le secrétariat social)

- **Enregistrement du temps de travail** : système objectif, fiable et accessible (jurisprudence européenne de 2019 sur la mesure du temps de travail), consultable par le travailleur (Mon espace).
- **Règlement de travail** : horaires, pauses, modalités de pointage et de contrôle à y intégrer.
- **Introduction d une nouvelle technologie** (CCT n° 39) : information et concertation du conseil d entreprise avant le déploiement du pointage, des badges, du monde 3D et de la gamification.
- **Contrôle des communications électroniques** (CCT n° 81) : les journaux techniques ne servent pas à surveiller le contenu des communications.
- Commissions paritaires portées par les fiches de poste (exemples du jeu de démo : 118 ouvriers de l industrie alimentaire, 220 employés, 202 commerce de détail alimentaire) : **à vérifier** par le secrétariat social.
- Repos minimal entre deux prestations, limites de durée, travail de nuit et dominical : paramétrés dans `time.rules`, valeurs à confirmer.
- **Dimona** : transmise par le secrétariat social à partir de l onboarding (pas d appel direct à l ONSS dans le périmètre initial).
- Conseiller en prévention : rôle dédié ; déclaration d accident du travail à l assureur.

## Sécurité alimentaire

- **Autocontrôle et HACCP** (exigences de l AFSCA) : plan HACCP versionné, CCP surveillés, enregistrements immuables.
- **Traçabilité** un pas en amont, un pas en aval (règlement (CE) n° 178/2002) : généalogie des lots de la fève au client.
- **Information du consommateur** (règlement (UE) n° 1169/2011) : 14 allergènes, mentions « peut contenir », étiquetage multilingue FR / NL / DE.
- **Contaminants** : suivi des analyses (cadmium dans le chocolat, mycotoxines), limites réglementaires paramétrables.
- Certifications privées : IFS Food, BRCGS, FSSC 22000, bio, cacao durable.
- Retraits et rappels : notification de l autorité, communication clients, bilan.

## Devoir de vigilance déforestation

Le cacao entre dans le champ du règlement (UE) 2023/1115. TEMPER gère la déclaration de diligence, la géolocalisation des parcelles, l analyse de risque et l atténuation par fournisseur et par lot. **Le calendrier d application a été reporté à plusieurs reprises : vérifier la date en vigueur** avant tout engagement client.

## Facturation électronique

Belgique : facture électronique structurée via le réseau Peppol obligatoire entre entreprises assujetties depuis le 1er janvier 2026. TEMPER émet et reçoit en Peppol BIS Billing 3.0 via un point d accès certifié (intégration `PEPPOL`), communication structurée belge sur les factures.

## Cybersécurité (à évaluer)

Les producteurs alimentaires d une certaine taille peuvent relever de la directive NIS2 (transposée en droit belge). Si l entreprise est concernée : gestion des risques, notification d incidents, sécurité de la chaîne d approvisionnement logicielle. TEMPER fournit les journaux, la traçabilité et les procédures.

## Caisse et commerce de détail

Vérifier les obligations de caisse enregistreuse applicables aux boutiques selon leur activité, et la conformité des terminaux de paiement.

MAAYOUD
