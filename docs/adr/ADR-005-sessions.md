# ADR-005 : Sessions opaques plutôt que JWT

**Statut** : accepté

**Décision** : jeton aléatoire en cookie httpOnly, SameSite Lax, seule son empreinte est stockée. Révocation immédiate (départ, vol, changement de rôle), inactivité 30 min, durée maximale selon les rôles. Appareils : identifiant + secret haché. Les droits sont recalculés à chaque requête (cache Redis invalidé sur changement d attribution au sprint 2).

**Pourquoi pas JWT** : révocation difficile, droits figés dans le jeton jusqu à expiration, taille des règles.

MAAYOUD
