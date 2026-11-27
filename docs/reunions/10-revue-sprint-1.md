# 10 : Revue du sprint 1

**Date** : 2026-11-27, 1 h. **Participants** : PO, TL, ARCHI, BACK, QA, SECU, DPO, OPS, METIER-RH.

## Démontré

- 116 ressources tabulées exposées (19 domaines). `World` et `WorldPresence` restent des projections.
- Liste paginée, triée, recherchable (`q`, 121 index GIN `pg_trgm`), filtrée par les droits, puis projetée champ par champ.
- Détail, création, modification, export CSV (point-virgule, plafond 5 000), historique d audit de l objet.
- Erreur `{ code, message, details, requestId }`, messages FR / NL / EN. Un pointage modifié répond `IMMUTABLE`, y compris pour le super administrateur.
- Cache Redis des droits, invalidé par version. `/health` signale `cache: down` sans couper l API.
- Base de développement et base `temper_test` migrées (init + `recherche_trigramme`) et seedées (47 employés).

## Chiffres

- `pnpm typecheck` : 8 tâches vertes.
- `pnpm test` : 160 tests verts (21 droits, 139 API dont 116 ressources avec un cas autorisé et un cas refusé, plus la non-fuite de paie, l annuaire, le CSV, le néerlandais et le cache).
- Build web : réussi.
- `pnpm check` : 181 fichiers conformes.

## Retours métiers

- **METIER-RH** : la fiche de paie personnelle reste lisible, celle du collègue répond 403 sans montant. Validé.
- **DPO** : l annuaire ne renvoie pas l adresse ni l e-mail personnel des collègues. Validé.
- **SECU** : aucun `passwordHash`, secret TOTP ni empreinte de jeton dans les listes, y compris pour le compte de secours.
- **QA** : le critère du sprint est tenu sur l API réelle seedée, pas sur un double des règles.

## Dette

- Pas d écran Bureau sur ce gabarit (sprint 2).
- La création générique refuse encore les objets dont une colonne obligatoire n est ni fournie ni déductible du principal. Les actes métier (pointage, libération, paiement) garderont un service dédié.
- Pas de suppression générique, par décision.
- L image Docker Hub de MinIO n existe plus : le compose pointe vers `quay.io/minio/minio`. Les autres services n ont pas été requis pour cette revue.

## Suite

Sprint 2 : tableau de données, tiroir avec audit, boîte de validation, MFA (enrôlement, secours, WebAuthn, sessions), `next-intl`, Playwright.

MAAYOUD
