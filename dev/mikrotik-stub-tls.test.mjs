// TLS gate for the MikroTik REST stub (AAA slice 2026-07-03--01, stub A).
// Behaviour pinned over a REAL HTTPS transport (not app.inject): the stub serves its
// self-signed-cert HTTPS listener that both consumers hit (`https://{host}/rest`, TLS
// verify bypassed). This proves buildApp wires the cert into Fastify's https option and
// that Basic auth still gates requests over the wire.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { request } from 'node:https';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { buildApp } from './stubs/mikrotik/app.mjs';

const certDir = join(dirname(fileURLToPath(import.meta.url)), 'stubs', 'mikrotik', 'certs');
const https = { key: readFileSync(join(certDir, 'key.pem')), cert: readFileSync(join(certDir, 'cert.pem')) };
const basic = (u, p) => 'Basic ' + Buffer.from(`${u}:${p}`).toString('base64');

// One HTTPS GET with TLS verification disabled (the self-signed-cert bypass both consumers use).
function httpsGet(port, path, headers = {}) {
  return new Promise((resolve, reject) => {
    const req = request(
      { host: '127.0.0.1', port, path, method: 'GET', headers, rejectUnauthorized: false },
      (res) => {
        let body = '';
        res.on('data', (c) => (body += c));
        res.on('end', () => resolve({ status: res.statusCode, body }));
      },
    );
    req.on('error', reject);
    req.end();
  });
}

async function withTlsServer(fn) {
  const app = buildApp({ user: 'admin', pass: 'admin', https });
  await app.listen({ port: 0, host: '127.0.0.1' });
  try { await fn(app.server.address().port); } finally { await app.close(); }
}

test('the stub serves /rest over HTTPS with a self-signed cert', async () => {
  await withTlsServer(async (port) => {
    const res = await httpsGet(port, '/rest/system/resource', { authorization: basic('admin', 'admin') });
    assert.equal(res.status, 200, 'HTTPS + valid Basic auth must return 200');
    assert.ok('cpu-load' in JSON.parse(res.body), 'the system-resource object comes back over TLS');
  });
});

test('Basic auth is enforced over HTTPS too', async () => {
  await withTlsServer(async (port) => {
    const res = await httpsGet(port, '/rest/system/resource');
    assert.equal(res.status, 401, 'no credentials over TLS must still be 401');
  });
});
