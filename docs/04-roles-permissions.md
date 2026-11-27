# Rôles et permissions

> Document généré automatiquement depuis `packages/permissions` (`pnpm docs:matrix`). Ne pas modifier à la main.

## Légende des portées

- **P** : Personnel
- **E** : Équipe
- **D** : Département
- **S** : Site
- **T** : Entreprise

## Vue d ensemble : portée maximale de consultation par module

Chaque rôle interne inclut le socle EMPLOYE (libre-service), chaque rôle externe le socle EXTERNE. Case vide : aucune donnée. P seul : libre-service "Mon espace", le module métier reste masqué. Astérisque : champs limités (annuaire, adresse de livraison).

| Rôle | Orga | RH | Accès | Temps | Prod | Qualité | Stock | Outils | Maint. | Achats | Ventes | Boutique | Logist. | Finance | HSE | Comm. | Monde | Pilotage | Admin |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| Employé (socle) | T | T* | P | P |  | P |  | P |  | P |  |  |  | P | P | S | T | P | P |
| Externe (socle) | T |  |  |  |  |  |  |  |  |  |  |  |  |  |  | P |  |  | P* |
| Super administrateur | T | T | T | T | T | T | T | T | T | T | T | T | T | T | T | T | T | T | T |
| Administrateur IT | T | T* | T | P |  | P |  | P |  | P |  |  |  | P | P | S | T | P | T |
| Direction générale | T | T | T | T | T | T | T | T | T | T | T | T | T | T | T | T | T | T | T |
| Directeur de site | T | T* | S | S | T | S | T | S | S | T | T | S | S | S | S | S | T | T | S |
| Directeur des ressources humaines | T | T | T | T |  | P |  | P |  | P |  |  |  | P | P | T | T | T | T |
| Gestionnaire RH | T | T* | S | S |  | P |  | P |  | P |  |  |  | P | P | S | T | P | P |
| Gestionnaire de paie | T | T | P | T |  | P |  | P |  | P |  |  |  | P | P | S | T | P | P |
| Conseiller en prévention | T | T* | P | P | S | P |  | S |  | P |  |  |  | P | S | S | T | P | P |
| Représentant du personnel (CPPT, CE) | T | T* | P | P |  | P |  | P |  | P |  |  |  | P | S | S | T | T | P |
| Manager d équipe | T | T* | P | E |  | P |  | E |  | P |  |  |  | P | P | S | T | P | P |
| Directeur de production | T | T* | P | S | T | S | T | E | S | P |  |  |  | T | P | S | T | T | P |
| Planificateur | T | T* | P | S | T | P | T | P | S | T | T |  |  | P | P | S | T | P | P |
| Maître chocolatier (R&D) | T | T* | P | P | T | T | T | P |  | T |  |  |  | P | P | S | T | P | P |
| Chef d équipe production | T | T* | P | E | T | T | T | S | S | P |  |  |  | P | S | S | T | P | P |
| Opérateur de ligne | T | T* | P | P | T | T | T | S | S | P |  |  |  | P | P | S | T | P | P |
| Responsable qualité et sécurité alimentaire | T | T* | P | P | T | T | T | S |  | T |  |  |  | P | S | S | T | T | P |
| Technicien qualité | T | T* | P | P | T | T | T | S |  | S |  |  |  | P | P | S | T | P | P |
| Responsable maintenance | T | T* | P | E | S | P | T | S | S | P |  |  |  | P | S | S | T | T | P |
| Technicien de maintenance | T | T* | P | P | S | P | T | S | S | P |  |  |  | P | P | S | T | P | P |
| Responsable logistique | T | T* | P | E |  | P | T | S |  | S | S |  | T | P | P | S | T | P | P |
| Magasinier, cariste | T | T* | P | P |  | P | T | S |  | S |  |  | S | P | P | S | T | P | P |
| Préparateur de commandes | T | T* | P | P |  | P | T | P |  | P |  |  | S | P | P | S | T | P | P |
| Chauffeur livreur | T | T* | P | P |  | P |  | P |  | P | T* |  | P | P | P | S | T | P | P |
| Responsable achats | T | T* | P | P | T | P | T | P |  | T |  |  |  | P | P | S | T | T | P |
| Acheteur | T | T* | P | P | T | P | T | P |  | T |  |  |  | P | P | S | T | P | P |
| Directeur commercial | T | T* | P | E | T | P | T | E |  | P | T |  |  | T | P | S | T | T | P |
| Commercial | T | T* | P | P | T | P | T | P |  | P | T |  |  | P | P | S | T | P | P |
| Administration des ventes | T | T* | P | P | T | T | T | P |  | P | T |  | T | P | P | S | T | P | P |
| Marketing | T | T* | P | P | T | T |  | P |  | P | T |  |  | P | P | T | T | T | P |
| Responsable de boutique | T | T* | P | E | T | T | S | E |  | P | T | S |  | P | P | S | T | T | P |
| Vendeur en boutique | T | T* | P | P | T | T | S | P |  | P | T | S |  | P | P | S | T | P | P |
| Directeur administratif et financier | T | T | P | T | T | P | T | P |  | T | T |  |  | T | P | S | T | T | P |
| Comptable | T | T* | P | P |  | P |  | P |  | T | T |  |  | T | P | S | T | P | P |
| Contrôleur de gestion | T | T* | P | P | T | P | T | P |  | T | T |  |  | T | P | S | T | T | P |
| Agent de sécurité, accueil | T | T* | S | P |  | P |  | P |  | P |  |  |  | P | P | S | T | P | P |
| Sous-traitant | T |  |  |  | S* |  |  |  | P |  |  |  |  |  | P | P |  |  | P* |
| Auditeur qualité (lecture seule, durée limitée) | T | S* |  |  | T | T | S | S |  | T |  |  |  |  |  | P |  |  | P* |
| Auditeur financier (lecture seule, durée limitée) | T |  |  |  |  |  | T |  |  | T | T |  |  | T |  | P |  |  | T |
| Borne et lecteur (appareil) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |

## Détail par rôle

### Employé (socle) (`EMPLOYE`)

Libre-service de chaque membre du personnel : profil, pointages, planning, congés, absences, fiches de paie, formations, outils empruntés, quêtes, annuaire.

- Catégorie : socle (socle automatique)
- Second facteur obligatoire : non ; délégable : non ; session max : 12 h
- Tenue dans le monde 3D : chemise

