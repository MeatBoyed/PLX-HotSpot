// Integration gate for the captive-site DB seed (AAA slice 2026-07-03--01, stub H part 3).
// Behaviour pinned: applying dev/seed/captive-site.sql to the API's Postgres installs a dev
// tenant → site → radius_config chain whose RadiusDesk fields point at stub C and whose
// gateway (login) URL points at stub B, so the API's provisioning + the captive portal's
// gateway lookup resolve against the local stubs. FK integrity across the chain is enforced
// by the fixture tables (tenants → sites → radius_config), mirroring the EF schema.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const devDir = dirname(fileURLToPath(import.meta.url));
const seedFile = join(devDir, 'seed', 'captive-site.sql');
const CONTAINER = 'auraconnect_captive_seed_test';
const SUPERUSER = 'local_dev';
const APPDB = 'auraconnect';

// Minimal fixture of the FK chain (EF: tenants → sites → radius_config). Only what the seed
// touches, but with the real FKs so an out-of-order or dangling seed fails loudly.
const FIXTURE_DDL = `
  CREATE TABLE tenants (
    id varchar(32) PRIMARY KEY, name varchar(255) NOT NULL, slug varchar(100) NOT NULL UNIQUE,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP);
  CREATE TABLE sites (
    id varchar(32) PRIMARY KEY, tenant_id varchar(32) NOT NULL REFERENCES tenants(id),
    ssid varchar(255) NOT NULL UNIQUE, name varchar(255) NOT NULL,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP);
  CREATE TABLE radius_config (
    site_id varchar(32) PRIMARY KEY REFERENCES sites(id),
    gateway_url varchar(500), free_username varchar(255), free_password varchar(255),
    radiusdesk_url varchar(500), radiusdesk_api_token text,
    radiusdesk_realm_id varchar(255), radiusdesk_cloud_id varchar(255),
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP);`;

const PW_ENV = ['-e', 'PGPASSWORD=local_dev_pw'];

function docker(args, opts = {}) { return execFileSync('docker', args, { encoding: 'utf8', ...opts }); }

function psql(sql) {
  const out = docker(
    ['exec', '-i', ...PW_ENV, CONTAINER, 'psql', '-h', '127.0.0.1', '-U', SUPERUSER, '-d', APPDB, '-tAc', sql],
    { stdio: ['pipe', 'pipe', 'pipe'] },
  );
  return out.split('\n').map((s) => s.trim()).filter(Boolean);
}

function applySeed() {
  docker(
    ['exec', '-i', ...PW_ENV, CONTAINER, 'psql', '-h', '127.0.0.1', '-v', 'ON_ERROR_STOP=1', '-U', SUPERUSER, '-d', APPDB],
    { input: readFileSync(seedFile, 'utf8'), stdio: ['pipe', 'pipe', 'pipe'] },
  );
}

before(() => {
  try { docker(['rm', '-f', CONTAINER]); } catch { /* not running */ }
  docker(['run', '-d', '--rm', '--name', CONTAINER,
    '-e', `POSTGRES_USER=${SUPERUSER}`, '-e', 'POSTGRES_PASSWORD=local_dev_pw', '-e', `POSTGRES_DB=${APPDB}`,
    'postgres:17']);
  const deadline = Date.now() + 60_000;
  for (;;) {
    try { docker(['exec', CONTAINER, 'pg_isready', '-h', '127.0.0.1', '-U', SUPERUSER], { stdio: 'pipe' }); break; }
    catch { if (Date.now() > deadline) break; execFileSync('sleep', ['1']); }
  }
  psql(FIXTURE_DDL);
});

after(() => { try { docker(['rm', '-f', CONTAINER]); } catch { /* gone */ } });

test('the seed installs the tenant → site → radius_config chain', () => {
  applySeed();
  assert.equal(psql('SELECT COUNT(*) FROM tenants')[0], '1', 'one dev tenant');
  assert.equal(psql('SELECT COUNT(*) FROM sites')[0], '1', 'one dev site');
  assert.equal(psql('SELECT COUNT(*) FROM radius_config')[0], '1', 'one radius_config');
  // FK integrity: the site references the tenant, the config references the site.
  const [joined] = psql(`
    SELECT t.id || '|' || s.id || '|' || r.site_id
    FROM radius_config r JOIN sites s ON s.id = r.site_id JOIN tenants t ON t.id = s.tenant_id`);
  assert.ok(joined && joined.split('|').length === 3, 'the chain must join end to end');
});

test('radius_config points the API at stub C (RadiusDesk)', () => {
  const [row] = psql(`
    SELECT radiusdesk_url, radiusdesk_api_token, radiusdesk_realm_id, radiusdesk_cloud_id
    FROM radius_config`);
  const [url, token, realm, cloud] = row.split('|');
  assert.equal(url, 'http://radiusdesk:8080', 'API (container) reaches stub C via compose DNS');
  assert.equal(token, 'dev-radiusdesk-token', 'token must match the stub');
  assert.ok(realm.length > 0 && cloud.length > 0, 'realm + cloud ids must be set for provisioning');
});

test('radius_config points the browser at stub B (hotspot login)', () => {
  const [gateway] = psql("SELECT gateway_url FROM radius_config");
  assert.match(gateway, /:5483/, 'gateway/login URL must target the hotspot-login host lane');
});

test('the seed is idempotent — re-applying keeps one of each row', () => {
  applySeed();
  applySeed();
  assert.equal(psql('SELECT COUNT(*) FROM radius_config')[0], '1');
  assert.equal(psql('SELECT COUNT(*) FROM sites')[0], '1');
  assert.equal(psql('SELECT COUNT(*) FROM tenants')[0], '1');
});
