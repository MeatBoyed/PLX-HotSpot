import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./test/setup.ts'],
    // Unit tests only. `e2e/**` (*.spec.ts) is Playwright's and must not be run
    // by Vitest — it imports @playwright/test.
    include: ['src/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      // Text summary for the terminal; html for drill-down; lcov for any CI tool.
      reporter: ['text', 'text-summary', 'html', 'lcov'],
      reportsDirectory: './coverage',
      // Measure the app's own source. Exclude config, types, generated clients,
      // archived legacy trees, and tests themselves so the number reflects code
      // we can actually test.
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.d.ts',
        'src/**/*.test.{ts,tsx}',
        'src/lib/hotspotAPI.ts',
        'archive/**',
      ],
      // Record-only baseline this slice — no failing threshold gate yet.
      // (Vitest 4 reports all `include`d files by default; no `all` flag needed.)
    },
  },
  resolve: {
    alias: {
      // Mirror the `@/* -> ./src/*` alias from tsconfig.json so tests import
      // modules the same way production code does.
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      // `server-only` throws on import outside an RSC bundle. Tests exercise the
      // server logic directly, so alias it to a no-op stub.
      'server-only': fileURLToPath(new URL('./test/server-only-stub.ts', import.meta.url)),
    },
  },
});
