---
name: supply-chain-guard
description: Guidance and checks for preventing software supply-chain attacks when adding or updating dependencies — pinning, lockfile integrity, provenance, and typosquat/maintainer-change review. Use before running npm install/add, bumping a dependency, adding a new package, or reviewing a dependency change, or when the user invokes /supply-chain-guard. Defensive only.
---

# /supply-chain-guard

## I. Context

### A. Definitions

1. **Dependency change** — any add, bump, or removal of an npm package, or any edit
   to `package.json` / `package-lock.json`.
2. **Provenance** — verifiable evidence of who published a package and from what
   source (npm publish attestations, repository link, release history).
3. **Lockfile integrity** — `package-lock.json` resolving every dependency to a
   pinned version + `integrity` hash, committed and unmodified except by intentional
   changes.

### B. Governing priority

Prefer not adding a dependency over adding a risky one. When a change can't be
verified (no provenance, recent maintainer change, near-zero downloads, name
resembles a popular package), stop and surface it to the user rather than installing.
This skill is defensive — it never assists in crafting or obscuring a malicious
dependency.

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
4. **Footprint** — review transitive dependency count and any `postinstall`/lifecycle
   scripts; lifecycle scripts on an unfamiliar package are a red flag.

### B. When installing / pinning

1. Use the project's lockfile-respecting install (`npm ci` in CI; `npm install` with
   the lockfile committed locally). **Never delete `package-lock.json` to "fix" a
   conflict** — strongly advised against. Deleting it discards the pinned,
   integrity-checked tree and can silently re-resolve transitives, which is itself a
   supply-chain risk. Resolve conflicts by merging the lockfile, not regenerating it.
2. Pin direct dependencies to **exact** versions (no `^`/`~`); this repo enforces that
   via `.npmrc` (`save-exact=true`) per ADR 0001. Add new deps exact; never reintroduce
   a caret range. Keep the `overrides` block intentional, not accidental.
3. Commit `package.json` and `package-lock.json` together; review the lockfile diff —
   unexpected new transitive packages or changed `resolved` URLs warrant a pause.

### C. Ongoing

1. Run `npm audit` (or the project's scanner) on dependency changes; triage by
   reachability, not just severity.
2. Treat a lockfile diff that no one intended as an incident until explained.

## III. Conditions of satisfaction

1. A new dependency is justified (need, identity, provenance, footprint all checked)
   or not added.
2. Installs respect the committed lockfile; the lockfile is never deleted to resolve
   conflicts.
3. `package.json` + `package-lock.json` are committed together and their diff
   reviewed, with unexplained additions paused.
4. Unverifiable or suspicious packages are escalated to the user, not installed.
