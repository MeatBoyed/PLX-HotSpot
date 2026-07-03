// Gate for the RadiusDesk rd_cake stub (AAA slice 2026-07-03--01, stub C).
// Behaviour pinned via app.inject(): the stub serves the `cake4/rd_cake/…` endpoints the
// API (RadiusProvisioningService.cs) and captive portals (voucher-service.ts,
// permanent-user-service.ts) call, with RadiusDesk's token model (token via ?token= query
// OR a body field) and its `{success, data}` / `{items}` response shapes. Content types:
// form-urlencoded for most POSTs, JSON for permanent-users/add + profiles/delete.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildApp } from './stubs/radiusdesk/app.mjs';

const TOKEN = 'dev-radiusdesk-token';
const P = 'cake4/rd_cake';

async function withApp(fn) {
  const app = buildApp({ token: TOKEN });
  try { await fn(app); } finally { await app.close(); }
}

const form = (obj) => new URLSearchParams(obj).toString();
const formHeaders = { 'content-type': 'application/x-www-form-urlencoded' };

// ── token auth (query or body) ──────────────────────────────────────────────────
test('vouchers/add with a valid token (form + ?token=) issues a voucher code', async () => {
  await withApp(async (app) => {
    const res = await app.inject({
      method: 'POST', url: `/${P}/vouchers/add.json?token=${TOKEN}`,
      headers: formHeaders,
      payload: form({ single_field: 'true', realm_id: '1', profile_id: '102', quantity: '1',
        never_expire: 'on', extra_value: '27820000001', cloud_id: '1' }),
    });
    assert.equal(res.statusCode, 200);
    const body = res.json();
    assert.equal(body.success, true, 'valid token → success');
    // voucher-service.ts deep-scans for a code under voucher/code/password/name/username.
    const code = body?.data?.voucher ?? (Array.isArray(body?.data) ? body.data[0]?.voucher : undefined);
    assert.ok(typeof code === 'string' && code.length > 0, 'a voucher code string must come back');
  });
});

test('a bad token yields success:false (RadiusDesk returns 200 + success flag)', async () => {
  await withApp(async (app) => {
    const res = await app.inject({
      method: 'POST', url: `/${P}/vouchers/add.json?token=WRONG`,
      headers: formHeaders, payload: form({ realm_id: '1', profile_id: '102' }),
    });
    assert.equal(res.json().success, false, 'wrong token must not succeed');
  });
});

test('a missing token yields success:false', async () => {
  await withApp(async (app) => {
    const res = await app.inject({
      method: 'POST', url: `/${P}/vouchers/add.json`,
      headers: formHeaders, payload: form({ realm_id: '1' }),
    });
    assert.equal(res.json().success, false);
  });
});

// ── permanent-users/add — token in the JSON body (TS path) ──────────────────────
test('permanent-users/add echoes the created user in data', async () => {
  await withApp(async (app) => {
    const res = await app.inject({
      method: 'POST', url: `/${P}/permanent-users/add.json`,
      payload: { token: TOKEN, user_id: 0, username: 'u-27820000001', password: 'pw',
        realm_id: '1', profile_id: '102', cloud_id: '1', active: 'true' },
    });
    assert.equal(res.statusCode, 200);
    const body = res.json();
    assert.equal(body.success, true);
    assert.equal(body.data.username, 'u-27820000001', 'data.username must echo the request');
    assert.equal(typeof body.data.id, 'number', 'data.id must be numeric (C# reads int)');
  });
});

// ── profiles ────────────────────────────────────────────────────────────────────
test('profiles/index.json returns an items array of {id, name}', async () => {
  await withApp(async (app) => {
    const res = await app.inject({
      method: 'GET', url: `/${P}/profiles/index.json?page=1&start=0&limit=500&token=${TOKEN}&cloud_id=1`,
    });
    const body = res.json();
    assert.ok(Array.isArray(body.items) && body.items.length > 0, 'must expose a non-empty items array');
    assert.ok('id' in body.items[0] && 'name' in body.items[0], 'items carry id + name');
    assert.equal(typeof body.items[0].id, 'number', 'profile id must be numeric');
  });
});

test('profiles/simple_add.json succeeds (no id — caller follows up via index)', async () => {
  await withApp(async (app) => {
    const res = await app.inject({
      method: 'POST', url: `/${P}/profiles/simple_add.json?token=${TOKEN}`,
      headers: formHeaders,
      payload: form({ name: 'voucher-2h', data_limit_enabled: 'false', time_limit_enabled: 'true', cloud_id: '1' }),
    });
    assert.equal(res.json().success, true);
  });
});

// ── permanent-users/enable-disable (form) ───────────────────────────────────────
test('permanent-users/enable-disable.json succeeds', async () => {
  await withApp(async (app) => {
    const res = await app.inject({
      method: 'POST', url: `/${P}/permanent-users/enable-disable.json?token=${TOKEN}`,
      headers: formHeaders, payload: form({ id: '5001', rb: 'disable', cloud_id: '1' }),
    });
    assert.equal(res.json().success, true);
  });
});
