# Slice 2026-07-05--02 — captive-portal TENANT_ID required

**Status:** done
**Started:** 2026-07-05
**Finished:** 2026-07-06

## Goal / definition of done

`clients/current/captive-portal` refuses to run (throws immediately at env-module load, so
both `yarn dev` and `next build`) when `TENANT_ID` is unset, blank, or not a valid hex/UUID —
instead of silently starting and only failing per-request deep in `sites.api.ts`/
`branding.api.ts`/etc. with "TENANT_ID is not configured". Root `.env.current.example` and the
working `.env.current` both gain an explicit (blank) `TENANT_ID=` key so the requirement is
visible and a developer knows to fill it in. Done when a new test pins this required-ness
(fails today against the current `.optional()` schema, passes once fixed) and
`node --test src/env.test.mjs` is green in `clients/current/captive-portal`.

## Working scope

1. `clients/current/captive-portal/src/env.ts` — remove `.optional()` from the `TENANT_ID`
   zod schema (keep the existing hex/UUID regex). `@t3-oss/env-nextjs`'s `createEnv` then
   throws on module import if it's missing or malformed — covers both `yarn dev` startup and
   `next build`.
2. New test, written first: `clients/current/captive-portal/src/env.test.mjs`. This workspace
   has no test runner today (no jest/vitest, no `"test"` script) — `tsx` is already a
   devDependency, so the test uses `node:test` + `execFileSync` to spawn the local
   `node_modules/.bin/tsx src/env.ts` binary (cwd = package root) with different `TENANT_ID`
   overrides and asserts on exit code: unset → non-zero, blank → non-zero, malformed
   (non-hex) → non-zero, valid 32-char-hex → zero. Add `"test": "node --test src/env.test.mjs"`
   to `package.json` so this is a real runnable gate (mirrors the `node:test` +
   `execFileSync` pattern already used throughout `dev/*.test.mjs`, e.g.
   `dev/captive-seed.test.mjs`).
3. Root `.env.current.example` — add `TENANT_ID=` (blank), commented: required, must be a
   real tenant's hex/UUID id, no shared default provided — each developer sets their own based
   on what they're testing against.
4. Root `.env.current` (working copy, gitignored) — same: add `TENANT_ID=` blank. This
   deliberately breaks the already-running local captive-portal until a real value is filled
   in — that's the intended enforcement, not a regression to avoid.

Explicitly **not** in scope:
- `clients/current/captive-portal/docker/env/dev.env` — left untouched (real
  `TENANT_ID="abc28409ad0f4f059f3f4faafb7a6640"` stays as-is; user decision).
- `dev/seed/captive-site.sql`'s tenant ids (`tenant-dev`, `auraconnect`) — left as-is, not
  reconciled with the hex-format requirement here (user decision).

### Extended scope (2026-07-06) — API_URL / NEXT_PUBLIC_API_URL naming fix

