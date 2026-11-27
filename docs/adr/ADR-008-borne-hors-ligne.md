# ADR-008 : Borne de pointage hors ligne et idempotente

**Statut** : accepté

**Décision** : la borne est une page web en mode kiosque (`/borne`) ; lecteur NFC en émulation clavier ; secours matricule + PIN ; chaque scan porte un `clientEventId` UUID ; en cas d échec réseau, file locale rejouée ; unicité en base garantissant zéro doublon ; heure de borne contrôlée et marquée `isOffline`. Aucune donnée personnelle stockée sur la borne.

**À faire** : service worker pour démarrer la borne sans réseau, signature des requêtes par appareil (HMAC horodaté) en complément du secret.

MAAYOUD
