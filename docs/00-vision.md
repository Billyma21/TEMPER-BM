# Vision produit

## En une phrase

TEMPER est le système de gestion intégré d une chocolaterie industrielle : chaque personne, chaque badge, chaque fève, chaque lot, chaque outil, chaque commande et chaque euro sont suivis dans un seul outil, consultable en **mode Bureau** (interface classique, rapide, exhaustive) ou en **mode Monde** (jumeau numérique 3D isométrique, ludique, compréhensible en un coup d oeil).

## Pourquoi

Une chocolaterie comme Maison Aurum (société fictive de démonstration, 4 sites, environ 50 personnes dans le jeu de données, conçue pour monter à 1 500) vit aujourd hui avec :

- un logiciel de pointage, un autre pour les badges, des tableurs pour la production, un ERP comptable, un CRM, des classeurs HACCP papier ;
- des ressaisies, des écarts, aucune traçabilité de bout en bout (fève vers tablette vers client) en moins de 4 heures en cas de rappel ;
- des écrans « colonnes et lignes » que personne n a envie d ouvrir.

TEMPER remplace ce patchwork par une seule source de vérité et rend l information **désirable** : le directeur voit son usine vivre, la commerciale voit ses prospects changer de pièce, l opératrice voit ses quêtes du jour.

## Principes non négociables

1. **Une donnée, un endroit, un propriétaire.** Aucune ressaisie entre modules.
2. **Les droits avant l écran.** Chaque donnée est filtrée par l API selon le rôle, le périmètre (site, département, équipe, personnel) et la période. Le monde 3D obéit aux mêmes règles que le bureau.
3. **Traçabilité totale.** Mouvements de stock, pointages, lots, factures, journal d audit : immuables, corrigés par contre-écriture.
4. **Le terrain d abord.** Borne de pointage hors ligne, tablettes de ligne, gros boutons, gants, bruit, poussière de cacao, températures.
5. **Vie privée par conception.** Présence nominative visible uniquement par les managers concernés, classements sur consentement, jamais de diagnostic médical, géolocalisation limitée au pointage et aux rôles itinérants.
6. **Gamification éthique.** On récompense la qualité, la sécurité, l entraide et la régularité, jamais la vitesse de production ni le volume au détriment de la sécurité.
7. **Conformité belge et européenne native** : droit du travail, RGPD, sécurité alimentaire, facturation électronique, devoir de vigilance.

## Personas (extraits)

| Persona | Rôle TEMPER | Ce qu il veut | Mode préféré |
|---|---|---|---|
| Catherine, directrice générale | DIRECTION_GENERALE | Vision globale, validations, aucune donnée nominative sensible | Monde (vue ville) puis Pilotage |
| Marc, directeur d usine | DIRECTEUR_SITE + DIRECTEUR_PRODUCTION | TRS, pannes, présence, plan de production | Monde (hall) |
| Karim, chef d équipe matin | CHEF_EQUIPE | Qui est là, OF du poste, corrections de pointage | Tablette, Bureau |
| Emma, opératrice | OPERATEUR | Son OF, ses contrôles, ses quêtes, son planning | Tablette de ligne, Monde |
| Sarah, responsable qualité | RESPONSABLE_QUALITE | CCP, libération des lots, rappel en 1 clic | Bureau |
| Youssef, magasinier | MAGASINIER | Réceptions, inventaires, prêts d outils | Terminal portable |
| Noa, commerciale | COMMERCIAL | Prospects, devis, commandes, quêtes d appels | Monde (bureau commercial) |
| Zineb, vendeuse | VENDEUR_BOUTIQUE | Caisse, fidélité, stock boutique | Caisse |
| Nadia, DRH | DRH | Dossiers, paie, conformité, demandes RGPD | Bureau |
| Bilal, admin IT | ADMIN_IT | Comptes, rôles, bornes, intégrations, audit | Bureau |
| Auditeur IFS | AUDITEUR_QUALITE | Lecture seule, 5 jours, périmètre qualité | Bureau |

## Indicateurs de succès

- Rappel produit : liste des clients concernés par un lot de fèves en **moins de 2 minutes** (exigence interne, bien en deçà des délais d audit).
- Pointage : **moins de 1 seconde** entre le badge et le message de la borne ; zéro pointage perdu hors ligne.
- Paie : export vers le secrétariat social **sans ressaisie**, anomalies traitées avant clôture.
- Adoption : plus de 80 % du personnel connecté au moins une fois par semaine au bout de 3 mois.
- Sécurité : zéro accès hors périmètre en test d intrusion ; MFA sur 100 % des rôles sensibles.

MAAYOUD
