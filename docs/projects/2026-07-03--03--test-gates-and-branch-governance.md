# Slice 2026-07-03--03 — Test gates + branch governance

**Status:** planning
**Started:** 2026-07-03
**Finished:** —

## Plan reference

Child of the release-engineering epic
([2026-07-03--02](2026-07-03--02--release-management-tooling.md)) — see it for the shared
ratified decisions (hook manager, hook split, CI scope, trunk = `v3`-as-`main`). This slice
delivers the **first CI gate + merge discipline**: failing tests never reach GitHub, and
the release trunk is only reachable from `test`.

**Definition of done:**
- **lefthook** installed + wired: **pre-commit → `yarn test:dev`** (unit), **pre-push →
  `yarn test:e2e`** (e2e, fails fast if local dev isn't up), **commit-msg → commitlint**
  (Conventional Commits, so history aligns with release notes).
- **GitHub Actions** runs the **unit gate (`test:dev`)** on push/PR as a **required status
  check** — the server-side belt against locally-bypassed hooks (`--no-verify`). e2e stays
  local (pre-push).
- **Branch model + merge protection**: feature branches → **`test`** (integration; a merge
  here deploys to the test env) → trunk (`v3`-as-`main`). Feature branches merge into `test`
  via PR; the trunk accepts merges **only from `test`**. Shipped as an **ADR** (policy),
  **reproducible ruleset tooling** (committed ruleset JSON / `gh` script), and a **setup
  guide/checklist**.

## Working scope

Work items A (git hook harness) + B (branch governance + CI) from the epic. Create the
`test` branch (it doesn't exist remotely yet); feature branches are short-lived and
per-change. New deps (lefthook, commitlint) via `supply-chain-guard`, exact-pinned
(ADR 0002).

## Assumptions going in

- The gates exist + green on this branch: `yarn test:dev` (79) + `yarn test:e2e` (4).
- Docker is available locally (e2e/pre-push) and on the Actions runner (`ubuntu-latest`
  provides Docker so `test:dev`'s throwaway containers run unchanged).
- Trunk is `v3` treated as `main` (ADR 0006 rename recommended first).

## Decisions made during the slice

Shared decisions live in the epic; slice-local ones here. Durable (branch policy) → ADR.

- (from epic) lefthook; pre-commit unit / pre-push e2e / commit-msg commitlint; CI = unit
  only; trunk `v3`-as-`main`.

## Deferred / pushed forward

- **Lint + auto-format hooks** — after the test gate lands.
- **e2e in CI** — never; e2e is local-only (pre-push).

## Open questions

- **Ruleset shape** — committed GitHub **ruleset JSON** applied via `gh api`, vs a `gh`
  script, vs documented-only. Prefer a committed, re-appliable artifact.
- **Actions Docker** — confirm `test:dev`'s container tests run on `ubuntu-latest` as-is.
- **commitlint config** — `@commitlint/config-conventional` baseline; which types/scopes.

## Learnings

- ...

## Retrospective

(Fill in at wrap-up.)
