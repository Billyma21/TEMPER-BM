# ADR-012 : Planning, journées et mesures

**Statut** : accepté (sprint 4)

**Contexte** : le moteur de journée existe déjà et ne défavorise pas le travailleur. Le pointage est interdit en mise à jour et en suppression. Les congés et les corrections ont déjà un circuit à quatre yeux. La journée calculée n est pas un sujet du catalogue : elle reprend les colonnes du planning.

**Décision**

- La rotation 3x8 publie cinq jours pour les équipes PROD-A, PROD-B et PROD-C. Le code d horaire est `(rang d équipe + semaine ISO) modulo 3`, dans l ordre matin, après-midi, nuit. Un poste de nuit se termine le lendemain. Les heures sont celles de Bruxelles.
- La clôture du jour relit les pointages et le planning, ignore les pointages visés par une annulation approuvée, et réécrit la journée tant qu elle n est pas validée.
- L acceptation d une correction d ajout crée un pointage de source `IMPORT`, identifié par `correction-<id>`. L acceptation d une annulation ne supprime rien.
- Le congé décompte des jours ouvrés, fériés belges exclus, et incrémente `plannedDays`. Le refus décrémente.
- Le capteur écrit une mesure. L alerte est un booléen, pas un diagnostic.
- Le script de charge reste un fichier k6, sans paquet ajouté.

**Conséquences** : qui peut mettre à jour un planning peut clôturer la journée des mêmes personnes. Qui ne lit que ses propres plannings ne voit que ses anomalies. Le relevé de paie et l export vers le secrétariat social restent au sprint suivant.

**Alternatives écartées** : ajouter `DailyAttendance` au catalogue pour ce sprint ; modifier le pointage d origine ; arrondir les minutes au détriment de la personne ; installer k6 comme dépendance.

MAAYOUD
