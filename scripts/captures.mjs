/**
 * Captures du Bureau et du Monde pour chaque profil de démonstration (recette visuelle).
 * Prérequis : front démarré en mode démo (pnpm demo) et `pnpm exec playwright install chromium`.
 * Usage : node scripts/captures.mjs [url]   (défaut http://localhost:3000)
 * Sortie : captures/<profil>-<ecran>.png
 * MAAYOUD
 */
import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright';

const base = process.argv[2] ?? 'http://localhost:3000';
const profiles = ['noa', 'emma', 'marc'];
const screens = [
  ['monde', '/monde', 6000],
  ['bureau', '/', 2500],
  ['production', '/production', 2000],
];

mkdirSync('captures', { recursive: true });
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
let failures = 0;
for (const profile of profiles) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => {
    failures++;
    console.error(`[${profile}] erreur de page : ${e.message}`);
  });
  await page.goto(`${base}/connexion`);
  await page.evaluate((p) => localStorage.setItem('temper.demo.profile', p), profile);
  for (const [name, path, wait] of screens) {
    await page.goto(`${base}${path}`);
    await page.waitForTimeout(wait);
    await page.screenshot({ path: `captures/${profile}-${name}.png` });
    console.log(`captures/${profile}-${name}.png`);
  }
  await ctx.close();
}
await browser.close();
process.exit(failures ? 1 : 0);
