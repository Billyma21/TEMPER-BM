# Intégrations

Principe : chaque intégration est un **adaptateur** derrière une interface (port) dans `apps/api/src/integrations/<domaine>`, avec une implémentation `mock` utilisée en développement et en test. Les secrets sont chiffrés (`Integration.configEnc`). Les échanges sont journalisés et rejouables (file BullMQ, idempotence).

| Intégration | Sens | Protocole / format | Déclencheur | Priorité |
|---|---|---|---|---|
| Lecteurs de badge (portes) | entrant | Contrôleur d accès en OSDP (éviter Wiegand non chiffré) vers API HTTP | Passage | Sprint 3 |
| Borne de pointage | entrant | HTTPS + `Device` ; lecteur NFC en émulation clavier | Scan | Fait (API) |
| Secrétariat social (SD Worx, Securex, Partena, Acerta...) | sortant | Fichier de prestations (CSV ou XML propre au prestataire) ou API | Clôture de période | Sprint 5 |
| Logiciel comptable (Exact Online, Yuki, Odoo, Winbooks...) | sortant | API ou export d écritures | Validation des écritures | Sprint 9 |
| Peppol | entrant et sortant | UBL Peppol BIS Billing 3.0 via point d accès | Émission facture, réception fournisseur | Sprint 8 |
| EDI grande distribution | entrant et sortant | EANCOM / GS1 XML : ORDERS, ORDRSP, DESADV, INVOIC | Commande, expédition | Sprint 10 |
| Banque | sortant / entrant | SEPA pain.001 (paiements), CODA ou camt.053 (relevés) | Lot de paiements, rapprochement | Sprint 9 |
| Machines | entrant | OPC UA vers passerelle MQTT (`aurum/<site>/<ligne>/<machine>`) | Continu | Sprint 7 |
| Capteurs température / humidité | entrant | MQTT ou LoRaWAN | Continu | Sprint 4 |
| Balances, imprimantes d étiquettes | sortant / entrant | ZPL, GS1-128, SSCC | Production, expédition | Sprint 7 |
| Terminaux de paiement boutique | entrant | SDK du prestataire, Payconiq | Encaissement | Sprint 10 |
| E-commerce | entrant | Webhooks commandes, synchronisation stock | Commande | Plus tard |
| SSO | entrant | OIDC (Entra ID) | Connexion | Sprint 3 |
| Messagerie | sortant | SMTP, SMS, notifications push | Événements | Sprint 2 |

## Exigences communes

- Délais d attente, nouvelles tentatives exponentielles, file des échecs consultable par l admin IT.
- Tableau de bord des intégrations (dernière synchro, erreurs, volume).
- Contrats de test : chaque adaptateur a des tests sur des fichiers d exemple anonymisés.

MAAYOUD
