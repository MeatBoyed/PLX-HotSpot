// Stop the AAA stubs started by global-setup. Uses `stop` (not `down -v`) so images +
// the postgres/radius volumes survive between runs; a rerun just restarts them.
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const composeFile = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'docker-compose.yml');

export default async function globalTeardown() {
  try {
    execFileSync('docker', [
      'compose', '-f', composeFile, '--profile', 'aaa', 'stop', 'mikrotik', 'radiusdesk',
    ], { stdio: 'inherit' });
  } catch { /* best effort */ }
}
