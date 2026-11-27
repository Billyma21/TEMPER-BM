# Périmètre fonctionnel détaillé

Chaque module liste : écrans, règles métier, cas limites et critères d acceptation. Les droits exacts sont dans `04-roles-permissions.md` (généré depuis le code). Les tables sont dans `packages/db/prisma/schema.prisma`.

Convention des critères : **Étant donné / Quand / Alors**. Tout critère est couvert par un test automatisé.

---

## 0. Mon espace (libre-service, tout le personnel)

**Écrans** : accueil (journée, quêtes, alertes du périmètre, annonces à accuser), mon planning, mes pointages, mes congés et soldes, mes absences et certificats, mes fiches de paie, mes formations et certifications, mes outils empruntés et EPI, mes notes de frais, signaler (incident, presque-accident, non-conformité, idée), mes données personnelles (accès, rectification, export, opposition), préférences (langue FR / NL / EN, thème, notifications, apparence de l avatar, participation au classement).

**Règles**
- Un employé modifie uniquement les champs de `SELF_EDITABLE_EMPLOYEE_FIELDS` ; le reste passe par une demande RH.
- Une demande de congé est modifiable tant qu elle est `PENDING`.
- Un oubli de badge se régularise par une **demande de correction** (jamais par modification du pointage brut).
- Les annonces « accusé de lecture requis » bloquent la quête hebdomadaire correspondante tant qu elles ne sont pas lues.

**Critères**
- Étant donné une opératrice, quand elle ouvre Mon espace, alors elle voit son poste du jour, ses pointages, ses quêtes et uniquement les alertes de son périmètre.
- Étant donné une demande de congé approuvée, quand l employé tente de la modifier, alors l API répond 403.

---

## 1. Organisation

**Écrans** : sites (carte, coordonnées, géorepérage), bâtiments et zones (avec placement dans le monde 3D), départements (arborescence, centres de coûts), équipes (modèle horaire, responsable), fiches de poste (commission paritaire, catégorie, formations requises, rôles par défaut), organigramme interactif, annuaire (champs limités).

**Règles** : un département appartient à un site ; une équipe à un département ; une fiche de poste propose des rôles par défaut lors de l onboarding mais l attribution reste une action explicite validée.

---

## 2. Ressources humaines

**Écrans** : liste du personnel (filtres site, département, équipe, statut, type de contrat), fiche employé (onglets : identité, poste, contrat(s), temps, absences, formations, documents, matériel et EPI, accès et badges, historique), paie (onglet séparé, chiffré, rôles paie / DRH), aptitude médicale (statut uniquement), onboarding et offboarding (check-lists), tableau de bord RH (effectifs, turnover, absentéisme agrégé, formations expirées).

**Onboarding** (check-list générée par la fiche de poste) : création du compte, attributions de rôles proposées (validées par l IT et le métier), badge, EPI, formations hygiène et sécurité **avant** premier accès en production, Dimona transmise par le secrétariat social, remise du règlement de travail, matériel.

**Offboarding** : date de fin, révocation automatique des rôles et des badges à J+0 23:59, restitution outils et EPI (prêts en cours bloquants), solde de tout compte, archivage puis anonymisation selon la durée de conservation.

**Règles**
- Les intérimaires et étudiants ont une attribution de rôle avec `validUntil` obligatoire.
- Aucun diagnostic médical n est jamais stocké : uniquement l aptitude et les restrictions formulées par le médecin du travail.
- Les données de paie (NISS, IBAN, salaire) sont chiffrées au repos et lisibles uniquement par DRH, gestionnaire de paie, DAF (lecture).

**Critères**
- Étant donné une formation hygiène expirée, quand l employé badge au sas production, alors l accès est refusé (`TRAINING_EXPIRED`) et son manager est notifié.
- Étant donné un départ le 30, quand on est le 31 à 00:00, alors tous ses badges sont `RETURNED` ou `SUSPENDED` et ses sessions révoquées.

---

## 3. Badges et contrôle d accès

**Écrans** : badges (émission, perte, vol, désactivation, restitution), badges temporaires (visiteurs, sous-traitants), zones (niveau, hygiène, formations et EPI exigés, capacité, anti-retour), règles d accès (rôle, poste, équipe, personne, créneaux), appareils (bornes, lecteurs, provisionnement du secret, état, dernière activité), journal des passages (filtrable, export), visiteurs (pré-enregistrement par l hôte, accueil, consignes de sécurité, déclaration d hygiène, badge, départ), **mode évacuation** (liste nominative des présents par zone, pointage au point de rassemblement).

