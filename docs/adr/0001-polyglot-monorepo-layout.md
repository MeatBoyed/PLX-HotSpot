# ADR 0001 — Polyglot monorepo layout (`api/` + `clients/<era>/<app>`)

**Status:** Accepted
**Date:** 2026-07-01
**Deciders:** Alex Veldtman
**Scope:** monorepo

## Context

AuraConnect was spread across three places: the `main` and `v3` branches of
`MeatBoyed/PLX-HotSpot` (a Next.js line that forked at base `d8e6f87` — `v3` being the
live development line, 54 commits ahead) and a separate `MeatBoyed/AuraConnect` repo
(the ASP.NET `net10.0` API). `v3` had already split the monolith into a thin captive
portal + a standalone admin panel + a monitoring app, all consuming the API over
generated OpenAPI types. The old `main` monolith (portal + admin + Prisma + Clerk +
RadiusDesk/MikroTik/PayFast) is still deployed to live sites and stays on a
maintenance track — bugfixes, no new shared-package coupling.

We need one home for the whole system, where root tooling can bring API + database +
all clients up together, without erasing the client/server split `v3` already made or
stranding the still-deployed legacy monolith.

## Decision

We will build a single polyglot monorepo on a branch off `v3` with this layout:

```
/api/                                        ASP.NET net10.0 (imported, see ADR 0003)
/clients/                                    Node clients (Yarn workspaces, ADR 0002)
  current/
    captive-portal/                          v3 thin portal (API client)
    admin/                                   v3 standalone admin (Clerk)
    monitor/                                 v3 monitoring app
  legacy/
    captive-portal-and-admin/                main monolith — first-class, marked legacy
  packages/                                  shared internal packages (later slice)
```

Clients are organised **by era** (`clients/<era>/<app>`): `current/` for the v3 split
stack, `legacy/` for the monolith. App folders are named for their content
(`captive-portal`, `admin`, `monitor`); a multi-domain app joins domains function-first
(`captive-portal-and-admin`). Workspace package names are scoped `@auraconnect/*`.

## Consequences

- **Easier:** one clone holds the whole system; root dev tooling can start everything
  together; the two `next-captive-portal-rd` lineages (v3 thin vs main monolith)
  coexist without a name clash because era-nesting + content-naming disambiguates them.
- **Legacy is first-class but unmistakable:** it sits inside the workspace graph
  (installable, buildable, deployable) yet its `legacy/` path, scoped name, and
  isolation (ADR 0002) mark it as maintenance-track.
- **Harder / follow-on:** workspace globs are two levels (`clients/*/*`); shared-package
  extraction (`clients/packages/`) is deferred to its own slice; the auth-model split
  (API JWT/Identity vs admin Clerk) is a known gap left for a later slice.
- The `api/` tree is .NET and does not participate in the Node workspace graph; it is
  wired in through root compose, not the JS task runner.

## Alternatives considered

- **Keep three separate repos.** Rejected — no single command brings the system up,
  and cross-cutting changes (API contract + client) span repos.
- **Evolve `v3` in place / build on `main`.** Rejected — `main` is the stale
  pre-split line; the earlier bootstrap work built on it unaware of `v3` and had to be
  realigned. `v3` is the correct base.
- **Flat `clients/*` with `-legacy` suffixes.** Rejected — era-nesting groups the
  live stack and the maintenance monolith physically and scales if more legacy apps
  are imported, where suffixes would interleave them in listings.
