import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
  },
  resolve: {
    alias: {
      // Mirror the `@/* -> ./src/*` alias from tsconfig.json so tests import
      // modules the same way production code does.
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
