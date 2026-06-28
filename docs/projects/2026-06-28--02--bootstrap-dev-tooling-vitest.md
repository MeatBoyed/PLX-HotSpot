# Slice — Bootstrap dev environment tooling and Vitest unit testing

**Status:** done
**Started:** 2026-06-28
**Finished:** 2026-06-28

## Plan reference

Two parallel gaps block contributor onboarding and the quality gate promised in
`CLAUDE.md`. This slice closes both.

**Track A — Dev environment spin-up.** Today the only compose file is the
production multi-tenant stack (`docker/docker-compose.yml`, 11 sites wired to real
RadiusDesk / PayFast / MikroTik). There is no local Postgres, no Node version
lock, and the existing `prisma/seed.ts` is run by hand (`npx tsx`) rather than via
npm. A new contributor cannot stand up a working local environment from the repo
alone.

**Track B — Testing retrofit.** `CLAUDE.md` states "a Vitest + Testing Library
suite is being bootstrapped; once present, `npm test` is part of the gate." Today
zero test infrastructure exists: no `vitest`, no config, no `test` script, no test
files. This slice delivers **Vitest unit testing only** (component/RTL and CI are
deferred — see Deferred).

**Definition of done:**

- A fresh clone can reach a running local dev env using only documented npm
  commands: a local Postgres comes up, migrations apply, seed data loads, and
  `npm run dev` serves the app against it.
- Node version is pinned to the current latest LTS, full patch — **`24.18.0`** —
  so everyone runs the same runtime.
- `.env.local` bootstrap is a single documented step from `.env.example`, with a
  working dev `DATABASE_URL` pointing at the local Postgres.
- `npm test` runs Vitest and passes with **at least one real, meaningful unit
  test**. Goal is to land a working harness and capture existing coverage *before*
  any major change — not broad coverage now.
