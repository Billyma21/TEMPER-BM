# Temps

Sprints 4 et 5. Le pointage borne, mobile et web existe déjà. La semaine, la journée et les demandes aussi. Le relevé se valide deux fois, puis part au secrétariat.

## Écrans

- Planning : `GET /time/schedules/week`. Liste vide si rien n est publié.
- Journée : `GET /time/anomalies`. Liste vide s il n y a pas d anomalie.
- Relevés : `GET /time/timesheets`. Liste vide s il n y a pas de relevé.
- Jours fériés : `GET /time/holidays`. Liste vide s il n y en a pas.

## Actes

- `POST /time/schedules/rotation` publie la rotation 3x8 d une semaine qui commence un lundi.
- `POST /time/days/close` recalcule les journées de la date.
- `POST /time/corrections` ouvre un circuit `TIME_CORRECTION` sans toucher au pointage.
- `POST /time/leave` réserve des jours ouvrés sur le solde de l appelant.
- `POST /time/absences` déclare une absence sans motif médical.
- `POST /time/sensors` est réservé au capteur. Une température hors de 12 à 20 °C est signalée.
- `POST /time/timesheets/build` prépare les relevés. `submit`, `manager` et `payroll` les font avancer. `POST /time/payroll-exports` verrouille et renvoie le CSV.
- `POST /time/holidays` déclare un férié pour qui couvre le site.
- `POST /time/balances/settle` recalcule pris et planifié.

## Charge

`apps/api/test/k6/pointage.js` décrit 300 passages en dix minutes, p95 sous 300 ms. Le test automatisé rejoue un lot plus court sur la borne.

MAAYOUD
