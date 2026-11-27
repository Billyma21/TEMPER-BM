# Modèle de données

Source : `packages/db/prisma/schema.prisma` (146 tables, 65 énumérations). Migration initiale : `packages/db/prisma/migrations/20261127120000_init`.

## Conventions

- Code et colonnes en anglais ; valeurs d énumération en anglais ; libellés traduits (FR, NL, EN) côté interface.
- Identifiants UUID v7 (ordonnés dans le temps, pas d énumération possible).
- Tables au pluriel en snake_case (`@@map`).
- Montants `Decimal(14,2)`, quantités `Decimal(14,3)`, coûts unitaires `Decimal(14,4)`. Jamais de `Float` pour de l argent ou des stocks.
- **Colonnes de périmètre dénormalisées** (`siteId`, `departmentId`, `teamId`) sur tout ce qui est filtré par les droits, figées à la création.
- **Acteurs** (`createdById`, `approvedById`, `decidedById`) : identifiants d utilisateur sans relation, intégrité garantie par les services et l audit.
- **Immuables** : `TimeEntry`, `AccessEvent`, `StockMovement`, `BatchRelease`, `ProofOfDelivery`, `EnvironmentReading`, `AuditLog`. Correction par nouvelle écriture (`TimeCorrection`, `reversalOfId`).
- **Jamais supprimés** : factures, notes de crédit, lots, tickets de caisse, écritures comptables, contrôles qualité.
- **Chiffrés applicativement** (suffixe `Enc`) : NISS, IBAN, secrets MFA, configuration des intégrations.
- Suppression logique (`deletedAt`) sur les référentiels ; **anonymisation** (`anonymizedAt`) pour les personnes après la durée légale de conservation.

## Domaines et tables principales

| Domaine | Tables |
|---|---|
| Organisation | companies, sites, buildings, departments, teams, positions |
| Comptes et sécurité | users, sessions, webauthn_credentials, role_assignments, devices, api_keys, audit_logs, settings, integrations, data_requests, notifications |
| RH | employees, employee_payroll, employee_medical, contracts, trainings, employee_documents, onboardings |
| Accès | badges, access_zones, access_rules, access_events, visitors |
| Temps | shift_patterns, schedules, time_entries, time_corrections, daily_attendances, timesheets, leave_types, leave_balances, leave_requests, absences, public_holidays, payroll_exports |
| Production | products, allergens, product_allergens, item_allergens, recipes, recipe_lines, recipe_steps, demand_forecasts, production_lines, machines, production_plans, production_orders, production_steps, batches, batch_genealogy, downtimes, oee_snapshots |
| Qualité | haccp_plans, haccp_ccps, quality_checks, non_conformities, capas, lab_analyses, batch_releases, recalls, recall_batches, quality_certifications, complaints |
| Stock | items, warehouses, locations, stock_lots, stock_movements, inventory_counts, inventory_lines, stock_transfers, stock_transfer_lines, environment_readings |
| Outils | tools, tool_loans, calibrations, ppe_issues |
| Maintenance | maintenance_plans, work_orders |
| Achats | suppliers, supplier_bank_accounts, due_diligences, supplier_contracts, purchase_requests, purchase_orders, purchase_order_lines, goods_receipts, goods_receipt_lines, supplier_invoices |
| Ventes | customers, leads, opportunities, activities, price_lists, price_list_lines, promotions, quotes, quote_lines, sales_orders, sales_order_lines, invoices, invoice_lines, credit_notes |
| Boutiques | stores, pos_sessions, pos_sales, pos_sale_lines, loyalty_members |
| Logistique | picking_lists, picking_lines, carriers, shipments, delivery_routes, vehicles, proofs_of_delivery |
| Finance | ledger_accounts, journal_entries, journal_lines, payments, budgets, cost_sheets, assets, expense_reports |
| HSE | incidents, risk_assessments, work_permits, environmental_metrics |
| Communication | announcements, announcement_acks, documents, tasks, approval_requests, approval_decisions |
| Monde | quest_templates, quests, xp_events, achievements, employee_achievements |
| Pilotage | dashboards, reports |

## Invariants à garantir dans les services (tests obligatoires)

1. `stock_lots.quantity` = somme des `stock_movements` pour (article, lot, emplacement), jamais négative.
2. Un lot `RELEASED` a une `batch_releases` la plus récente avec `decision = RELEASED` par une personne différente du déclarant de production.
3. Numéro de facture continu et sans trou par exercice ; une facture émise n est plus modifiable.
4. Un `timesheets` `EXPORTED` ou `LOCKED` n accepte plus de correction sur sa période.
5. Une `role_assignments` d un rôle sensible a une `approvalRequestId` approuvée.
6. `audit_logs` : la chaîne `prevHash` / `hash` est continue (`AuditService.verifyChain`).
7. Un `production_orders` en cours référence une recette `APPROVED` et fige `recipeVersion`.

## Évolutions prévues

- Partitionnement mensuel de `access_events`, `time_entries`, `environment_readings`, `audit_logs`.
- Politiques RLS PostgreSQL en défense en profondeur (périmètre site) pour les accès hors API (outils BI).
- Vues matérialisées de pilotage rafraîchies par tâche planifiée.

MAAYOUD
