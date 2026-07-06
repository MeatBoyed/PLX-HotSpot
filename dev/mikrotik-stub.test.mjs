// Gate for the MikroTik RouterOS REST stub (AAA slice 2026-07-03--01, stub A).
// Behaviour pinned via Fastify's app.inject() (no network/TLS/docker): the stub demands
// HTTP Basic auth on /rest and serves GET /rest/system/resource as the single RouterOS
// object the monitor dashboard reads (client.ts → /rest/system/resource, rendered in
// monitor app/(app)/system/page.tsx). TLS + compose wiring are pinned separately.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildApp } from './stubs/mikrotik/app.mjs';

const USER = 'admin';
const PASS = 'admin';
const basic = (u, p) => 'Basic ' + Buffer.from(`${u}:${p}`).toString('base64');
const AUTH = { authorization: basic(USER, PASS) };

async function withApp(fn) {
  const app = buildApp({ user: USER, pass: PASS });
  try { await fn(app); } finally { await app.close(); }
}

// GET a /rest path with valid auth, assert 200, return the parsed JSON body.
async function getJson(app, url) {
  const res = await app.inject({ method: 'GET', url, headers: AUTH });
  assert.equal(res.statusCode, 200, `${url} must be 200 with valid auth`);
  return res.json();
}

// Assert every listed kebab-case key is present on the first element of an array response.
function assertArrayFields(rows, keys, path) {
  assert.ok(Array.isArray(rows) && rows.length > 0, `${path} must return a non-empty array`);
  for (const key of keys) {
    assert.ok(key in rows[0], `${path}[0] must expose "${key}" (monitor reads it)`);
  }
}

test('GET /rest/system/resource without credentials is 401', async () => {
  await withApp(async (app) => {
    const res = await app.inject({ method: 'GET', url: '/rest/system/resource' });
    assert.equal(res.statusCode, 401, 'the RouterOS REST surface requires Basic auth');
  });
});

test('GET /rest/system/resource with wrong credentials is 401', async () => {
  await withApp(async (app) => {
    const res = await app.inject({
      method: 'GET', url: '/rest/system/resource',
      headers: { authorization: basic('admin', 'wrong') },
    });
    assert.equal(res.statusCode, 401);
  });
});

test('GET /rest/system/resource with valid Basic auth returns the system-resource object', async () => {
  await withApp(async (app) => {
    const res = await app.inject({
      method: 'GET', url: '/rest/system/resource',
      headers: { authorization: basic(USER, PASS) },
    });
    assert.equal(res.statusCode, 200);
    const body = res.json();
    // RouterOS returns a single object here (not an array); monitor reads kebab-case keys.
    assert.ok(!Array.isArray(body), '/system/resource is a single object, not an array');
    for (const key of ['cpu-load', 'free-memory', 'total-memory', 'uptime', 'version', 'board-name']) {
      assert.ok(key in body, `system/resource must expose "${key}" (monitor reads it)`);
    }
  });
});

// ── Monitor array GETs — each rendered by the monitor dashboard ─────────────────
test('GET /rest/ip/hotspot/active returns active sessions with the rendered fields', async () => {
  await withApp(async (app) => {
    const rows = await getJson(app, '/rest/ip/hotspot/active');
    assertArrayFields(rows, ['.id', 'server', 'user', 'address', 'mac-address', 'bytes-in', 'bytes-out'],
      '/ip/hotspot/active');
  });
});

test('GET /rest/ip/hotspot/active?server= filters by hotspot server', async () => {
  await withApp(async (app) => {
    const all = await getJson(app, '/rest/ip/hotspot/active');
    const server = all[0].server;
    const filtered = await getJson(app, `/rest/ip/hotspot/active?server=${encodeURIComponent(server)}`);
    assert.ok(filtered.length > 0 && filtered.every((r) => r.server === server),
      'the ?server= filter must narrow to that server');
  });
});

test('GET /rest/ip/dhcp-server/lease returns leases with the rendered fields', async () => {
  await withApp(async (app) => {
    const rows = await getJson(app, '/rest/ip/dhcp-server/lease');
    assertArrayFields(rows, ['.id', 'address', 'mac-address', 'server', 'expires-after'],
      '/ip/dhcp-server/lease');
  });
});

