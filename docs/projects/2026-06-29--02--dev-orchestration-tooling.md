# Slice 5 — Dev orchestration tooling (one-command local dev + Makefile)

**Status:** in-progress
**Started:** 2026-06-29
**Finished:** —

## Plan reference

Follow-up surfaced during the test-coverage slice (`2026-06-29--01`). Today bringing
up local dev is multi-step and manual: `npm run db:up`, wait, `npm run dev`, plus
`db:migrate`/`db:seed`. As we add dev dependencies (Mailpit, Redis, RabbitMQ, …) this
gets worse. We want **one command** that brings the whole local stack up (compose,
waiting for health) and starts the dev server, plus a thin **Makefile** layer that
wraps the npm scripts so the same verbs serve both local dev and CI/CD.

**Definition of done** (confirm/adjust before starting):
- A generic `dev:deps` npm script brings up everything in
  `docker/docker-compose.dev.yml` with `up -d --wait` (blocks until healthy), not a
  db-specific name — adding a service to the compose file is the only change needed
  to include it.
- `npm run dev` brings deps up first then starts the dev server, in one command
  (via `predev` lifecycle), and is idempotent (re-running when deps are already up
  is a no-op that still starts the server).
- A `Makefile` wraps the npm scripts with at least: `dev`, `dev-down`, `gate`
  (lint + test + build), `e2e`. Targets just call `npm run …`; `make help` lists them.
- README "Local Development" updated to the one-command flow; CLAUDE.md command list
  updated.
- No regression to existing gates (lint/test/build no-regression per
  `[[rescue-slice-relax-gates]]`).

## Working scope

One-command local dev (compose deps `--wait` + dev server) + a Makefile wrapping npm
scripts for dev and CI/CD.

Concretely:
- Add `dev:deps` (`docker compose -f docker/docker-compose.dev.yml up -d --wait`) and
  `dev:down`; keep `db:*` migrate/seed scripts. Decide whether `db:up`/`db:down`
  become aliases or are replaced (see Open questions).
