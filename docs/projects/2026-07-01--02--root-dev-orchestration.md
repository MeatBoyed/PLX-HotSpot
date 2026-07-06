# Slice 2026-07-01--02 — Root dev orchestration (compose Postgres×2 + dotnet watch API + concurrently clients)

**Status:** done
**Started:** 2026-07-01
**Finished:** 2026-07-02

## Goal / definition of done

Promoted out of the monorepo-restructure slice
([2026-07-01--01](2026-07-01--01--polyglot-monorepo-restructure.md)). Deliver a
**single command that brings the whole system up locally** for development.

**Definition of done (draft — confirm at first checkpoint):**
- One root command (e.g. `yarn dev`) starts: Postgres (one server, **two logical
  DBs** — legacy + new), the ASP.NET API under `dotnet watch` (hot reload, no image
  rebuild on source edits), and the Node client dev servers.
- **Legacy builds and runs** — this slice supplies the `DATABASE_URL` (+ other env)
  that left legacy's build env-gated in slice 01.
- `.env` / secrets layout decided and documented (root vs per-app vs layered).
- Editing source triggers hot reload (API + clients) with **no `docker build`** —
  rebuild only on dependency/manifest change.
- ADR recorded for the dev-orchestration design.
- Leaves room (compose profiles) for the later AAA-emulation slice (RadiusDesk +
  MikroTik) without wiring it here.

## Working scope

Root dev orchestration: docker-compose for backing services (Postgres with two
logical DBs, seeded by an init script that extends `api/init-db.sql`) + the .NET API
via `dotnet watch` + bind mount; Node clients run on the **host** via `concurrently`
across the Yarn Berry workspaces; a root `dev` script that does `docker compose up -d`
(infra + API) then `concurrently` the client dev servers — one command, whole system.
Wire the `.env`/secrets layout and reconcile the legacy monolith's existing
`docker/env/*` strategy into the root stack. **Not** building the AAA emulators here
(own slice) — only leaving compose-profile room for them.

## Assumptions going in

- Hybrid orchestration (from slice 01 Decisions): Docker for infra + API; host +
  `concurrently` for Node clients (fastest HMR, team preference). Confirmed there.
- One Postgres server, two logical DBs (legacy Prisma-managed + new EF-migrated),
  created by an init script — `api/init-db.sql` is the pattern to extend.
- Legacy keeps its own DB/schema and direct integrations; it is env-gated, not
  code-broken (slice 01 verified the Prisma client generates; build fails only for
  lack of `DATABASE_URL` at page-data collection).
- `nmHoistingLimits: workspaces` isolation (ADR 0002) means each client runs `dev`
  with its own deps — no cross-app dev interference.
- Legacy README documents a `docker/env/.env.shared` + site-specific env strategy to
  reconcile, not reinvent.

## Decisions made during the slice

Slice-local decisions only. A decision that outlives the slice (stack, layout, an
interface others depend on) goes in an ADR under `docs/adr/` — link it here.

