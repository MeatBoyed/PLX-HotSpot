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

Root dev orchestration (one command for API + Postgres + all clients) is being built
in a **dedicated dev-orchestration slice** — see `docs/projects/`. Until it lands, run
each client with its own `yarn workspace … run dev` and the API from `api/` (see
`api/README.md`).

## The `api/` tree

`api/` is .NET and does not participate in the Node workspace graph; it is wired in via
root compose (dev-orchestration slice). Its history was imported by `git subtree`; the
legacy monolith by `git-filter-repo` — see
[ADR 0003](docs/adr/0003-repository-history-import-method.md).