| Actions | Ressources | Portée | Restrictions |
|---|---|---|---|
| Consulter | Société, Site, Département, Équipe, Fiche de poste | Entreprise |  |
| Consulter | Fiche employé | Entreprise | champs : id, firstName, lastName, preferredName, jobTitle, positionId, departmentId, teamId, siteId, workEmail, workPhone, photoUrl, languages, avatar |
| Consulter | Fiche employé | Personnel |  |
| Modifier | Fiche employé | Personnel | champs : preferredName, personalPhone, personalEmail, address, emergencyContactName, emergencyContactPhone, photoUrl, languages, avatar |
| Consulter | Données de paie (salaire, IBAN, NISS), Aptitude médecine du travail, Contrat de travail, Formation et certification, Document du personnel, Arrivée et départ | Personnel |  |
| Consulter | Pointage brut, Planning, Solde de congés, Relevé de prestations, Absence | Personnel |  |
| Créer | Pointage brut | Personnel | si {"source":{"in":["MOBILE","WEB"]}} |
| Créer, Consulter | Correction de pointage, Demande de congé | Personnel |  |
| Modifier | Demande de congé | Personnel | si {"status":"PENDING"} |
| Créer | Absence | Personnel |  |
| Consulter | Badge, Journal des passages | Personnel |  |
| Consulter | Prêt d outil, Équipement de protection individuelle | Personnel |  |
| Créer, Consulter | Accident, presque accident, situation dangereuse, Non-conformité | Personnel |  |
| Consulter | Annonce interne | Site |  |
| Consulter | Document (procédures, notes) | Site | si {"visibility":"ALL_STAFF"} |
| Consulter, Modifier | Tâche | Personnel |  |
| Créer, Consulter | Demande de validation | Personnel |  |
| Consulter, Modifier | Notification | Personnel |  |
| Créer, Consulter | Note de frais, Demande d achat | Personnel |  |
| Modifier | Note de frais | Personnel | si {"status":"DRAFT"} |
| Créer, Consulter | Demande RGPD (accès, rectification, effacement) | Personnel |  |
| Consulter | Accès au monde 3D | Entreprise |  |
| Consulter, Modifier | Quête | Personnel |  |
| Créer, Consulter, Modifier, Supprimer | Tableau de bord | Personnel |  |
| Consulter, Modifier | Compte utilisateur | Personnel | champs : locale, theme, notificationPrefs, worldPrefs, mfaEnabled |

### Externe (socle) (`EXTERNE`)

Socle minimal des personnes sans contrat (sous-traitants, auditeurs, sécurité externalisée).

- Catégorie : socle (socle automatique), externe
- Second facteur obligatoire : non ; délégable : non ; session max : 8 h
- Tenue dans le monde 3D : visiteur

| Actions | Ressources | Portée | Restrictions |
|---|---|---|---|
| Consulter | Société, Site | Entreprise |  |
| Consulter, Modifier | Notification | Personnel |  |
| Consulter, Modifier | Compte utilisateur | Personnel | champs : locale, theme, notificationPrefs |

### Super administrateur (`SUPER_ADMIN`)

Accès total, réservé à 2 personnes nommément désignées. Clé de sécurité matérielle obligatoire, chaque action est journalisée et notifiée à la direction (accès bris de glace).

- Catégorie : it
- Second facteur obligatoire : oui ; délégable : non ; session max : 1 h
- Tenue dans le monde 3D : chemise

| Actions | Ressources | Portée | Restrictions |
|---|---|---|---|
| Tous droits | Tout | Entreprise |  |

### Administrateur IT (`ADMIN_IT`)

Comptes, rôles, appareils, intégrations, paramètres. Aucun accès aux données RH sensibles, financières ou aux recettes.

- Catégorie : it
- Second facteur obligatoire : oui ; délégable : non ; session max : 4 h
- Tenue dans le monde 3D : chemise

| Actions | Ressources | Portée | Restrictions |
|---|---|---|---|
| Tous droits | Compte utilisateur, Attribution de rôle, Appareil (borne, lecteur, capteur), Paramètre, Intégration externe, Clé d API, Modèle de quête, Accès au monde 3D | Entreprise |  |
| Consulter | Journal d audit | Entreprise |  |
| Créer, Consulter, Modifier | Société, Site, Département, Équipe | Entreprise |  |
| Consulter | Zone d accès, Règle d accès | Entreprise |  |

### Direction générale (`DIRECTION_GENERALE`)

Vision complète de l entreprise et validations stratégiques. Pas de données individuelles sensibles (paie nominative, médical, traces de passage) : uniquement des agrégats.

- Catégorie : direction
- Second facteur obligatoire : oui ; délégable : oui ; session max : 8 h
- Tenue dans le monde 3D : costume

| Actions | Ressources | Portée | Restrictions |
|---|---|---|---|
| Consulter, Exporter | Société, Site, Département, Équipe, Fiche de poste, Fiche employé, Contrat de travail, Formation et certification, Document du personnel, Arrivée et départ, Badge, Zone d accès, Règle d accès, Visiteur, Appareil (borne, lecteur, capteur), Pointage brut, Correction de pointage, Planning, Modèle horaire, Demande de congé, Solde de congés, Absence, Relevé de prestations, Export secrétariat social, Produit fini, Recette (secret de fabrication), Prévision de la demande, Ligne de production, Machine, Plan de production, Ordre de fabrication, Étape de fabrication, Lot, Arrêt machine, Plan HACCP, Contrôle qualité, Non-conformité, Action corrective et préventive, Analyse laboratoire, Libération de lot, Retrait et rappel produit, Allergène, Certification (IFS, BRCGS, bio, cacao durable), Réclamation client, Article, Entrepôt, Emplacement, Stock par lot, Mouvement de stock, Inventaire, Transfert inter-sites, Mesure température et humidité, Outil, moule, instrument, Prêt d outil, Étalonnage, Équipement de protection individuelle, Plan de maintenance préventive, Bon d intervention, Fournisseur, Devoir de vigilance (déforestation, durabilité), Contrat fournisseur, Demande d achat, Commande fournisseur, Réception marchandise, Facture fournisseur, Client, Prospect, Opportunité, Activité commerciale (appel, rendez-vous), Tarif, Promotion, Devis, Commande client, Facture client, Note de crédit, Boutique, Session de caisse, Ticket de caisse, Client fidélité, Liste de préparation, Expédition, Transporteur, Tournée de livraison, Véhicule, Preuve de livraison, Compte du plan comptable, Écriture comptable, Paiement, Budget, Coût de revient, Immobilisation, Note de frais, Accident, presque accident, situation dangereuse, Analyse de risques, Permis de travail (feu, hauteur, consignation), Énergie, eau, déchets, CO2, Annonce interne, Document (procédures, notes), Tâche, Demande de validation, Accès au monde 3D, Quête, Modèle de quête, Tableau de bord, Rapport, Compte utilisateur, Attribution de rôle, Journal d audit, Paramètre, Intégration externe | Entreprise |  |
| Valider / approuver | Commande fournisseur, Budget, Retrait et rappel produit, Recette (secret de fabrication), Note de crédit, Paiement, Client | Entreprise |  |
| Créer, Consulter, Modifier | Annonce interne | Entreprise |  |

