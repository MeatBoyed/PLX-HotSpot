// Integration gate for the API RADIUS-DB config seed (AAA slice 2026-07-03--01, stub H).
// Behaviour pinned: applying dev/seed/platform-settings.sql to the API's Postgres yields
// exactly one platform_settings row (id='platform') whose five radius_db_* columns are all
// populated and point at the radius-db stub — the exact condition PlatformSettings
// .IsRadiusDbConfigured (computed in AuraConnect.Core/Entities/PlatformSettings.cs) requires,
// so RadiusAccountingClient connects with zero manual setup. Idempotent: re-applying keeps
// one row (the repo fetches via SingleOrDefault — a second row would throw).
//
// The real platform_settings table is created by EF migrations at API startup; this test
// stands up a fixture table with the migration's column shape (see
// Migrations/20260629084446_AddRadiusCalledStationIdsAndDbSettings.cs +
// Data/Configurations/PlatformSettingsConfiguration.cs) so the seed can be exercised
// without booting the API. Runs a throwaway container with no published host port.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const devDir = dirname(fileURLToPath(import.meta.url));
const seedFile = join(devDir, 'seed', 'platform-settings.sql');
const CONTAINER = 'auraconnect_platform_seed_test';
const SUPERUSER = 'local_dev';
const APPDB = 'auraconnect';

// Column shape from the EF migration + Fluent config (fixture standing in for the
// EF-created table). Only what the seed touches, plus the NOT NULL payfast default.
const FIXTURE_DDL = `
  CREATE TABLE platform_settings (
    id                   varchar(32)  PRIMARY KEY,
    radius_db_host       varchar(255) NULL,
    radius_db_port       integer      NULL,
    radius_db_name       varchar(255) NULL,
    radius_db_username   varchar(255) NULL,
    radius_db_password   varchar(255) NULL,
    mikrotik_api_host    varchar(255) NULL,
    mikrotik_username    varchar(255) NULL,
    mikrotik_password    varchar(255) NULL,
    payfast_sandbox_mode boolean      NOT NULL DEFAULT true,
    created_at           timestamptz  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at           timestamptz  NOT NULL DEFAULT CURRENT_TIMESTAMP
  );`;

function docker(args, opts = {}) {
  return execFileSync('docker', args, { encoding: 'utf8', ...opts });
}

// Connect over TCP (-h127.0.0.1), NOT the unix socket: Postgres' init runs a socket-only
// temporary server then restarts the real one, so a socket connection can catch the temp
// server mid-restart ("system is shutting down"). TCP is refused until the real server is
// up. TCP needs password auth, hence PGPASSWORD.
const PW_ENV = ['-e', 'PGPASSWORD=local_dev_pw'];

// psql -tA (tuples-only, unaligned) over stdin; returns trimmed non-empty lines.
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
  docker([
    'run', '-d', '--rm', '--name', CONTAINER,
    '-e', `POSTGRES_USER=${SUPERUSER}`,
    '-e', 'POSTGRES_PASSWORD=local_dev_pw',
    '-e', `POSTGRES_DB=${APPDB}`,
    'postgres:17',
  ]);
  // Poll over TCP so we only proceed once the *real* server accepts network connections
  // (the socket-only temp init server is invisible to -h127.0.0.1).
  const deadline = Date.now() + 60_000;
  for (;;) {
    try { docker(['exec', CONTAINER, 'pg_isready', '-h', '127.0.0.1', '-U', SUPERUSER], { stdio: 'pipe' }); break; }
    catch { if (Date.now() > deadline) break; execFileSync('sleep', ['1']); }
  }
  psql(FIXTURE_DDL);
});

after(() => {
  try { docker(['rm', '-f', CONTAINER]); } catch { /* already gone */ }
});

test('the seed installs exactly one platform_settings row, id=platform', () => {
  applySeed();
  const [count] = psql('SELECT COUNT(*) FROM platform_settings');
  assert.equal(count, '1', 'expected exactly one platform_settings row (SingleOrDefault)');
  const [id] = psql("SELECT id FROM platform_settings");
  assert.equal(id, 'platform', 'the singleton row must use the fixed id');
});

test('all five radius_db_* columns are populated → IsRadiusDbConfigured would be true', () => {
  const [row] = psql(`
    SELECT radius_db_host, radius_db_port, radius_db_name, radius_db_username, radius_db_password
    FROM platform_settings WHERE id = 'platform'`);
  const [host, port, name, user, pass] = row.split('|');
  assert.equal(host, 'radius-db', 'host must be the compose service DNS name');
  assert.equal(port, '3306', 'port must be the MariaDB container port');
  assert.equal(name, 'radius');
  assert.equal(user, 'radius');
  assert.equal(pass, 'radius_pw');
  for (const v of [host, port, name, user, pass]) {
    assert.ok(v && v.length > 0, 'no radius_db_* column may be empty (IsRadiusDbConfigured)');
  }
});

test('the three mikrotik_* columns are populated → IsMikroTikConfigured would be true', () => {
  const [row] = psql(`
    SELECT mikrotik_api_host, mikrotik_username, mikrotik_password
    FROM platform_settings WHERE id = 'platform'`);
  const [host, user, pass] = row.split('|');
  assert.equal(host, 'mikrotik:8443', 'API reaches stub A REST at the compose DNS + HTTPS port');
  assert.equal(user, 'admin');
  assert.equal(pass, 'admin');
  for (const v of [host, user, pass]) {
    assert.ok(v && v.length > 0, 'no mikrotik_* column may be empty (IsMikroTikConfigured)');
  }
});

test('the seed is idempotent — re-applying keeps a single row', () => {
  applySeed();
  applySeed();
  const [count] = psql('SELECT COUNT(*) FROM platform_settings');
  assert.equal(count, '1', 're-running the seed must not create a second row');
});
