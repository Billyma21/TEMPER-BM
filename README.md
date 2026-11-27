<p align="center">
  <img src="docs/apercu/logo.svg" width="88" alt="Marque TEMPER, courbe de tempérage sur fond cacao">
</p>

<h1 align="center">TEMPER</h1>

<p align="center">
  <strong>Le système de gestion de la chocolaterie, du badge à la livraison.</strong><br>
  Personnel, accès, temps, production, qualité, stocks, maintenance, achats, ventes, boutiques, logistique et finance.
</p>

Société de démonstration : **Maison Aurum Chocolatier SA**. Usine et siège à Bruxelles, entrepôt à Vilvorde, deux boutiques. Les captures ci-dessous viennent de cette base, avec le compte opératrice Emma Janssens.

| | |
|---|---|
| ![Page de connexion](docs/apercu/connexion.png) | ![Espace du jour](docs/apercu/bureau-accueil.png) |
| Connexion | Journée, quêtes et alertes du périmètre |
| ![Ordres de fabrication](docs/apercu/bureau-ordres.png) | ![Jumeau de l usine](docs/apercu/monde-usine.png) |
| Ordres de fabrication, quantités et statut | Usine de Bruxelles-Sud, machine en panne au hall |

Deux façons de travailler sur les mêmes données et les mêmes droits :

- **Bureau** : listes, fiches, validations, exports. Chaque écran ne propose que les actions autorisées.
- **Monde** : jumeau isométrique du site. Une machine en panne se voit dans le hall, les bâtiments hors fonction restent fermés, les noms n apparaissent que pour qui a le droit de présence nominative.

---

## Démarrage en 2 minutes (démo, sans base de données)

```bash
pnpm install
pnpm demo
```

Ouvrir http://localhost:3000 puis choisir un profil : Noa (commerciale), Emma (opératrice), Marc (directeur d usine). Les écrans et le monde changent selon les droits. Les réponses affichées sont de vraies réponses de l API enregistrées.

## Démarrage complet

Prérequis : Node 22.12+, pnpm 10, Docker.

```bash
cp .env.example .env                # puis remplacer les secrets
pnpm install
pnpm infra:up                       # PostgreSQL, Redis, MinIO, Mailpit, MQTT
pnpm db:generate && pnpm db:migrate # client Prisma + migration initiale
pnpm db:seed                        # Maison Aurum : 47 employés, 4 sites, recettes, lots, clients
pnpm dev                            # API :4000 (docs /api/docs), web :3000
```

### Comptes de démonstration (mot de passe `Temper!2026`)

| Compte | Rôles | Pour tester |
|---|---|---|
| catherine.vandenberghe@maison-aurum.test | Direction générale | Vision globale sans données nominatives sensibles |
| marc.dubois@maison-aurum.test | Directeur de site, directeur de production | Tout le site, monde complet |
| karim.benali@maison-aurum.test | Chef d équipe matin | Présence nominative de son équipe uniquement |
| emma.janssens@maison-aurum.test | Opératrice | Monde sans noms, recettes verrouillées |
| sarah.willems@maison-aurum.test | Responsable qualité | HACCP, NC, libération des lots |
| youssef.tahiri@maison-aurum.test | Magasinier | Stocks, réceptions, prêts d outils |
| noa.lefevre@maison-aurum.test | Commerciale | Bureau commercial 3D, ville des clients, quêtes d appels |
| nadia.elamrani@maison-aurum.test | DRH | Personnel, paie (MFA en production) |
| francois.delcourt@maison-aurum.test | DAF | Finance, validations |
| bilal.chraibi@maison-aurum.test | Admin IT | Comptes, rôles, appareils, audit |
| tech@frigotech.test | Sous-traitant | Ses interventions seulement |
| audit@certif-food.test | Auditeur qualité (5 jours) | Lecture seule qualité |
| secours@maison-aurum.test | Super administrateur | Bris de glace, journalisé |

### Borne de pointage

1. Connecté en admin IT : `POST /api/v1/devices/<id de KIOSK-0001>/secret` renvoie l identifiant d appareil (affiché une seule fois).
2. Ouvrir http://localhost:3000/borne sur la tablette, coller l identifiant.
3. Badger (lecteur NFC en émulation clavier) ou saisir un UID puis Entrée. Exemple d Emma : `04A111B2C3`.

---

## Structure

```
apps/api            API NestJS 12 (ESM) : auth, droits, audit, gabarit CRUD, temps, monde, temps réel
apps/web            Next.js 16 : Bureau, Monde 3D (React Three Fiber), borne, connexion
packages/permissions 41 rôles, 118 ressources, portées, séparation des tâches, validations (testé)
packages/db         Prisma 7 : 146 tables, migration initiale, seed Maison Aurum
packages/shared     Contrats zod et types partagés
docs                Vision, modules, architecture, données, droits, monde 3D, sécurité,
                    conformité, intégrations, qualité, exploitation, feuille de route,
                    ADR, comptes rendus de réunions
infra               docker-compose de développement
```

## Commandes

| Commande | Effet |
|---|---|
| `pnpm demo` | Front en mode démonstration |
| `pnpm dev` | API + front |
| `pnpm test` | Tous les tests |
| `pnpm typecheck` | Contrôle de types |
| `pnpm docs:matrix` | Régénère `docs/04-roles-permissions.md` depuis le code |
| `pnpm check` | Contrôle des livrables (signature, typographie) |

## Principes

Les droits avant l écran ; une donnée, un endroit ; faits immuables et audit chaîné ; vie privée par conception ; gamification éthique (qualité et sécurité, jamais la cadence) ; conformité belge et européenne native. Détails dans `docs/`.

---

Conçu et développé par **MAAYOUD**. Tous droits réservés.
