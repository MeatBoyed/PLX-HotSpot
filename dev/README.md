# Local dev orchestration

One command brings the whole system up for the inner loop: Postgres (two logical
DBs) + the ASP.NET API under `dotnet watch` (Docker), and the Next.js clients on the
host via `concurrently`. Design + rationale: [ADR 0004](../docs/adr/0004-dev-orchestration.md).

## Quick start

```bash
# 1. Install deps (Yarn Berry, single root lockfile). REQUIRED before dev:aaa / test:e2e:
#    the stub images bake each stub workspace's node_modules, so they must exist on disk.
yarn install --immutable

# 2. Seed env from the committed templates (real .env* are git-ignored)
cp .env.example .env
cp .env.current.example .env.current
cp .env.legacy.example .env.legacy

# 3. Bring the system up (default = current mode)
yarn dev
```

`yarn dev` starts core infra (Postgres + API) then the current client dev servers.
First run pulls the .NET SDK image (~1GB) and restores NuGet — subsequent runs are fast.

Prereqs: Docker (Compose v2), Node + Yarn Berry v4. Most tests spin throwaway containers,
so **Docker must be running** for `yarn test:dev` and `yarn test:e2e`.

**Node version** — the committed root `.envrc` auto-switches to the `.nvmrc` version via
[direnv](https://direnv.net/) + nvm. Install `direnv`, hook it into your shell (`eval
"$(direnv hook bash)"` / `zsh` equivalent in your rc file), then run `direnv allow` once in
the repo root. Without direnv, `nvm use` manually accomplishes the same thing.

## Run modes

| Command | Brings up |
| --- | --- |
| `yarn dev` / `yarn dev:current` | Postgres + API + admin, captive-portal, monitor |
| `yarn dev:legacy` | Postgres + API + the legacy monolith |
| `yarn dev:both` | Postgres + API + all four clients |
| `yarn dev:aaa` | Postgres + API + **AAA stubs** + current clients, seeded + stub-pointed |

Each client runs on a fixed host port from the central port map, with its group env
layered in (`.env.current` or `.env.legacy`, over the shared root `.env`).

## Port map

| Service | Host port |
| --- | --- |
| Postgres | 5442 |
| API (ASP.NET) | 5299 |
| pgAdmin (`tools`) | 5050 |
| Seq (`tools`) | 5342 |
| admin | 3301 |
| captive-portal | 3302 |
| monitor | 3303 |
| legacy | 3401 |
| RadiusDesk stub (`aaa`) | 5480 |
| MikroTik REST stub (`aaa`, HTTPS) | 5481 |
| FreeRADIUS DB stub (`aaa`, MariaDB) | 5482 |
| MikroTik hotspot login stub (`aaa`, HTTP) | 5483 |

Chosen to avoid collisions with ports already in use on the dev machine.

## Optional services (profiles)

The default `up` is core-only. Bring the admin UIs up on demand:

```bash
docker compose -f dev/docker-compose.yml --profile tools up -d   # pgAdmin + Seq
```

## AAA emulation (`aaa` profile)

Thin HTTP stubs of the integration backends the apps call, so captive-auth / voucher /
telemetry flows are testable in local dev. Design: [ADR 0005](../docs/adr/0005-aaa-emulation-stub-architecture.md);
full plan: [slice 2026-07-03--01](../docs/projects/2026-07-03--01--aaa-emulation-dev.md).

| Stub | Service | What it emulates |
| --- | --- | --- |
| A | `mikrotik` (HTTPS 5481) | MikroTik RouterOS `/rest` (monitor telemetry + API gateway verify) |
| B | `mikrotik` (HTTP 5483) | MikroTik hotspot `/login` page (captive portals submit here) |
| C | `radiusdesk` (HTTP 5480) | RadiusDesk `cake4/rd_cake/…` (vouchers, permanent-users, profiles) |
| D | `radius-db` (MariaDB 5482) | FreeRADIUS accounting DB the API reads as SQL |

```bash
# One command: full aaa stack (stubs + API + DB) up, wait for API migration, seed the
# API config to point at the stubs, then run the current clients (stub-pointed).
yarn dev:aaa
```

Stub source lives in `dev/stubs/*` (Fastify workspaces). The API is pointed at the stubs
by DB seeds in `dev/seed/*.sql` (applied by `yarn dev:seed`, which `dev:aaa` runs for you);
host clients (monitor, captive) are pointed by the values in `.env.current.example`.
`E` (PayFast) and `F` (SMS) stubs are optional and not yet built.

## Databases

One Postgres server, two logical DBs created on a **fresh volume** by `dev/init/`:

- `auraconnect` (owner `auraconnect`) — current group, EF-migrated.
- `phs_portal` (owner `legacy`) — legacy group, Prisma-managed.

### Resetting the DB (important)

The Postgres data volume **persists across `docker compose down`**. The init scripts
run **only on a fresh volume**, so after changing an init script — or bumping the
Postgres image version — you must reset the volume, or Postgres will either refuse to
start (version mismatch) or silently skip init:

```bash
yarn db:reset   # docker compose down -v && up -d postgres
```

## Other commands

| Command | Does |
| --- | --- |
| `yarn infra:up` | Start Postgres + API only (no clients) |
| `yarn infra:down` | Stop the stack (keeps volumes) |
| `yarn db:reset` | Drop volumes + recreate Postgres fresh (re-runs init) |
| `yarn dev:seed` | Apply `dev/seed/*.sql` to the API DB (point config at the AAA stubs) |
| `yarn test:dev` | Unit/integration gate (`dev/*.test.mjs`) — needs Docker |
| `yarn test:e2e` | Playwright e2e against the live `aaa` stubs — builds + ups stubs, needs Docker |
| `yarn build:legacy` | Build the legacy client with `.env.legacy` loaded |

## Tests

- **`yarn test:dev`** — `node --test dev/*.test.mjs`. Compose-config assertions + throwaway-
  container integration tests (Postgres/MariaDB DB init, config seeds, stub `app.inject()`
  behaviour). Docker required. Container tests connect over TCP (not the unix socket) to
  avoid the images' temp-init-server restart window — see the slice doc if one flakes.
- **`yarn test:e2e`** — Playwright (`@auraconnect/e2e` workspace). API request-context tests
  (no browser) against the running stubs; `global-setup` builds + ups the `mikrotik` +
  `radiusdesk` stubs and waits for them, `global-teardown` stops them. Run `yarn install`
  first (the stub images bake their workspace `node_modules`). Browser-UI journeys (monitor
  dashboard, full captive purchase) are a staged follow-up and need the full app stack up.
