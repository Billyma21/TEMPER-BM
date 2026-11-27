# Système de design

## Identité

- **Cacao** (structure, navigation) : `#2B1A12`, `#3D2619`, `#5B3A29`, fonds `#F3EBE5` `#FAF6F3`.
- **Or** (marque, appels forts) : `#C8A24A`, `#D8B866`, `#F7EFD9`.
- **Lavande** (interaction, sélection, monde 3D) : `#6F62E8`, `#8F84F3`, `#C6BFFF`, `#EEEBFF`.
- Statuts : succès `#22A06B`, attention `#E8A33D`, danger `#E5484D`.
- Surface : `#F6F7FB`.

Les jetons sont dans `apps/web/src/app/globals.css` (`@theme` Tailwind 4).

## Typographie

- Inter 400 / 500 / 600 / 700 pour tout le texte.
- Instrument Serif italique pour un mot d accent par titre (« Bonjour Noa, *belle journée* »).
- Tailles : 11 (méta), 13 (dense), 14 (corps), 16, 20, 24, 30.
- Chiffres tabulaires pour les quantités, heures et montants.

## Composants (à constituer dans `apps/web/src/components/ui`)

Bouton (primaire cacao, secondaire, fantôme, danger), champ, sélecteur, date et heure, recherche, puce de statut, badge, carte, tableau de données (tri, filtres, colonnes, export, sélection multiple, virtualisation au-delà de 200 lignes), tiroir latéral de détail, modale de confirmation, onglets, fil d Ariane, état vide, squelette, toast, barre de progression, chronologie, calendrier d équipe, organigramme, téléversement avec aperçu, signature, scanner (caméra ou douchette), pavé numérique (borne, tablette de ligne).

## Règles d ergonomie

- Une action principale par écran, visible sans défiler.
- Toute liste : recherche, filtres enregistrables, export si droit `export`.
- Toute fiche : tiroir latéral depuis la liste, URL partageable, historique d audit en onglet.
- Formulaires : validation zod partagée avec l API, messages en clair, sauvegarde de brouillon.
- Écrans terrain (borne, tablette de ligne, terminal magasin) : cibles 56 px minimum, contraste élevé, utilisables avec des gants, mode sombre.
- Les actions non permises sont **masquées** (pas grisées) sauf si l explication aide l utilisateur.

## Langues

Français par défaut, néerlandais et anglais complets (`next-intl`). Formats belges : `fr-BE`, `nl-BE`, dates JJ/MM/AAAA, semaine du lundi, séparateur décimal virgule, euro.

## Accessibilité

Objectif WCAG 2.2 AA : contraste, focus visible, navigation clavier complète, libellés ARIA, annonces `aria-live` (borne, toasts), pas d information portée uniquement par la couleur, cibles tactiles, mouvement réduit respecté.

MAAYOUD