### Directeur de site (`DIRECTEUR_SITE`)

Pilotage complet d un site (usine, entrepôt, boutique) : lecture de tout le site et validations locales.

- Catégorie : direction
- Second facteur obligatoire : oui ; délégable : oui ; session max : 8 h
- Tenue dans le monde 3D : costume

| Actions | Ressources | Portée | Restrictions |
|---|---|---|---|
| Consulter, Exporter | Site, Département, Équipe, Fiche employé, Contrat de travail, Formation et certification, Document du personnel, Arrivée et départ, Badge, Zone d accès, Règle d accès, Visiteur, Appareil (borne, lecteur, capteur), Pointage brut, Correction de pointage, Planning, Modèle horaire, Demande de congé, Solde de congés, Absence, Relevé de prestations, Export secrétariat social, Ligne de production, Machine, Plan de production, Ordre de fabrication, Étape de fabrication, Lot, Arrêt machine, Plan HACCP, Contrôle qualité, Non-conformité, Action corrective et préventive, Analyse laboratoire, Libération de lot, Entrepôt, Emplacement, Stock par lot, Mouvement de stock, Inventaire, Transfert inter-sites, Mesure température et humidité, Outil, moule, instrument, Prêt d outil, Étalonnage, Équipement de protection individuelle, Plan de maintenance préventive, Bon d intervention, Demande d achat, Commande fournisseur, Réception marchandise, Commande client, Boutique, Session de caisse, Ticket de caisse, Client fidélité, Liste de préparation, Expédition, Tournée de livraison, Véhicule, Preuve de livraison, Budget, Immobilisation, Note de frais, Accident, presque accident, situation dangereuse, Analyse de risques, Permis de travail (feu, hauteur, consignation), Énergie, eau, déchets, CO2, Annonce interne, Document (procédures, notes), Attribution de rôle | Site |  |
| Consulter | Présence nominative (qui est où) | Site |  |
| Consulter | Produit fini, Article, Client, Fournisseur, Rapport, Tableau de bord | Entreprise |  |
| Valider / approuver | Demande d achat, Budget, Relevé de prestations, Permis de travail (feu, hauteur, consignation), Inventaire, Correction de pointage | Site |  |
| Créer, Consulter, Modifier | Annonce interne | Site |  |

### Directeur des ressources humaines (`DRH`)

Tout le personnel, contrats, paie, temps, formations, organisation. Traite les demandes RGPD.

- Catégorie : rh
- Second facteur obligatoire : oui ; délégable : oui ; session max : 8 h
- Tenue dans le monde 3D : chemise

| Actions | Ressources | Portée | Restrictions |
|---|---|---|---|
| Tous droits | Fiche employé, Données de paie (salaire, IBAN, NISS), Contrat de travail, Formation et certification, Document du personnel, Arrivée et départ, Fiche de poste | Entreprise |  |
| Consulter | Aptitude médecine du travail | Entreprise |  |
| Tous droits | Correction de pointage, Planning, Modèle horaire, Demande de congé, Solde de congés, Absence, Relevé de prestations, Export secrétariat social | Entreprise |  |
| Consulter, Exporter | Pointage brut, Badge | Entreprise |  |
| Créer, Consulter, Modifier | Département, Équipe | Entreprise |  |
| Consulter, Modifier, Valider / approuver | Demande RGPD (accès, rectification, effacement) | Entreprise |  |
| Créer, Consulter, Modifier | Annonce interne, Document (procédures, notes) | Entreprise |  |
| Consulter, Exporter | Rapport | Entreprise |  |

### Gestionnaire RH (`GESTIONNAIRE_RH`)

Dossiers du personnel d un ou plusieurs sites, sans accès aux salaires.

- Catégorie : rh
- Second facteur obligatoire : oui ; délégable : oui ; session max : 8 h
- Tenue dans le monde 3D : chemise

| Actions | Ressources | Portée | Restrictions |
|---|---|---|---|
| Créer, Consulter, Modifier | Fiche employé, Contrat de travail, Formation et certification, Document du personnel, Arrivée et départ | Site |  |
| Consulter, Modifier, Valider / approuver | Demande de congé, Absence, Correction de pointage | Site |  |
| Consulter | Pointage brut, Relevé de prestations, Solde de congés, Planning, Badge | Site |  |
| Créer, Consulter, Modifier | Annonce interne | Site |  |

### Gestionnaire de paie (`GESTIONNAIRE_PAIE`)

Prépare et transmet les prestations au secrétariat social. Seul rôle (avec DRH) à modifier les données de paie.

- Catégorie : rh
- Second facteur obligatoire : oui ; délégable : non ; session max : 8 h
- Tenue dans le monde 3D : chemise

| Actions | Ressources | Portée | Restrictions |
|---|---|---|---|
| Consulter | Fiche employé, Contrat de travail, Pointage brut, Absence, Planning | Entreprise |  |
| Tous droits | Données de paie (salaire, IBAN, NISS), Solde de congés, Export secrétariat social | Entreprise |  |
| Consulter, Modifier, Valider / approuver, Exporter | Relevé de prestations, Correction de pointage | Entreprise |  |

### Conseiller en prévention (`CONSEILLER_PREVENTION`)

Fonction légale de prévention : incidents, analyses de risques, permis de travail, EPI, aptitudes (jamais de diagnostic), liste d évacuation.

- Catégorie : rh
- Second facteur obligatoire : oui ; délégable : oui ; session max : 8 h
- Tenue dans le monde 3D : gilet-securite

| Actions | Ressources | Portée | Restrictions |
|---|---|---|---|
| Tous droits | Accident, presque accident, situation dangereuse, Analyse de risques, Permis de travail (feu, hauteur, consignation), Équipement de protection individuelle | Site |  |
| Consulter | Aptitude médecine du travail, Machine, Énergie, eau, déchets, CO2, Formation et certification, Fiche employé | Site |  |
| Créer, Consulter | Formation et certification | Site |  |
| Consulter, Exporter | Présence nominative (qui est où) | Site |  |
| Créer, Consulter, Modifier | Document (procédures, notes), Annonce interne | Site |  |

### Représentant du personnel (CPPT, CE) (`REPRESENTANT_PERSONNEL`)

Accès aux informations collectives prévues par la loi : bilans agrégés, analyses de risques, annonces.

- Catégorie : rh
- Second facteur obligatoire : non ; délégable : non ; session max : 8 h
- Tenue dans le monde 3D : chemise

| Actions | Ressources | Portée | Restrictions |
|---|---|---|---|
| Consulter | Rapport | Entreprise | si {"audience":"WORKS_COUNCIL"} |
| Consulter | Analyse de risques | Site |  |

