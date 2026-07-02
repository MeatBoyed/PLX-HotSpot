// Gate for the root dev-orchestration scripts (three run modes: current / legacy /
// both, default current). This is process glue — not a live boot — so the behaviour
// pinned is the *contract* of the scripts: each mode brings infra up, runs the right
// workspaces on the central-port-map ports, and layers the right env group.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join } from 'node:path';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const pkg = JSON.parse(readFileSync(join(repoRoot, 'package.json'), 'utf8'));
const scripts = pkg.scripts ?? {};

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
const ports = parseEnv('.env.example');

const CURRENT = [
  { name: '@auraconnect/admin', port: ports.ADMIN_PORT },
  { name: '@auraconnect/captive-portal', port: ports.CAPTIVE_PORTAL_PORT },
  { name: '@auraconnect/monitor', port: ports.MONITOR_PORT },
];
const LEGACY = { name: '@auraconnect/captive-portal-and-admin-legacy', port: ports.LEGACY_PORT };

test('default `dev` maps to the current mode', () => {
  assert.ok(scripts.dev, 'missing script: dev');
  assert.match(scripts.dev, /dev:current/, '`dev` must default to the current mode');
});

test('every mode brings the infra stack up', () => {
  for (const mode of ['dev:current', 'dev:legacy', 'dev:both']) {
    assert.ok(scripts[mode], `missing script: ${mode}`);
    assert.match(scripts[mode], /docker compose .*up -d/, `${mode} must bring infra up`);
  }
});

test('dev:current runs the three current clients on their mapped ports + env', () => {
  const s = scripts['dev:current'];
  for (const c of CURRENT) {
    assert.ok(s.includes(c.name), `dev:current must run ${c.name}`);
    assert.ok(s.includes(c.port), `dev:current must run ${c.name} on port ${c.port}`);
  }
  assert.match(s, /\.env\.current/, 'dev:current must layer .env.current');
  assert.ok(!s.includes(LEGACY.name), 'dev:current must not run the legacy client');
});

test('dev:legacy runs only the legacy client on its mapped port + env', () => {
  const s = scripts['dev:legacy'];
  assert.ok(s.includes(LEGACY.name), 'dev:legacy must run the legacy client');
  assert.ok(s.includes(LEGACY.port), `dev:legacy must run legacy on port ${LEGACY.port}`);
  assert.match(s, /\.env\.legacy/, 'dev:legacy must layer .env.legacy');
});

test('dev:both runs all four clients', () => {
  const s = scripts['dev:both'];
  for (const c of [...CURRENT, LEGACY]) {
    assert.ok(s.includes(c.name), `dev:both must run ${c.name}`);
  }
});

test('the four client ports are distinct', () => {
  const all = [...CURRENT.map((c) => c.port), LEGACY.port];
  assert.equal(new Set(all).size, all.length, `client ports must be distinct: ${all.join(', ')}`);
});