test('GET /rest/ip/hotspot/user returns hotspot user accounts', async () => {
  await withApp(async (app) => {
    const rows = await getJson(app, '/rest/ip/hotspot/user');
    assertArrayFields(rows, ['.id', 'server', 'name', 'profile'], '/ip/hotspot/user');
  });
});

test('GET /rest/ip/hotspot returns the hotspot server list', async () => {
  await withApp(async (app) => {
    const rows = await getJson(app, '/rest/ip/hotspot');
    assertArrayFields(rows, ['.id', 'name', 'interface', 'address-pool', 'profile'], '/ip/hotspot');
  });
});

test('GET /rest/log returns log lines and honours ?topics=', async () => {
  await withApp(async (app) => {
    const rows = await getJson(app, '/rest/log');
    assertArrayFields(rows, ['.id', 'time', 'topics', 'message'], '/log');
    const topic = rows[0].topics.split(',')[0];
    const filtered = await getJson(app, `/rest/log?topics=${encodeURIComponent(topic)}`);
    assert.ok(filtered.every((r) => r.topics.includes(topic)), 'the ?topics= filter must narrow the log');
  });
});

test('GET /rest/interface returns interfaces with the rendered byte counters', async () => {
  await withApp(async (app) => {
    const rows = await getJson(app, '/rest/interface');
    assertArrayFields(rows, ['.id', 'name', 'mac-address', 'rx-byte', 'tx-byte'], '/interface');
  });
});

// ── Monitor mutating calls ──────────────────────────────────────────────────────
test('POST /rest/interface/monitor-traffic returns a one-shot bits/sec sample', async () => {
  await withApp(async (app) => {
    const res = await app.inject({
      method: 'POST', url: '/rest/interface/monitor-traffic',
      headers: AUTH, payload: { interface: 'ether1', once: '' },
    });
    assert.equal(res.statusCode, 200);
    const rows = res.json();
    assertArrayFields(rows, ['name', 'rx-bits-per-second', 'tx-bits-per-second'], 'monitor-traffic');
    assert.equal(rows[0].name, 'ether1', 'the sample must be for the requested interface');
  });
});

test('DELETE /rest/ip/hotspot/active/{id} disconnects a session (204)', async () => {
  await withApp(async (app) => {
    const res = await app.inject({
      method: 'DELETE', url: '/rest/ip/hotspot/active/*1', headers: AUTH,
    });
    assert.equal(res.statusCode, 204, 'RouterOS answers 204 No Content on delete');
  });
});

test('the mutating calls also require Basic auth', async () => {
  await withApp(async (app) => {
    const post = await app.inject({ method: 'POST', url: '/rest/interface/monitor-traffic', payload: {} });
    assert.equal(post.statusCode, 401);
    const del = await app.inject({ method: 'DELETE', url: '/rest/ip/hotspot/active/*1' });
    assert.equal(del.statusCode, 401);
  });
});

// ── API-facing GETs — MikroTikGatewayService gateway verification (all arrays) ──
test('GET /rest/ip/hotspot/profile returns profiles with the matched fields', async () => {
  await withApp(async (app) => {
    const rows = await getJson(app, '/rest/ip/hotspot/profile');
    assertArrayFields(rows, ['name', 'dns-name', 'ssl-certificate', 'use-radius'], '/ip/hotspot/profile');
  });
});

test('GET /rest/certificate returns certs with health + expiry fields', async () => {
  await withApp(async (app) => {
    const rows = await getJson(app, '/rest/certificate');
    assertArrayFields(rows, ['name', 'common-name', 'flags', 'invalid-after', 'subject-alt-name'], '/certificate');
  });
});

test('GET /rest/ip/address returns addresses with network + interface', async () => {
  await withApp(async (app) => {
    const rows = await getJson(app, '/rest/ip/address');
    assertArrayFields(rows, ['address', 'network', 'interface'], '/ip/address');
  });
});

test('GET /rest/ip/pool returns pools with ranges', async () => {
  await withApp(async (app) => {
    const rows = await getJson(app, '/rest/ip/pool');
    assertArrayFields(rows, ['name', 'ranges'], '/ip/pool');
  });
});

