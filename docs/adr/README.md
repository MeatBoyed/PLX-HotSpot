# Architecture Decision Records

An ADR captures **one architecturally significant decision** — its context, the
choice made, and the consequences — so the reasoning survives the people who made it.

## When to write one

Record a decision here when it outlives a single slice and constrains future work:
a technology or library choice, an on-disk or module layout, an interface other code
depends on, a trust boundary, a data-ownership rule. Slice-local decisions stay in
their slice doc (`docs/projects/`), not here.

## Scope & location (route by reach)

This is a polyglot monorepo, so ADRs live at the altitude of the decision:

- **Monorepo / cross-cutting → this folder (`/docs/adr/`).** Repo layout, package
  manager, CI, security policy, history-import method — anything spanning `api/` +
  `clients/`. Own sequence, `0001+`.
- **Single app → that app's own `docs/adr/`.** A decision internal to one client
  (framework, state management, routing) lives in e.g.
  `clients/current/admin/docs/adr/`, its own sequence from `0001`. Created **lazily**
  — only when that app records its first ADR. Path scoping means per-app sequences
  never collide with the root sequence or each other.
- **Legacy app → `clients/legacy/captive-portal-and-admin/docs/adr/`.** The legacy
  monolith predates this record-keeping; decisions about it are documented **after
  the fact** with Status `Accepted (Retrospective)` and a `Decided:` date that is the
  best estimate of when the choice was actually made. This is the "room for legacy"
  the numbering leaves: legacy owns its own namespace, so back-filling its history
  never renumbers the live root ADRs.

## Convention

- One file per decision: `NNNN-kebab-title.md`, `NNNN` a zero-padded sequence
  starting at `0001`, per location.
- Use `template.md` in this folder as the starting point.
- Status moves `Proposed → Accepted → (Superseded by NNNN | Deprecated)`, plus
  `Accepted (Retrospective)` for a decision documented after it was made. Never edit
  a decided ADR's substance — supersede it with a new one and link both ways.

## Index (monorepo / cross-cutting)

| ADR | Title | Status |
| --- | --- | --- |
| [0001](0001-polyglot-monorepo-layout.md) | Polyglot monorepo layout (`api/` + `clients/<era>/<app>`) | Accepted |
| [0002](0002-package-manager-and-dependency-policy.md) | Yarn Berry workspaces + exact pinning, script gating, per-workspace isolation | Accepted |
| [0003](0003-repository-history-import-method.md) | Import external code with history: subtree for `api/`, filter-repo for legacy | Accepted |
| [0004](0004-dev-orchestration.md) | Local dev orchestration: Docker infra + API, host clients via concurrently, layered env, run-mode + tools/aaa profiles | Accepted |
| [0005](0005-aaa-emulation-stub-architecture.md) | AAA-emulation stub architecture: thin HTTP stubs as Fastify workspaces under `dev/stubs/*`, one compose service per system | Accepted |
| [0006](0006-trunk-migration-v3-to-main.md) | Trunk migration: promote `v3` to `main` after the monorepo bootstrap (retire old `main`, reconcile its orphan commit) | Proposed |
