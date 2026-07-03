// MikroTik RouterOS REST emulator (AAA slice 2026-07-03--01, stub A) — Fastify app.
// Thin stand-in for the `/rest` surface the monitor + API consume. HTTP Basic auth is
// enforced here; self-signed TLS is handled at the server layer (server.mjs), not here.
// RouterOS quirks reproduced: kebab-case keys, /system/resource is a single object while
// the other paths return arrays, numbers rendered as strings.
import Fastify from 'fastify';

// A plausible RouterOS `/system/resource` snapshot. Keys are exactly what the monitor
// dashboard reads (client.ts → system/page.tsx); values mimic RouterOS string encoding.
const SYSTEM_RESOURCE = {
  'uptime': '6d14h32m10s',
  'version': '7.15.3 (stable)',
  'build-time': 'Jun/10/2025 09:12:34',
  'factory-software': '7.1',
  'free-memory': '201785344',
  'total-memory': '268435456',
  'cpu': 'ARM64',
  'cpu-count': '4',
  'cpu-frequency': '1400',
  'cpu-load': '7',
  'free-hdd-space': '68485120',
  'total-hdd-space': '134217728',
  'write-sect-since-reboot': '4521',
  'write-sect-total': '221544',
  'bad-blocks': '0',
  'architecture-name': 'arm64',
  'architecture': 'arm64',
  'board-name': 'RB5009UG+S+',
  'platform': 'MikroTik',
};

// Two hotspot sites, so the ?server= filter is meaningful.
const HOTSPOT_SERVERS = [
  { '.id': '*1', 'name': 'hs-site-01', 'interface': 'bridge-hs1', 'address-pool': 'hs-pool-1',
    'profile': 'hsprof-site-01', 'idle-timeout': 'none', 'keepalive-timeout': '00:02:00', 'disabled': 'false' },
  { '.id': '*2', 'name': 'hs-site-02', 'interface': 'bridge-hs2', 'address-pool': 'hs-pool-2',
    'profile': 'hsprof-site-02', 'idle-timeout': 'none', 'keepalive-timeout': '00:02:00', 'disabled': 'false' },
];

const HOTSPOT_ACTIVE = [
  { '.id': '*1', 'server': 'hs-site-01', 'user': 'user01@aura', 'address': '100.64.0.10',
    'mac-address': '11:22:33:44:55:01', 'login-by': 'http-chap', 'uptime': '20m4s',
    'bytes-in': '15000000', 'bytes-out': '45000000', 'packets-in': '21000', 'packets-out': '30000' },
  { '.id': '*2', 'server': 'hs-site-01', 'user': 'user02@aura', 'address': '100.64.0.11',
    'mac-address': '11:22:33:44:55:02', 'login-by': 'http-chap', 'uptime': '3m10s',
    'bytes-in': '2000000', 'bytes-out': '6000000', 'packets-in': '3100', 'packets-out': '4200' },
  { '.id': '*3', 'server': 'hs-site-02', 'user': 'user03@aura', 'address': '100.64.1.10',
    'mac-address': '11:22:33:44:55:03', 'login-by': 'http-chap', 'uptime': '45m0s',
    'bytes-in': '30000000', 'bytes-out': '90000000', 'packets-in': '41000', 'packets-out': '60000' },
];

const DHCP_LEASES = [
  { '.id': '*1', 'address': '100.64.0.10', 'mac-address': '11:22:33:44:55:01', 'server': 'dhcp-hs1',
    'status': 'bound', 'expires-after': '2h58m', 'last-seen': '1m20s', 'host-name': 'phone-01',
    'disabled': 'false', 'dynamic': 'true', 'blocked': 'false', 'radius': 'true' },
  { '.id': '*2', 'address': '100.64.1.10', 'mac-address': '11:22:33:44:55:03', 'server': 'dhcp-hs2',
    'status': 'bound', 'expires-after': '23h1m', 'last-seen': '30s', 'host-name': 'laptop-03',
    'disabled': 'false', 'dynamic': 'true', 'blocked': 'false', 'radius': 'true' },
];

