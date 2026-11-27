/**
 * Contrôleurs de domaine produits par la fabrique CRUD.
 * MAAYOUD
 */
import { organisationControllers } from './organisation/organisation.module.js';
import { rhControllers } from './rh/rh.module.js';
import { accesControllers } from './acces/acces.module.js';
import { tempsControllers } from './temps/temps.module.js';
import { productionControllers } from './production/production.module.js';
import { qualiteControllers } from './qualite/qualite.module.js';
import { stockControllers } from './stock/stock.module.js';
import { outilsControllers } from './outils/outils.module.js';
import { maintenanceControllers } from './maintenance/maintenance.module.js';
import { achatsControllers } from './achats/achats.module.js';
import { ventesControllers } from './ventes/ventes.module.js';
import { boutiqueControllers } from './boutique/boutique.module.js';
import { logistiqueControllers } from './logistique/logistique.module.js';
import { financeControllers } from './finance/finance.module.js';
import { hseControllers } from './hse/hse.module.js';
import { communicationControllers } from './communication/communication.module.js';
import { mondeControllers } from './monde/monde.module.js';
import { reportingControllers } from './reporting/reporting.module.js';
import { adminControllers } from './admin/admin.module.js';

export const domainControllers = [
  ...organisationControllers,
  ...rhControllers,
  ...accesControllers,
  ...tempsControllers,
  ...productionControllers,
  ...qualiteControllers,
  ...stockControllers,
  ...outilsControllers,
  ...maintenanceControllers,
  ...achatsControllers,
  ...ventesControllers,
  ...boutiqueControllers,
  ...logistiqueControllers,
  ...financeControllers,
  ...hseControllers,
  ...communicationControllers,
  ...mondeControllers,
  ...reportingControllers,
  ...adminControllers,
];
