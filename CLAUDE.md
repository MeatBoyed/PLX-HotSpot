# CLAUDE.md

Guidance for working in this repo. Keep it current when conventions change.

## What this is

Polyglot monorepo for AuraConnect (captive-portal / hotspot). ASP.NET `net10.0` API
(`api/`) + Next.js clients (`clients/current/*`, `clients/legacy/*`), one Postgres
server with two logical DBs. Layout + rationale: `README.md` and `docs/adr/`.

## Commands

```bash
# Dev stack (Docker infra + API under dotnet watch, host clients via concurrently)
yarn dev                 # default = current mode (admin + captive-portal + monitor)
yarn dev:legacy          # legacy monolith
yarn dev:both            # all four clients
yarn infra:up | infra:down
yarn db:reset            # drop DB volume + recreate (re-runs dev/init/*)

# Gate for the dev-orchestration slice
yarn test:dev            # node --test dev/*.test.mjs  (compose config, DB init, env, scripts)

# Builds
yarn build:legacy        # legacy build with .env.legacy loaded
yarn workspace @auraconnect/<name> run build
yarn install --immutable # CI: fail on any lockfile change
```

Full dev usage (ports, compose profiles, gotchas): `dev/README.md`.

## Conventions

- **Dependencies** — Yarn Berry v4, one root `yarn.lock`, **exact pins** (no `^`),
  install-scripts gated to an allowlist, per-workspace isolation. Before any
  `yarn add`/bump, use the `supply-chain-guard` skill (`.claude/skills/`). ADR 0002.
- **Decisions** — route by reach. Slice-local → the slice doc. Outlives the slice
  (stack/layout/interface/trust boundary) → an ADR. Monorepo-wide → `docs/adr/`
  (`0001+`); single-app → that app's own `docs/adr/`. See `docs/adr/README.md`.
- **Work is sliced** — plan a unit of work as a slice doc in `docs/projects/`
  (`plan-slice`), execute coding slices increment-by-increment with strict TDD
  (`execute-slice`). Sync the slice doc append-only; never overwrite superseded entries.
- **Tests are the gate.** For infra/glue that isn't unit-testable, assert on
  `docker compose config --format json` / parsed manifests (see `dev/*.test.mjs`) —
  keep RED→GREEN real.

## Gotchas

- **Layered env** — 3 files: root `.env` (shared: port map + Postgres creds, Compose
  auto-loads it) + `.env.current` + `.env.legacy`. They STACK: `dotenv -e .env.<group>
  -e .env`, group wins. Real `.env*` git-ignored; only `*.example` committed. ADR 0004.
- **Postgres volume persists across `docker compose down`.** `dev/init/*` runs only on
  a fresh volume. After changing an init script or bumping the PG image, `yarn db:reset`
  — otherwise Postgres refuses to start (version mismatch) or silently skips init. A
  dead/mis-versioned DB shows up as a *connect hang*, not a clear error.
- **Legacy build env traps** — `z.string().url().optional()` rejects `""` (leave such
  vars UNSET, not empty); `<ClerkProvider>` needs a well-formed `pk_*` publishable key
  even for a static build. Both guarded by `dev/env.test.mjs`.
- **API bind mount** writes `obj/bin` into the host `api/` tree; a stale `obj\Debug`
  artifact yields a non-fatal `dotnet watch` warning. Clean host `obj/bin` if it bites.

## Ports

Postgres 5442 · API 5299 · pgAdmin 5050 · Seq 5342 · admin 3301 · captive-portal 3302
· monitor 3303 · legacy 3401. Central map in `.env`; cross-checked by `dev/scripts.test.mjs`.