- `README.md` (and `CLAUDE.md`'s testing note) reflect the new flow.
- `npm run build` and `npm run lint` still pass.

## Working scope

Bootstrap dev environment tooling and Vitest unit testing into the repo, in one
slice with two tracks. Confirmed scope from planning:

**Track A — Dev environment (do):**
- `docker/docker-compose.dev.yml` — local Postgres only; app runs via `npm run dev`
  against it (not containerised in dev).
- Wire npm scripts: `db:migrate` (prisma migrate dev), `db:seed` (run existing
  `prisma/seed.ts`), `db:reset` (reset + migrate + seed).
- Pin Node to **current latest LTS, full patch**: `.nvmrc` = `24.18.0` +
  `engines` field in `package.json`, and bump the Dockerfile off `20-alpine` to
  match.
  Treat any dependency bump in this slice as supply-chain-sensitive (run
  `/supply-chain-guard`; keep `package.json` + lockfile committed together).
- `.env.local` bootstrap: documented one-step copy from `.env.example`, setting
  `DATABASE_URL` to the local Postgres. NOTE: `DATABASE_URL` is read raw via
  `process.env` by the Prisma pg driver adapter (`src/lib/services/
  database-service.ts:65`, `packages-service.ts:7`) — it does NOT go through
  `src/env.ts`, and `.env.example:95` ships it empty.

**Track B — Testing (do):**
- Install `vitest` (+ minimal deps); add `vitest.config.ts` mirroring the
  `@/* → ./src/*` alias from `tsconfig.json`.
- Add `test` and `test:watch` npm scripts.
- Land **one working, meaningful unit test** to prove the harness. Highest-value
  first target is `src/env.ts` validation behaviour (pure, no DB/server). More
  tests are welcome but coverage breadth is not the goal of this slice.

**Explicitly NOT this slice:** see Deferred.

## Assumptions going in

- Local dev runs the Next app on the host (`npm run dev`), not in Docker; only
  Postgres is containerised for dev. (Matches "Local Postgres compose" choice.)
- The existing `prisma/seed.ts` (upserts ~9 sites into `branding_config`) is the
  canonical dev seed and can be wired as-is.
- `src/env.ts` is pure enough to unit-test by feeding env objects (T3 Env + zod);
  confirm it can be exercised without a running Next server.
- Move to latest Node LTS (`24.1`) rather than staying on Dockerfile's `20`;
  Dockerfile bumps to match. Keep current dependencies otherwise frozen — the
  point of this slice is to capture existing behaviour in tests *before* major
  changes, not to upgrade the stack.
- Postgres is confirmed: `prisma/schema.prisma` provider `postgresql`, Prisma 7
  driver-adapter pattern over `pg`.
- No CI exists yet, so `npm test` is a local gate this slice; enforcement in CI is
  a later slice. A working local dev env also unlocks **Playwright e2e** pointed at
  it — explicitly a later slice (see Deferred).

## Decisions made during the slice

Slice-local decisions only. Cross-cutting ones go into `docs/adr/` — link the ADR
here. Candidates that may warrant an ADR rather than living here: choosing Vitest
as the test runner, and the local-Postgres-via-compose dev pattern (both are
interface-level choices later code depends on).

- **[Increment 1, 2026-06-28] Test runner = Vitest `4.1.9`** (installed `-D`,
  pinned, lockfile committed with `package.json`). `vitest.config.ts` mirrors the
  `@/* → ./src/*` alias from `tsconfig.json`; `node` environment, `globals: true`.
  Scripts: `test` = `vitest run`, `test:watch` = `vitest`. This is the
  interface-level choice the slice flagged as an ADR candidate — **recommend
  writing an ADR** (`/write-adr`) once the harness proves out; kept slice-local
  until then.
- **[Increment 1] First test target = `src/env.ts`**, as planned. It is a pure
  characterisation test: `createEnv` runs once at import, so each case sets
  `process.env`, `vi.resetModules()`, then dynamically imports `@/env`. Pins
  defaulting (`BRAND_NAME`), coercion (`VOUCHER_DEFAULT_TTL_HOURS` string→number),
  the empty-`PAYFAST_MODE`→`sandbox` transform, and required-`NEXT_PUBLIC_SSID`
  throwing. Because the code already works, RED was demonstrated by flipping one
  expectation (`Received: "PluxNet"` vs `Expected: "WRONG"`) — confirming the test
  exercises real `env.ts`, not a hollow pass — then restored to green.
- **[Increment 2, 2026-06-28] Dev DB = `docker/docker-compose.dev.yml`** — single
  `postgres:17-alpine`, host `55432`→container `5432`, creds
  `postgres`/`postgres`/`auraconnect`, named volume `auraconnect-dev-db`,
  `pg_isready` healthcheck. App stays on host (`npm run dev`).
- **[Increment 2] npm scripts added:** `db:up`/`db:down` (compose lifecycle),
  `db:migrate` (`prisma migrate dev`), `db:seed` (`prisma db seed`), `db:reset`
  (`prisma migrate reset --force`), and **`postinstall`: `prisma generate`** —
  folds the fresh-clone Prisma-client generation in (was the build blocker from
  Increment 1's Learnings) so `npm install` leaves a buildable tree.
- **[Increment 2] `.env.example:95` `DATABASE_URL` seeded** with the local default
  `postgresql://postgres:postgres@localhost:55432/auraconnect`. Bootstrap is
  `cp .env.example .env.local` (NEXT_PUBLIC_SSID already had a dev default at
  `.env.example:15`, so the copy is zero-edit).
- **[Increment 2] Prisma config moved `prisma/prisma.config.ts` → root
  `prisma.config.ts`** (git mv). Prisma 7 only auto-detects the config at the cwd
  root; in `prisma/` it was silently ignored, so `migrate`/`seed` failed with
  "datasource.url property is required". Its paths were already cwd-relative, so
  the move needs no other edit. Also swapped `import "dotenv/config"` for explicit
  `config({ path: ".env.local" }); config();` so the Prisma CLI reads the same
  `.env.local` Next.js does (`.env` as fallback). **Cross-cutting (toolchain
  wiring) — consider an ADR alongside the Vitest one.**
- **[Increment 2] Catch-up migration `20260628144155_sync_branding_columns`
  hand-hardened with `IF NOT EXISTS`** on every `ADD COLUMN` / `CREATE TABLE` /
  `CREATE INDEX` (user prod-safety call). The objects may already exist on prod
  out-of-band, so an unguarded `migrate deploy` would fail "already exists". Guards
  make it a no-op there. Verified it still applies cleanly on a fresh DB via
  `prisma migrate deploy` (forward-only — avoids the `migrate reset` AI-danger
  block). **Must still be diffed against a prod schema dump before deploy** (see
  Open questions).
- **[Increment 2] `prisma/seed.ts` made self-bootstrapping.** It cloned all 9
  schools from a pre-existing `ih-harris` base row; on an empty dev DB that row is
  absent and it threw. Now it creates the IH Harris base from schema defaults
  (only `ssid`+`name` are required) when missing, then proceeds. Idempotent.
  Supersedes the planning assumption "`prisma/seed.ts` … can be wired as-is" —
  as-is it could not seed an empty database.
- **[Increment 2] `.env.example` `EC1_SMS_API_URL` commented out.** It shipped
  empty but `src/env.ts` types it `z.string().url().optional()`; `.optional()`
  permits `undefined`, not `''`, so an empty value fails `url()` and broke the
  build. Commenting it makes the `cp .env.example .env.local` bootstrap yield a
  buildable env. (Surgical fix; the broader hardening is the open question below.)
- **[Increment 3, 2026-06-28] Node pinned to `24.18.0`.** `.nvmrc` = `24.18.0`,
  `package.json` `engines.node` = `>=24.18.0` (advisory floor, not engine-strict),
  and **both** Dockerfiles bumped `node:20-alpine` → `node:24-alpine` (root
  `Dockerfile` and `docker/Dockerfile` — see Learnings: the compose files build
  from `docker/Dockerfile`, the root one is an identical duplicate). Docker images
  not rebuilt here (tag bump is mechanical; `node:24-alpine` is a published LTS
  image).
- **[Increment 4] Docs updated.** `README.md` "Getting Started" boilerplate
  replaced with a "Local Development" section (prereqs, one-time setup, db command
  table, testing, pre-done gates). `CLAUDE.md` Commands updated: `npm test` is now
  present/part of the gate; added the `db:*` commands and Node-pin note.

## Deferred / pushed forward

What we explicitly are NOT doing this slice:

- **Testing Library / component (RTL) tests** — deferred; Track B is unit-only.
  Picks up in a follow-up testing slice once unit harness is proven.
- **Playwright e2e** — deferred to its own slice, but is the *reason* the dev env
  exists: once `npm run dev` reliably serves against local Postgres, e2e tests
  point at that local env. This slice delivers the foundation it sits on.
- **CI workflow** (GitHub Actions running lint+build+test) — deferred to its own
  slice; this slice makes `npm test` exist and pass locally first.
- **One-command `setup` / Makefile target** — not chosen; individual npm scripts
  only. Revisit if onboarding friction remains.
- **Pre-commit hooks (husky/lint-staged), Prettier, `.editorconfig`** — out of
  scope.
- **Containerising the dev app itself** — dev runs on host.

Resolved during planning:

- ~~Node pin target~~ → **24.1** (latest LTS, minor granularity); align `.nvmrc`,
  `engines`, and Dockerfile together. Be supply-chain-mindful on any dep bump.
- ~~`DATABASE_URL` key / how read~~ → key is **`DATABASE_URL`**, read **raw via
  `process.env`** by the Prisma `pg` driver adapter, NOT via `src/env.ts`.
  `.env.example:95` ships it empty.
- ~~First unit-test target~~ → **`src/env.ts`** (pure, no DB). One meaningful test
  is the bar; breadth deferred.
- ~~Vitest path alias~~ → mirror `@/* → ./src/*` from `tsconfig.json`.

Also resolved:

- ~~Node patch~~ → **`24.18.0`** (`nvm list-remote` latest LTS), not `24.1`.
- ~~Postgres extensions~~ → **none**. Migrations (`prisma/migrations/0_init`,
  `20260310_add_otp_verification`) contain no `CREATE EXTENSION`; schema has no
  `extensions` preview feature. **Vanilla `postgres` image + `prisma migrate`
  suffices.**
- ~~Local DB port~~ → host **`55432`** (container `5432`). Sits above the `54xxx`
  Supabase region and clear of the `517x`/`518x` bands in `~/lab/PORTS.md`.
  `DATABASE_URL=postgresql://<user>:<pass>@localhost:55432/<db>`. `.env.example`'s
  empty `DATABASE_URL=` gets seeded with this local default for zero-edit
  bootstrap.

Still open:

- **[Increment 2, PROD-SAFETY — must do before deploy] Verify the catch-up
  migration against a production schema dump before `migrate deploy` runs on
  prod.** `20260628144155_sync_branding_columns` was reverse-engineered from local
  drift (schema-vs-empty-DB), not from prod. The added objects (`Packages`,
  `marketing_opt_in_submission`, 5 `branding_config` columns) **may already exist
  on production** out-of-band — that drift is *why* this migration exists. We
  hardened the SQL with `IF NOT EXISTS` so `migrate deploy` no-ops where they
  already exist, but that does NOT verify the existing prod columns/types/indexes
  *match* what the schema expects. Required before deploy:
  1. Pull a prod schema dump (`pg_dump --schema-only`).
  2. Diff prod's `branding_config` / `Packages` / `marketing_opt_in_submission`
     against `prisma/schema.prisma` (column types, nullability, defaults, index
     definitions).
  3. Confirm the guarded migration is a true no-op on prod (and that prod has the
     `_prisma_migrations` row, or `migrate resolve --applied` it) so history lines
     up. Reconcile any type/nullability mismatch with a follow-up migration.
  Owner/timing: before this slice's migration is shipped to any prod tenant.
- **Port governance:** `~/lab/PORTS.md` is a Supabase/Vite registry; auraconnect
  is Next.js + plain Postgres and has no row or band there. `55432` is a
  provisional pick — add a row and finalise governance in a later pass (user's
  call).
- **[Increment 1, NEW SCOPE — needs your call] How to make `npm run build` pass,
  which the DoD requires but baseline fails (see Learnings).** Two fixes are
  implied and both arguably belong to this slice's "fresh clone reaches a working
  env" intent:
  - **(a) Prisma generate on a fresh clone** — add a `postinstall` (or `prebuild`
    + `predev`) script running `npx prisma generate`, so `npm install` then
    `npm run build`/`dev` works with no manual step. Low risk.
  - **(b) Stop `archive/` from gating the build** — add `"archive"` to
    `tsconfig.json` `exclude` (and/or an eslint ignore). Justified by CLAUDE.md
    ("archive… Don't build on it"), but it edits a repo-wide config, so flagging
    rather than doing it silently.
  - The **55 lint errors** are out of this slice's scope (pre-existing app-code
    debt); proposing we explicitly carry the DoD line as "build+lint *do not
    regress*" for pre-existing app code, and fix only (a)+(b) to make `build`
    green. Confirm before I proceed.
- **[Increment 2, NEW SCOPE — needs your call] Resolve schema↔migration drift so
  `db:migrate && db:seed` works (DoD bullet 1).** 5 additive-safe columns exist in
  `schema.prisma` but in no migration (see Learnings). Options:
  - **(a) Generate a catch-up migration** — `prisma migrate dev --name
    sync_branding_columns` produces an additive `ALTER TABLE` adding the 5
    columns, bringing migration history in sync with the schema. Proper Prisma
    flow; safe (no data loss); but it writes a shared migration = reach beyond
    this slice's tooling intent. **Recommended** — it's the only way to satisfy
    "seed data loads", and the drift is a pre-existing latent bug a real deploy
    would also hit.
  - **(b) Defer** — land the dev-env scaffolding (compose, scripts, env, config)
    this slice and carve the migration fix into a dedicated data-layer slice;
    mark DoD bullet 1 partially met (DB + migrate work; seed blocked on drift).
  - **RESOLVED [2026-06-28, user call]: (a)** — catch-up migration generated,
    hardened with `IF NOT EXISTS`, seed made self-bootstrapping. `db:migrate` +
    `db:seed` now run clean on a fresh DB (IH Harris base + 9 schools).
- **[Increment 2, NEW SCOPE — needs your call] How far to push `npm run build`
  green for a fresh clone?** After fixing the `.env.example` defects, the
  production build now compiles, typechecks, collects page data, and only fails
  **prerendering `/admin/marketing`** on missing `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
  (a real per-deployment secret, empty in `.env.example`; supplied per-site via
  `docker/env/*.env` in prod). Options:
  - **(a) Ship a placeholder `pk_test_…` Clerk key in `.env.example`** so the
    admin pages prerender locally and `npm run build` goes green on a bare clone.
    Low effort; lets the documented build gate pass. Risk: a fake key is inert
    (admin auth won't actually work in dev without a real Clerk project).
  - **(b) Treat full `npm run build` as needing real deployment secrets** (Clerk
    et al.), document that, and make the dev-env gate `npm run dev` serving + the
    test/lint gates — not a secretless production prerender. Matches the rescue
    relaxation already agreed for build.
  - My lean: **(b)** — `npm run build` legitimately needs per-tenant secrets for
    admin prerender; chasing it with fake keys is brittle. Confirm.
  - **RESOLVED [2026-06-28, user call]: (a)** — added inert placeholder Clerk keys
    to `.env.example` (`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_…` decoding to
    `clerk.example.com$`, dummy `CLERK_SECRET_KEY`). `npm run build` now goes
    **green on a bare clone**. Keys are inert — real Clerk project keys needed for
    working admin auth (documented inline in `.env.example`).
- **[Increment 2, hardening recommendation] Add `emptyStringAsUndefined: true` to
  `createEnv` in `src/env.ts`.** Would make any empty env var behave as unset,
  killing the whole class of "empty optional fails validation" footguns (the
  `EC1_SMS_API_URL` build break) rather than patching `.env.example` one var at a
  time. Touches the env-validation contract (reach) so flagged, not done — own
  decision/ADR candidate.
  - **RESOLVED [2026-06-28, user call]:** This is a **rescue** slice — relax the
    DoD's "build + lint pass" gates. (1) **Lint:** not required green this slice;
    gate becomes *no-regression* on pre-existing app-code debt (55 errors carried).
    (2) **Build / typecheck:** **ignore `archive/`** — done: added `"archive"` to
    `tsconfig.json` `exclude`. (3) Prisma-generate-on-fresh-clone folds into
    Track A dev-env work (it is part of "fresh clone reaches a working env"), not a
    separate lint/build concern. Superseded the "confirm before proceed" above.

## Learnings

(Fill in as you discover them.) Durable knowledge this slice produces about the
codebase, the domain, or the tooling.

- **`DATABASE_URL` bypasses `src/env.ts`.** It is read raw via `process.env` by the
  Prisma `pg` driver adapter (`database-service.ts:65`, `packages-service.ts:7`),
  unlike every other env var which is zod-validated through `src/env.ts`. This
  violates CLAUDE.md's "don't read `process.env` ad hoc" convention. Pre-existing,
  out of scope here — flag as a candidate cleanup slice.
- Prisma 7 generates the client to `generated/prisma` (not the default location)
  and uses the **driver-adapter** pattern, not the schema `url`/`env()` binding
  (datasource `url` is commented out in `prisma/schema.prisma`).
- **[Increment 3] Two identical Dockerfiles exist.** Root `Dockerfile` and
  `docker/Dockerfile` are byte-identical (bar the node tag now). The per-site
  compose files (`docker/docker-compose.*.yml`) all build from `docker/Dockerfile`
  — that is the canonical one; the root copy looks vestigial. Candidate cleanup:
  delete the root duplicate or symlink it. Both bumped here to stay consistent.
- **[Increment 3] Host Node was `24.15.0`, below the pinned `24.18.0`.** `engines`
  is a `>=` floor and not enforced (no `engine-strict`), so `npm install` warns
  but works; contributors should `nvm use` to land on `24.18.0`.
- **[Increment 1] The DoD's "`npm run build` and `npm run lint` still pass" is
  FALSE at baseline** — both are already red before this slice touched anything
  (verified: failures are in pre-existing files, my diff is only `package.json` +
  lockfile + `vitest.config.ts` + `src/env.test.ts` + this doc). Three independent
  baseline breakages found:
  1. **`npm run build` needs `npx prisma generate` first.** The client at
     `generated/prisma/client` is git-ignored and there is no `postinstall` /
     `prebuild` hook, so a fresh clone's first build dies with
     `Module not found: Can't resolve '../../../generated/prisma/client'`. The
     Dockerfile masks this by running `npx prisma generate` before `npm run build`
     (Dockerfile:43). Directly relevant to Track A (fresh-clone bootstrap).
  2. **`archive/` is typechecked by `next build`.** `tsconfig.json` includes
     `**/*.ts` and excludes only `node_modules`, so after `prisma generate` the
     build fails on `archive/hono-captive-portal/drizzle.config.ts`:
     `Cannot find module 'drizzle-kit'` (never in `package.json`). CLAUDE.md says
     archive is "Not production. Don't build on it." — yet it gates the build.
  3. **`npm run lint` has 55 pre-existing errors** (335 warnings), all in
     `src/features` / `src/lib` etc. My two new files lint clean
     (`npx eslint src/env.test.ts vitest.config.ts` → exit 0).
  My Increment-1 change regresses none of these; the testing gate (`npm test`) is
  green (4/4).
- **[Increment 2] Prisma 7 only auto-loads `prisma.config.ts` from the cwd root.**
  The repo had it at `prisma/prisma.config.ts`, where it was silently ignored —
  any `migrate`/`seed` failed with "datasource.url property is required". Moved to
  root to fix (see Decisions).
- **[Increment 2] BLOCKER — schema↔migration drift.** `prisma/schema.prisma`'s
  `branding_config` model has **5 columns the migrations never create**:
  `parent_ssid` (`VarChar?`), `venue_label` (`VarChar?`), `venue_route`
  (`VarChar?`), `marketing_opt_in` (`Boolean @default(false)`), `sort_order`
  (`Int @default(0)`). A fresh DB built from `prisma/migrations/` (`0_init` +
  `20260310_add_otp_verification`) lacks them, so `db:seed` dies with
  `P2022 ColumnNotFound`. The schema + generated client were advanced without an
  accompanying migration. All 5 are additive-safe (nullable or defaulted), so a
  catch-up migration is non-destructive. **This means "migrations apply + seed
  loads" (DoD bullet 1) cannot be met until the drift is resolved.** See Open
  questions.

## Retrospective

**What worked**
- Leading with the one true TDD increment (Vitest + `env.ts`) proved the harness
  before the messy glue. The deliberate RED (flipping `PluxNet`→`WRONG`) caught
  that a characterisation test of working code can be a false-green and forced a
  real failure-mode check.
- Treating Track A as integration-verified glue (Method Note 2) rather than forcing
  hollow unit tests: the "test" was `db:up → migrate → seed → dev serves 200`.
- Surfacing every pre-existing defect as a checkpoint decision instead of silently
  fixing kept scope honest — and several turned out to be real latent bugs
  (schema/migration drift, seed can't bootstrap empty DB, 3 `.env.example` breaks).

**What surprised us**
- The slice's premise ("just add tooling") sat on top of a repo whose **baseline
  build and lint were already red** and whose **schema was well ahead of its
  migrations** (2 whole tables + 5 columns un-migrated). The "bootstrap" was really
  a rescue. Good that we made gates *no-regression* rather than chasing green.
- `prisma.config.ts` being silently ignored from `prisma/` (Prisma 7 only auto-
  loads it at cwd root) — a one-line-of-output failure that masked a real blocker.
- `migrate reset` is hard-blocked for AI agents; `migrate deploy` on a freshly
  recreated volume was the clean, non-destructive way to validate the migration.

**What we'd do differently / follow-ups**
- The drift fixes (catch-up migration, self-bootstrapping seed) arguably deserved
  their own data-layer slice; they landed here because they blocked the DoD. The
  **prod schema-dump verification is logged as a hard pre-deploy gate** — do not
  ship the migration without it.
- Carry forward as their own work: the `emptyStringAsUndefined` env hardening, the
  55-error lint debt, the duplicate root `Dockerfile`, `DATABASE_URL` bypassing
  `src/env.ts`, and ADRs for the Vitest + Prisma-config-wiring choices.
