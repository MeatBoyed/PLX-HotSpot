// MikroTik hotspot login page (AAA slice 2026-07-03--01, stub B) — Fastify HTTP app.
// The captive portals submit credentials here via a real browser GET navigation to
// `<gateway>/login?username=&password=[&dst=]` (PAP plaintext, no CHAP) and rely on the
// gateway's own HTML redirect — so this serves HTML / 302, never JSON. Distinct from the
// REST app (app.mjs): plain HTTP, browser-facing. Both run in the one `mikrotik` service.
import Fastify from 'fastify';

const CONNECTED_HTML = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>Connected</title></head><body><h1>Connected</h1>
<p>You are logged in to the hotspot.</p></body></html>`;

// The login form a browser sees when it hits /login with no credentials — mirrors the
// RouterOS hotspot login page enough for the GET-submit flow (username + password).
const loginPageHtml = (action) => `<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>Hotspot Login</title></head><body><h1>Hotspot Login</h1>
<form method="get" action="${action}">
  <input type="text" name="username" placeholder="username">
  <input type="password" name="password" placeholder="password">
  <button type="submit">Log in</button>
</form></body></html>`;

export function buildLoginApp({ successUrl = process.env.MIKROTIK_LOGIN_SUCCESS_URL ?? '/status' } = {}) {
  const app = Fastify();

  // RouterOS accepts credentials as GET query params and, on success, redirects the
  // browser to the originally-requested URL (here the portal's `dst`), else a status page.
  app.get('/login', async (req, reply) => {
    const { username, password, dst } = req.query;
    if (username && password) {
      return reply.code(302).header('location', dst || successUrl).send();
    }
    return reply.type('text/html').send(loginPageHtml('/login'));
  });

  // The post-login landing page (default `dst`).
  app.get('/status', async (_req, reply) => reply.type('text/html').send(CONNECTED_HTML));

  return app;
}
