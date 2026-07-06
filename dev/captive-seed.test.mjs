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

// Real GUID-hex ids (slice 2026-07-05--01 correction) — must match BaseEntity's
// Guid.NewGuid().ToString("N") shape, since captive-portal's TENANT_ID requires it.
const AURACONNECT_TENANT_ID = '96f20055f69a475cbfe549d960a8d51a';
const AURACONNECT_SITE_ID = '79cca231d2a34e869db7a7ccdbaf50f1';
// Same correction applied to the original demo tenant/site (2026-07-03--01, Checkpoint 17).
const DEV_TENANT_ID = 'de49b6cbe9d24edfb7d32dcec06a474f';
const DEV_SITE_ID = 'eaafa0ff706d4a52b6f45dbcced67b3b';

// Minimal fixture of the FK chain (EF: tenants → sites → radius_config). Only what the seed
// touches, but with the real FKs so an out-of-order or dangling seed fails loudly.
const FIXTURE_DDL = `
  CREATE TABLE tenants (
    id varchar(32) PRIMARY KEY, name varchar(255) NOT NULL, slug varchar(100) NOT NULL UNIQUE,
    portal_routing_mode integer NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP);
  CREATE TABLE sites (
    id varchar(32) PRIMARY KEY, tenant_id varchar(32) NOT NULL REFERENCES tenants(id),
    ssid varchar(255) NOT NULL UNIQUE, name varchar(255) NOT NULL, domain varchar(255) UNIQUE,
    auth_methods text[] NOT NULL DEFAULT '{}',
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP);
  CREATE TABLE radius_config (
    site_id varchar(32) PRIMARY KEY REFERENCES sites(id),
    gateway_url varchar(500), free_username varchar(255), free_password varchar(255),
    radiusdesk_url varchar(500), radiusdesk_api_token text,
    radiusdesk_realm_id varchar(255), radiusdesk_cloud_id varchar(255),
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP);
  CREATE TABLE branding (
    site_id varchar(32) PRIMARY KEY REFERENCES sites(id),
    brand_primary varchar(7) NOT NULL, brand_primary_hover varchar(7) NOT NULL,
    brand_secondary varchar(7) NOT NULL, brand_accent varchar(7) NOT NULL,
    text_primary varchar(7) NOT NULL, text_secondary varchar(7) NOT NULL,
    text_tertiary varchar(7) NOT NULL, text_muted varchar(7) NOT NULL,
    surface_card varchar(7) NOT NULL, surface_white varchar(7) NOT NULL, surface_border varchar(7) NOT NULL,
    button_primary varchar(7) NOT NULL, button_primary_hover varchar(7) NOT NULL, button_primary_text varchar(7) NOT NULL,
    button_secondary varchar(7) NOT NULL, button_secondary_hover varchar(7) NOT NULL, button_secondary_text varchar(7) NOT NULL,
    logo_url varchar(255) NOT NULL, logo_white_url varchar(255) NOT NULL, connect_card_bg_url varchar(255) NOT NULL,
    sort_order integer NOT NULL DEFAULT 0,
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
  assert.equal(psql('SELECT COUNT(*) FROM tenants')[0], '2', 'the original dev tenant plus AuraConnect');
  assert.equal(psql('SELECT COUNT(*) FROM sites')[0], '2', 'the original dev site plus Dev');
  assert.equal(psql('SELECT COUNT(*) FROM radius_config')[0], '2', 'one radius_config per site');
  // FK integrity: every site references its tenant, every config references its site.
  const joined = psql(`
    SELECT t.id || '|' || s.id || '|' || r.site_id
    FROM radius_config r JOIN sites s ON s.id = r.site_id JOIN tenants t ON t.id = s.tenant_id
    ORDER BY t.id`);
  assert.equal(joined.length, 2, 'both chains must join end to end');
  // ORDER BY t.id: '9...' sorts before 'd...' (ASCII digit < letter).
  assert.deepEqual(joined, [
    `${AURACONNECT_TENANT_ID}|${AURACONNECT_SITE_ID}|${AURACONNECT_SITE_ID}`,
    `${DEV_TENANT_ID}|${DEV_SITE_ID}|${DEV_SITE_ID}`,
  ]);
});

test('radius_config points the API at stub C (RadiusDesk)', () => {
  const [row] = psql(`
    SELECT radiusdesk_url, radiusdesk_api_token, radiusdesk_realm_id, radiusdesk_cloud_id
    FROM radius_config WHERE site_id = '${DEV_SITE_ID}'`);
  const [url, token, realm, cloud] = row.split('|');
  assert.equal(url, 'http://radiusdesk:8080', 'API (container) reaches stub C via compose DNS');
  assert.equal(token, 'dev-radiusdesk-token', 'token must match the stub');
  assert.ok(realm.length > 0 && cloud.length > 0, 'realm + cloud ids must be set for provisioning');
});

test('radius_config points the browser at stub B (hotspot login)', () => {
  const [gateway] = psql(`SELECT gateway_url FROM radius_config WHERE site_id = '${DEV_SITE_ID}'`);
  assert.match(gateway, /:5483/, 'gateway/login URL must target the hotspot-login host lane');
});

test('the original dev tenant/site chain is untouched by the additive block, id is a real GUID', () => {
  // Looked up by slug/ssid rather than id, since the id itself is under test here.
  const [tenant] = psql("SELECT id || '|' || name || '|' || slug FROM tenants WHERE slug = 'dev'");
  const [tenantId, tenantName, slug] = tenant.split('|');
  assert.match(tenantId, /^[0-9a-f]{32}$/i, 'tenant id must be a real GUID-hex string');
  assert.equal(tenantId, DEV_TENANT_ID);
  assert.equal(`${tenantName}|${slug}`, 'Dev Tenant|dev');

  const [site] = psql("SELECT id || '|' || name || '|' || ssid FROM sites WHERE ssid = 'my-demo-ssid'");
  const [siteId, siteName, ssid] = site.split('|');
  assert.match(siteId, /^[0-9a-f]{32}$/i, 'site id must be a real GUID-hex string');
  assert.equal(siteId, DEV_SITE_ID);
  assert.equal(`${siteName}|${ssid}`, 'Dev Site|my-demo-ssid');
});

test('the seed additively installs the AuraConnect tenant / Dev site chain', () => {
  // Looked up by slug/ssid (the human-facing fields) rather than id, since the id itself is
  // under test here: it must be a real GUID, not the slug/ssid string.
  const [tenant] = psql(
    "SELECT id || '|' || name || '|' || portal_routing_mode FROM tenants WHERE slug = 'auraconnect'");
  const [tenantId, tenantName, mode] = tenant.split('|');
  assert.match(tenantId, /^[0-9a-f]{32}$/i, 'tenant id must be a real GUID-hex string, not the slug');
  assert.equal(tenantId, AURACONNECT_TENANT_ID);
  assert.equal(`${tenantName}|${mode}`, 'AuraConnect|1', 'TenantShared routing mode');

  const [site] = psql(
    "SELECT id || '|' || name || '|' || domain FROM sites WHERE ssid = 'dev'");
  const [siteId, siteName, domain] = site.split('|');
  assert.match(siteId, /^[0-9a-f]{32}$/i, 'site id must be a real GUID-hex string, not a slug-like value');
  assert.equal(siteId, AURACONNECT_SITE_ID);
  assert.equal(`${siteName}|${domain}`, 'Dev|dev.auraconnect.co.za');

  const [row] = psql(`
    SELECT gateway_url, free_username, free_password,
           radiusdesk_url, radiusdesk_api_token, radiusdesk_realm_id, radiusdesk_cloud_id
    FROM radius_config WHERE site_id = '${AURACONNECT_SITE_ID}'`);
  const [gateway, freeUsername, freePassword, radiusdeskUrl, token, realm, cloud] = row.split('|');
  assert.equal(gateway, 'https://dev-gateway.auraconnect.co.za',
    'routes the browser at the real pre-configured MikroTik gateway, not the local stub');
  assert.equal(freeUsername, 'dev_trail', 'click-to-connect creds match the real device');
  assert.equal(freePassword, 'dev_trail');
  assert.equal(radiusdeskUrl, 'http://radiusdesk:8080',
    'the API\'s own backend call to RadiusDesk still targets the local stub');
  assert.equal(token, 'dev-radiusdesk-token');
  assert.ok(realm.length > 0 && cloud.length > 0);

  const [authMethods] = psql(
    `SELECT auth_methods::text FROM sites WHERE id = '${AURACONNECT_SITE_ID}'`);
  assert.equal(authMethods, '{free}', 'auth method must be Free Access');

  const [branding] = psql(
    `SELECT brand_primary || '|' || logo_url FROM branding WHERE site_id = '${AURACONNECT_SITE_ID}'`);
  assert.equal(branding, '#301358|/logo-default.svg', 'AuraConnect default branding must be seeded');
});

test('the seed is idempotent — re-applying keeps one of each row per site', () => {
  applySeed();
  applySeed();
  assert.equal(psql('SELECT COUNT(*) FROM radius_config')[0], '2');
  assert.equal(psql('SELECT COUNT(*) FROM sites')[0], '2');
  assert.equal(psql('SELECT COUNT(*) FROM tenants')[0], '2');
});