**Règles**
- L UID brut du badge n est jamais stocké : HMAC avec poivre serveur.
- Badge perdu : désactivation immédiate, nouveau badge, ancien refusé (`BADGE_INACTIVE`) avec alerte à l agent de sécurité.
- Zone haute hygiène : formation `FOOD_HYGIENE` valide exigée ; tablette au sas qui rappelle les EPI.
- Anti-retour sur zones restreintes : une entrée sans sortie bloque une deuxième entrée.
- Évacuation : la liste est disponible même si le serveur central est indisponible (copie locale chiffrée sur la tablette de l accueil, rafraîchie toutes les minutes).

---

## 4. Temps et présences

**Écrans** : plannings (vue équipe par semaine, glisser-déposer, rotation 3x8, publication), modèles horaires, pointages du jour (présents, retards, absents, en pause), anomalies à traiter, corrections (demandes et validations), congés (demandes, calendrier d équipe, soldes, règles de validation), absences (maladie avec certificat, accident du travail lié à l incident HSE), relevés de prestations par période, clôture et **export secrétariat social**, jours fériés et remplacements.

**Moteur de règles** (`apps/api/src/time/time-rules.ts`, paramétrable) : temps travaillé, pauses (déduction de la pause planifiée si non badgée, signalement si trop courte), heures supplémentaires, minutes de nuit, dimanches, fériés, retards, départs anticipés, repos minimal entre deux postes, durée journalière maximale, journée en cours sans fausse anomalie.

**Règles**
- Aucun arrondi en défaveur du travailleur.
- Le pointage mobile est réservé aux rôles listés dans le paramétrage et contrôlé par géorepérage (sauf rôles itinérants).
- Clôture : relevé validé par le manager puis par la paie ; une fois exporté, le relevé est verrouillé ; une correction ultérieure crée une régularisation sur la période suivante.
- Volume de pointe : 300 badges en 10 minutes au changement d équipe de 14:00.

---

## 5. Production

**Écrans** : produits finis (fiche technique, nutrition, ingrédients multilingues, allergènes, codes EAN), **recettes** (versions, lignes avec pertes, gamme opératoire, paramètres cibles, CCP, double validation qualité et production, comparaison de versions), prévisions (saisonnalité Pâques, Saint-Nicolas, Noël), plan directeur, calcul des besoins (matières, capacité lignes, personnel), ordres de fabrication (lancement, affectation équipe et ligne, réservation des lots FEFO), **tablette de ligne** (étapes, paramètres mesurés, consommations par scan de lot, déclaration de production et rebuts, arrêts), lots et généalogie, TRS par ligne et par poste.

**Règles**
- Un OF fige la version de recette au lancement.
- La consommation d une matière exige le scan d un lot libéré ; un lot en quarantaine ou bloqué est refusé.
- Tout lot produit naît en `QUARANTINE` jusqu à libération qualité.
- Changement de production avec allergène (ex. lait après noir) : contrôle `ALLERGEN_CHANGEOVER` obligatoire avant démarrage.
- Les opérateurs ne voient jamais la formulation complète (secret de fabrication) : uniquement les instructions de leur OF.

**Critères**
- Étant donné un lot de fèves, quand la qualité lance « traçabilité aval », alors TEMPER liste en moins de 2 minutes tous les lots enfants, les commandes et les clients livrés.

---

## 6. Qualité et sécurité alimentaire

**Écrans** : plan HACCP (versions, CCP, limites critiques, surveillance, actions correctives), contrôles (CCP, PRP, réception, en ligne, produit fini, environnement, nettoyage, nuisibles), non-conformités (gravité, analyse des causes, actions), CAPA (efficacité vérifiée), analyses de laboratoire (micro, allergènes, humidité, granulométrie, contaminants dont cadmium et mycotoxines), **libération des lots** (check-list automatique, quatre yeux), retraits et rappels (périmètre par généalogie, notification autorité, communication clients, suivi des quantités récupérées), certifications, réclamations clients (blanchiment gras, corps étranger, casse...).

**Règles**
- CCP hors limite : blocage automatique du lot concerné et des lots produits depuis le dernier contrôle conforme.
- La libération est impossible si une NC ouverte, une analyse non conforme ou un CCP non conforme est rattaché au lot.
- Rappel : la qualité bloque immédiatement ; la validation direction formalise la notification.

---

## 7. Stocks et entrepôts

**Écrans** : articles, entrepôts et emplacements (plan 2D et rendu 3D des racks avec taux de remplissage), stock par lot et emplacement, mouvements, réceptions (contrôle camion, température, scellés, lots fournisseurs, DDM), rangement guidé, inventaires tournants et annuels, transferts inter-sites, quarantaine, températures et humidité en continu avec alertes.

**Règles** : FEFO par défaut ; mouvements immuables, contre-passation pour corriger ; écart d inventaire valorisé soumis au circuit `INVENTORY_ADJUSTMENT` ; stock négatif interdit ; entrepôt produits finis 15-18 °C, alerte au-delà de 30 minutes hors plage.