- Wire `predev` → `dev:deps` so `npm run dev` is one command.
- Add `Makefile` (chosen over Taskfile/npm-only — `make` is in every CI image, zero
  install; matches the team's veldtman-media repo): `dev`, `dev-down`, `gate`, `e2e`,
  `help`. Thin — each target shells out to `npm run …`.
- Update README + CLAUDE.md.

## Assumptions going in

- No new npm packages expected (Makefile + scripts only) → likely no
  `/supply-chain-guard` run, but if any dep is added it is mandatory + pinned exact.
- Docker compose v2 (`docker compose … --wait`) is available (already used by `db:up`).
- E2e against the agent needs a routable `BASE_URL`; `make e2e` passes `BASE_URL`
  through. Tunnels are explicitly OUT (Cloudflare not in this product's stack yet) —
  `make e2e` defaults to localhost for human runs. See `[[2026-06-29--01]]` e2e notes.
- The dev server still runs on the host (not in compose) — only dependencies are
  containerised, per the current compose file's design note.

## Decisions made during the slice

Slice-local decisions only. Cross-cutting ones go into `docs/adr/` — link here.

- **Orchestration layer = Makefile wrapping npm scripts** (vs Taskfile / npm-only) —
  decided with the user: portability (make ubiquitous in CI), zero install, matches an
  existing team repo. _May warrant a short ADR if it becomes the standard across repos._
- `dev:deps` uses `--wait` so server start never races an unhealthy DB.
- **Replace `db:up`/`db:down` with `dev:deps`/`dev:down`** (not alias) — clean break,
  generic naming. Update README + CLAUDE.md references. `db:migrate`/`db:seed`/`db:reset`
  stay (they're DB-specific operations, not "bring deps up").
- **Migrations: explicit in dev, auto on deploy.** `npm run dev` does NOT auto-migrate
  — keep `db:migrate`/`db:seed` manual locally. Auto-migrate belongs to the deploy
  path (future deploy slice), not here.
- **`make gate` = test + build blocking, lint non-blocking** (`npm run lint || true`,
  reports only) until the 55-error lint debt is cleared, then flip lint to blocking.
  No-regression spirit; usable CI verb today. See `[[rescue-slice-relax-gates]]`.
- ~~**direnv `nvm use` wiring = `use nvm` + a `use_nvm` direnvrc helper.**~~
  **SUPERSEDED (2026-06-29)** after checking veldtman-media's actual `.envrc`: the
  team's pattern is **`use nvm $(cat .nvmrc)`** (passes the pinned version explicitly,
  no custom `use_nvm` helper needed) plus `dotenv_if_exists` for env files. Adopt that
  verbatim. `.envrc` is git-tracked (gitignore ignores `.env*` but not `.envrc`);
  `.env.local` stays ignored. Add `.direnv/` cache to gitignore.

## Deferred / pushed forward

- **Tunnel / Cloudflare** for agent-driven browser e2e — out of scope; Cloudflare is
  not part of this product's stack. Revisit only if agent browser-e2e value emerges.
- **Adding Mailpit / Redis / RabbitMQ** — not this slice; the point here is that
  `dev:deps` will pick them up once they're added to the compose file.
- **A CI pipeline** itself (GitHub Actions etc.) — this slice makes the verbs
  CI-ready (`make gate`), but wiring an actual pipeline is later work.
- **Running the dev server inside compose** — stays on the host for now.

## Open questions

Resolved at planning (kept for the record):
- ~~Alias or replace `db:up`?~~ → **Replace** with `dev:deps`/`dev:down`.
- ~~Auto-migrate on `npm run dev`?~~ → **No** — explicit in dev; auto-migrate is a
  deploy-path concern (future slice).
- ~~`make gate` strict-green or no-regression?~~ → **No-regression**: test+build block,
  lint non-blocking until debt cleared.

Added scope (user request, 2026-06-29) — **direnv tooling**:
- Add `.envrc` so entering the repo folder auto-runs `nvm use` (pinned `.nvmrc`
  24.18.0) and loads the dev env file. Fits the slice theme (zero-friction dev). New
  increment after docs.
- Decision needed: how to fire `nvm use` (nvm is a shell function, not a binary) —
  see checkpoint. Env loading via direnv-native `dotenv_if_exists .env.local`.
- `.envrc` is git-tracked; each dev runs `direnv allow` once (it's gitignored from
  auto-trust). Must NOT commit secrets — `.envrc` loads `.env.local`, doesn't contain it.

Still open:
- Does `--wait` no-op fast when containers are already up-and-healthy? (Verify at build.)
- `predev` runs on every `npm run dev` — acceptable startup cost, or gate it? (Verify
  `--wait` is fast enough that always-run is fine.)

## Increment log

### Inc 1 — dev:deps/dev:down scripts + predev wiring (done 2026-06-29)
- `package.json`: removed `db:up`/`db:down`; added `dev:deps`
  (`docker compose -f docker/docker-compose.dev.yml up -d --wait`), `dev:down`
  (`… down`), and `predev` (`npm run dev:deps`). `db:migrate`/`db:seed`/`db:reset` kept.
- Config/glue increment (Method Note 2) — verified by running, not a unit test.
- Verified: `dev:deps` → Running→Waiting→**Healthy**; ~0.7s fast no-op when already
  healthy (answers the `--wait` idempotency open question — yes, fast no-op).
- Verified one-command flow: `npm run dev` → predev → dev:deps (Healthy) → `next dev`
  → Ready. (Dev server runs on :3001; `next start`/e2e on :3000 — pre-existing, fine.)
- Gates: tests 54/54; lint 55 err/337 warn = unchanged; build not run (script-only
  change can't affect `next build`).

### Inc 2 — Makefile (done 2026-06-29)
- `Makefile` wrapping npm scripts: `help` (default, self-documenting via `## `
  comments), `dev`, `dev-down`, `deps`, `gate`, `e2e`. Each target shells to `npm run …`.
- `gate` = `npm test` + `npm run build` (blocking) then `-npm run lint` (the `-`
  prefix makes lint non-blocking). Verified `make gate` exits **0** with 55 lint
  errors present; test+build still block (no `-`).
- `make help` verified; recipe lines are real tabs.
- `make e2e` calls `npm run test:e2e`; `BASE_URL` passes through the env naturally
  (`BASE_URL=… make e2e`). Not run from the agent (browser test needs a routable
  target, per `[[2026-06-29--01]]`).
- Gates: `make gate` green (test 54/54 + build compiled); lint unchanged 55/337.

### Inc 3 — direnv (.envrc) (done 2026-06-29)
- `.envrc` (tracked): `use nvm $(cat .nvmrc)` + `dotenv_if_exists .env.local` — exact
  veldtman-media pattern. `.direnv/` cache added to gitignore.
- **Verified by running** (`direnv allow` + `direnv exec`): env loads
  (`DATABASE_URL: yes`, `SITE_DESCRIPTION: set`), `use nvm` resolves the pinned version.
- **Two issues surfaced by actually running it:**
  - **`nvm 24.18.0` not installed** (machine has 24.15.0 — the pre-existing engine gap).
    `use nvm` works; the version is a one-time prereq: `nvm install 24.18.0`. Documented.
  - **direnv's `dotenv` rejects unquoted spaced values** (`SITE_DESCRIPTION=PluxNet
    Fibre HotSpot`) — stricter than Next's loader, so the whole env file failed to load.
    Fixed `.env.example` (tracked) to quote it; quoted the one line in `.env.local` too.
- Gates: tests 54/54; lint 55 err/337 warn = unchanged; build not run (no source change).

### Smoke test (user-run, 2026-06-29)
- User ran `make dev` in a real terminal: predev → `dev:deps` (Healthy 0.5s) →
  `next dev` → Ready. Agent `curl http://127.0.0.1:3001/` → **200**, title
  "PluxNet Fibre HotSpot". Full one-command path verified end-to-end.

### Inc 4 — docs + DEV_PORT (done 2026-06-29)
- README "Local Development" rewritten: deps generalised (not just Postgres), `make`
  verbs table, direnv prereq + `direnv allow`, one-command run, `.env*` quoting note,
  `db:up`→`dev:deps`. CLAUDE.md "Commands" updated (make dev / dev:deps / test:e2e /
  direnv; e2e no longer "deferred").
- **Added scope (user request): deterministic dev port.** `DEV_PORT` (default 3000) in
  `.env.example` + `.env.local`; `dev` script binds `-p ${DEV_PORT:-3000}`. direnv
  loads it into the shell. Verified `DEV_PORT=3007 npm run dev` → binds 3007. Stops the
  silent fallback to 3001 on a conflict (Next now errors loudly instead).
- Gates: `make gate` exit 0 (test 54/54 + build compiled); lint 55/337 unchanged.

### Inc 5 — e2e decoupled from server mgmt + single port var (done 2026-06-29)
- **Removed Playwright `webServer`** — e2e no longer starts/stops the app. Contract:
  start the app yourself (`make dev`); if nothing's at the target, the suite fails.
  Matches the team's decoupled model (server lifecycle ≠ test lifecycle).
- **`BASE_URL` now derives from `DEV_PORT`** — `http://localhost:${DEV_PORT ?? 3000}`.
  One port var drives both the dev server bind and the e2e target; `BASE_URL` overrides
  only for a different host (CI/routable). Verified: default → :3000 (http smoke green
  vs the running server); `DEV_PORT=3007` → targets :3007 (fails, nothing there).
- e2e/README updated to the decoupled, DEV_PORT-driven model.
- **Agent browser-vs-localhost: confirmed unfixable in-repo.** With the server up
  (curl :3000 = 200) and config minimal, the agent's Chromium still gets
  `net::ERR_NAME_NOT_RESOLVED at http://localhost:3000/` while Node/curl reach it. The
  suite + config are correct; the limit is the agent sandbox's browser loopback reach.
  Human/CI runs (`make e2e` on host) pass both tests. Agent runs pass the HTTP smoke.

## Learnings

(Fill in as you discover them.)

- `--wait` is a fast no-op (~0.7s) when containers are already healthy → always-run
  `predev` is fine, no need to gate it.
- One port var (`DEV_PORT`) should drive both the dev server and the e2e default
  target — derive `BASE_URL` from it rather than duplicating the port.
- Make's `-` recipe-line prefix is the clean way to make one step (lint) non-blocking
  while keeping siblings (test/build) blocking — no shell `|| true` needed.
- **direnv's dotenv is stricter than Next's**: values with spaces MUST be quoted or the
  whole file silently fails to load (`invalid line`). Keep all `.env*` values quoted.
- `use nvm $(cat .nvmrc)` is the team's direnv idiom — passes the version explicitly,
  no custom `use_nvm` helper required.

## Retrospective

(Fill in at wrap-up.)

- ...
