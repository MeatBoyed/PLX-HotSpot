---
name: supply-chain-guard
description: Guidance and checks for preventing software supply-chain attacks when adding or updating dependencies in this Yarn Berry monorepo — pinning, single-root-lockfile integrity, lifecycle-script gating, provenance, and typosquat/maintainer-change review. Use before running yarn add/up, bumping a dependency, adding a new package, or reviewing a dependency change, or when the user invokes /supply-chain-guard. Defensive only.
---

# /supply-chain-guard

## I. Context

### A. Definitions

1. **Dependency change** — any add, bump, or removal of a package in any workspace,
   or any edit to a `package.json`, the root `yarn.lock`, or `.yarnrc.yml`.
2. **Provenance** — verifiable evidence of who published a package and from what
   source (npm publish attestations, repository link, release history).
3. **Lockfile integrity** — the **single root `yarn.lock`** resolving every workspace
   dependency to a pinned version + checksum, committed and unmodified except by
   intentional changes. This monorepo has one root lockfile, not per-app locks.
4. **Lifecycle-script gating** — Yarn Berry does **not** run package build/postinstall
   scripts unless explicitly allowed. The allowlist lives in `dependenciesMeta.<pkg>.built: true`
   (per workspace or root). An unexpected new entry there is a red flag.

### B. Governing priority

Prefer not adding a dependency over adding a risky one. When a change can't be
verified (no provenance, recent maintainer change, near-zero downloads, name
resembles a popular package), stop and surface it to the user rather than installing.
This skill is defensive — it never assists in crafting or obscuring a malicious
dependency.

Scope note: this guards the **Node/Yarn clients** (`clients/*/*`). The `api/` tree is
.NET (NuGet, pinned via `nuget.config` + `packages.lock.json`) — a separate supply-chain
axis, not covered here.

### C. Inputs

```
/supply-chain-guard            # audit the current dependency state / pending change
/supply-chain-guard <package>  # vet a specific package before adding
```

## II. Action

### A. Before adding a new package

1. **Need check** — can the standard library, an existing dependency, or a few lines
   of local code do it? If yes, don't add.
2. **Identity** — confirm the exact name (guard against typosquats: hyphen/scope
   swaps, look-alike characters). Verify the package links to a real source repo.
3. **Provenance & health** — check publish attestation/signature where available,
   download volume, release cadence, open-maintenance signals, and recent
   maintainer/ownership changes (a common compromise vector).
4. **Footprint** — review transitive count and any lifecycle scripts. Berry blocks
   scripts by default; if a package *needs* `dependenciesMeta.built: true` to work,
   treat that as a deliberate, reviewed exception — never blanket-enable scripts.

### B. When installing / pinning

1. Use the lockfile-respecting install: **`yarn install --immutable`** in CI (fails on
   any lockfile change — the Berry equivalent of `npm ci`); locally `yarn install` with
   the root `yarn.lock` committed. **Never delete `yarn.lock` to "fix" a conflict** —
   it discards the pinned, checksummed tree and can silently re-resolve transitives,
   itself a supply-chain risk. Resolve conflicts by merging the lockfile
   (`yarn install` after a clean git merge), not regenerating it from scratch.
2. Pin direct dependencies to **exact** versions (no `^`/`~`). Enforce repo-wide with
   `.yarnrc.yml`: `defaultSemverRangePrefix: ""` (the Berry equivalent of npm
   `save-exact=true` from ADR 0001). Add new deps exact (`yarn add pkg@x.y.z`); never
   reintroduce a caret range.
3. Harden `.yarnrc.yml` and keep it under review:
   - `enableScripts: false` — no lifecycle scripts unless allowlisted.
   - `checksumBehavior: throw` — abort if a resolved package's checksum drifts.
   - `enableStrictSsl: true` — no downgraded transport to the registry.
   - Keep the `dependenciesMeta … built` allowlist and any `resolutions` block
     intentional, not accidental.
4. Commit the changed `package.json`(s) and the root `yarn.lock` together; review the
   lockfile diff — unexpected new transitives, changed `resolution` URLs, or changed
   checksums warrant a pause.

### C. Ongoing

1. Run **`yarn npm audit --all --recursive`** on dependency changes; triage by
   reachability, not just severity.
2. Treat a `yarn.lock` diff that no one intended as an incident until explained.

## III. Conditions of satisfaction

1. A new dependency is justified (need, identity, provenance, footprint all checked)
   or not added.
2. Installs respect the committed root `yarn.lock`; the lockfile is never deleted to
   resolve conflicts; CI uses `--immutable`.
3. Exact pinning holds (`defaultSemverRangePrefix: ""`); no caret/tilde on direct deps.
4. Lifecycle scripts stay gated (`enableScripts: false`); every `built: true` entry is
   a reviewed exception.
5. `package.json`(s) + root `yarn.lock` are committed together and their diff reviewed,
   with unexplained additions paused.
6. Unverifiable or suspicious packages are escalated to the user, not installed.
