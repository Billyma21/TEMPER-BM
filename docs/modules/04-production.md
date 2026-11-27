# Production

Sprint 6. La recette reste un secret. L ordre fige une version approuvée. La tablette montre la gamme.

## Écrans

- Tablette : `GET /production/orders/:id/sheet`. Sans ordre choisi, l écran est vide.
- Traçabilité aval : `GET /production/batches/:id/downstream`. Sans lot, l écran est vide.

## Actes

- `POST /production/recipes/:id/versions` ouvre la double validation.
- `POST /production/orders` lance un ordre et réserve en FEFO les lots libérés.
- `POST /production/orders/:id/start` démarre, ou refuse le changement d allergène.
- `POST /production/orders/:id/consume` n accepte qu un lot `RELEASED`.
- `POST /production/orders/:id/output` crée un lot `QUARANTINE` et la généalogie.
- `GET /production/lines/:id/trs` recalcule le TRS du jour.
- `POST /production/quests/draw` propose le contrôle d hygiène. Un événement de cadence est refusé.

MAAYOUD
