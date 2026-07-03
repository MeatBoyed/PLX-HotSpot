---
marp: true
theme: default
paginate: true
title: Release Engineering Plan
---

<!-- Marp deck. Render: `npx @marp-team/marp-cli docs/design/release-engineering-plan.md`
     or the Marp for VS Code preview. Slides are split by `---`. -->

# Release Engineering

### Test gates · branch governance · release notes · Dokploy deploy

AuraConnect monorepo — planning deck
Epic `docs/projects/2026-07-03--02`

---

## The problem

Shipping needs guard rails the repo doesn't have yet:

- **Failing tests reach GitHub** — no gate between "commit" and "pushed".
- **Releases are ad-hoc** — no versioning, no notes, no deliberate cut.
- **The deploy target is click-configured** — not reproducible from source.

**Goal:** a disciplined path from commit → release → deploy, where a red suite never
leaves the laptop and every release is recorded in source.

---

## Branch model

```
   feature/* ──▶ test ─────────────▶ trunk (v3 → main)
                  │                     │
                  ▼                     ▼
             deploy to test          release
             (Dokploy/Proxmox)      (tagged + notes)
```

- **feature branches** — where work happens; branched off `test`, merged back when ready.
- **`test`** — integration. A merge here **deploys to the test environment**. The **only**
  branch allowed to merge into trunk.
- **trunk** — `v3` treated as `main` today. **Strong rec: finish the ADR 0006 rename.**

---

## Gate 1 — local hooks (lefthook)

Fast feedback, before anything leaves the machine:

| Hook | Runs | Why |
|---|---|---|
| **pre-commit** | `yarn test:dev` (unit) | near-instant, catches most breakage |
| **pre-push** | `yarn test:e2e` (e2e) | heavier; fails fast if local dev isn't up |
| **commit-msg** | commitlint | Conventional Commits → notes align with history |

`lefthook` chosen for a **polyglot** (.NET + Node) monorepo — parallel, language-aware.

---

## Gate 2 — server CI (belt **and** braces)

Local hooks are bypassable (`--no-verify`) — so add a server-side belt:

- **GitHub Actions runs the unit gate (`test:dev`)** on push/PR as a **required check**.
- **e2e stays local** (pre-push) — it depends on a running local stack and is hard to
  reproduce in the cloud. The pre-push hook is its enforcement point.

```
 belt   → lefthook (local)     : unit + e2e + commit-msg
 braces → GitHub Actions (CI)  : unit gate, required check
```

---

## Merge discipline

**Into the trunk only from `test`** — shipped as three things, not tribal knowledge:

1. **Policy** — an ADR recording the rule + rationale.
2. **Reproducible tooling** — a committed GitHub **ruleset** (JSON / `gh` script) so the
   protection is re-appliable, not hand-clicked.
3. **Setup guide / checklist** — the human steps to wire GitHub + branches.

Rules target `v3` today, move to `main` on the ADR 0006 rename.

---

## Release notes — recorded in source

- **One markdown note per release** in **`docs/releases/`**, committed to source.
- **Generated from Conventional Commits** since the last release (history ↔ notes align).
- **Repo-wide SemVer**; a release is cut on a **`test → trunk`** promotion.
- The **release PR is created interactively from the Claude Code terminal**.

> The **release *skill*** (a `SKILL.md` wrapping the flow) is **deferred** — but the script
> is built skill-ready. Release tooling *will* be accompanied by a release skill.

---

## Deploy — Dokploy IaC (spike findings)

- **A merge into `test` deploys to the test environment** on Dokploy (Proxmox).
- **IaC via Dokploy's official API/CLI** — `x-api-key` auth; ~449 CLI commands generated
  from the OpenAPI spec; declares projects, apps, and domains.
- **No official Terraform provider.** Community providers exist but are
  fragmented/unverified, so the API/CLI is the stable foundation.
- Apps deploy from the repo's own **Dockerfiles / Compose** (Dokploy Dockerfile/Compose
  service types — **no Nixpacks**).

---

## Deploy — builds on Proxmox (spike findings)

- **Builds run on the same Proxmox host as Dokploy**, which is what we want.
- But building on the Dokploy host is RAM/CPU-heavy and can **freeze it**, taking running
  apps down with it.
- **Recommendation: a dedicated build-server VM/LXC on the same Proxmox**, with Dokploy
  building remotely over SSH — same physical host, isolated build load.

```
 Proxmox host
 ├── VM: Dokploy (deploy)  ◀── SSH ──┐
 └── VM/LXC: build server ───────────┘  builds images, isolated load
```

---

## The plan is 1 epic + 3 slices

```
2026-07-03--02  EPIC  Release engineering (shared decisions + Dokploy spike)
   ├── --03  Test gates + branch governance   (lefthook · CI · policy)
   ├── --04  Release-notes tooling            (docs/releases · conv-commits)
   └── --05  Dokploy deploy                   (guide · API/CLI IaC · builds)
```

Each child is executed + checkpointed on its own (strict TDD where it's code).

**Order:** `--03` → `--04` (needs commitlint from --03) → `--05` (independent).

---

## Sequencing + prerequisites

- **Trunk first** — best executed after the **ADR 0006 `v3` → `main`** rename; until then,
  treat `v3` as `main` (rules target `v3`).
- **Builds on the existing gates** — `test:dev` (79) + `test:e2e` (4) already green from
  the AAA slice; the hooks/CI wire to these, no new test infra.
- **New deps** (lefthook, commitlint, any changelog tool) go through **`supply-chain-guard`**,
  exact-pinned (ADR 0002).

---

## Open decisions (per slice)

- **--03** — ruleset shape (committed JSON vs `gh` script); commit types/scopes.
- **--04** — release file convention (`vX.Y.Z.md` + git tag?); version-bump source
  (auto from commit types vs manual); bespoke generator vs `conventional-changelog`.
- **--05** — build topology (dedicated build VM vs on the Dokploy VM); which apps deploy
  (`api`, clients — **stubs never**); secrets handling.

---

## Next steps

1. Land the **ADR 0006 trunk migration** (retire `main`, promote `v3`).
2. `execute-slice --03` — hooks + CI + branch policy.
3. `execute-slice --04` — release-notes tooling.
4. `execute-slice --05` — Dokploy setup + IaC.
5. Follow-ups: lint/format hooks, the **release skill**, per-app versioning.

**Guarantee at the end:** no red build reaches GitHub, every release is in source, and the
deploy target rebuilds from code.