Carried in from slice 01 (to be ratified + ADR'd here):
- **Hybrid dev orchestration**: `docker compose up -d` (Postgres 2-DB + `dotnet
  watch` API via bind mount) → `concurrently` host client dev servers. No
  `docker build` on source edits; `docker compose watch` (`develop.watch`: sync
  source, rebuild only on manifest change) available for a full-in-container parity
  mode.

Confirmed at planning (2026-07-01, user):
- **`.env` layout — layered.** A root `.env` for shared config, plus split
  group-level files: **`.env.current`** (for `clients/current/*`) and
  **`.env.legacy`** (for the legacy monolith), each with a committed
  `.env.current.example` / `.env.legacy.example`. (Real `.env*` stay git-ignored.)
- **Runtime modes — three, default `current`.** The root dev command supports
  **current-only (default)**, **legacy-only**, and **both**. Implemented via compose
  profiles + the dev script.
- **Legacy compose — rebuild, don't inherit.** Discard the legacy monolith's existing
  docker setup; use it only as a *reference* to author a fresh compose service in the
  root stack.
- **DB init — separate per group.** Distinct init scripts for the current DB and the
  legacy DB; the two databases can be created/run independently (not one shared
  init).
- **Port map — centralised in the root**, chosen to avoid collisions with ports
  already in use on the dev machine (verified at build time; specific host ports not
  documented here).

## Deferred / pushed forward

What we explicitly are not doing this slice, and where it picks up.

- **AAA emulation (RadiusDesk + MikroTik stub/CHR)** — its own slice; here only leave
  compose-profile room.
- **Shared-packages extraction** — separate slice.
- **Production/deploy compose** — this slice is the local inner loop only.

## Open questions

Still TBD as the slice progresses.

- ~~**`.env` / secrets layout**~~ **RESOLVED** → layered: root `.env` + `.env.current`
  + `.env.legacy` (+ `.example` for each). See Decisions.
- ~~**Which clients in the default `up`**~~ **RESOLVED** → three modes (current /
  legacy / both), default current. See Decisions.
- ~~**Port allocation**~~ **RESOLVED** → central root port map avoiding machine
  collisions (checked at build). See Decisions.
- ~~**Legacy compose reconciliation**~~ **RESOLVED** → discard legacy's compose,
  rebuild fresh in root using it as reference. See Decisions.
- ~~**Two-DB init**~~ **RESOLVED** → separate init scripts per group (current /
  legacy), independently runnable. See Decisions.
- ~~**Task runner**~~ **RESOLVED** (2026-07-02, checkpoint 0) → plain root `package.json`
  scripts + `concurrently`. No Makefile/justfile — matches Yarn Berry setup, no new tool.
- **Central port map** (resolved 2026-07-02): Postgres `5442`, pgAdmin `5050`, Seq `5342`,
  API `5299`, clients admin `3301` / captive-portal `3302` / monitor `3303` / legacy
  `3401`. Chosen against live `ss -ltn` scan to avoid machine collisions.
- **Emulator profiles vs always-on** (foreshadowing the AAA slice): default `up`
  stays light; emulators behind `--profile`. (still open — AAA slice)
- **Env-file → compose/runtime wiring**: how `.env.current` / `.env.legacy` feed the
  right services and the host `concurrently` client dev servers per mode. (new,
  during build)

## Learnings

(Fill in as you go.) Durable knowledge this slice produced about the codebase, the
domain, or the tooling — facts that outlive the slice.

**Inc 1 (2026-07-02) — dev compose skeleton + port map + gate harness:**
- **Layout (2026-07-02, checkpoint 1, user):** dev tooling lives under **`dev/`**, not
  the repo root — keep root tidy. Compose + gate now `dev/docker-compose.yml` +
  `dev/compose.test.mjs`; test runs with `cwd: dev/`. Root keeps only the one-command
  entry points (`yarn dev*` / `yarn test:dev` in root `package.json`). Superseded the
  first-cut root `docker-compose.yml` + `scripts/dev/` placement. Candidate root ADR at
  Inc 6 (where dev tooling lives).
- Gate harness = Node's built-in test runner (`node --test`, no new dep) shelling
  `docker compose -f docker-compose.yml config --format json` and asserting on the
  parsed model. Root script: `yarn test:dev` → `node --test dev/*.test.mjs`. Two
  asserts so far: expected backing services present; no duplicate host port.
- Node 24 quirk: `node --test scripts/dev/` treats a bare directory as an *entry
  module* (Cannot find module .../scripts/dev) — must pass a file glob
  (`scripts/dev/*.test.mjs`). Direct single-file run worked, masking it.
- Root `docker-compose.yml` uses `${VAR:-default}` for every host port so
  `docker compose config` resolves with zero env (keeps the gate hermetic); real
  values come from the layered `.env` files in Inc 4.
- All Next.js clients default to port 3000 → collision; port map assigns distinct
  host ports (admin 3301 / captive-portal 3302 / monitor 3303 / legacy 3401),
  wired in Inc 5.

**Inc 2 (2026-07-02) — two-DB init (separate per group):**
- Names/roles fixed here: **current** DB `auraconnect` owned by role `auraconnect`;
  **legacy** DB `phs_portal` owned by role `legacy` (legacy `.env.shared` used
  `phs-portal-default`; hyphens force quoting, so underscore `phs_portal`). Dev-only
  passwords committed in `dev/init/*.sql` — this stack is the local inner loop, never
  deployed.
- Postgres `POSTGRES_DB` now the neutral bootstrap `postgres`; the two app DBs are
  created solely by `dev/init/10-current-db.sql` + `20-legacy-db.sql`, mounted at
  `/docker-entrypoint-initdb.d` (runs once, alphabetically, on a fresh volume only).
  Keeping POSTGRES_DB=auraconnect would collide with 10-current's CREATE DATABASE.
- Gate for this is an integration test (`dev/db-init.test.mjs`): boots a throwaway
  `postgres:17` container with **no published host port** (exec `psql` inside it), so
  it neither hits the port map nor needs a persisted volume; asserts both DBs exist
  and each is owned by its own role. `yarn test:dev` now runs 5 tests.
- Gotcha: a docker `-v` bind of a not-yet-existing host dir creates it **root-owned**.
  The first RED run created `dev/init/` as root; had to recreate before writing the
  SQL. Real init dir now exists, so subsequent runs bind an existing user-owned dir.

**Inc 3 (2026-07-02) — API under dotnet watch (bind mount, no rebuild):**
- Dev API service uses the **SDK image** (`mcr.microsoft.com/dotnet/sdk:10.0`) running
  `dotnet watch --project AuraConnectAPI/AuraConnect.API.csproj run` against a
  bind-mounted `../api:/src` — **no `build:`**, so a source edit hot-reloads and never
  triggers `docker build`. The `api/Dockerfile` publish image stays for deploy only.
- `DOTNET_USE_POLLING_FILE_WATCHER=true` — inotify does not cross the bind mount
  reliably on WSL2/Docker; polling is needed for watch to see edits.
- Connection string points the API at the **current** DB (`auraconnect`/`auraconnect`),
  matching the Inc 2 init. NuGet restore cached in a named volume (`nuget_cache`) so
  restarts don't re-download.
- Gate is **config-level** (`docker compose config`): asserts api has no build, uses
  the SDK image, runs `dotnet watch`, bind-mounts source at `/src`, and sets polling.
  These asserts pin the exact mechanism that guarantees no-rebuild-on-edit. Live boot
  deferred to opt-in verify (SDK image ~1GB pull + first-run restore/build).
- **Open (verify):** whole-tree bind means container writes `obj/bin` into the host
  tree (host is WSL2 linux, container linux — same RID, expected OK). If artifacts
  clash at live verify, shadow with anonymous volumes on the `obj`/`bin` dirs.

**Inc 4 (2026-07-02) — layered env + DATABASE_URL wiring:**
- Layout realised: root `.env` (shared: port map + Postgres creds, compose auto-loads)
  + `.env.current` + `.env.legacy`, each with a committed `.example`. `.gitignore`
  ignores the real files, whitelists the three `.example` templates.
- Env bridge for host-run clients = **dotenv-cli**, pinned exact `11.0.0` as a root
  devDep (single root lockfile; transitive `dotenv@16.6.1`, `dotenv-expand@12.0.3`).
  Root script `build:legacy` = `dotenv -e .env.legacy -- yarn workspace <legacy> build`.
  This resolves the open question "env-file → runtime wiring": a root-level dotenv-cli
  bridge per group, since Next only auto-loads app-local `.env`, not root.
- Legacy DB URL: `postgresql://legacy:legacy_pw@localhost:5442/phs_portal?connect_timeout=30`
  (host-side → mapped port 5442; targets the Inc 2 legacy DB).
- **DoD "legacy builds" — DONE (full green `next build`).** With `.env.legacy` supplied
  and the DB reachable, `yarn build:legacy` completes: env validation passes, Prisma
  client generates, compiles, and the whole route table prerenders. (Initial partial
  claim of only "env-gate cleared / compiles" was under a dead DB — see root-cause
  below; superseded by the green build.)
- Two more build-required values surfaced beyond DATABASE_URL, both now in the example
  + guarded by the fast gate:
  - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` — the root layout wraps every page in
    `<ClerkProvider>`, which throws `Missing publishableKey` at prerender. Set to
    Clerk's documented dummy key `pk_test_Y2xlcmsuZXhhbXBsZS5jb20k` (decodes to
    `clerk.example.com$`, no network for a static build).
  - `EC1_SMS_API_URL` empty-string trap (above).
- Trap found: legacy `src/env.ts` validates `EC1_SMS_API_URL` with `z.string().url()
  .optional()`. `.optional()` accepts *undefined*, not `""` — an empty value in the env
  file fails as "invalid url". Examples now leave it commented/UNSET, not empty. Only
  url-typed optional keys hit this; `SMS_API_URL` is unvalidated.
- Fast gate = `dev/env.test.mjs` (parses `.env.legacy.example`, asserts DATABASE_URL →
  phs_portal on :5442, and a well-formed Clerk publishable key). `yarn test:dev` now 9
  tests. Full `next build` to green is verified out-of-band (minutes), not in the fast gate.

## Open questions (Inc 4 residual)
- ~~**Legacy `next build` prerender timeout**~~ **RESOLVED — misdiagnosed, not app-internal.**
  Root cause: the compose volume `dev_postgres_data` held a **stale PG16** data dir, so
  `postgres:17` exited on startup (`FATAL: database files are incompatible`) and init
  never ran — the build ran against a **dead DB**. `PrismaPg` (via `BrandingService.get`
  in the root layout) then hung to `connect_timeout` on every page → the 60s prerender
  timeouts on every route incl `/_not-found`. Network was fine all along. Fix:
  `docker compose -f dev/docker-compose.yml down -v` to drop the stale volume, recreate
  fresh (PG17 + init runs). After that + the Clerk key, the legacy build is fully green.
- **Durable gotcha (learning):** the named Postgres volume survives `down` (only `down -v`
  or `docker volume rm` clears it). A version bump or a changed init needs a volume reset,
  else Postgres either refuses to start (version mismatch) or silently skips init
  ("database directory appears to contain a database; Skipping initialization"). Inc 5/6
  should add a `db:reset` convenience + document it in the dev README.

**Inc 5 (2026-07-02) — root dev scripts + concurrently (three modes):**
- `concurrently` pinned exact `10.0.3` (root devDep). Modes as root `package.json`
  scripts: `dev` → `dev:current` (default), `dev:current` (admin/captive/monitor),
  `dev:legacy`, `dev:both`. Each: `docker compose … up -d postgres api` then
  `concurrently` the host client dev servers. Helpers: `infra:up`, `infra:down`,
  `db:reset` (the volume-reset convenience from Inc 4's gotcha).
- Per-client env layering via `dotenv -e .env.<group> -e .env -- yarn workspace <name>
  dev -p <port>`. dotenv-cli does not override already-set vars, so listing the
  group file **first** gives it precedence and root `.env` fills the gaps (verified:
  `.env.current` supplies API base/SSID, `.env` supplies shared `ADMIN_PORT`).
- Client ports passed as literal `-p 3301/3302/3303/3401` in the scripts (the central
  map); root `.env` port vars feed compose/infra. Minor duplication of the numbers,
  chosen over fragile `$VAR` expansion inside dotenv-cli/concurrently child commands.
  The gate cross-checks the script ports against `.env.example` so they can't drift
  silently.
- Inner client commands single-quoted inside the double-quoted JSON script strings —
  no escaping, shell passes them to concurrently intact.
- Gate = `dev/scripts.test.mjs` (parses `package.json`): default→current, every mode
  brings infra up, each mode runs the right workspaces on mapped ports with the right
  env group, four ports distinct. `yarn test:dev` now 15 tests. Live full-stack boot
  (SDK image pull + 3–4 Next dev servers) left as opt-in verify.

**Inc 6 (2026-07-02) — compose profiles + ADR + dev README:**
- Default `up` is core-only (`postgres`, `api` — verified `config --services`). pgAdmin
  + Seq moved behind **`--profile tools`**; `aaa` profile + host-port lane reserved
  (commented) for the AAA slice. Port-uniqueness gate now runs across all profiles.
- Plan evolution (logged): the Inc 1 "declares backing services" assert listed
  pgadmin/seq as always-up. Superseded — split into "default is core-only" +
  "tools profile enables the admin UIs". Same file, append-only.
- **ADR 0004** (`docs/adr/0004-dev-orchestration.md`, indexed) records the whole
  dev-orchestration design at monorepo altitude: hybrid Docker-infra+API / host-clients,
  `dev/` layout, two-DB init, layered env, three run modes, tools/aaa profiles. Folds in
  the Inc 1 "dev tooling lives in dev/" layout decision (was flagged as an ADR candidate).
- **`dev/README.md`** documents quick start, run modes, port map, profiles, DBs, and the
  `db:reset` volume-reset gotcha.
- `yarn test:dev` = 16 tests, all green.

**DoD sign-off (2026-07-02) — live all-up boot verified:**
- `yarn dev:current` brought the whole system up with one command: pulled the .NET SDK
  image, started Postgres (healthy) + API, then `concurrently` the three current Next
  clients. Live probes: **API 5299** `/scalar` 302 (`dotnet watch ⌚ Waiting for changes`,
  "Now listening on :8080"); **admin 3301** 307, **captive 3302** 200, **monitor 3303**
  200; clients `✓ Ready` in ~0.5s. End-to-end DoD proven, not just the contract.
- The bind-mount `obj/bin` concern (Inc 3 open item) surfaced as a **non-fatal** warning:
  `dotnet watch` logged `Failed to read '.../obj\Debug/.../staticwebassets.development.json'`
  — a stale host artifact with Windows-style `\` separators. App started and watch ran
  regardless. If it ever bites, shadow `obj`/`bin` with anonymous volumes (or clean the
  host `obj/bin` before first container run). Downgraded from risk to known cosmetic.
- **Gate flakiness under load:** during the live boot (API first-build + 3 Next servers
  saturating CPU), the `db-init` integration test's 60s init poll starved and 2 tests
  failed + the run timed out. Re-run with the stack idle → 16/16. The integration test is
  load-sensitive; if it recurs, raise its poll deadline. The 15 config/parse tests are
  fast + robust.

## Retrospective

**What worked**
- Config-level gates (`docker compose config --format json` + parsing `package.json`/
  env examples) gave real RED→GREEN on infra/glue that isn't naturally unit-testable,
  and stayed fast enough to run every increment. The one integration test (db-init in a
  throwaway container) earned its keep by proving init actually runs.
- Cross-checking the port map between `.env.example` and the dev-script `-p` flags in a
  test killed the main duplication risk of hardcoding ports.
- Verifying pieces live as we went (two-DB init, legacy build) localised failures fast.

**What we'd do differently**
- The biggest time sink was a **self-inflicted misdiagnosis**: a stale PG16 volume made
  Postgres exit silently, and the resulting dead-DB connect-hang looked like an app-level
  prerender problem. Lesson banked as a durable gotcha + a `db:reset` script + README
  note. Next time, when a build "hangs," check the DB container is actually *up* before
  suspecting app code.
- Deferring the live boot to the very end meant the env/Clerk/volume issues only surfaced
  during the Inc 4 legacy build rather than an earlier smoke boot. A tiny "infra up +
  curl API" smoke could have run right after Inc 3.

**Surprises**
- `z.string().url().optional()` rejects `""` (only `undefined` passes) — empty url-typed
  env vars fail the build. And `<ClerkProvider>` in the root layout forces a well-formed
  publishable key even for a static/dummy build. Both now guarded by the gate.

(Fill in at wrap-up.) What worked, what we'd do differently, what surprised us.
