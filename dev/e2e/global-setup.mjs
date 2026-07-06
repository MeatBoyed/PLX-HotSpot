// Bring the `aaa` HTTP stubs up before the suite and wait until they answer. Only the
// two HTTP stubs the request-context tests hit (mikrotik = A + B, radiusdesk = C); the
// FreeRADIUS DB (D) is covered by dev/radius-db-init.test.mjs, not reachable over HTTP.
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const composeFile = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'docker-compose.yml');
const MIKROTIK = process.env.E2E_MIKROTIK_URL ?? 'https://localhost:5481';
const RADIUSDESK = process.env.E2E_RADIUSDESK_URL ?? 'http://localhost:5480';

async function waitFor(url, okCodes, deadlineMs = 90_000) {
  const deadline = Date.now() + deadlineMs;
  for (;;) {
    try {
      const res = await fetch(url);
      if (okCodes.includes(res.status)) return;
    } catch { /* not up yet */ }
    if (Date.now() > deadline) throw new Error(`timed out waiting for ${url}`);
    await new Promise((r) => setTimeout(r, 1000));
  }
}

export default async function globalSetup() {
  // Build (first run) + start just the two HTTP stubs; -d so setup returns.
  execFileSync('docker', [
    'compose', '-f', composeFile, '--profile', 'aaa', 'up', '-d', '--build', 'mikrotik', 'radiusdesk',
  ], { stdio: 'inherit' });

  // Accept the self-signed cert while polling stub A over HTTPS.
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  // /system/resource needs auth → 401 is a valid "up" signal; radiusdesk index → 200.
  await waitFor(`${MIKROTIK}/rest/system/resource`, [200, 401]);
  await waitFor(`${RADIUSDESK}/cake4/rd_cake/profiles/index.json?token=dev-radiusdesk-token`, [200]);
}
