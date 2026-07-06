// Pins TENANT_ID as a required, validated env var (slice 2026-07-05--02). @t3-oss/env-nextjs's
// createEnv validates its runtimeEnv immediately on import, so importing src/env.ts is itself
// the check — run it as a standalone script via the local tsx binary (env.ts has no
// Next.js-specific dependency) and assert on the process's exit code.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const srcDir = dirname(fileURLToPath(import.meta.url));
const pkgRoot = join(srcDir, '..');
const tsx = join(pkgRoot, 'node_modules', '.bin', 'tsx');
const envFile = join(srcDir, 'env.ts');

const VALID_HEX_TENANT_ID = 'abc28409ad0f4f059f3f4faafb7a6640';

function runEnv(tenantId) {
  const env = { ...process.env };
  if (tenantId === undefined) delete env.TENANT_ID;
  else env.TENANT_ID = tenantId;
  try {
    execFileSync(tsx, [envFile], { cwd: pkgRoot, env, stdio: 'pipe' });
    return { exitCode: 0 };
  } catch (err) {
    return { exitCode: err.status ?? 1, stderr: err.stderr?.toString() ?? '' };
  }
}

test('TENANT_ID unset fails env validation', () => {
  const { exitCode, stderr } = runEnv(undefined);
  assert.notEqual(exitCode, 0, 'importing env.ts must throw when TENANT_ID is unset');
  assert.match(stderr, /TENANT_ID/);
});

test('TENANT_ID blank fails env validation', () => {
  const { exitCode, stderr } = runEnv('');
  assert.notEqual(exitCode, 0, 'importing env.ts must throw when TENANT_ID is blank');
  assert.match(stderr, /TENANT_ID/);
});

test('TENANT_ID malformed (non-hex) fails env validation', () => {
  const { exitCode, stderr } = runEnv('auraconnect');
  assert.notEqual(exitCode, 0, 'importing env.ts must throw when TENANT_ID is not hex/UUID');
  assert.match(stderr, /TENANT_ID/);
});

test('TENANT_ID valid hex passes env validation', () => {
  const { exitCode } = runEnv(VALID_HEX_TENANT_ID);
  assert.equal(exitCode, 0, 'importing env.ts must succeed for a valid hex TENANT_ID');
});