### Manager d équipe (`MANAGER_EQUIPE`)

Brique de management réutilisable : présences, plannings, congés, corrections et quêtes de son équipe.

- Catégorie : rh
- Second facteur obligatoire : non ; délégable : oui ; session max : 12 h
- Tenue dans le monde 3D : chemise

| Actions | Ressources | Portée | Restrictions |
|---|---|---|---|
| Consulter | Fiche employé, Formation et certification, Solde de congés, Pointage brut, Relevé de prestations, Prêt d outil, Équipement de protection individuelle | Équipe |  |
| Consulter | Absence | Équipe | champs : id, employeeId, startDate, endDate, status, type |
| Consulter, Valider / approuver | Demande de congé, Correction de pointage, Relevé de prestations | Équipe |  |
| Créer | Correction de pointage | Équipe |  |
| Créer, Consulter, Modifier | Planning | Équipe |  |
| Consulter | Présence nominative (qui est où) | Équipe |  |
| Créer, Consulter, Modifier | Quête, Tâche | Équipe |  |

### Directeur de production (`DIRECTEUR_PRODUCTION`)

Toute la production d un site, validation industrielle des recettes, arbitrages qualité et maintenance.

- Catégorie : production
- Second facteur obligatoire : oui ; délégable : oui ; session max : 10 h
- Hérite de : `MANAGER_EQUIPE`
- Tenue dans le monde 3D : blouse-blanche

| Actions | Ressources | Portée | Restrictions |
|---|---|---|---|
| Tous droits | Ligne de production, Machine, Plan de production, Ordre de fabrication, Étape de fabrication, Arrêt machine | Site |  |
| Créer, Consulter, Modifier | Lot | Site |  |
| Consulter, Valider / approuver | Recette (secret de fabrication) | Entreprise |  |
| Consulter | Produit fini, Article, Prévision de la demande, Coût de revient | Entreprise |  |
| Consulter | Contrôle qualité, Non-conformité, Action corrective et préventive, Libération de lot, Bon d intervention, Plan de maintenance préventive, Stock par lot, Fiche employé, Pointage brut, Planning, Mesure température et humidité | Site |  |
| Consulter | Présence nominative (qui est où) | Site |  |
| Valider / approuver | Demande d achat, Relevé de prestations | Site |  |
| Consulter, Exporter | Rapport | Entreprise |  |

### Planificateur (`PLANIFICATEUR`)

Plan directeur, calcul des besoins, lancement des ordres de fabrication, capacité des lignes.

- Catégorie : production
- Second facteur obligatoire : non ; délégable : oui ; session max : 10 h
- Tenue dans le monde 3D : chemise

| Actions | Ressources | Portée | Restrictions |
|---|---|---|---|
| Tous droits | Plan de production, Prévision de la demande | Entreprise |  |
| Créer, Consulter, Modifier | Ordre de fabrication | Site |  |
| Consulter | Recette (secret de fabrication) | Entreprise | champs : id, code, name, version, status, yieldKg, lines, productId, durationMinutes |
| Consulter | Produit fini, Article, Commande client, Commande fournisseur | Entreprise |  |
| Consulter | Ligne de production, Machine, Stock par lot, Planning, Plan de maintenance préventive, Bon d intervention | Site |  |
| Créer | Demande d achat | Site |  |

### Maître chocolatier (R&D) (`MAITRE_CHOCOLATIER`)

Crée et fait évoluer les recettes, lance des essais, définit les fiches techniques produit.

- Catégorie : production
- Second facteur obligatoire : oui ; délégable : non ; session max : 10 h
- Tenue dans le monde 3D : blouse-blanche

| Actions | Ressources | Portée | Restrictions |
|---|---|---|---|
| Créer, Consulter, Modifier | Recette (secret de fabrication) | Entreprise |  |
| Consulter, Modifier | Produit fini | Entreprise |  |
| Consulter | Article, Allergène, Fournisseur | Entreprise |  |
| Consulter | Analyse laboratoire, Contrôle qualité, Lot | Site |  |
| Créer | Ordre de fabrication | Site | si {"kind":"TRIAL"} |

### Chef d équipe production (`CHEF_EQUIPE`)

Opérateur expérimenté qui encadre une équipe postée (3x8) : présences, affectations, démarrage des OF.

- Catégorie : production
- Second facteur obligatoire : non ; délégable : oui ; session max : 12 h
- Hérite de : `OPERATEUR`, `MANAGER_EQUIPE`
- Tenue dans le monde 3D : blouse-blanche

| Actions | Ressources | Portée | Restrictions |
|---|---|---|---|
| Modifier | Ordre de fabrication, Arrêt machine | Équipe |  |
| Consulter | Contrôle qualité, Non-conformité, Accident, presque accident, situation dangereuse | Site |  |

### Opérateur de ligne (`OPERATEUR`)

Exécute les ordres de fabrication de son équipe, saisit quantités, arrêts et contrôles en ligne, emprunte les outils, déclare les consommations.

- Catégorie : production
- Second facteur obligatoire : non ; délégable : non ; session max : 12 h
- Tenue dans le monde 3D : blouse-blanche

| Actions | Ressources | Portée | Restrictions |
|---|---|---|---|
| Consulter | Ordre de fabrication, Étape de fabrication, Arrêt machine | Équipe |  |
| Modifier, Exécuter (borne, scan, opération terrain) | Étape de fabrication | Équipe |  |
| Créer | Arrêt machine | Équipe |  |
| Créer, Consulter | Contrôle qualité | Site |  |
| Consulter | Machine, Ligne de production, Lot, Emplacement, Plan HACCP, Stock par lot, Outil, moule, instrument | Site |  |
| Consulter | Article, Produit fini, Allergène | Entreprise |  |
| Créer | Mouvement de stock | Personnel |  |
| Créer, Exécuter (borne, scan, opération terrain) | Prêt d outil | Personnel |  |
| Créer, Consulter | Bon d intervention | Site | si {"kind":"REQUEST"} |

### Responsable qualité et sécurité alimentaire (`RESPONSABLE_QUALITE`)

HACCP, contrôles, non-conformités, actions correctives, libération et blocage des lots, retraits et rappels, certifications, allergènes.

- Catégorie : qualite
- Second facteur obligatoire : oui ; délégable : oui ; session max : 10 h
- Tenue dans le monde 3D : blouse-verte

