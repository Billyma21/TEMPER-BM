/**
 * Parcours bureau en mode démonstration.
 * MAAYOUD
 */
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './apps/web/e2e',
  timeout: 60_000,
  use: { baseURL: 'http://127.0.0.1:3100' },
  webServer: {
    command: 'corepack pnpm --filter @temper/web exec next dev --port 3100',
    url: 'http://127.0.0.1:3100/connexion',
    reuseExistingServer: false,
    timeout: 120_000,
    env: { NEXT_PUBLIC_DEMO: '1' },
  },
});
