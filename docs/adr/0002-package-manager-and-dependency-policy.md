# ADR 0002 — Yarn Berry workspaces + exact pinning, script gating, per-workspace isolation

**Status:** Accepted
**Date:** 2026-07-01
**Deciders:** Alex Veldtman
**Scope:** monorepo

## Context

The monorepo (ADR 0001) holds four Node clients that must install and build together
from one root. They do not agree on every dependency major (e.g. `zod ^3` in
captive-portal + legacy, `zod ^4` in admin), and the legacy monolith is a
maintenance-track app that must not acquire new shared-package coupling. We also need
a supply-chain posture: this codebase's prior policy (npm with `.npmrc save-exact`,
committed `package-lock.json`, "never delete the lockfile") set the *intent* — exact
pins, reviewed lockfile diffs — which must survive whatever tooling we pick.

The clients were npm (`package-lock.json`); no root workspace existed yet.

## Decision

We will use **Yarn Berry (v4) with `nodeLinker: node-modules`** as the single package
manager for all Node clients, configured for a deliberately conservative dependency
posture in `.yarnrc.yml` + the root `package.json`:

- **One root `yarn.lock`** for all workspaces; commit it with every change and review
  its diff. Workspaces are `clients/current/*` + `clients/legacy/*`; names are
  `@auraconnect/*`.
- **Exact pinning:** `defaultSemverRangePrefix: ""` — new `yarn add` writes exact
  versions, no `^`/`~` (the ADR-era `save-exact` intent, under Berry).
- **Install-script gating:** `enableScripts: false` — no package runs lifecycle/build
  scripts unless allowlisted via root `dependenciesMeta.<pkg>.built: true`. Current
  allowlist: `prisma`, `@prisma/engines`, `sharp`, `esbuild`, `@clerk/shared`,
  `core-js`, `unrs-resolver`.
- **Lockfile integrity:** `checksumBehavior: throw` — abort if a resolved package's
  checksum drifts from `yarn.lock`. CI installs with `yarn install --immutable`.
- **Per-workspace dependency isolation:** `nmHoistingLimits: workspaces` — each
  workspace resolves its own declared external deps; nothing hoists to root. This
  keeps legacy dependency-isolated and lets current apps hold independent versions
  until a shared-packages slice aligns them. Internal `@auraconnect/*` packages still
  symlink across workspaces, so internal sharing is unaffected.

## Consequences

- **Easier:** one install brings up all four clients (verified: `yarn install`, 1066
  lock entries, no conflicts); a compromised/typosquatted dependency's postinstall is
  blocked by default; version disagreements between apps no longer break each other's
  builds (this fixed admin's `zod 3/4` type-resolution failure under hoisting).
- **Harder / costs:** larger `node_modules` (less external-dep dedup); every genuinely
  needed build script must be an explicit, reviewed allowlist entry; adding a client
  that needs a new builder requires updating `dependenciesMeta`.
- **Follow-on:** external-dependency convergence (so current apps *share* one copy of
  common libs) is deferred to the shared-packages slice, where hoisting is revisited.
  The npm `package-lock.json` files still present in each client are superseded by the
  root `yarn.lock` and should be removed in that cleanup.
- Enforced operationally by the ported `supply-chain-guard` skill
  (`.claude/skills/`).

## Alternatives considered

- **npm/pnpm workspaces.** Rejected — Yarn Berry was the user's choice; its
  constraints, protocols, and `dependenciesMeta` script-allowlist give the supply-chain
  controls we want with less friction than npm's all-or-nothing `ignore-scripts`.
- **Yarn PnP linker.** Rejected for now — Next 16 and assorted tooling still hit PnP
  compat friction; `node-modules` linker avoids it. Revisit later.
- **Global hoisting (share externals across current apps).** Rejected now — the apps
  disagree on majors (`zod 3/4`); sharing one copy would require breaking migrations,
  which are out of scope for the restructure. Chose isolation; convergence is a later
  slice.
