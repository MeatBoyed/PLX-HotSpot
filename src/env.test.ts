import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Characterisation tests for the central zod/T3-Env schema (`src/env.ts`).
 *
 * `createEnv` runs once at module import using `process.env`, so each test sets
 * the environment, resets the module registry, and dynamically imports `@/env`
 * to exercise validation against a fresh process environment.
 */

const ORIGINAL_ENV = process.env;

// Minimal environment that satisfies every required (no-default) variable.
// Only `NEXT_PUBLIC_SSID` has no default, so it is the sole hard requirement.
function validEnv(overrides: Record<string, string | undefined> = {}) {
  return {
    ...ORIGINAL_ENV,
    NEXT_PUBLIC_SSID: 'test-ssid',
    ...overrides,
  };
}

async function loadEnv() {
  vi.resetModules();
  return (await import('@/env')).env;
}

beforeEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

afterEach(() => {
  process.env = ORIGINAL_ENV;
});

describe('env schema', () => {
  it('applies declared defaults when a variable is unset', async () => {
    process.env = validEnv({ BRAND_NAME: undefined });
    const env = await loadEnv();
    expect(env.BRAND_NAME).toBe('PluxNet');
  });

  it('coerces VOUCHER_DEFAULT_TTL_HOURS from string to number', async () => {
    process.env = validEnv({ VOUCHER_DEFAULT_TTL_HOURS: '48' });
    const env = await loadEnv();
    expect(env.VOUCHER_DEFAULT_TTL_HOURS).toBe(48);
  });

  it('transforms empty PAYFAST_MODE to the "sandbox" default', async () => {
    process.env = validEnv({ PAYFAST_MODE: '' });
    const env = await loadEnv();
    expect(env.PAYFAST_MODE).toBe('sandbox');
  });

  it('throws when the required NEXT_PUBLIC_SSID is missing', async () => {
    process.env = validEnv({ NEXT_PUBLIC_SSID: undefined });
    await expect(loadEnv()).rejects.toThrow();
  });
});
