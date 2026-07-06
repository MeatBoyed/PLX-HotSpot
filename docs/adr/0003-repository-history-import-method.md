# ADR 0003 — Import external code with history: subtree for `api/`, filter-repo for legacy

**Status:** Accepted
**Date:** 2026-07-01
**Deciders:** Alex Veldtman
**Scope:** monorepo

## Context

Two external code lines had to land in the monorepo (ADR 0001) **with usable
history** — needed both for blame and to reconstruct decisions (ADRs) after the fact:

1. The ASP.NET API from `MeatBoyed/AuraConnect` (branch `main`, 66 commits) → `api/`.
2. The legacy Next monolith from `MeatBoyed/PLX-HotSpot` branch `main`
   (`next-captive-portal-rd/`, ~212 commits) → `clients/legacy/captive-portal-and-admin/`.

A spike compared three methods (naive `checkout`+`mv`, `git subtree`, and
`git-filter-repo` + unrelated-histories merge). Findings: naive loses blame and
history; **subtree** keeps blame and full history but grafts imported commits behind
the import merge's second parent, so plain `git log -- <path>` shows only the import
(first-parent simplification) — the commits are still reachable via the second parent;
**filter-repo** rewrites imported commits so their paths already sit under the target
prefix, making `git log <path>`, `--follow`, and blame all resolve directly, at the
cost of an external tool.

## Decision

We will import **`api/` via `git subtree`** (full history, no `--squash`) and the
**legacy monolith via `git-filter-repo` + `git merge --allow-unrelated-histories`**,
renaming its path to `clients/legacy/captive-portal-and-admin/` during the rewrite.

Rationale for the split: legacy is a maintenance track where engineers run
`git log <path>` / `blame` daily, so its ergonomics justify the external
`git-filter-repo` dependency; `api/` is imported once and read mostly via tooling, so
subtree's built-in convenience wins and its `git log <path>` limitation is acceptable
(history remains reachable via the import merge's second parent).

## Consequences

- **Verified:** `api/` import — 66 commits reachable via the second parent, blame
  intact. Legacy import — clean merge, zero conflicts, `git log -- <path>` = 208,
  `--follow` works, blame resolves to original authors back to 2025-06-09. Both
  `next-captive-portal-rd` lineages coexist without collision.
- **Costs / follow-on:** `git-filter-repo` must be installed (via `brew` on this box;
  the raw-script fetch is blocked by the sandbox classifier). `api/` history needs the
  second-parent incantation for path-scoped log. The `auraconnect-api` git remote is
  kept for future `git subtree pull`; retire it when the source repo is decommissioned.
- Source repos can be retired or kept as read-only mirrors; the monorepo now owns the
  authoritative history.

## Alternatives considered

- **Subtree for both.** Rejected for legacy — hides `git log <path>`, which legacy's
  maintenance workflow relies on.
- **filter-repo for both.** Reasonable but adds the external-tool cost to `api/` for
  little gain, since `api/` isn't browsed by path-scoped log day to day.
- **Naive `checkout` + `git mv`.** Rejected — collapses history to one commit, loses
  blame; a home-rolled `filter-branch` variant also hit add/add root-file conflicts
  that filter-repo's path filter avoids.