| Actions | Ressources | Portée | Restrictions |
|---|---|---|---|
| Tous droits | Plan HACCP, Non-conformité, Action corrective et préventive, Analyse laboratoire, Étalonnage | Site |  |
| Créer, Consulter, Modifier, Exporter | Contrôle qualité | Site |  |
| Créer, Consulter, Valider / approuver | Libération de lot | Site |  |
| Tous droits | Retrait et rappel produit, Allergène, Certification (IFS, BRCGS, bio, cacao durable), Réclamation client | Entreprise |  |
| Consulter, Valider / approuver | Recette (secret de fabrication) | Entreprise |  |
| Consulter, Modifier | Lot, Stock par lot | Site |  |
| Consulter, Modifier | Fournisseur, Produit fini | Entreprise |  |
| Consulter | Devoir de vigilance (déforestation, durabilité), Article | Entreprise |  |
| Consulter | Mesure température et humidité, Ordre de fabrication, Formation et certification, Accident, presque accident, situation dangereuse, Réception marchandise | Site |  |
| Consulter, Exporter | Rapport | Entreprise | si {"domain":"QUALITY"} |

### Technicien qualité (`TECHNICIEN_QUALITE`)

Contrôles, prélèvements, analyses, ouverture de non-conformités, étalonnages.

- Catégorie : qualite
- Second facteur obligatoire : non ; délégable : non ; session max : 12 h
- Tenue dans le monde 3D : blouse-verte

| Actions | Ressources | Portée | Restrictions |
|---|---|---|---|
| Créer, Consulter, Modifier | Contrôle qualité, Analyse laboratoire, Non-conformité, Étalonnage | Site |  |
| Consulter | Plan HACCP, Lot, Stock par lot, Mesure température et humidité, Action corrective et préventive, Réception marchandise | Site |  |
| Modifier | Action corrective et préventive | Personnel |  |
| Consulter | Article, Produit fini, Allergène | Entreprise |  |

### Responsable maintenance (`RESPONSABLE_MAINTENANCE`)

Plans préventifs, priorisation et affectation des interventions, parc machines et outillage, étalonnage.

- Catégorie : maintenance
- Second facteur obligatoire : oui ; délégable : oui ; session max : 10 h
- Hérite de : `TECHNICIEN_MAINTENANCE`, `MANAGER_EQUIPE`
- Tenue dans le monde 3D : combinaison-bleue

| Actions | Ressources | Portée | Restrictions |
|---|---|---|---|
| Tous droits | Plan de maintenance préventive, Bon d intervention, Machine, Outil, moule, instrument, Étalonnage | Site |  |
| Consulter | Arrêt machine, Mesure température et humidité, Ordre de fabrication | Site |  |
| Consulter, Valider / approuver | Permis de travail (feu, hauteur, consignation) | Site |  |
| Créer | Demande d achat | Site |  |
| Consulter, Exporter | Rapport | Entreprise | si {"domain":"MAINTENANCE"} |

### Technicien de maintenance (`TECHNICIEN_MAINTENANCE`)

Réalise les interventions, met à jour les compteurs, sort les pièces détachées, demande les permis.

- Catégorie : maintenance
- Second facteur obligatoire : non ; délégable : non ; session max : 12 h
- Tenue dans le monde 3D : combinaison-bleue

| Actions | Ressources | Portée | Restrictions |
|---|---|---|---|
| Consulter | Bon d intervention, Plan de maintenance préventive, Machine, Étalonnage, Stock par lot, Emplacement, Outil, moule, instrument | Site |  |
| Créer, Consulter | Bon d intervention | Site |  |
| Modifier, Exécuter (borne, scan, opération terrain) | Bon d intervention | Personnel |  |
| Modifier | Machine | Site | champs : meterHours, meterCycles, status |
| Créer | Mouvement de stock | Personnel |  |
| Créer, Exécuter (borne, scan, opération terrain) | Prêt d outil | Personnel |  |
| Créer, Consulter | Permis de travail (feu, hauteur, consignation) | Personnel |  |
| Consulter | Article | Entreprise |  |

### Responsable logistique (`RESPONSABLE_LOGISTIQUE`)

Entrepôts, stocks, transports, expéditions, tournées, flotte.

- Catégorie : logistique
- Second facteur obligatoire : oui ; délégable : oui ; session max : 10 h
- Hérite de : `MAGASINIER`, `MANAGER_EQUIPE`
- Tenue dans le monde 3D : gilet-orange

| Actions | Ressources | Portée | Restrictions |
|---|---|---|---|
| Tous droits | Entrepôt, Emplacement, Transfert inter-sites, Liste de préparation, Expédition, Tournée de livraison, Véhicule, Outil, moule, instrument, Prêt d outil, Réception marchandise | Site |  |
| Créer, Consulter, Modifier | Stock par lot | Site |  |
| Consulter, Valider / approuver | Inventaire | Site |  |
| Consulter | Preuve de livraison, Commande client | Site |  |
| Consulter, Modifier | Article | Entreprise | champs : minStock, maxStock, reorderPoint, storageConditions, defaultLocationId, palletization |
| Consulter | Article | Entreprise |  |
| Tous droits | Transporteur | Entreprise |  |

### Magasinier, cariste (`MAGASINIER`)

Réceptions, rangement, mouvements, inventaires tournants, transferts, prêts d outils et dotation EPI.

- Catégorie : logistique
- Second facteur obligatoire : non ; délégable : non ; session max : 12 h
- Tenue dans le monde 3D : gilet-orange

| Actions | Ressources | Portée | Restrictions |
|---|---|---|---|
| Consulter | Entrepôt, Emplacement, Stock par lot, Outil, moule, instrument, Commande fournisseur, Mesure température et humidité | Site |  |
| Consulter | Article | Entreprise |  |
| Créer, Consulter | Mouvement de stock, Réception marchandise, Transfert inter-sites, Équipement de protection individuelle | Site |  |
| Créer, Consulter, Modifier | Inventaire | Site |  |
| Consulter, Modifier | Liste de préparation | Site |  |
| Créer, Consulter, Modifier, Exécuter (borne, scan, opération terrain) | Prêt d outil | Site |  |

### Préparateur de commandes (`PREPARATEUR_COMMANDES`)

Prélève et conditionne les commandes, déclare les écarts de stock.

- Catégorie : logistique
- Second facteur obligatoire : non ; délégable : non ; session max : 12 h
- Tenue dans le monde 3D : gilet-orange

| Actions | Ressources | Portée | Restrictions |
|---|---|---|---|
| Consulter, Modifier, Exécuter (borne, scan, opération terrain) | Liste de préparation | Personnel |  |
| Consulter | Liste de préparation, Stock par lot, Emplacement | Site |  |
| Consulter | Article | Entreprise |  |
| Créer | Mouvement de stock | Personnel |  |

### Chauffeur livreur (`CHAUFFEUR`)

Ses tournées, preuves de livraison (signature, photo, températures), incidents de route.

- Catégorie : logistique
- Second facteur obligatoire : non ; délégable : non ; session max : 12 h
- Tenue dans le monde 3D : gilet-orange

