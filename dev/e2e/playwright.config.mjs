// Playwright config for the AAA-emulation e2e suite (AAA slice 2026-07-03--01).
// These are API/request-context tests (no browser) against the running `aaa` stub
// containers — globalSetup brings the stubs up, globalTeardown tears them down. Browser-UI
// journeys (monitor dashboard, captive flow) are a later increment and need the full stack.
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  globalSetup: './global-setup.mjs',
  globalTeardown: './global-teardown.mjs',
  timeout: 30_000,
  fullyParallel: false,
  reporter: [['list']],
  use: {
    ignoreHTTPSErrors: true, // stub A serves a self-signed cert
  },
});
