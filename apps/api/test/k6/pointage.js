/**
 * Charge du changement d équipe : 300 passages en 10 minutes, p95 sous 300 ms.
 * Lancer contre une API déjà démarrée :
 * k6 run -e BASE=http://127.0.0.1:4000 -e DEVICE='id.secret' -e BADGE=04A1B2C3 apps/api/test/k6/pointage.js
 * MAAYOUD
 */
import http from 'k6/http';
import { check } from 'k6';

export const options = {
  scenarios: {
    changement: {
      executor: 'constant-arrival-rate',
      rate: 30,
      timeUnit: '1m',
      duration: '10m',
      preAllocatedVUs: 20,
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<300'],
  },
};

export default function pointage() {
  const hex = `${__VU}${__ITER}${Date.now()}`.replace(/\D/g, '').padEnd(32, '0').slice(0, 32);
  const id = `${hex.slice(0, 8)}-${hex.slice(8, 12)}-7${hex.slice(13, 16)}-8${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
  const res = http.post(
    `${__ENV.BASE}/api/v1/time/kiosk/scan`,
    JSON.stringify({
      badgeUid: __ENV.BADGE,
      clientEventId: id,
      kind: __ITER % 2 === 0 ? 'IN' : 'OUT',
    }),
    { headers: { 'content-type': 'application/json', authorization: `Device ${__ENV.DEVICE}` } },
  );
  check(res, { 'passage accepté': (r) => r.status === 200 });
}
