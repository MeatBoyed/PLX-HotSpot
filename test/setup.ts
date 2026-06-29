// Global Vitest setup. Satisfies the one required (no-default) env var so any
// module importing `@/env` (zod/T3-Env validates at import) loads under test.
// env.test.ts manages its own process.env per-test and is unaffected.
process.env.NEXT_PUBLIC_SSID ||= 'test-ssid';
