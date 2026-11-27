# ADR-013 : Relevés, export et soldes

**Statut** : accepté (sprint 5)

**Contexte** : les journées sont calculées. La paie a besoin d un relevé par période, validé deux fois, puis d un fichier pour le secrétariat social. Le catalogue a déjà `Timesheet`, `PayrollExport` et `LeaveBalance`.

**Décision**

- Le relevé somme les journées. Tant qu il est `OPEN`, un nouveau calcul le remplace. Dès qu il est soumis, le calcul le saute.
- Le manager approuve, puis une autre personne qui peut exporter approuve pour la paie. L export verrouille et passe le statut à `EXPORTED`.
- Le CSV n emporte pas de motif d absence. Les heures sont en virgule, les dates en `JJ/MM/AAAA`.
- Une correction acceptée sur un relevé verrouillé ouvre un relevé de régularisation à la période suivante.
- Le jour férié est une ligne `PublicHoliday` de la société. Le déclarant doit couvrir un site, pas seulement une équipe.
- Le solde pris et le solde planifié se déduisent des demandes, sans ajouter une seconde fois les jours déjà réservés.

**Conséquences** : le fichier de paie du sprint suivant n est pas ce CSV. Le secrétariat reçoit les heures. Les fiches de paie restent hors de ce sprint.

**Alternatives écartées** : modifier un relevé exporté ; mettre un diagnostic dans le fichier ; installer un connecteur de secrétariat avant d avoir le prestataire.

MAAYOUD