const HOTSPOT_USERS = [
  { '.id': '*1', 'server': 'hs-site-01', 'name': 'user01@aura', 'profile': 'voucher-1h',
    'disabled': 'false', 'bytes-in': '35000000', 'bytes-out': '105000000' },
  { '.id': '*2', 'server': 'hs-site-02', 'name': 'user03@aura', 'profile': 'voucher-24h',
    'disabled': 'false', 'bytes-in': '30000000', 'bytes-out': '90000000' },
];

const INTERFACES = [
  { '.id': '*1', 'name': 'ether1', 'type': 'ether', 'mtu': '1500', 'actual-mtu': '1500',
    'mac-address': 'DC:2C:6E:00:00:01', 'running': 'true', 'disabled': 'false',
    'rx-byte': '9123456789', 'tx-byte': '4123456789', 'rx-packet': '8123456', 'tx-packet': '5123456' },
  { '.id': '*2', 'name': 'bridge-hs1', 'type': 'bridge', 'mtu': '1500', 'actual-mtu': '1500',
    'mac-address': 'DC:2C:6E:00:00:02', 'running': 'true', 'disabled': 'false',
    'rx-byte': '512345678', 'tx-byte': '1512345678', 'rx-packet': '712345', 'tx-packet': '912345' },
];

const LOG_LINES = [
  { '.id': '*1', 'time': 'jul/03 08:01:12', 'topics': 'hotspot,info', 'message': 'user01@aura logged in' },
  { '.id': '*2', 'time': 'jul/03 08:02:34', 'topics': 'dhcp,info', 'message': 'dhcp-hs1 assigned 100.64.0.10 to 11:22:33:44:55:01' },
  { '.id': '*3', 'time': 'jul/03 08:05:00', 'topics': 'system,error,critical', 'message': 'login failure for user99@aura' },
];

// ── API gateway-verification chain (MikroTikGatewayService) ─────────────────────
// Two internally-consistent sites: profile → cert (ssl-certificate), profile ← server
// (server.profile), server.interface → ip/address → CIDR, server.address-pool → pool,
// server.interface → dhcp-server, CIDR → dhcp network + firewall hotspot-list entry.
const HOTSPOT_PROFILES = [
  { 'name': 'hsprof-site-01', 'dns-name': 'wifi.site01.aura.co.za', 'hotspot-address': '100.64.0.1',
    'html-directory': 'hotspot', 'html-directory-override': '', 'ssl-certificate': 'cert-site-01',
    'use-radius': 'yes', 'radius-accounting': 'yes', 'radius-interim-update': '00:05:00' },
  { 'name': 'hsprof-site-02', 'dns-name': 'wifi.site02.aura.co.za', 'hotspot-address': '100.64.1.1',
    'html-directory': 'hotspot', 'html-directory-override': '', 'ssl-certificate': 'cert-site-02',
    'use-radius': 'yes', 'radius-accounting': 'yes', 'radius-interim-update': '00:05:00' },
];

const CERTIFICATES = [
  { 'name': 'cert-site-01', 'common-name': 'wifi.site01.aura.co.za', 'flags': 'KAT',
    'invalid-after': '2027-01-15 12:00:00', 'subject-alt-name': 'DNS:wifi.site01.aura.co.za' },
  { 'name': 'cert-site-02', 'common-name': 'wifi.site02.aura.co.za', 'flags': 'KAT',
    'invalid-after': '2027-03-20 12:00:00', 'subject-alt-name': 'DNS:wifi.site02.aura.co.za' },
];

const IP_ADDRESSES = [
  { 'address': '100.64.0.1/24', 'network': '100.64.0.0', 'interface': 'bridge-hs1' },
  { 'address': '100.64.1.1/24', 'network': '100.64.1.0', 'interface': 'bridge-hs2' },
];

const IP_POOLS = [
  { 'name': 'hs-pool-1', 'ranges': '100.64.0.10-100.64.0.254' },
  { 'name': 'hs-pool-2', 'ranges': '100.64.1.10-100.64.1.254' },
];

const DHCP_SERVERS = [
  { 'name': 'dhcp-hs1', 'interface': 'bridge-hs1', 'address-pool': 'hs-pool-1', 'lease-time': '01:00:00', 'disabled': 'false' },
  { 'name': 'dhcp-hs2', 'interface': 'bridge-hs2', 'address-pool': 'hs-pool-2', 'lease-time': '24:00:00', 'disabled': 'false' },
];

