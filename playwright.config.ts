import { defineConfig, devices } from '@playwright/test';

/**
 * E2e config. Drives a real browser against an ALREADY-RUNNING app. It does NOT
 * manage the server — start the app yourself first (e.g. `make dev`). If nothing
 * is listening at BASE_URL, the suite fails. That's the contract.
 *
 * Target is http://localhost:$DEV_PORT — the same port the dev server binds.
 */
const BASE_URL = `http://localhost:${process.env.DEV_PORT ?? '3000'}`;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: 'list',
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    // --no-sandbox keeps Chromium happy in restricted/containerised runners.
    launchOptions: { args: ['--no-sandbox'] },
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
