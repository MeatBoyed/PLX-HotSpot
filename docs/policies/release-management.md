# Release Management Policy

**Status:** Draft
**Applies to:** the AuraConnect monorepo
**Related:** epic [2026-07-03--02](../projects/2026-07-03--02--release-management-tooling.md);
slices [--03](../projects/2026-07-03--03--test-gates-and-branch-governance.md) /
[--04](../projects/2026-07-03--04--release-notes-tooling.md) /
[--05](../projects/2026-07-03--05--dokploy-deploy-iac.md);
[ADR 0006](../adr/0006-trunk-migration-v3-to-main.md) (trunk); ADR 0002 (dependencies).

## Purpose

This policy defines how a change travels from a developer's machine to a released,
deployed build. It guarantees that a failing test never reaches GitHub and that every
release is deliberate and recorded in source.

## Branch model

Two long-lived branches and short-lived feature branches:

- **feature branches** — where the work happens. An engineer branches off `test`, builds,
  and merges back when the change is ready.
- **`test`** — integration. Feature branches merge here, and each merge **triggers a deploy
  to the test environment** (Dokploy on Proxmox). `test` is the **only** branch permitted to
  merge into the trunk.
- **trunk** — released code only. The trunk is `main`. It is currently `v3` pending the
  ADR 0006 rename, and this policy treats `v3` as the trunk until that rename lands.

## Quality gates

A change passes two layers of gate before it can be released.

**Local (required, via lefthook):**

- **pre-commit** runs the unit suite (`yarn test:dev`); it must pass to commit.
- **pre-push** runs the end-to-end suite (`yarn test:e2e`); it must pass to push.
- **commit-msg** rejects any message that does not follow Conventional Commits.

**Server (required checks, GitHub Actions):**

- The unit suite runs on every push and pull request and must pass before a merge.
- End-to-end tests do not run in CI. They depend on a running local stack that is hard to
  reproduce in the cloud, so they are enforced locally at pre-push.

Bypassing the local hooks (`--no-verify`) is not permitted. The server-side unit check is
the backstop that catches a bypassed hook.

## Merge rules

- Feature branches merge into `test` via pull request with all required checks green.
- The trunk accepts merges **only from `test`**, **only via pull request**, and **only
  with all required checks green**.
- No branch is pushed directly to `test` or the trunk.
- Branch protection enforces these rules. The ruleset is committed to the repository and
  applied from source, so the protection is reproducible rather than hand-configured.

## Commit conventions

Every commit follows Conventional Commits, enforced by the commit-msg hook. The commit type
is load-bearing, driving both release-note generation and the version bump.

## Release process

- A release is cut when `test` is promoted to the trunk.
- **Versioning** is repo-wide SemVer. The bump is derived from the commit types in the
  range since the previous release.
- **Release notes** are one markdown file per release under `docs/releases/`, generated
  from the Conventional Commits in that range and committed to source as part of the
  release pull request.
- The release pull request (`test` → trunk) is created interactively from the Claude Code
  terminal. A release skill will wrap this flow; until it exists, the flow is run by hand
  against the same steps.

## Deployment

- A merge into `test` deploys to the test environment on Dokploy (Proxmox).
- Images build on that same Proxmox host from the repository's own Dockerfiles and Compose
  files, ideally on a dedicated build server so build load stays off the deploy node.
- The Dokploy target is defined as infrastructure-as-code through the Dokploy API/CLI and
  is reproducible from source.

## Exceptions

Any deviation from this policy, such as an emergency hotfix straight to the trunk or a
skipped gate, requires explicit owner approval and must be recorded in a linked issue or a
note in the release entry. Exceptions are rare by design. The gates exist precisely for the
moments under pressure, when the temptation to skip them is highest.
