// Gate for the AAA-emulation stack (compose slice 2026-07-03--01).
// Behaviour pinned: the reserved `aaa` profile brings up thin emulators of the
// integration backends the apps call, each its own compose service (stub-per-system),
// off by default and on their own host-port lane. This file grows one block per stub
// as the slice adds them (D radius-db first; A/B/C/E/F follow).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const devDir = dirname(fileURLToPath(import.meta.url));

function composeConfig(profiles = []) {
  const profileArgs = profiles.flatMap((p) => ['--profile', p]);
  const out = execFileSync(
    'docker',
    ['compose', '-f', 'docker-compose.yml', ...profileArgs, 'config', '--format', 'json'],
    { cwd: devDir, encoding: 'utf8' },
  );
  return JSON.parse(out);
}

// ── D — FreeRADIUS accounting DB (MariaDB the API reads as SQL) ────────────────
test('the FreeRADIUS accounting DB stays behind the `aaa` profile', () => {
  const services = Object.keys(composeConfig().services ?? {});
  assert.ok(
    !services.includes('radius-db'),
    'radius-db must not be in the default stack; it is an opt-in emulator',
  );
});

test('the `aaa` profile brings up the FreeRADIUS accounting DB as MariaDB', () => {
  const cfg = composeConfig(['aaa']);
  const svc = cfg.services?.['radius-db'];
  assert.ok(svc, 'radius-db must be enabled by --profile aaa');

  // The API reads radacct/radpostauth/user_stats_dailies via MySqlConnector, so the
  // stub is a real MySQL-wire DB (MariaDB), not a RADIUS server.
  assert.match(svc.image ?? '', /mariadb/, 'radius-db must use a MariaDB image');

  // Init scripts (schema + seed) mount at the MySQL entrypoint init dir.
  const initMount = (svc.volumes ?? []).find(
    (v) => v.target === '/docker-entrypoint-initdb.d',
  );
  assert.ok(initMount, 'radius-db must mount an init dir at /docker-entrypoint-initdb.d');

  // Its own host-port lane, no collision with the core map (checked globally below).
  const published = (svc.ports ?? []).map((p) => String(p.published ?? ''));
  assert.ok(published.includes('5482'), `radius-db must publish 5482; got ${published.join(', ')}`);
});

// ── A — MikroTik RouterOS REST stub (Fastify HTTPS service) ────────────────────
test('the MikroTik REST stub stays behind the `aaa` profile', () => {
  const services = Object.keys(composeConfig().services ?? {});
  assert.ok(!services.includes('mikrotik'), 'mikrotik must not be in the default stack');
});

test('the `aaa` profile builds + brings up the MikroTik REST stub on the 5481 lane', () => {
  const cfg = composeConfig(['aaa']);
  const svc = cfg.services?.mikrotik;
  assert.ok(svc, 'mikrotik must be enabled by --profile aaa');

  // Built from the stub workspace (no prebuilt image to publish for a dev stub).
  assert.ok(svc.build, 'mikrotik must build from the stub workspace');

  // Its own host-port lane on the AAA range; container serves HTTPS on 8443.
  const port = (svc.ports ?? []).find((p) => String(p.published) === '5481');
  assert.ok(port, 'mikrotik must publish host port 5481');
  assert.equal(String(port.target), '8443', 'container must serve on 8443');
});

test('the mikrotik service also exposes the hotspot login page (stub B) on 5483', () => {
  const svc = composeConfig(['aaa']).services?.mikrotik;
  assert.ok(svc, 'mikrotik must be enabled by --profile aaa');
  // Same RouterOS "system" → one service, second (plain-HTTP) listener for /login.
  const login = (svc.ports ?? []).find((p) => String(p.published) === '5483');
  assert.ok(login, 'mikrotik must publish the hotspot-login host port 5483');
  assert.equal(String(login.target), '8080', 'the login page serves plain HTTP on 8080');
});

// ── C — RadiusDesk rd_cake stub (Fastify HTTP service) ─────────────────────────
test('the RadiusDesk stub stays behind the `aaa` profile', () => {
  const services = Object.keys(composeConfig().services ?? {});
  assert.ok(!services.includes('radiusdesk'), 'radiusdesk must not be in the default stack');
});

test('the `aaa` profile builds + brings up the RadiusDesk stub on the 5480 lane', () => {
  const cfg = composeConfig(['aaa']);
  const svc = cfg.services?.radiusdesk;
  assert.ok(svc, 'radiusdesk must be enabled by --profile aaa');
  assert.ok(svc.build, 'radiusdesk must build from the stub workspace');
  const port = (svc.ports ?? []).find((p) => String(p.published) === '5480');
  assert.ok(port, 'radiusdesk must publish host port 5480');
  assert.equal(String(port.target), '8080', 'container must serve on 8080 (plain HTTP)');
});

test('no two services publish the same host port (core + tools + aaa)', () => {
  const cfg = composeConfig(['tools', 'aaa']);
  const seen = new Map(); // host port -> service
  for (const [name, svc] of Object.entries(cfg.services ?? {})) {
    for (const p of svc.ports ?? []) {
      const host = String(p.published ?? '');
      if (!host) continue;
      assert.ok(!seen.has(host), `host port ${host} bound by both ${seen.get(host)} and ${name}`);
      seen.set(host, name);
    }
  }
});