Reopened: the user found the admin and captive-portal clients silently ignore the API base URL
set in `.env.current`, because it's set under the wrong key. Same class of bug as `TENANT_ID`
(env file sets a name the code never reads) — investigated the same way (trace both clients'
source, then confirm live via the actual running processes' env, not just static code).

**Traced, confirmed by grep + live process inspection:**
- `admin`: server-side reads `process.env.API_URL` (`lib/infrastructure/api/client.ts`,
  `branding.api.ts`), client-side reads `process.env.NEXT_PUBLIC_API_URL` (`branding.api.ts`).
- `captive-portal`: server-side reads `env.API_URL`, client-side reads `env.NEXT_PUBLIC_API_URL`
  (both via `src/env.ts`, same `@t3-oss/env-nextjs` schema `TENANT_ID` lives in).
- `.env.current`/`.env.current.example` set `NEXT_PUBLIC_API_BASE_URL` — grepped the entire
  `clients/` tree: **zero** references to that name anywhere. Dead key.
- Live confirmation: dumped the running admin process's actual env
  (`/proc/<pid>/environ`) — `NEXT_PUBLIC_API_BASE_URL` was present (the user's edit loaded
  fine), `API_URL`/`NEXT_PUBLIC_API_URL` were absent. Captive-portal's own `/api/health`
  showed the same: both `"(not set)"`, `"api":{"reachable":false}`. Both clients were silently
  falling back to their hardcoded `http://localhost:5299` default the whole time, regardless
  of what `NEXT_PUBLIC_API_BASE_URL` was set to.

**Fix**: replace `NEXT_PUBLIC_API_BASE_URL` with two keys, `API_URL` and `NEXT_PUBLIC_API_URL`,
both set to the same address (no docker-internal/host split here — `192.168.100.45:5299` is a
real LAN address reachable the same way from both the server process and the browser), in both
`.env.current.example` and the working `.env.current`.

Test-first in `dev/env.test.mjs` (mirrors its existing `parseEnv` + assertion pattern used for
`.env.legacy.example`'s `DATABASE_URL`/Clerk key checks): assert `.env.current.example` sets
non-empty `API_URL` and `NEXT_PUBLIC_API_URL`. This is a real, testable behavior (not "config,
docs, pure glue" — Method Note 2 doesn't apply), so it gets a proper RED→GREEN cycle instead of
being handled as a silent config edit.

## Assumptions going in

- `@t3-oss/env-nextjs`'s `createEnv` validates its `runtimeEnv` immediately at call time (no
  `skipValidation` option is set in this `env.ts`), so removing `.optional()` is sufficient to
  fail-fast on both dev boot and build — no additional wiring needed.
- `env.ts` itself only imports `@t3-oss/env-nextjs` and `zod` (confirmed by reading the file) —
  no Next.js-specific runtime dependency, so it can be executed standalone via `tsx` outside
  the Next.js dev/build pipeline for test purposes.
- Spawning the local `node_modules/.bin/tsx` binary directly (not `npx tsx`) avoids any
  version-resolution/install-prompt behavior in the test.

## Decisions made during the slice

- Follows on from [[2026-07-05--01--auraconnect-dev-site-seed]] (same day), but kept as its
  own slice — a distinct, narrower concern the user explicitly scoped as "simple."
- Confirmed with the user: `docker/env/dev.env`'s existing real `TENANT_ID` value is untouched
  by this slice — it's the authoritative value for that separate Docker-deployment mechanism.
- Confirmed with the user: no shared/default `TENANT_ID` is seeded into `.env.current(.example)`
  — left blank deliberately, each developer must set their own real value. This was chosen
  over reconciling the local seed's tenant id (`auraconnect`) to match the real hex value,
  which was the other option raised.

## Deferred / pushed forward

- ~~**Residual gap**: neither locally-seeded tenant id (`tenant-dev`, `auraconnect`) passes
  `TENANT_ID`'s hex/UUID regex~~ — **RESOLVED** in
  [2026-07-05--01](2026-07-05--01--auraconnect-dev-site-seed.md)'s Checkpoint 17-style
  correction (2026-07-06): both tenants now have real GUID-hex ids
  (`96f20055f69a475cbfe549d960a8d51a` for AuraConnect, `de49b6cbe9d24edfb7d32dcec06a474f` for
  the original demo tenant). The working `.env.current`'s `TENANT_ID` is set to the former.
- ~~The separately-flagged `API_URL`/`NEXT_PUBLIC_API_BASE_URL` key-name mismatch~~ —
  **RESOLVED** in this slice, next increment (see updated Working scope below): both clients
  actually read `API_URL` (server-side) / `NEXT_PUBLIC_API_URL` (client-side); the committed
  env files set neither, only the dead `NEXT_PUBLIC_API_BASE_URL`.

## Open questions

- ...

## Learnings

(Fill in as you go.)

- The existing `TENANT_ID` regex was already correctly rejecting malformed values when
  present (`z.string().regex(...)` was fine) — the entire gap was just the trailing
  `.optional()`. Confirmed via RED: "unset"/"blank" cases failed against the old schema while
  "malformed"/"valid" cases already passed, isolating the fix to exactly one token.
- `env.ts` has zero Next.js-specific dependencies (only `@t3-oss/env-nextjs` + `zod`), so it
  runs standalone via the already-present `tsx` devDependency without needing the Next.js dev
  server or build pipeline — made it possible to pin this behavior with a fast, isolated
  `node:test` + subprocess test instead of a slow full `next build`.
- A dead env-file key can hide for a long time without a test catching it, because
  `?? 'http://localhost:5299'`-style fallbacks make the app still "work" — just silently
  against the wrong (or default) target. Unlike `TENANT_ID` (which now fails loudly when
  missing), `API_URL`/`NEXT_PUBLIC_API_URL` still have soft fallbacks in both clients, so this
  class of bug isn't fully closed by the env-file fix alone — only made visible via the new
  `dev/env.test.mjs` assertion. Confirming via the *live running process's* actual env (not
  just reading source) was what made this concrete instead of theoretical, same technique
  used for the original `TENANT_ID` investigation.
- Next.js reads env files at process startup; editing `.env.current` while `next dev` is
  already running has no effect until the process restarts (not a hot-reload target).

## Retrospective

Two increments: (1) the TDD-covered behavior change (`.optional()` removal + the new
`env.test.mjs` gate), (2) a config-only follow-up (blank `TENANT_ID=` in
`.env.current.example` and the working `.env.current`, with an explanatory comment) — handled
outside the TDD cycle per Method Note 2, since there's no behavior to pin in a "add a commented
key to an env file" change. Caught mid-flow: after increment 1's checkpoint, the user flagged
that the example file still hadn't been updated — a reminder that a checkpoint report proposing
the next increment isn't the same as having done it; the two config files landed in this same
pass right after. Net result: the enforcement now exists top-to-bottom (schema → test → example
→ working copy), with the residual tenant-id-format gap left honestly documented rather than
papered over.

Reopened once more (2026-07-06) for a third increment: the `API_URL`/`NEXT_PUBLIC_API_BASE_URL`
mismatch this slice had explicitly deferred came back as a real, user-hit bug — they changed
the API address and nothing happened. Both of this slice's original "Deferred" items ended up
resolved, just not in the order or shape guessed at the time: the tenant-id-format gap was
closed as a side effect of unrelated work in the other slice, while the env-key mismatch got
its own proper TDD increment here (unlike `TENANT_ID`, this one really was expressible as a
failing test, so it got one instead of being treated as pure config). Investigating by tracing
source AND confirming against the live running process (not stopping at "the code looks
right") is what turned "should be fixed" into "confirmed broken, confirmed fixed" both times
this session — worth keeping as the default move whenever an env var is suspected of not
taking effect.
