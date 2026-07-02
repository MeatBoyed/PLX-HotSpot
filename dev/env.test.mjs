// Gate for the layered env layout (slice decision: root .env + .env.current +
// .env.legacy, each with a committed .example; real .env* git-ignored).
// Behaviour pinned: the committed examples exist, and .env.legacy.example supplies a
// DATABASE_URL aimed at the legacy database (phs_portal) on the mapped host port —
// this is the value that unblocks the env-gated legacy build (slice 01).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join } from 'node:path';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

function parseEnv(file) {
  const out = {};
  for (const raw of readFileSync(file, 'utf8').split('\n')) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    out[line.slice(0, eq).trim()] = line.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
  }
  return out;
}

test('the three layered env examples are committed', () => {
  for (const name of ['.env.example', '.env.current.example', '.env.legacy.example']) {
    assert.ok(existsSync(join(repoRoot, name)), `missing committed example: ${name}`);
  }
});

test('.env.legacy.example supplies DATABASE_URL for the legacy DB on the mapped port', () => {
  const env = parseEnv(join(repoRoot, '.env.legacy.example'));
  const url = env.DATABASE_URL ?? '';
  assert.ok(url, 'DATABASE_URL must be set in .env.legacy.example');
  assert.match(url, /\/phs_portal(\?|$)/, 'DATABASE_URL must target the phs_portal database');
  assert.match(url, /:5442\b/, 'DATABASE_URL must use the mapped Postgres host port 5442');
});

test('.env.legacy.example supplies the build-required Clerk publishable key', () => {
  // The root layout wraps every page in <ClerkProvider>, which throws
  // "Missing publishableKey" at prerender if the key is absent — so the legacy
  // build needs a well-formed key present even for a static/dummy build.
  const env = parseEnv(join(repoRoot, '.env.legacy.example'));
  assert.match(
    env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? '',
    /^pk_(test|live)_/,
    'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY must be a well-formed Clerk key (pk_test_/pk_live_)',
  );
});
