// Gate for the host-client → AAA-stub env wiring (AAA slice 2026-07-03--01, stub H part 4).
// The monitor + captive portals run on the HOST (Next dev via concurrently) and call the
// stubs directly over their published host-port lanes. This pins that .env.current.example
// points those clients at the stubs (monitor → A, captive → C, browser → B), so a fresh
// `.env.current` copied from the template is wired for the `aaa` stack out of the box.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join } from 'node:path';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

function parseEnv(file) {
  const out = {};
  for (const raw of readFileSync(join(repoRoot, file), 'utf8').split('\n')) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq !== -1) out[line.slice(0, eq).trim()] = line.slice(eq + 1).trim();
  }
  return out;
}
const env = parseEnv('.env.current.example');

test('monitor telemetry points at the MikroTik REST stub (A) on its host lane', () => {
  assert.equal(env.MIKROTIK_HOST, 'localhost:5481', 'monitor client hits https://MIKROTIK_HOST/rest → stub A');
  assert.equal(env.MIKROTIK_USER, 'admin');
  assert.equal(env.MIKROTIK_PASS, 'admin');
  assert.equal(env.MIKROTIK_TLS_VERIFY, 'false', 'the stub uses a self-signed cert');
});

test('captive portal points its direct RadiusDesk calls at stub C', () => {
  assert.equal(env.MIKROTIK_RADIUS_DESK_BASE_URL, 'http://localhost:5480', 'host → stub C rd_cake');
  assert.equal(env.RADIUSDESK_TOKEN, 'dev-radiusdesk-token', 'token must match the stub');
  for (const k of ['RADIUSDESK_REALM_ID', 'RADIUSDESK_PROFILE_ID', 'RADIUSDESK_CLOUD_ID']) {
    assert.ok((env[k] ?? '').length > 0, `${k} must be set for voucher/permanent-user issue`);
  }
});

test('captive portal login navigation points the browser at the hotspot-login stub (B)', () => {
  assert.equal(env.NEXT_PUBLIC_MIKROTIK_BASE_URL, 'http://localhost:5483', 'browser → stub B /login lane');
});
