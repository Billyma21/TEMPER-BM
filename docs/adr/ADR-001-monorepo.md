# ADR-001 : Monorepo pnpm + Turborepo

**Statut** : accepté (sprint 0)

**Contexte** : l API, le front, les bornes et la documentation partagent les mêmes droits, les mêmes contrats et les mêmes types. Des dépôts séparés créeraient des divergences de droits, le risque le plus grave du produit.

**Décision** : un seul dépôt, espaces de travail pnpm, orchestration Turborepo. Paquets partagés compilés en CommonJS (consommables par l API ESM, Next et les scripts). Le catalogue des droits vit dans `packages/permissions` et génère la documentation.

**Conséquences** : une PR modifie droits, API, UI et doc ensemble ; CI unique ; les paquets doivent être construits avant les applications (Turborepo gère l ordre).

MAAYOUD
