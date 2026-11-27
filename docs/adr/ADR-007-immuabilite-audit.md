# ADR-007 : Immuabilité des faits et journal d audit chaîné

**Statut** : accepté

**Décision** : les faits (pointages, passages, mouvements, libérations, preuves, mesures, audit) ne sont ni modifiés ni supprimés, y compris par le super administrateur ; les corrections sont de nouveaux enregistrements liés. Le journal d audit est chaîné par empreinte sous verrou consultatif PostgreSQL et vérifié chaque nuit.

**Conséquences** : historique probant pour l inspection sociale, l AFSCA, les auditeurs et les litiges ; volumétrie à partitionner.

MAAYOUD
