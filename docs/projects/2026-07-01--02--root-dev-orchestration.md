# Slice 2026-07-01--02 — Root dev orchestration (compose Postgres×2 + dotnet watch API + concurrently clients)

**Status:** planning
**Started:** 2026-07-01
**Finished:** —

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
- **Task runner**: plain root `package.json` scripts + `concurrently`, or introduce a
  Makefile / justfile for the compose+node choreography? (still open)
- **Emulator profiles vs always-on** (foreshadowing the AAA slice): default `up`
  stays light; emulators behind `--profile`. (still open — AAA slice)
- **Env-file → compose/runtime wiring**: how `.env.current` / `.env.legacy` feed the
  right services and the host `concurrently` client dev servers per mode. (new,
  during build)

## Learnings

(Fill in as you go.) Durable knowledge this slice produced about the codebase, the
domain, or the tooling — facts that outlive the slice.

- ...

## Retrospective

(Fill in at wrap-up.) What worked, what we'd do differently, what surprised us.
