/**
 * Connexion démo, navigation selon le profil, contrôle d accessibilité.
 * MAAYOUD
 */
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

async function enter(page: import('@playwright/test').Page, name: string) {
  await page.goto('/connexion');
  await page.getByRole('button', { name }).click();
  await expect(page.getByRole('link', { name: 'Mon espace' })).toBeVisible();
}

test('Noa ouvre les ventes, Emma n ouvre pas la finance', async ({ page }) => {
  await enter(page, 'Noa, commerciale');
  await expect(page.getByRole('link', { name: 'Ventes et clients' })).toBeVisible();
  await page.getByRole('link', { name: 'Ventes et clients' }).click();
  await expect(page.getByRole('heading', { name: 'Ventes et clients' })).toBeVisible();
  await page.getByRole('button', { name: 'nl' }).click();
  await expect(page.getByRole('link', { name: 'Goedkeuringen' })).toBeVisible();

  await page.goto('/connexion');
  await page.getByRole('button', { name: 'Emma, opératrice de ligne' }).click();
  await expect(page.getByRole('link', { name: 'Production' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Finance' })).toHaveCount(0);
});

test('la connexion et l accueil n ont pas de violation grave', async ({ page }) => {
  await page.goto('/connexion');
  const login = await new AxeBuilder({ page }).analyze();
  expect(login.violations.filter((item) => item.impact === 'serious' || item.impact === 'critical')).toEqual([]);

  await enter(page, 'Marc, directeur d usine');
  await expect(page.getByRole('link', { name: 'Production' })).toBeVisible();
  const home = await new AxeBuilder({ page }).analyze();
  expect(home.violations.filter((item) => item.impact === 'serious' || item.impact === 'critical')).toEqual([]);
});
