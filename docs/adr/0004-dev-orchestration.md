# ADR 0004 — Local dev orchestration: Docker infra + API, host clients, layered env

**Status:** Accepted
**Date:** 2026-07-02
**Deciders:** Alex Veldtman
**Scope:** monorepo

## Context

The monorepo holds a .NET API (`api/`), three current Next.js clients
(`clients/current/*`), and a legacy Next.js monolith (`clients/legacy/*`), all
backed by Postgres. Developers need **one command to bring the whole system up**
for the inner loop, with hot reload and no image rebuild on source edits. The
constraints that shaped this:

- Fastest client HMR comes from running Next.js on the host, not in a container.
- The API benefits from `dotnet watch` hot reload; running it in Docker keeps the
  toolchain off the host.
- Two apps need their own logical database on one Postgres server (current,
  EF-migrated; legacy, Prisma-managed).
- Config is split by group and partly secret, so it cannot all be committed.
- A later AAA-emulation slice (RadiusDesk + MikroTik) will add services that must
  not weigh down the default loop.

This decision spans `api/` + `clients/` and defines an on-disk layout and env
contract other work depends on, so it is a monorepo-level ADR, not slice-local.

## Decision

We will orchestrate local dev as a **hybrid**, driven by root `package.json`
scripts:

- **Docker for backing services + API.** A single compose file at `dev/docker-compose.yml`
  runs Postgres and the API. The API uses the **.NET SDK image against a
  bind-mounted source tree under `dotnet watch`** — no `build:`, so source edits
  hot-reload and never trigger `docker build`. All dev tooling lives under `dev/`
  to keep the repo root tidy; the root holds only the one-command entry points.
- **Host for clients.** Next.js dev servers run on the host via `concurrently`
  across the Yarn Berry workspaces, each on a fixed host port from a **central
  port map** (Postgres 5442, pgAdmin 5050, Seq 5342, API 5299, clients 3301–3303
  and legacy 3401).
- **One Postgres, two logical DBs, separate init per group.** `dev/init/10-current-db.sql`
  and `20-legacy-db.sql` each create their group's database + owning role on a
  fresh volume; `POSTGRES_DB` is a neutral bootstrap DB.
- **Layered env.** Root `.env` (shared: port map + Postgres creds; compose
  auto-loads it) plus group files `.env.current` and `.env.legacy`, each with a
  committed `.example`. Real `.env*` are git-ignored. `dotenv-cli` bridges a group
  file into each host workspace command (`-e .env.<group> -e .env`, group wins).
- **Three run modes, default current.** `yarn dev` → `dev:current`; also
  `dev:legacy` and `dev:both`. Each brings core infra up then `concurrently` the
  relevant client dev servers.
- **Compose profiles for opt-in services.** The default `up` is core-only
  (postgres + api). Admin UIs (pgAdmin, Seq) sit behind `--profile tools`; the
  `aaa` profile + a host-port lane are **reserved** (commented) for the AAA slice.

## Consequences

- One command (`yarn dev`) starts the whole system with hot reload on both tiers
  and no rebuild-on-edit. New contributors copy three `.example` files and go.
- The named Postgres volume persists across `docker compose down` — a Postgres
  version bump or a changed init script needs a volume reset, or Postgres refuses
  to start (version mismatch) or silently skips init. Mitigated by a `db:reset`
  script; called out in `dev/README.md`.
- The central port map is duplicated as literal `-p` flags in the dev scripts and
  as vars in `.env` (compose). A gate test cross-checks them so they cannot drift
  silently.
- The AAA slice can add emulators behind `--profile aaa` without touching the core
  loop.
- Whole-tree bind-mount of `api/` means the container writes `obj/bin` into the
  host tree (same RID, expected fine); shadow with anonymous volumes if it clashes.

## Alternatives considered

- **Everything in Docker (clients too).** Slower HMR through the bind mount and
  heavier resource use; `docker compose watch` remains available for a full parity
  mode when needed, but is not the default.
- **Inherit the legacy monolith's existing compose.** Discarded in favour of a
  fresh compose service in the root stack, using the legacy setup only as a
  reference (its env layout informed `.env.legacy`).
- **A Makefile / justfile task runner.** Rejected to avoid a new tool; plain root
  `package.json` scripts + `concurrently` match the Yarn Berry setup.
- **One shared DB init.** Rejected; separate per-group init keeps the two
  databases independently creatable and mirrors their separate ownership.