| Actions | Ressources | Portée | Restrictions |
|---|---|---|---|
| Consulter, Modifier, Exécuter (borne, scan, opération terrain) | Tournée de livraison | Personnel |  |
| Créer, Consulter | Preuve de livraison | Personnel |  |
| Consulter | Véhicule | Personnel |  |
| Consulter | Client | Entreprise | champs : id, name, deliveryAddresses, deliveryContact, deliveryInstructions |

### Responsable achats (`RESPONSABLE_ACHATS`)

Valide les commandes dans sa délégation, qualifie les fournisseurs, négocie les contrats cadres.

- Catégorie : achats
- Second facteur obligatoire : oui ; délégable : oui ; session max : 10 h
- Hérite de : `ACHETEUR`
- Tenue dans le monde 3D : costume

| Actions | Ressources | Portée | Restrictions |
|---|---|---|---|
| Valider / approuver | Commande fournisseur, Demande d achat, Fournisseur, Contrat fournisseur, Devoir de vigilance (déforestation, durabilité) | Entreprise |  |
| Consulter, Exporter | Rapport | Entreprise | si {"domain":"PURCHASING"} |

### Acheteur (`ACHETEUR`)

Fournisseurs de fèves, sucre, lait, fruits secs, emballages ; commandes, contrats, devoir de vigilance.

- Catégorie : achats
- Second facteur obligatoire : oui ; délégable : oui ; session max : 10 h
- Tenue dans le monde 3D : chemise

| Actions | Ressources | Portée | Restrictions |
|---|---|---|---|
| Créer, Consulter, Modifier | Fournisseur, Contrat fournisseur, Devoir de vigilance (déforestation, durabilité), Article | Entreprise |  |
| Créer, Consulter, Modifier | Commande fournisseur | Personnel |  |
| Consulter | Commande fournisseur, Demande d achat, Réception marchandise, Facture fournisseur, Prévision de la demande | Entreprise |  |
| Modifier | Demande d achat | Entreprise | champs : status, purchaseOrderId, buyerComment |
| Consulter | Stock par lot | Entreprise |  |

### Directeur commercial (`DIRECTEUR_COMMERCIAL`)

Toute l activité commerciale, politique tarifaire, remises exceptionnelles, encours clients.

- Catégorie : commercial
- Second facteur obligatoire : oui ; délégable : oui ; session max : 10 h
- Hérite de : `COMMERCIAL`, `MANAGER_EQUIPE`
- Tenue dans le monde 3D : costume

| Actions | Ressources | Portée | Restrictions |
|---|---|---|---|
| Tous droits | Prospect, Opportunité, Activité commerciale (appel, rendez-vous), Devis, Client, Commande client, Tarif, Promotion | Entreprise |  |
| Consulter | Facture client, Note de crédit, Coût de revient, Prévision de la demande | Entreprise |  |
| Valider / approuver | Devis, Client, Commande client | Entreprise |  |
| Consulter, Exporter | Rapport | Entreprise | si {"domain":"SALES"} |

### Commercial (`COMMERCIAL`)

Son portefeuille : prospects, clients, activités, devis, commandes. Vue limitée sur les autres clients.

- Catégorie : commercial
- Second facteur obligatoire : non ; délégable : oui ; session max : 12 h
- Tenue dans le monde 3D : costume

| Actions | Ressources | Portée | Restrictions |
|---|---|---|---|
| Créer, Consulter, Modifier | Prospect, Opportunité, Activité commerciale (appel, rendez-vous), Devis, Client | Personnel |  |
| Créer | Prospect, Client, Réclamation client | Entreprise |  |
| Consulter | Client | Entreprise | champs : id, name, segment, city, accountManagerEmployeeId |
| Créer, Consulter | Commande client | Personnel |  |
| Consulter | Facture client | Personnel |  |
| Consulter | Produit fini, Tarif, Promotion, Article | Entreprise |  |

### Administration des ventes (`ADV`)

Saisie et suivi des commandes, contrôle d encours, facturation électronique, notes de crédit, réclamations.

- Catégorie : commercial
- Second facteur obligatoire : oui ; délégable : oui ; session max : 10 h
- Tenue dans le monde 3D : chemise

| Actions | Ressources | Portée | Restrictions |
|---|---|---|---|
| Consulter, Modifier | Client | Entreprise |  |
| Créer, Consulter, Modifier, Valider / approuver | Commande client | Entreprise |  |
| Créer, Consulter | Facture client, Note de crédit | Entreprise |  |
| Consulter | Expédition, Tarif, Promotion, Produit fini, Article, Preuve de livraison | Entreprise |  |
| Créer, Consulter, Modifier | Réclamation client | Entreprise |  |

### Marketing (`MARKETING`)

Catalogue, fiches produits, promotions, saisonnalité (Pâques, Saint-Nicolas, Noël), salons.

- Catégorie : commercial
- Second facteur obligatoire : non ; délégable : oui ; session max : 10 h
- Tenue dans le monde 3D : chemise

| Actions | Ressources | Portée | Restrictions |
|---|---|---|---|
| Consulter, Modifier | Produit fini | Entreprise | champs : name, marketingName, description, images, range, season, claims, translations |
| Consulter | Produit fini, Tarif, Prévision de la demande, Allergène | Entreprise |  |
| Tous droits | Promotion | Entreprise |  |
| Créer | Prospect | Entreprise |  |
| Créer, Consulter, Modifier | Document (procédures, notes), Annonce interne | Entreprise |  |
| Consulter | Rapport | Entreprise | si {"domain":"SALES"} |

### Responsable de boutique (`RESPONSABLE_BOUTIQUE`)

Gère sa boutique : caisse, écarts, annulations, réassort, inventaire, planning des vendeurs.

- Catégorie : boutique
- Second facteur obligatoire : non ; délégable : oui ; session max : 12 h
- Hérite de : `VENDEUR_BOUTIQUE`, `MANAGER_EQUIPE`
- Tenue dans le monde 3D : tablier-boutique

| Actions | Ressources | Portée | Restrictions |
|---|---|---|---|
| Consulter, Modifier, Valider / approuver | Session de caisse, Ticket de caisse | Site |  |
| Consulter, Modifier | Boutique, Client fidélité | Site |  |
| Créer, Consulter | Transfert inter-sites, Inventaire | Site |  |
| Consulter | Rapport | Entreprise | si {"domain":"RETAIL"} |

### Vendeur en boutique (`VENDEUR_BOUTIQUE`)

Caisse, encaissement, fidélité, réception des colis boutique.

- Catégorie : boutique
- Second facteur obligatoire : non ; délégable : non ; session max : 12 h
- Tenue dans le monde 3D : tablier-boutique