const DHCP_NETWORKS = [
  { 'address': '100.64.0.0/24', 'gateway': '100.64.0.1', 'dns-server': '1.1.1.1,8.8.8.8' },
  { 'address': '100.64.1.0/24', 'gateway': '100.64.1.1', 'dns-server': '1.1.1.1,8.8.8.8' },
];

const FIREWALL_ADDRESS_LIST = [
  { 'list': 'hotspot-list', 'address': '100.64.0.0/24', 'creation-time': 'Jul/01/2026 09:00:00' },
  { 'list': 'hotspot-list', 'address': '100.64.1.0/24', 'creation-time': 'Jul/01/2026 09:05:00' },
];

// Constant-time-ish Basic-auth check. RouterOS answers 401 with a WWW-Authenticate
// challenge when the Authorization header is missing or wrong.
function checkBasicAuth(req, user, pass) {
  const header = req.headers['authorization'] ?? '';
  if (!header.startsWith('Basic ')) return false;
  const decoded = Buffer.from(header.slice(6), 'base64').toString('utf8');
  const idx = decoded.indexOf(':');
  if (idx === -1) return false;
  return decoded.slice(0, idx) === user && decoded.slice(idx + 1) === pass;
}

export function buildApp({ user = process.env.MIKROTIK_STUB_USER ?? 'admin',
                          pass = process.env.MIKROTIK_STUB_PASS ?? 'admin',
                          https } = {}) {
  // `https` (a {key, cert} pair) turns the listener into the self-signed HTTPS server both
  // consumers hit. Omitted for app.inject() tests, which are transport-agnostic.
  const app = Fastify(https ? { https } : {});

  // Gate the whole /rest surface behind Basic auth, as RouterOS does.
  app.addHook('onRequest', async (req, reply) => {
    if (!checkBasicAuth(req, user, pass)) {
      reply.header('WWW-Authenticate', 'Basic realm="RouterOS"').code(401).send({ error: 'unauthorized' });
    }
  });

  app.get('/rest/system/resource', async () => SYSTEM_RESOURCE);

  // Active hotspot sessions — monitor appends ?server=<name> to narrow to one site.
  app.get('/rest/ip/hotspot/active', async (req) => {
    const { server } = req.query;
    return server ? HOTSPOT_ACTIVE.filter((s) => s.server === server) : HOTSPOT_ACTIVE;
  });

  app.get('/rest/ip/dhcp-server/lease', async () => DHCP_LEASES);
  app.get('/rest/ip/hotspot/user', async () => HOTSPOT_USERS);
  app.get('/rest/ip/hotspot', async () => HOTSPOT_SERVERS);
  app.get('/rest/interface', async () => INTERFACES);

  // Router log — monitor appends ?topics=<topic> to filter.
  app.get('/rest/log', async (req) => {
    const { topics } = req.query;
    return topics ? LOG_LINES.filter((l) => l.topics.split(',').includes(topics)) : LOG_LINES;
  });

  // One-shot traffic sample for a chosen interface (bits/sec as numbers, per the client).
  app.post('/rest/interface/monitor-traffic', async (req) => {
    const iface = req.body?.interface ?? 'ether1';
    return [{ 'name': iface, 'rx-bits-per-second': 12480000, 'tx-bits-per-second': 5360000 }];
  });

  // Disconnect a hotspot user — RouterOS returns 204 No Content.
  app.delete('/rest/ip/hotspot/active/:id', async (_req, reply) => reply.code(204).send());

  // ── API gateway-verification reads (all arrays) ──
  app.get('/rest/ip/hotspot/profile', async () => HOTSPOT_PROFILES);
  app.get('/rest/certificate', async () => CERTIFICATES);
  app.get('/rest/ip/address', async () => IP_ADDRESSES);
  app.get('/rest/ip/pool', async () => IP_POOLS);
  app.get('/rest/ip/dhcp-server', async () => DHCP_SERVERS);
  app.get('/rest/ip/dhcp-server/network', async () => DHCP_NETWORKS);
  app.get('/rest/ip/firewall/address-list', async () => FIREWALL_ADDRESS_LIST);

  return app;
}
