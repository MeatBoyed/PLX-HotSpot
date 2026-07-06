# AuraConnect monorepo

Polyglot monorepo for the AuraConnect captive-portal / hotspot system: an ASP.NET
API plus a set of Next.js clients, on the `v3` development line. See
[ADR 0001](docs/adr/0001-polyglot-monorepo-layout.md) for the layout rationale.

## Layout

```
api/                                       ASP.NET net10.0 API (EF Core + Postgres, JWT/Identity)
                                           owns AAA + RadiusDesk/MikroTik/PayFast/RADIUS integrations
clients/
  current/                                 the v3 split stack (talks to api/ over generated OpenAPI types)
    captive-portal/    @auraconnect/captive-portal              thin public portal (API client)
    admin/             @auraconnect/admin                       admin panel (Clerk auth)
    monitor/           @auraconnect/monitor                     monitoring app
  legacy/
    captive-portal-and-admin/  @auraconnect/captive-portal-and-admin-legacy
                                           original monolith — maintenance track, still deployed
dev/                                       root dev orchestration — compose stack, DB init,
                                           layered-env templates, gate tests (see dev/README.md)
docs/
  adr/                                     architecture decision records (this repo's decisions)
  projects/                                slice docs (planning + execution record)
```

## Package management

Yarn Berry (v4) workspaces, `node-modules` linker, **one root `yarn.lock`**. Hardened
per [ADR 0002](docs/adr/0002-package-manager-and-dependency-policy.md): exact version
pins, install-scripts gated to an allowlist, checksum-enforced lockfile, and
per-workspace dependency isolation (each client resolves its own external deps; legacy
is fully isolated).

```bash
yarn install                 # install all workspaces
yarn install --immutable     # CI: fail on any lockfile change
yarn workspace @auraconnect/<name> run build
```

Adding or bumping a dependency? See the `supply-chain-guard` skill in `.claude/skills/`.

## Running the system

One command brings the whole stack up for local development — Postgres (one server,
two logical DBs) + the ASP.NET API under `dotnet watch` (Docker), and the Next.js
clients on the host via `concurrently`:

```bash
cp .env.example .env                    # shared base (port map + Postgres creds)
cp .env.current.example .env.current    # current clients' config
cp .env.legacy.example .env.legacy      # legacy client + DATABASE_URL
yarn dev                                # default = current mode
```

Run modes: `yarn dev` / `dev:current` (admin + captive-portal + monitor),
`yarn dev:legacy`, `yarn dev:both`. Helpers: `yarn infra:up|down`, `yarn db:reset`,
`yarn test:dev`. Full usage — ports, profiles, the persistent-volume gotcha — in
[`dev/README.md`](dev/README.md); design rationale in
[ADR 0004](docs/adr/0004-dev-orchestration.md).

## The `api/` tree

`api/` is .NET and does not participate in the Node workspace graph; it is wired into
the root dev stack via `dev/docker-compose.yml` ([ADR 0004](docs/adr/0004-dev-orchestration.md)).
Its history was imported by `git subtree`; the legacy monolith by `git-filter-repo` — see
[ADR 0003](docs/adr/0003-repository-history-import-method.md).