| Actions | Ressources | Portée | Restrictions |
|---|---|---|---|
| Créer, Consulter, Modifier | Session de caisse | Personnel |  |
| Créer, Consulter | Ticket de caisse | Personnel |  |
| Consulter | Stock par lot, Boutique | Site |  |
| Créer | Mouvement de stock | Personnel |  |
| Créer, Consulter | Client fidélité | Site |  |
| Consulter | Produit fini, Tarif, Promotion, Allergène | Entreprise |  |
| Créer | Réclamation client | Entreprise |  |

### Directeur administratif et financier (`DAF`)

Finance complète, validation des paiements et des engagements dans sa délégation, masse salariale.

- Catégorie : finance
- Second facteur obligatoire : oui ; délégable : oui ; session max : 8 h
- Hérite de : `CONTROLEUR_GESTION`
- Tenue dans le monde 3D : costume

| Actions | Ressources | Portée | Restrictions |
|---|---|---|---|
| Tous droits | Compte du plan comptable, Écriture comptable, Paiement, Immobilisation, Note de frais | Entreprise |  |
| Consulter | Facture fournisseur | Entreprise |  |
| Valider / approuver | Commande fournisseur, Facture fournisseur, Note de crédit, Note de frais, Paiement, Coordonnées bancaires fournisseur, Client | Entreprise |  |
| Consulter | Données de paie (salaire, IBAN, NISS), Export secrétariat social, Coordonnées bancaires fournisseur, Fournisseur, Client | Entreprise |  |
| Consulter, Exporter | Facture client, Note de crédit, Commande client | Entreprise |  |

### Comptable (`COMPTABLE`)

Écritures, factures fournisseurs, rapprochements, préparation des paiements (sans les valider).

- Catégorie : finance
- Second facteur obligatoire : oui ; délégable : oui ; session max : 10 h
- Tenue dans le monde 3D : chemise

| Actions | Ressources | Portée | Restrictions |
|---|---|---|---|
| Créer, Consulter, Modifier | Écriture comptable, Facture fournisseur, Immobilisation | Entreprise |  |
| Créer, Consulter | Paiement | Entreprise |  |
| Consulter | Compte du plan comptable, Facture client, Note de crédit, Note de frais, Fournisseur, Client, Commande fournisseur, Réception marchandise | Entreprise |  |
| Créer, Consulter, Modifier | Coordonnées bancaires fournisseur | Entreprise |  |
| Exporter | Écriture comptable, Facture client, Facture fournisseur | Entreprise |  |

### Contrôleur de gestion (`CONTROLEUR_GESTION`)

Coûts de revient, budgets, valorisation des stocks, marges, tableaux de bord financiers.

- Catégorie : finance
- Second facteur obligatoire : oui ; délégable : oui ; session max : 10 h
- Tenue dans le monde 3D : chemise

| Actions | Ressources | Portée | Restrictions |
|---|---|---|---|
| Tous droits | Coût de revient, Budget | Entreprise |  |
| Consulter | Recette (secret de fabrication) | Entreprise | champs : id, code, name, version, yieldKg, lines, productId |
| Consulter | Écriture comptable, Compte du plan comptable, Ordre de fabrication, Stock par lot, Commande client, Facture client, Commande fournisseur, Produit fini, Article, Immobilisation | Entreprise |  |
| Consulter, Exporter | Rapport | Entreprise |  |

### Agent de sécurité, accueil (`AGENT_SECURITE`)

Accueil des visiteurs, badges temporaires, surveillance des accès, alarmes, appel d évacuation.

- Catégorie : securite
- Second facteur obligatoire : non ; délégable : non ; session max : 12 h
- Tenue dans le monde 3D : gilet-securite

| Actions | Ressources | Portée | Restrictions |
|---|---|---|---|
| Créer, Consulter, Modifier | Visiteur | Site |  |
| Créer, Consulter, Modifier | Badge | Site | si {"kind":"TEMPORARY"} |
| Consulter | Badge, Journal des passages, Zone d accès, Appareil (borne, lecteur, capteur) | Site |  |
| Consulter, Exporter | Présence nominative (qui est où) | Site |  |
| Créer | Accident, presque accident, situation dangereuse | Site |  |
| Consulter | Fiche employé | Entreprise | champs : id, firstName, lastName, preferredName, jobTitle, positionId, departmentId, teamId, siteId, workEmail, workPhone, photoUrl, languages, avatar |

### Sous-traitant (`SOUS_TRAITANT`)

Intervenant externe : uniquement les interventions qui lui sont confiées et les permis associés.

- Catégorie : externe, externe
- Second facteur obligatoire : non ; délégable : non ; session max : 10 h
- Tenue dans le monde 3D : visiteur

| Actions | Ressources | Portée | Restrictions |
|---|---|---|---|
| Consulter, Modifier, Exécuter (borne, scan, opération terrain) | Bon d intervention | Personnel |  |
| Créer, Consulter | Permis de travail (feu, hauteur, consignation) | Personnel |  |
| Consulter | Machine | Site | champs : id, code, name, location, manufacturer, model, status |
| Créer | Accident, presque accident, situation dangereuse | Personnel |  |

### Auditeur qualité (lecture seule, durée limitée) (`AUDITEUR_QUALITE`)

Audit de certification ou client : accès en lecture au système qualité pour la durée de l audit.

- Catégorie : externe, externe
- Second facteur obligatoire : oui ; délégable : non ; session max : 8 h
- Tenue dans le monde 3D : visiteur

| Actions | Ressources | Portée | Restrictions |
|---|---|---|---|
| Consulter | Plan HACCP, Contrôle qualité, Non-conformité, Action corrective et préventive, Analyse laboratoire, Libération de lot, Lot, Étalonnage, Mesure température et humidité, Réception marchandise | Site |  |
| Consulter | Retrait et rappel produit, Allergène, Certification (IFS, BRCGS, bio, cacao durable), Réclamation client, Fournisseur, Devoir de vigilance (déforestation, durabilité), Produit fini | Entreprise |  |
| Consulter | Formation et certification | Site | champs : id, employeeId, type, title, completedAt, validUntil, status |

### Auditeur financier (lecture seule, durée limitée) (`AUDITEUR_FINANCE`)

Réviseur d entreprises : lecture des données financières et du journal d audit.

- Catégorie : externe, externe
- Second facteur obligatoire : oui ; délégable : non ; session max : 8 h
- Tenue dans le monde 3D : visiteur

| Actions | Ressources | Portée | Restrictions |
|---|---|---|---|
| Consulter, Exporter | Compte du plan comptable, Écriture comptable, Paiement, Budget, Coût de revient, Immobilisation, Note de frais, Facture client, Note de crédit, Facture fournisseur, Commande fournisseur, Réception marchandise, Stock par lot | Entreprise |  |
| Consulter | Journal d audit | Entreprise |  |

### Borne et lecteur (appareil) (`BORNE`)

Identité technique des bornes de pointage, lecteurs de badge et bornes outils. Aucune lecture de données en dehors de l opération en cours.

