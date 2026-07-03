// Gate for the MikroTik hotspot login stub (AAA slice 2026-07-03--01, stub B).
// Behaviour pinned via app.inject(): the captive portals navigate the browser to
// GET /login?username=&password=[&dst=] and depend on the gateway's HTML redirect. So the
// stub 302-redirects on valid creds (to dst, else a status page), serves an HTML login
// form when creds are absent, and serves an HTML "connected" status page — never JSON.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildLoginApp } from './stubs/mikrotik/login.mjs';

async function withApp(fn) {
  const app = buildLoginApp({ successUrl: '/status' });
  try { await fn(app); } finally { await app.close(); }
}

test('GET /login with credentials + dst redirects (302) to dst', async () => {
  await withApp(async (app) => {
    const dst = 'http://portal.local/welcome';
    const res = await app.inject({
      method: 'GET', url: `/login?username=user01@aura&password=pw&dst=${encodeURIComponent(dst)}`,
    });
    assert.equal(res.statusCode, 302, 'valid login must redirect the browser');
    assert.equal(res.headers.location, dst, 'redirect must honour the portal dst');
  });
});

test('GET /login with credentials but no dst redirects to the status page', async () => {
  await withApp(async (app) => {
    const res = await app.inject({ method: 'GET', url: '/login?username=user01@aura&password=pw' });
    assert.equal(res.statusCode, 302);
    assert.equal(res.headers.location, '/status', 'default post-login target is the status page');
  });
});

test('GET /login without credentials serves an HTML login form (not JSON, not a redirect)', async () => {
  await withApp(async (app) => {
    const res = await app.inject({ method: 'GET', url: '/login' });
    assert.equal(res.statusCode, 200);
    assert.match(res.headers['content-type'] ?? '', /text\/html/, 'the login page is HTML');
    assert.match(res.body, /<form[^>]*method=["']?get/i, 'must present a GET login form');
  });
});

test('GET /login with only a username (no password) is not treated as a successful login', async () => {
  await withApp(async (app) => {
    const res = await app.inject({ method: 'GET', url: '/login?username=user01@aura' });
    assert.notEqual(res.statusCode, 302, 'incomplete creds must not redirect as success');
  });
});

test('GET /status serves an HTML connected page', async () => {
  await withApp(async (app) => {
    const res = await app.inject({ method: 'GET', url: '/status' });
    assert.equal(res.statusCode, 200);
    assert.match(res.headers['content-type'] ?? '', /text\/html/);
    assert.match(res.body, /connected/i, 'the status page confirms the session is up');
  });
});
