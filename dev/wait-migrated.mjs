// Block until the API has migrated its Postgres schema (AAA slice 2026-07-03--01).
// The API applies EF migrations on startup (Program.cs), so `platform_settings` appears
// only once it has booted. `yarn dev:aaa` runs this between `compose up` and `dev:seed`
// so the seed never races the migration. Polls via the compose postgres service.
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const composeFile = resolve(dirname(fileURLToPath(import.meta.url)), 'docker-compose.yml');
const DEADLINE_MS = 180_000;

function tableExists() {
  try {
    const out = execFileSync('docker', [
      'compose', '-f', composeFile, 'exec', '-T', 'postgres',
      'psql', '-U', 'local_dev', '-d', 'auraconnect', '-tAc', "SELECT to_regclass('public.platform_settings')",
    ], { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
    return out.includes('platform_settings');
  } catch {
    return false; // psql/exec not ready yet
  }
}

const deadline = Date.now() + DEADLINE_MS;
process.stdout.write('Waiting for the API to migrate (platform_settings) …');
while (!tableExists()) {
  if (Date.now() > deadline) {
    process.stderr.write('\nTimed out waiting for API migration.\n');
    process.exit(1);
  }
  await new Promise((r) => setTimeout(r, 2000));
  process.stdout.write('.');
}
process.stdout.write(' ready.\n');
