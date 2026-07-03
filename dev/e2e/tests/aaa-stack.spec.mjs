// E2E over the running `aaa` stub containers (AAA slice 2026-07-03--01) via Playwright's
// API request context — no browser. Exercises the exact data paths the apps use:
//   - monitor telemetry  → stub A (MikroTik REST, HTTPS + Basic auth)
//   - captive voucher    → stub C (RadiusDesk rd_cake, token)
// Proves the stubs serve real data end-to-end over the network on their published lanes.
import { test, expect, request } from '@playwright/test';

const MIKROTIK = process.env.E2E_MIKROTIK_URL ?? 'https://localhost:5481';
const RADIUSDESK = process.env.E2E_RADIUSDESK_URL ?? 'http://localhost:5480';
const BASIC = 'Basic ' + Buffer.from('admin:admin').toString('base64');

test('monitor telemetry: stub A serves RouterOS system-resource + active sessions', async () => {
  const ctx = await request.newContext({ ignoreHTTPSErrors: true });

  const sys = await ctx.get(`${MIKROTIK}/rest/system/resource`, { headers: { authorization: BASIC } });
  expect(sys.status()).toBe(200);
  const resource = await sys.json();
  expect(resource).toHaveProperty('cpu-load');
  expect(resource).toHaveProperty('free-memory');
  expect(resource).toHaveProperty('uptime');

  const active = await ctx.get(`${MIKROTIK}/rest/ip/hotspot/active`, { headers: { authorization: BASIC } });
  expect(active.status()).toBe(200);
  const sessions = await active.json();
  expect(Array.isArray(sessions)).toBe(true);
  expect(sessions.length).toBeGreaterThan(0);
  expect(sessions[0]).toHaveProperty('mac-address');
  expect(sessions[0]).toHaveProperty('bytes-in');

  await ctx.dispose();
});

test('stub A rejects unauthenticated RouterOS REST calls (401)', async () => {
  const ctx = await request.newContext({ ignoreHTTPSErrors: true });
  const res = await ctx.get(`${MIKROTIK}/rest/system/resource`);
  expect(res.status()).toBe(401);
  await ctx.dispose();
});

test('captive voucher: stub C issues a voucher code for a valid token', async () => {
  const ctx = await request.newContext();
  const res = await ctx.post(`${RADIUSDESK}/cake4/rd_cake/vouchers/add.json?token=dev-radiusdesk-token`, {
    form: { single_field: 'true', realm_id: '1', profile_id: '102', quantity: '1', never_expire: 'on' },
  });
  expect(res.status()).toBe(200);
  const body = await res.json();
  expect(body.success).toBe(true);
  expect(body.data?.voucher).toMatch(/^VCH-/);
  await ctx.dispose();
});

test('stub C rejects a bad RadiusDesk token (success:false)', async () => {
  const ctx = await request.newContext();
  const res = await ctx.post(`${RADIUSDESK}/cake4/rd_cake/vouchers/add.json?token=WRONG`, {
    form: { realm_id: '1' },
  });
  const body = await res.json();
  expect(body.success).toBe(false);
  await ctx.dispose();
});
