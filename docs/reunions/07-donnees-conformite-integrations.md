# 07 : Données, conformité, intégrations

**Date** : 2026-11-24, 2 h. **Participants** : DPO, DATA, ARCHI, BACK, SECU, METIER-QUAL, gestionnaire de paie, DAF (invité), acheteur (invité).

## Échanges
- **DAF** : la facture électronique Peppol est obligatoire en B2B en Belgique ; elle doit être native, pas un module tiers.
- **Acheteur** : le devoir de vigilance déforestation concerne nos fèves : géolocalisation des parcelles par fournisseur et par lot. Le calendrier a bougé plusieurs fois, il faut un paramétrage, pas du code en dur.
- **METIER-QUAL** : les analyses de contaminants (cadmium) et les allergènes doivent remonter dans la libération des lots.
- **DPO** : durées de conservation paramétrables, purge et anonymisation automatiques, registre des traitements dans l outil.
- **SECU** : une modification d IBAN fournisseur est la fraude la plus fréquente : double validation et contre-appel au numéro connu.
- **DATA** : les rapports ne doivent jamais contourner les droits ; les bilans pour le conseil d entreprise sont agrégés.

## Décisions
- **D-07-1** : intégrations en adaptateurs avec implémentation simulée (`09-integrations.md`).
- **D-07-2** : Peppol BIS Billing 3.0 en émission et réception ; communication structurée belge.
- **D-07-3** : devoir de vigilance par fournisseur et par lot (`DueDiligence`), dates paramétrables.
- **D-07-4** : rétention paramétrable (`retention`), purge nocturne, anonymisation des personnes.
- **D-07-5** : IBAN fournisseur en ressource séparée, chiffré, circuit `SUPPLIER_BANK_CHANGE`.
- **D-07-6** : rapports pour représentants du personnel uniquement agrégés (`audience = WORKS_COUNCIL`).

MAAYOUD
