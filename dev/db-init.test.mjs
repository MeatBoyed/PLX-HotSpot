// Integration gate for the two-DB init (slice decision: separate init script per
// group — current + legacy — each independently runnable).
// Behaviour pinned: a fresh Postgres initialised with dev/init/ ends up owning both
// application databases (current + legacy), each with its own owning role.
// Runs a throwaway container with no published host port (exec psql inside it), so
// it neither collides with the port map nor depends on a persisted volume.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const devDir = dirname(fileURLToPath(import.meta.url));
const initDir = join(devDir, 'init');
const CONTAINER = 'auraconnect_dbinit_test';
const SUPERUSER = 'local_dev';

const EXPECTED_DBS = ['auraconnect', 'phs_portal'];

function docker(args, opts = {}) {
  return execFileSync('docker', args, { encoding: 'utf8', ...opts });
}

before(() => {
  try { docker(['rm', '-f', CONTAINER]); } catch { /* not running */ }
  docker([
    'run', '-d', '--rm', '--name', CONTAINER,
    '-v', `${initDir}:/docker-entrypoint-initdb.d:ro`,
    '-e', `POSTGRES_USER=${SUPERUSER}`,
    '-e', 'POSTGRES_PASSWORD=local_dev_pw',
    '-e', 'POSTGRES_DB=postgres',
    'postgres:17',
  ]);
  // Wait for init to finish: pg_isready, then poll until both DBs exist or timeout.
  const deadline = Date.now() + 60_000;
  for (;;) {
    try {
      docker(['exec', CONTAINER, 'pg_isready', '-U', SUPERUSER], { stdio: 'pipe' });
      const dbs = listDatabases();
      if (EXPECTED_DBS.every((d) => dbs.includes(d))) break;
    } catch { /* not ready yet */ }
    if (Date.now() > deadline) break;
    execFileSync('sleep', ['1']);
  }
});

after(() => {
  try { docker(['rm', '-f', CONTAINER]); } catch { /* already gone */ }
});

function listDatabases() {
  const out = docker([
    'exec', CONTAINER,
    'psql', '-U', SUPERUSER, '-d', 'postgres', '-tAc',
    'SELECT datname FROM pg_database',
  ], { stdio: 'pipe' });
  return out.split('\n').map((s) => s.trim()).filter(Boolean);
}

test('both application databases exist after init', () => {
  const dbs = listDatabases();
  for (const db of EXPECTED_DBS) {
    assert.ok(dbs.includes(db), `expected database "${db}" to exist; got ${dbs.join(', ')}`);
  }
});

test('each application database is owned by its own dedicated role', () => {
  const out = docker([
    'exec', CONTAINER,
    'psql', '-U', SUPERUSER, '-d', 'postgres', '-tAc',
    "SELECT d.datname || ':' || r.rolname FROM pg_database d " +
    'JOIN pg_roles r ON r.oid = d.datdba',
  ], { stdio: 'pipe' });
  const owners = Object.fromEntries(
    out.split('\n').map((s) => s.trim()).filter(Boolean).map((l) => l.split(':')),
  );
  assert.equal(owners.auraconnect, 'auraconnect');
  assert.equal(owners.phs_portal, 'legacy');
});
