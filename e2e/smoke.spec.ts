import { test, expect } from '@playwright/test';

/**
 * First e2e smoke. Proves the app boots (via `next build` + `next start`, started
 * by Playwright's webServer) and serves its public, Clerk-free landing page.
 * Creates no data, so there is nothing to clean up.
 */

// Browser-rendered smoke — the primary e2e check.
test('public landing page renders in a browser', async ({ page }) => {
  const response = await page.goto('/');
  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle(/.+/);
  await expect(page.locator('body')).not.toBeEmpty();
});

// HTTP-level smoke via the request fixture (Node networking, no browser). Fast,
// and a useful fallback in environments where a browser engine can't be launched.
test('public landing page responds 200 and renders HTML', async ({ request }) => {
  const response = await request.get('/');
  expect(response.status()).toBe(200);

  const body = await response.text();
  expect(body).toContain('<!DOCTYPE html>');
  expect(body).toMatch(/<title>[^<]+<\/title>/);
});
