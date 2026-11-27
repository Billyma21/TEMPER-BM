## Objet

<!-- Ce que change cette PR, pour qui (rôle), pourquoi. Lien vers l issue. -->

## Droits

- [ ] Ressources et actions concernées ajoutées dans `packages/permissions` (et tests)
- [ ] `@Requires` + `whereOrForbid` + `assertCan` sur chaque écriture
- [ ] Tests 403 par rôle hors périmètre
- [ ] `pnpm docs:matrix` relancé si les droits changent

## Qualité

- [ ] Types stricts, validation zod partagée
- [ ] Tests unitaires et d intégration verts ; parcours bout en bout mis à jour
- [ ] FR / NL / EN ; accessibilité ; mobile et tablette
- [ ] Monde 3D mis à jour si le module y est représenté
- [ ] Audit métier sur les objets sensibles
- [ ] Migration Prisma non destructive (ou plan en deux temps)

## Captures

<!-- Bureau et Monde, avant / après -->

## Livrable

- [ ] `node scripts/check-deliverables.mjs` vert (signature MAAYOUD, aucun tiret cadratin, aucune mention interdite)
