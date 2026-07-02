# Local dev orchestration

One command brings the whole system up for the inner loop: Postgres (two logical
DBs) + the ASP.NET API under `dotnet watch` (Docker), and the Next.js clients on the
host via `concurrently`. Design + rationale: [ADR 0004](../docs/adr/0004-dev-orchestration.md).

## Quick start

```bash
# 1. Seed env from the committed templates (real .env* are git-ignored)
cp .env.example .env
cp .env.current.example .env.current
cp .env.legacy.example .env.legacy

# 2. Bring the system up (default = current mode)
yarn dev
```

`yarn dev` starts core infra (Postgres + API) then the current client dev servers.
First run pulls the .NET SDK image (~1GB) and restores NuGet — subsequent runs are fast.

## Run modes

| Command | Brings up |
| --- | --- |
| `yarn dev` / `yarn dev:current` | Postgres + API + admin, captive-portal, monitor |
| `yarn dev:legacy` | Postgres + API + the legacy monolith |
| `yarn dev:both` | Postgres + API + all four clients |

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

Chosen to avoid collisions with ports already in use on the dev machine.

## Optional services (profiles)

The default `up` is core-only. Bring the admin UIs up on demand:

```bash
docker compose -f dev/docker-compose.yml --profile tools up -d   # pgAdmin + Seq
```

The `aaa` profile is reserved (commented in `docker-compose.yml`) for the future
AAA-emulation slice (RadiusDesk + MikroTik) — not wired here.

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
| `yarn test:dev` | Run the dev-orchestration gate (`dev/*.test.mjs`) |
| `yarn build:legacy` | Build the legacy client with `.env.legacy` loaded |