test('GET /rest/ip/dhcp-server returns dhcp servers with interface + pool', async () => {
  await withApp(async (app) => {
    const rows = await getJson(app, '/rest/ip/dhcp-server');
    assertArrayFields(rows, ['name', 'interface', 'address-pool', 'disabled'], '/ip/dhcp-server');
  });
});

test('GET /rest/ip/dhcp-server/network returns networks with gateway + dns', async () => {
  await withApp(async (app) => {
    const rows = await getJson(app, '/rest/ip/dhcp-server/network');
    assertArrayFields(rows, ['address', 'gateway', 'dns-server'], '/ip/dhcp-server/network');
  });
});

test('GET /rest/ip/firewall/address-list returns the hotspot-list entries', async () => {
  await withApp(async (app) => {
    const rows = await getJson(app, '/rest/ip/firewall/address-list');
    assertArrayFields(rows, ['list', 'address', 'creation-time'], '/ip/firewall/address-list');
    assert.ok(rows.some((r) => r.list === 'hotspot-list'), 'must carry a hotspot-list entry');
  });
});

// RouterOS date fields the API parses must be one of its three accepted formats.
const DATE_FORMATS = [
  /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/,      // yyyy-MM-dd HH:mm:ss
  /^[A-Za-z]{3}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2}$/, // MMM/dd/yyyy HH:mm:ss
  /^[A-Za-z]{3}\/\d{2}\/\d{4}$/,                // MMM/dd/yyyy
];
const okDate = (v) => DATE_FORMATS.some((re) => re.test(v));

test('cert invalid-after and firewall creation-time use RouterOS date formats', async () => {
  await withApp(async (app) => {
    const certs = await getJson(app, '/rest/certificate');
    for (const c of certs) assert.ok(okDate(c['invalid-after']), `bad invalid-after: ${c['invalid-after']}`);
    const fw = await getJson(app, '/rest/ip/firewall/address-list');
    for (const e of fw) assert.ok(okDate(e['creation-time']), `bad creation-time: ${e['creation-time']}`);
  });
});

// The whole point of the API's read-only verification: the chain must resolve end to end.
test('the gateway-verification chain resolves for a hotspot profile', async () => {
  await withApp(async (app) => {
    const profiles = await getJson(app, '/rest/ip/hotspot/profile');
    const servers = await getJson(app, '/rest/ip/hotspot');
    const certs = await getJson(app, '/rest/certificate');
    const addrs = await getJson(app, '/rest/ip/address');
    const pools = await getJson(app, '/rest/ip/pool');
    const dhcp = await getJson(app, '/rest/ip/dhcp-server');
    const nets = await getJson(app, '/rest/ip/dhcp-server/network');
    const fw = await getJson(app, '/rest/ip/firewall/address-list');

    const p = profiles[0];
    // profile → cert (by ssl-certificate name)
    assert.ok(certs.find((c) => c.name === p['ssl-certificate']), 'profile ssl-certificate must match a cert');
    // profile → server (server.profile == profile.name)
    const s = servers.find((x) => x.profile === p.name);
    assert.ok(s, 'a hotspot server must reference the profile');
    // server → interface address → CIDR (network + prefix from address)
    const addr = addrs.find((a) => a.interface === s.interface);
    assert.ok(addr, 'server interface must have an ip/address');
    const prefix = addr.address.split('/')[1];
    const cidr = `${addr.network}/${prefix}`;
    // server → pool
    assert.ok(pools.find((x) => x.name === s['address-pool']), 'server address-pool must match a pool');
    // server → dhcp-server (by interface)
    assert.ok(dhcp.find((d) => d.interface === s.interface), 'server interface must have a dhcp-server');
    // CIDR → dhcp network
    assert.ok(nets.find((n) => n.address === cidr), `dhcp network must exist for CIDR ${cidr}`);
    // CIDR → firewall hotspot-list entry
    assert.ok(fw.find((e) => e.address === cidr && e.list === 'hotspot-list'),
      `firewall hotspot-list must contain ${cidr}`);
  });
});
