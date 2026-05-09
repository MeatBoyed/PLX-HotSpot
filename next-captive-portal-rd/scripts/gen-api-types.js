#!/usr/bin/env node
/**
 * Generate portal API types from the ASP.NET OpenAPI spec.
 * Reads API_URL from .env.local (preferred) then .env.
 * Run: npm run api:types
 */

const { execSync } = require('child_process');
const { existsSync, readFileSync } = require('fs');
const { join } = require('path');

function loadEnv(file) {
  if (!existsSync(file)) return {};
  const vars = {};
  for (const line of readFileSync(file, 'utf-8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
    vars[key] = val;
  }
  return vars;
}

const root = join(__dirname, '..');
const env = {
  ...loadEnv(join(root, '.env')),
  ...loadEnv(join(root, '.env.local')), // .env.local wins
};

const apiUrl = env.API_URL ?? 'http://localhost:5299';
const specUrl = `${apiUrl}/openapi/v1.json`;
const outFile = 'src/infrastructure/api/schema.d.ts';

console.log(`Fetching OpenAPI spec from ${specUrl}`);
execSync(
  `npx openapi-typescript "${specUrl}" -o "${outFile}"`,
  { stdio: 'inherit', cwd: root }
);
console.log(`Types written to ${outFile}`);
