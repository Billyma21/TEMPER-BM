# Monde 3D : document de conception

## Intention

« Tout mon business, en un coup d oeil. » Le mode Monde est une **autre vue des mêmes données**, pas un jeu à côté de l outil. Il doit donner envie d ouvrir TEMPER, rendre visible ce qui est invisible dans un tableau (une panne, une équipe incomplète, un prospect qui attend), et ramener en un clic vers l écran Bureau où l on agit.

## Direction artistique

- **Isométrique**, caméra orthographique (angle 45° / 35°), rotation désactivée par défaut (quatre angles fixes en option), panoramique et zoom.
- **Basse polygonisation pastel** : sol gris lavande très clair, routes gris bleuté, toits lavande `#8F84F3`, murs blancs, arbres en cubes verts. Aucune texture lourde.
- Couleur = information : statuts machines (vert marche, gris arrêt, bleu nettoyage, orange maintenance, rouge clignotant panne), jaune chantier pour une commande en cours, vert « Livré ».
- Étiquettes en pastilles blanches arrondies (police Inter), accent serif italique pour les titres de l interface.
- Personnages « bonshommes » : capsule + tête, tenue selon le métier (blouse blanche et charlotte en production, blouse verte qualité, combinaison bleue maintenance, gilet orange logistique, tablier rose boutique, costume direction et ventes).

## Les métaphores, module par module

| Module | Dans le monde | Interaction |
|---|---|---|
| Présence | Les personnes présentes sont dans (ou devant) leur bâtiment. Silhouettes anonymes grises si l utilisateur n a pas le droit de voir la présence nominative. | Clic sur un bâtiment : effectif, lien vers le planning. |
| Production | Hall « maison de poupée » sans toit : lignes et machines, voyants d état, opérateurs à leur poste. Panne : étiquette rouge. | Clic machine : état, OF en cours, TRS ; « Ouvrir dans le bureau ». |
| Qualité | Laboratoire ; pastille d alerte si NC ouverte ou CCP hors limite. | Lien vers la NC. |
| Stocks | Entrepôts ; en zoom, racks dont le remplissage reflète le stock ; rouge sous le minimum. | Clic rack : articles et lots. |
| Outils | Atelier ; badge d alerte instruments à étalonner, outils en retard. | Lien vers les prêts. |
| Ventes (bureau commercial) | Bâtiment ouvert à pièces : à appeler, pas de réponse, à relancer, rendez-vous, qualifiés, signés, archives. **Chaque prospect est un personnage** ; il change de pièce quand l étape change. | Clic pièce : liste filtrée. |
| Ventes (ville) | Chaque client est un terrain ; **chaque commande est un chantier** dont l immeuble monte avec la progression (confirmée 10 %, production 40 %, préparation 70 %, expédiée 90 %, livrée 100 % avec toit). Grue animée pendant le chantier. | Clic terrain : commande, étape, client. |
| Logistique | Quais, camionnette qui part et revient sur la route principale pendant les tournées. | Lien vers la tournée. |
| Accès | Poste de garde ; visiteurs présents ; en mode évacuation, tout le monde rejoint le point de rassemblement. | Mode évacuation (conseiller en prévention, sécurité). |
| Droits | **Un bâtiment hors de mes fonctions est grisé avec un cadenas** : la porte reste fermée. | Message explicatif, aucune donnée. |

## Progression (gamification)

**Règles éthiques (décision de réunion D-05-01 à D-05-06)**
1. On récompense la **qualité**, la **sécurité**, l **entraide**, la **régularité** et l **apprentissage**. Jamais la vitesse de production, jamais un volume qui pousserait à prendre des risques.
2. Les quêtes sont **personnelles** ; aucun classement nominatif sans consentement explicite (`leaderboardOptIn`, faux par défaut). Classement par défaut : par équipe, anonyme.
3. Aucune sanction, aucune évaluation individuelle fondée sur l XP. L XP n est pas un indicateur RH et n est pas exportée vers les évaluations.
4. Désactivation possible (`questsEnabled`) sans perte de fonctionnalité.
5. Le dispositif est présenté au conseil d entreprise et au CPPT avant mise en service (introduction d une nouvelle technologie).
6. Quêtes de sécurité : signaler un presque-accident rapporte de l XP ; ne jamais en avoir n en rapporte pas (pas d incitation à taire).

**Économie** : 512 XP par niveau ; quêtes quotidiennes 15 à 100 XP, hebdomadaires 40 à 150 XP ; actions ponctuelles 5 à 20 XP ; série (jours consécutifs avec au moins une quête) ; succès (premier contrôle, vigie sécurité, maître du tempérage, première signature, régulier).

**Catalogue initial** : voir `quest_templates` dans le seed (opérateur, commercial, magasinier, technicien maintenance, technicien qualité, vendeur, manager, tout le personnel).

**Moteur** (à implémenter, sprint 6) : écoute des événements métier (`quality_check.created`, `activity.created`, `incident.created`, `inventory_line.counted`...), incrémente les quêtes actives correspondantes, attribue l XP une seule fois (idempotence par `sourceId`), génère les quêtes du jour à 04:00 selon les rôles actifs.

## Interface tête haute

- Haut gauche : site, indicateurs clés du périmètre, bascule des étiquettes.
- Haut droite : carte joueur (initiale, niveau, barre d XP, série).
- Bas gauche : « Bonjour Noa », quêtes du jour (case, barre, XP).
- Bas droite : alertes du périmètre, légende.
- Bas centre : panneau de sélection et bouton « Ouvrir dans le bureau ».

## Accessibilité et confort

- Tout ce qui est dans le monde existe dans le bureau ; le monde n est jamais obligatoire.
- `prefers-reduced-motion` : animations désactivées.
- Contraste des étiquettes AA ; statuts doublés par texte (pas seulement la couleur).
- Navigation clavier du HUD ; liste textuelle des alertes.
- Repli sans WebGL : message et lien vers le bureau.

## Performance

- Moins de 300 appels de dessin ; instanciation (`InstancedMesh`) dès 200 personnages ou arbres.
- Étiquettes DOM limitées ; masquées au dézoom (niveau de détail).
- Ombres : une lumière directionnelle, carte 2048.
- Instantané < 200 Ko, mises à jour par événements regroupés.

## Feuille de route 3D

1. (fait) Campus, halls ouverts, machines, présence, bureau commercial, ville des clients, HUD, droits.
2. Animations de transition : un prospect qui marche d une pièce à l autre, l immeuble qui monte d un étage, le camion qui part.
3. Racks d entrepôt détaillés au zoom, chariots élévateurs.
4. Mode évacuation et point de rassemblement.
5. Multi-sites : vue carte (usine, entrepôt, boutiques) avec téléportation.
6. Avatar personnalisable, succès visibles, effets de passage de niveau (sobres).
7. Vue « salle de contrôle » pour grand écran d atelier (lecture seule, rotation automatique).

MAAYOUD
