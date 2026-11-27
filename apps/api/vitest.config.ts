/**
 * Vitest compile les décorateurs Nest (métadonnées) pour les tests d intégration.
 * MAAYOUD
 */
import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [
    swc.vite({
      module: { type: 'es6' },
      jsc: {
        target: 'es2023',
        parser: { syntax: 'typescript', decorators: true },
        transform: { legacyDecorator: true, decoratorMetadata: true },
      },
    }),
  ],
  test: {
    environment: 'node',
    include: ['test/**/*.test.ts'],
    hookTimeout: 300_000,
    testTimeout: 30_000,
    fileParallelism: false,
  },
});
