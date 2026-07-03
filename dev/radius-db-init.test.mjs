// Integration gate for the FreeRADIUS accounting DB stub (AAA slice 2026-07-03--01, stub D).
// Behaviour pinned: a fresh MariaDB initialised with dev/radius-db/init ends up with the
// four tables the API reads (radacct, radacct_history, radpostauth, user_stats_dailies),
// seeded so the API's *own* aggregate queries return non-empty results. The queries below
// are copied from api/AuraConnect.Infrastructure/Services/RadiusAccountingClient.cs — if
// the schema/seed drifts from what the API expects, these go red.
// Runs a throwaway container with no published host port (exec the client inside it), so it
// neither collides with the port map nor depends on a persisted volume.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const devDir = dirname(fileURLToPath(import.meta.url));
const initDir = join(devDir, 'radius-db', 'init');
const CONTAINER = 'auraconnect_radiusdb_init_test';
const ROOT_PW = 'radius_root_pw';
const DB = 'radius';

function docker(args, opts = {}) {
  return execFileSync('docker', args, { encoding: 'utf8', ...opts });
}

// Run SQL as root against the seeded DB; returns tab-separated rows, header stripped.
// Connect over TCP (-h127.0.0.1), NOT the unix socket: MariaDB's init runs a socket-only
// temporary server (--skip-networking) then restarts the real one, so a socket connection
// can catch the temp server mid-restart ("system is shutting down"). TCP is refused until
// the real server is up, dodging that window.
function sql(query) {
  const out = docker(
    ['exec', CONTAINER, 'mariadb', '-h127.0.0.1', '--protocol=tcp', '-uroot', `-p${ROOT_PW}`,
     '-N', '-B', DB, '-e', query],
    { stdio: 'pipe' },
  );
  return out.split('\n').map((s) => s.trim()).filter(Boolean);
}

before(() => {
  try { docker(['rm', '-f', CONTAINER]); } catch { /* not running */ }
  docker([
    'run', '-d', '--rm', '--name', CONTAINER,
    '-v', `${initDir}:/docker-entrypoint-initdb.d:ro`,
    '-e', `MARIADB_ROOT_PASSWORD=${ROOT_PW}`,
    '-e', `MARIADB_DATABASE=${DB}`,
    '-e', 'MARIADB_ROOT_HOST=%', // allow root over TCP (127.0.0.1), see sql() note
    'mariadb:11.4.5',
  ]);
  // Wait for init to finish: poll until the four tables exist or timeout.
  const deadline = Date.now() + 90_000;
  for (;;) {
    try {
      const tables = sql('SHOW TABLES');
      if (['radacct', 'radacct_history', 'radpostauth', 'user_stats_dailies']
        .every((t) => tables.includes(t))) break;
    } catch { /* not ready yet */ }
    if (Date.now() > deadline) break;
    execFileSync('sleep', ['1']);
  }
});

after(() => {
  try { docker(['rm', '-f', CONTAINER]); } catch { /* already gone */ }
});

test('the four FreeRADIUS tables the API reads exist', () => {
  const tables = sql('SHOW TABLES');
  for (const t of ['radacct', 'radacct_history', 'radpostauth', 'user_stats_dailies']) {
    assert.ok(tables.includes(t), `expected table "${t}"; got ${tables.join(', ')}`);
  }
});

// GetDailySessionAggregatesAsync — UNION over radacct + radacct_history, grouped by
// station + day. Non-empty proves both tables carry the octet/username/time columns and
// overlapping seed dates.
test('the daily-session-aggregate query returns seeded rows', () => {
  const rows = sql(`
    SELECT calledstationid, DATE(acctstarttime), SUM(acctinputoctets), SUM(acctoutputoctets),
           COUNT(*), COUNT(DISTINCT username)
    FROM (
      SELECT calledstationid, acctstarttime, acctinputoctets, acctoutputoctets, username FROM radacct
      UNION ALL
      SELECT calledstationid, acctstarttime, acctinputoctets, acctoutputoctets, username FROM radacct_history
    ) combined
    GROUP BY calledstationid, DATE(acctstarttime)`);
  assert.ok(rows.length > 0, 'daily-session aggregate must return at least one row');
});

// GetActiveSessionsAsync — open sessions are radacct rows with NULL acctstoptime. The
// monitor "active users" view needs at least one.
test('at least one active session (open radacct row) is seeded', () => {
  const rows = sql('SELECT calledstationid, username FROM radacct WHERE acctstoptime IS NULL');
  assert.ok(rows.length > 0, 'expected at least one open (acctstoptime IS NULL) radacct row');
});

// GetAuthReplyCountsAsync — reply-code histogram from radpostauth.
test('radpostauth carries auth replies to count', () => {
  const rows = sql('SELECT reply, COUNT(*) FROM radpostauth GROUP BY reply');
  assert.ok(rows.length > 0, 'expected radpostauth reply rows');
});

// GetDailyUsageByUsernamesAsync — per-user daily octets from user_stats_dailies.
test('user_stats_dailies carries per-user daily usage', () => {
  const rows = sql('SELECT username, timestamp, acctinputoctets, acctoutputoctets FROM user_stats_dailies');
  assert.ok(rows.length > 0, 'expected user_stats_dailies rows');
});
