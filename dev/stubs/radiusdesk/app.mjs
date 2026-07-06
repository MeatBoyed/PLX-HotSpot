// RadiusDesk rd_cake emulator (AAA slice 2026-07-03--01, stub C) — Fastify app.
// Thin stand-in for the `cake4/rd_cake/…` surface the API (RadiusProvisioningService.cs)
// and captive portals (voucher-service.ts, permanent-user-service.ts) call. Reproduces
// RadiusDesk's quirks: token accepted via ?token= query OR a body field; most POSTs are
// form-urlencoded (one JSON-array body for profiles/delete); responses are
// `{success, data}` or a top-level `{items}` array; auth failures return 200 + success:false.
import Fastify from 'fastify';
import querystring from 'node:querystring';
import { randomBytes } from 'node:crypto';

const BASE = '/cake4/rd_cake';

// A few profiles so index-by-name lookups resolve (matches the seed profile names elsewhere).
const PROFILES = [
  { id: 101, name: 'default' },
  { id: 102, name: 'voucher-1h' },
  { id: 103, name: 'voucher-24h' },
];

const voucherCode = () => 'VCH-' + randomBytes(4).toString('hex').toUpperCase();
const userId = () => 5000 + (randomBytes(2).readUInt16BE(0) % 5000);

// Token may arrive as a query param or a body field (never both required). Array bodies
// (profiles/delete) carry no token field, so fall back to the query param.
function tokenOf(req) {
  if (req.query && typeof req.query.token === 'string') return req.query.token;
  if (req.body && !Array.isArray(req.body) && typeof req.body.token === 'string') return req.body.token;
  return undefined;
}

export function buildApp({ token = process.env.RADIUSDESK_STUB_TOKEN ?? 'dev-radiusdesk-token' } = {}) {
  const app = Fastify();

  // RadiusDesk POSTs are form-urlencoded by default; parse them into req.body.
  app.addContentTypeParser('application/x-www-form-urlencoded', { parseAs: 'string' }, (_req, body, done) => {
    try { done(null, querystring.parse(body)); } catch (err) { done(err); }
  });

  // Wrap a handler with RadiusDesk-style token auth (200 + success:false on failure).
  const guard = (handler) => async (req, reply) => {
    if (tokenOf(req) !== token) return { success: false, message: 'Not authorized' };
    return handler(req, reply);
  };

  // ── vouchers ──
  app.post(`${BASE}/vouchers/add.json`, guard(async () => ({
    success: true, data: { voucher: voucherCode() },
  })));

  // ── permanent-users ──
  app.post(`${BASE}/permanent-users/add.json`, guard(async (req) => {
    const b = req.body ?? {};
    return {
      success: true,
      data: { id: userId(), username: b.username, realm_id: b.realm_id, profile_id: b.profile_id, active: true },
    };
  }));
  app.post(`${BASE}/permanent-users/enable-disable.json`, guard(async () => ({ success: true })));
  app.post(`${BASE}/permanent-users/edit-basic-info.json`, guard(async () => ({ success: true })));

  // ── profiles ──
  // index.json returns a top-level `items` array (NOT `data`) — the caller warns if absent.
  app.get(`${BASE}/profiles/index.json`, guard(async () => ({ success: true, items: PROFILES })));
  app.post(`${BASE}/profiles/simple_add.json`, guard(async () => ({ success: true })));
  app.post(`${BASE}/profiles/simple_edit.json`, guard(async () => ({ success: true })));
  app.post(`${BASE}/profiles/delete.json`, guard(async () => ({ success: true })));

  return app;
}
