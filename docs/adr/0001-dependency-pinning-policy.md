# ADR 0001 — Pin all direct dependencies to exact versions

**Status:** Accepted
**Date:** 2026-06-29
**Deciders:** Alex Veldtman

## Context

This is a multi-tenant captive portal that delegates AAA to RadiusDesk/MikroTik and
takes payments through PayFast — a security-sensitive presentation tier shipped as
one Docker container per site. Its dependency tree includes auth (Clerk), the web
framework (Next.js 16), the ORM (Prisma 7), and analytics.

Before this decision, every direct dependency in `package.json` used a caret range
(`^x.y.z`). A caret lets `npm install` and `npm update` pull any newer
backwards-compatible release within the major. That is the primary npm supply-chain
attack surface: a compromised or hijacked package can publish a malicious patch
release that a caret range silently accepts on the next install, without any change
to `package.json`. The lockfile pins the full resolved tree, but the lockfile alone
does not protect a developer running `npm install <something>` (which may re-resolve
carets) or a teammate regenerating the lockfile.

Evidence that the drift is real, not theoretical: at the time of this decision the
caret ranges had already let several installed versions float above their declared
floor — `fast-xml-parser ^5.2.5 → 5.4.2`, `typescript ^5 → 5.8.3`,
`eslint ^9 → 9.28.0`, `@types/node ^20 → 20.19.0`, tailwind `^4 → 4.1.8`. None of
these were deliberate, reviewed bumps.

A current `npm audit` reports 45 advisories across the production/tooling tree
(Clerk, Next, Prisma, axios, and others). We are **not** fixing those here. We first
want a stable, fully-pinned baseline and basic test coverage so that dependency
*updates* — including the security fixes — can be made deliberately and verified,
rather than absorbed silently.

## Decision

We will pin **every direct dependency** in `package.json` (both `dependencies` and
`devDependencies`) to an **exact version** — no `^`, no `~` — set to the version
currently installed and vetted.

We will commit a repo-root `.npmrc` with `save-exact=true`, so any future
`npm install <pkg>` writes an exact version and can never reintroduce a caret range.

We will **not** set `ignore-scripts=true`. The repo depends on a
`postinstall: prisma generate` lifecycle script; a blanket block would break it. The
current tree was vetted (see the slice below) and carries no other install scripts.

This establishes a sequence for dependency work going forward:

1. **Pin** the tree as-is (this ADR) — freeze a known-good, supply-chain-safe baseline.
2. **Build test coverage** — enough of a safety net to detect regressions from a bump.
3. **Update deliberately** — bump dependencies (including the 45 outstanding
   advisories) as guarded changes, each vetted with `/supply-chain-guard` and
   verified by the test suite + build.

## Consequences

Easier:

- A compromised patch/minor release cannot enter via a caret on the next install.
  Version movement now requires an explicit, reviewable edit to `package.json` and
  the lockfile, committed together.
- The installed tree is reproducible from `package.json` alone, not only the lockfile.

Harder / costs:

- Routine updates no longer arrive for free. Each bump is now a deliberate change —
  this is the intended trade-off, and step 3 above is where it is paid down.
- Patch-level security fixes also no longer arrive automatically. Until step 3, the
  45 known advisories remain present by design; this is an accepted, time-boxed risk
  carried knowingly rather than a gap.
- `package.json` no longer signals the supported range for a dependency; the exact
  pin is a point-in-time fact, not a compatibility statement.

Ruled out: relying on the lockfile alone (does not protect re-resolution paths);
`ignore-scripts=true` (breaks `prisma generate`).

## Alternatives considered

- **Keep carets, rely on the lockfile.** Rejected: the lockfile does not protect
  `npm install <pkg>` re-resolution or lockfile regeneration, which is exactly where
  a hijacked release would land. The observed drift above shows carets already moved
  versions un-reviewed.
- **Pin only runtime `dependencies`, leave `devDependencies` on carets.** Rejected:
  dev tooling runs with full local/CI privileges and is a proven attack vector
  (build-time script execution). The vitest subtree audited in the originating slice
  is dev-only, so excluding devDeps would exclude the very tree that prompted this.
- **`ignore-scripts=true` plus an allowlist for prisma.** Deferred, not rejected:
  more moving parts than warranted now given the tree has only the one intended
  install script. Revisit if the tree grows install scripts.