- Catégorie : appareil
- Second facteur obligatoire : non ; délégable : non ; session max : 24 h
- Tenue dans le monde 3D : visiteur

| Actions | Ressources | Portée | Restrictions |
|---|---|---|---|
| Créer, Exécuter (borne, scan, opération terrain) | Pointage brut, Journal des passages | Site |  |
| Exécuter (borne, scan, opération terrain) | Prêt d outil, Visiteur | Site |  |
| Créer | Mesure température et humidité | Site |  |

## Séparation des tâches

| Règle | Cumul interdit | Niveau | Risque couvert |
|---|---|---|---|
| SOD-01 | Créer un fournisseur et valider ses factures | Bloquant | Fournisseur fictif puis paiement. |
| SOD-02 | Modifier un IBAN fournisseur et valider un paiement | Bloquant | Fraude au changement de coordonnées bancaires. |
| SOD-03 | Attribuer des rôles et valider des paiements | Bloquant | Auto-attribution de pouvoirs financiers. |
| SOD-04 | Émettre une note de crédit et l approuver | Bloquant | Remboursement non justifié. |
| SOD-05 | Saisir une facture fournisseur et approuver le paiement | Bloquant | Facture fictive payée. |
| SOD-06 | Passer une commande et réceptionner la marchandise | Alerte + quatre yeux | Réception de complaisance. |
| SOD-07 | Produire un lot et le libérer | Alerte + quatre yeux | Indépendance de la libération qualité. |
| SOD-08 | Compter un inventaire et valider l écart | Alerte + quatre yeux | Masquage de pertes. |
| SOD-09 | Créer un client et valider son encours | Alerte + quatre yeux | Encours excessif accordé à un client. |
| SOD-10 | Encaisser et valider les annulations de tickets | Alerte + quatre yeux | Annulation de ventes encaissées en espèces. |

## Circuits de validation par défaut

### Commande fournisseur (`PURCHASE_ORDER`)

- jusqu à 2500 EUR : 1. Responsable achats
- jusqu à 25000 EUR : 1. Responsable achats puis 2. Directeur administratif et financier
- au-delà : 1. Responsable achats puis 2. Directeur administratif et financier puis 3. Direction générale
- Contrôle quatre yeux : le demandeur ne valide jamais sa propre demande.
- Note : Les appels sur contrat cadre (fèves, sucre) déjà approuvé suivent le palier du contrat, pas celui de l appel.

### Demande d achat (`PURCHASE_REQUEST`)

- jusqu à 1000 EUR : 1. Manager d équipe ou Directeur de production ou Responsable maintenance ou Responsable logistique
- au-delà : 1. Directeur de site ou Directeur de production puis 2. Responsable achats
- Contrôle quatre yeux : le demandeur ne valide jamais sa propre demande.

### Congé (`LEAVE_REQUEST`)

- jusqu à 10 jours : 1. Manager d équipe ou Chef d équipe production ou Responsable de boutique
- au-delà : 1. Manager d équipe ou Chef d équipe production ou Responsable de boutique puis 2. Gestionnaire RH ou Directeur des ressources humaines
- Contrôle quatre yeux : le demandeur ne valide jamais sa propre demande.

### Correction de pointage (`TIME_CORRECTION`)

- au-delà : 1. Manager d équipe ou Chef d équipe production ou Responsable de boutique ou Gestionnaire RH
- Contrôle quatre yeux : le demandeur ne valide jamais sa propre demande.

### Note de frais (`EXPENSE_REPORT`)

- jusqu à 500 EUR : 1. Manager d équipe
- au-delà : 1. Manager d équipe puis 2. Directeur administratif et financier
- Contrôle quatre yeux : le demandeur ne valide jamais sa propre demande.

### Remise sur devis (`QUOTE_DISCOUNT`)

- jusqu à 5 % : aucune validation
- jusqu à 15 % : 1. Directeur commercial
- au-delà : 1. Directeur commercial puis 2. Direction générale
- Contrôle quatre yeux : le demandeur ne valide jamais sa propre demande.

### Note de crédit (`CREDIT_NOTE`)

- jusqu à 1000 EUR : 1. Directeur commercial
- au-delà : 1. Directeur commercial puis 2. Directeur administratif et financier
- Contrôle quatre yeux : le demandeur ne valide jamais sa propre demande.

### Écart d inventaire (`INVENTORY_ADJUSTMENT`)

- jusqu à 250 EUR : 1. Responsable logistique ou Responsable de boutique
- jusqu à 2500 EUR : 1. Responsable logistique
- au-delà : 1. Responsable logistique puis 2. Contrôleur de gestion ou Directeur administratif et financier
- Contrôle quatre yeux : le demandeur ne valide jamais sa propre demande.

### Libération de lot (`BATCH_RELEASE`)

- au-delà : 1. Responsable qualité et sécurité alimentaire
- Contrôle quatre yeux : le demandeur ne valide jamais sa propre demande.
- Note : Bloquante si un CCP est hors limite, une analyse non conforme ou une non-conformité ouverte sur le lot.

### Nouvelle version de recette (`RECIPE_VERSION`)

- au-delà : 1. Responsable qualité et sécurité alimentaire puis 2. Directeur de production
- Contrôle quatre yeux : le demandeur ne valide jamais sa propre demande.
- Note : La qualité valide allergènes et étiquetage, la production valide la faisabilité industrielle.

### Changement d IBAN fournisseur (`SUPPLIER_BANK_CHANGE`)

- au-delà : 1. Directeur administratif et financier
- Contrôle quatre yeux : le demandeur ne valide jamais sa propre demande.
- Note : Contre-appel obligatoire au numéro connu du fournisseur (jamais celui du courriel de demande), tracé dans la validation.

### Lot de paiements (`PAYMENT_RUN`)

- jusqu à 50000 EUR : 1. Directeur administratif et financier
- au-delà : 1. Directeur administratif et financier puis 2. Direction générale
- Contrôle quatre yeux : le demandeur ne valide jamais sa propre demande.

### Retrait ou rappel produit (`RECALL`)

- au-delà : 1. Responsable qualité et sécurité alimentaire puis 2. Direction générale
- Note : En cas d urgence sanitaire, la qualité bloque immédiatement les lots ; la validation formalise ensuite la notification à l autorité.

### Attribution d un rôle sensible (MFA requis) (`SENSITIVE_ROLE_ASSIGNMENT`)

- au-delà : 1. Administrateur IT puis 2. Directeur des ressources humaines ou Direction générale
- Contrôle quatre yeux : le demandeur ne valide jamais sa propre demande.
- Note : Un administrateur ne peut jamais s attribuer un rôle à lui-même.

Rôles attribuables : 39. Ressources protégées : 118.

MAAYOUD
