# ADR 0006 — Trunk migration: promote `v3` to `main` after the monorepo bootstrap

**Status:** Proposed
**Date:** 2026-07-03
**Deciders:** Alex Veldtman
**Scope:** monorepo

## Context

The monorepo bootstrap — the polyglot restructure, the `api/` subtree + legacy
`git-filter-repo` imports (ADR 0003), the dev orchestration (ADR 0004), and the
AAA-emulation slice — lives on the branch `auraconnect-monorepo-bootstrap`, **299 commits
ahead of `origin/v3`**. It lands on `v3` first (PR #10, base `v3`); it deliberately does
**not** target `main`, which is still the pre-monorepo product line.

The repository's default branch is `main`, but active development has moved to `v3`. That
mismatch is a standing hazard: new clones, CI defaults, PR bases, and branch protections
all point at a branch that no longer reflects the project. Once the monorepo bootstrap is
on `v3`, `v3` becomes the real trunk in everything but name.

The two branches have **diverged**, not fast-forwarded:

- Merge base: `d8e6f87`.
- `v3` carries **54 commits** not on `main`.
- `main` carries **1 commit not on `v3`**: `894bc35 feat: removed subvenue selection on
  splash page`.
- `main` is **not** an ancestor of `v3`.

So the migration is a rename **plus** a reconciliation, not a clean promotion — a blind
delete of `main` would lose `894bc35`.

## Decision

*(Proposed — to be ratified once PR #10 merges to `v3`.)*

We will **promote `v3` to the repository trunk `main`** after the monorepo bootstrap lands
on `v3`:

1. Reconcile old `main`'s divergence first (see open question below) — never delete
   `main` while it still has history not reachable elsewhere.
2. Rename `v3` → `main` (or point the default branch at the monorepo line), retire the
   old `main`.
3. Repoint the GitHub **default branch** and **branch-protection rules** at the new
   `main`; update any CI/base-branch assumptions.

## Open questions

- **Fate of old `main`'s orphan commit `894bc35`** — archive `main` as a tag (e.g.
  `archive/main-pre-monorepo`) so its history stays reachable, and/or cherry-pick the
  change onto `v3` if the "removed subvenue selection on splash page" behaviour is still
  wanted, versus dropping it as superseded by the monorepo. To be resolved at migration
  time; the guardrail is: **old `main` history must remain reachable (tag/archive) before
  any deletion.**

## Consequences

- The default branch finally reflects the monorepo, so clones/CI/PRs stop targeting a
  stale line.
- One-time churn: open PRs against old `main` or `v3` need retargeting; protection rules
  and any hard-coded base branches must be updated; contributors re-fetch.
- Because the branches diverged, this is a rename + reconcile, not a fast-forward — the
  orphan commit must be handled explicitly (above), which is why this is recorded rather
  than done silently.
- History from all three import tracks (ADR 0003) is preserved on the promoted trunk;
  archiving old `main` as a tag keeps the pre-monorepo line auditable.

## Alternatives considered

- **Force-push the monorepo onto `main`.** Overwrites `main`'s history (including
  `894bc35`) and rewrites the default branch out from under everyone — rejected;
  destructive and unreviewable.
- **Merge `v3` into `main`.** `main` is not an ancestor of `v3`, so this is an
  unrelated-histories merge that leaves a confusing two-headed graph and keeps the stale
  `main` name — rejected.
- **Keep `v3` as the trunk name.** Avoids a rename, but every tool and newcomer assumes
  `main`; the naming drift is a permanent papercut — rejected.