---

## 8. Outils, étalonnage, EPI

**Écrans** : parc d outils (moules polycarbonate avec compteur de cycles, instruments de mesure, outillage), prêts et retours (borne outils par badge, scan QR ou RFID), retards, étalonnages (échéances, certificats, blocage des instruments échus), dotation EPI (tailles, renouvellement, signature).

**Règles** : un instrument non étalonné ne peut pas être emprunté et ses mesures sont signalées ; un départ de l entreprise est bloqué tant que des outils sont prêtés ; un moule au-delà de son nombre maximal de cycles est mis au rebut.

---

## 9. Maintenance

**Écrans** : parc machines (criticité, compteurs, historique), plans préventifs (calendrier, heures, cycles, conditionnel), demandes d intervention (depuis la tablette de ligne en 2 clics, avec photo), bons d intervention (priorités P1 à P4, affectation, pièces, temps), permis de travail (feu, hauteur, consignation, zone alimentaire), **remise en production après intervention en zone alimentaire validée par la qualité**, indicateurs MTBF et MTTR.

---

## 10. Achats et fournisseurs

**Écrans** : fournisseurs (qualification, notes qualité et délai, certifications, risque), coordonnées bancaires (double validation et contre-appel obligatoire), **devoir de vigilance déforestation** pour le cacao (déclaration, géolocalisation des parcelles, analyse de risque, mesures d atténuation), contrats cadres (fèves à prix indexé), demandes d achat, commandes (circuit `PURCHASE_ORDER`), réceptions, factures fournisseurs (rapprochement commande, réception, facture), litiges.

---

## 11. Ventes et clients

**Écrans** : prospects (étapes : à appeler, pas de réponse, à relancer, rendez-vous, qualifié, signé, archivé), activités (appels, rendez-vous, dégustations), opportunités, clients (segments, encours, tarifs, adresses de livraison), devis (remises soumises au circuit `QUOTE_DISCOUNT`), commandes (EDI grande distribution, B2B, e-commerce), réservation de stock, promesse de livraison, factures (numérotation continue, communication structurée, **envoi Peppol**), notes de crédit, relances.

**Monde** : chaque prospect est un personnage dans la pièce de son étape ; un appel le fait changer de pièce ; un client signé devient un chantier dans la ville ; le bâtiment monte à chaque étape de la commande (confirmée, production, préparation, expédiée, livrée).

---

## 12. Boutiques

**Écrans** : caisse (tactile, scanner, paiements carte, espèces, Payconiq, bon cadeau), sessions de caisse (fond, comptage, écart, validation), annulations (validation responsable), fidélité (consentement marketing), stock boutique et réassort depuis l entrepôt, click and collect.

---

## 13. Logistique

**Écrans** : préparation (listes, scan emplacement et lot, contrôle), expéditions (palettes, SSCC, documents), transporteurs, tournées (ordre des arrêts, chauffeur, véhicule), application chauffeur (preuve de livraison : signature, photo, température, réserves), flotte (contrôle technique, entretien, assurance).

---

## 14. Finance

**Écrans** : plan comptable (PCMN), écritures générées automatiquement (ventes, achats, stocks, paie importée), paiements (préparation SEPA, validation `PAYMENT_RUN`), budgets par centre de coûts, **coûts de revient** (standard et réel, sensibilité au cours du cacao), immobilisations, notes de frais, export vers le logiciel comptable.

---

## 15. Santé, sécurité, environnement

**Écrans** : déclaration d incident en 30 secondes (mobile, photo), analyse (arbre des causes), actions, accidents du travail (déclaration assureur), analyses de risques par poste, permis de travail, EPI, énergie, eau, déchets, CO2.

---

## 16. Communication, documents, tâches, validations

**Écrans** : annonces (ciblage, accusé de lecture), documents (procédures, modes opératoires, fiches de données de sécurité, versions, revue périodique), tâches, **boîte de validation unique** (toutes les demandes en attente pour moi, délégations pendant mes absences), notifications (in-app, e-mail, push).

---

## 17. Monde 3D et progression

Voir `05-monde-3d.md` (document de conception complet).

---

## 18. Pilotage

Tableaux de bord par rôle (personnalisables), rapports planifiés, bilan social agrégé pour les représentants du personnel, exports. Aucun rapport ne contourne les droits : chaque indicateur est calculé sur les données accessibles.

---

## 19. Administration

Utilisateurs (invitation, MFA, verrouillage, sessions actives), attributions de rôles (périmètre, période, délégation, contrôle de séparation des tâches, circuit `SENSITIVE_ROLE_ASSIGNMENT`), appareils, paramètres (seuils de validation, règles de temps, rétention, gamification), intégrations, clés d API, journal d audit (recherche, vérification de la chaîne d intégrité), demandes RGPD.

MAAYOUD
