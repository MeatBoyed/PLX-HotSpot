# Epic 2026-07-03--02 — Release engineering (tooling bootstrap)

**Status:** planning (epic — executed via child slices, not directly)
**Started:** 2026-07-03
**Finished:** —

> **This is an epic, not a single executable slice.** It holds the shared plan, the
> ratified decisions, and the Dokploy research spike. The work is executed through focused
> child slices (each `execute-slice`d + checkpointed on its own):
>
> - **[2026-07-03--03](2026-07-03--03--test-gates-and-branch-governance.md)** — Test gates
>   (lefthook: pre-commit unit / pre-push e2e / commit-msg commitlint) + GitHub Actions unit
>   CI + branch governance (`test`→trunk only; policy ADR + ruleset tooling + checklist).
> - **[2026-07-03--04](2026-07-03--04--release-notes-tooling.md)** — Release-notes tooling
>   (`docs/releases/` per-release markdown from Conventional Commits; release skill deferred).
> - **[2026-07-03--05](2026-07-03--05--dokploy-deploy-iac.md)** — Dokploy deploy: setup
>   guide + API/CLI IaC + build-on-Proxmox topology.
>
> Suggested order: `--03` (gates/governance) → `--04` (release notes, needs commitlint from
> --03) → `--05` (Dokploy, independent). Best started after the ADR 0006 `v3`→`main` rename.
> Sections below (DoD, Decisions, Spike, Open questions) are the **shared reference** the
> children link back to.

## Plan reference

Builds on the monorepo bootstrap (branch `auraconnect-monorepo-bootstrap`) and the AAA
slice ([2026-07-03--01](2026-07-03--01--aaa-emulation-dev.md)), which delivered the two
test gates this slice hangs off: `yarn test:dev` (unit/integration) and `yarn test:e2e`
(Playwright). Interacts with the trunk migration ([ADR 0006](../adr/0006-trunk-migration-v3-to-main.md)):
this slice assumes a real `main`.

Goal: bootstrap the tooling for a disciplined release flow so **failing tests never reach
GitHub** and **releases are cut deliberately, with notes committed to source**.

**Definition of done (draft — core decisions ratified at planning, see Decisions):**
- **Local test gate via git hooks** — **pre-commit runs unit (`yarn test:dev`)**;
  **pre-push runs e2e (`yarn test:e2e`)**. A red suite blocks the commit/push. Lint +
  auto-format come later.
- **Server-side belt (GitHub Actions)** — CI runs the **unit gate (`test:dev`)** on
  push/PR as a required status check, guarding against locally-bypassed hooks
  (`--no-verify`). **e2e stays local-only** (it depends on a running local stack; hard to
  reproduce in the cloud) — the pre-push hook is its enforcement point.
- **Branch model + merge protection** — short-lived **feature branches** off `test`;
  **`test`** (integration — a merge here deploys to the test env on Dokploy/Proxmox); and
  the release trunk, currently **`v3`, treated as `main`** until ADR 0006's rename lands.
  Merges into the release trunk are allowed **only from `test`**, enforced by branch
  protection / rulesets
  and shipped as: a written **policy (ADR)** + **reproducible tooling** (a committed
  ruleset / `gh` script) + a **setup guide/checklist**.
- **Release-notes generation** — a script generates **one markdown note per release** into
  a dedicated folder (`docs/releases/`), from the **Conventional Commits** since the last
  release, **committed to source** on a `test → trunk` promotion; the release PR is created
  **interactively from the Claude Code terminal**. (The release *skill* wrapping this is a
  documented follow-up — see Deferred.)
- **Dokploy deploy target reproducible** — a setup guide/checklist for the Dokploy
  instance (on the Proxmox Docker build env) that `test` deploys to, and IaC for its
  projects/apps/domains so the target can be recreated from source (approach TBD).
- Recorded as ADR(s) where the choice is durable (branch model + merge policy; release
  process/tooling; Dokploy IaC approach).

## Working scope

Bootstrap the release-management tooling on top of the existing gates. Decomposes into:

- **A — Git hook harness**: a hook manager wired to run `yarn test:dev` (and `test:e2e`)
  so a red suite blocks the commit/push locally. Fast feedback vs coverage trade-off
  (which hook runs which gate) is a first-checkpoint decision.
- **B — Branch model + merge protection**: define + document feature-branches / `test` /
  `main`; enforce
  "into `main` only from `test`" via GitHub branch protection / rulesets (+ any local
  guard). ADR for the policy.
- **C — Release-notes generator**: a script that, from the **Conventional Commits** since
  the last release, writes **one markdown note per release into a dedicated folder**
  (e.g. `docs/releases/`), committed to source; plus the interactive `test → trunk`
  release-PR flow driven from the terminal. **The release *skill* (a `SKILL.md` wrapping
  this flow) is deferred** — but see the strong note in Deferred: release tooling is
  expected to be accompanied by a release skill.
- **D — Dokploy setup guide + IaC**: a setup guide/checklist for the Dokploy instance on
  Proxmox (incl. the build topology), and **API/CLI-based infrastructure-as-code** for the
  Dokploy projects/apps/domains so the deploy target is reproducible (spike resolved the
  approach — see Decisions). Builds run on the same Proxmox as Dokploy, ideally on a
  dedicated build-server VM to avoid the host-freeze risk. Uses the repo's existing
  Dockerfiles/compose (Dokploy Dockerfile/Compose service types; no Nixpacks). Durable →
  its own ADR.

Explicitly a **tooling bootstrap**. The `test`-branch → Dokploy deploy is defined as
reproducible config (D); the underlying Proxmox host provisioning + per-app runtime tuning
are not this slice.

## Assumptions going in

- The two gates exist and are green on this branch: `yarn test:dev` (79) + `yarn test:e2e`
  (4). Hooks wire to these, not to new test infra.
- `main` exists as the real trunk (per ADR 0006) — or this slice lands just after that
  migration. The merge-protection rules target the post-migration `main`.
- Docker is available on dev machines (the e2e gate needs it) — so an e2e hook has a real
  cost budget, not free.
- Dependency additions (hook manager, any changelog tool) go through `supply-chain-guard`
  and pin exact per ADR 0002.

## Decisions made during the slice

Slice-local decisions only. Durable ones (branch model + merge policy, release process,
hook-tool choice if it becomes a convention others depend on) → an ADR under `docs/adr/`,
linked here.

### Ratified at planning (2026-07-03)

- **Hook split**: pre-commit → unit (`test:dev`); pre-push → e2e (`test:e2e`). e2e is too
  heavy for pre-commit and depends on a running local stack — pre-push fails fast if local
  dev isn't up.
- **Server CI = GitHub Actions runs the unit gate only** (`test:dev`), as a required check,
  to guard against `--no-verify`. **e2e is deliberately local-only** (hard to run in the
  cloud; the pre-push hook is its gate). This makes the guarantee belt-and-braces: local
  hooks (belt) + server unit CI (braces), with e2e covered locally.
- **Merge policy is a deliverable, not just config**: this slice ships the ADR (policy) +
  reproducible tooling to apply the GitHub rulesets + a setup guide/checklist — so the
  "into the release trunk only from `test`" rule is reproducible, not tribal knowledge.
- **Release trunk = `v3`, treated as `main` for now**, with a strong recommendation in the
  docs to complete the [ADR 0006](../adr/0006-trunk-migration-v3-to-main.md) rename. Rules
  target `v3` today and move to `main` on rename.
- **Hook manager = `lefthook`** — polyglot/parallel, the right fit for a .NET + Node
  monorepo (runs per-language hooks cleanly) over husky/simple-git-hooks. New dep →
  `supply-chain-guard`, exact pin.
- **Release-notes model = one markdown note per release in a dedicated folder**
  (e.g. `docs/releases/`), **derived from Conventional Commits** so commit history aligns
  with the notes. Enforce the commit convention with a **commitlint `commit-msg` hook**
  (via lefthook) so notes are reliably generatable. Repo-wide SemVer version (single
  version for the monorepo). Release cut on `test → trunk` promotion.

### Spike: Dokploy IaC + build topology (2026-07-03)

Research spike to de-risk work item D. Findings:

- **IaC substrate — use the official Dokploy API/CLI, not a Terraform provider.** Dokploy's
  first-party automation surface is its **REST API** (`/api`, JWT/`x-api-key` token from
  `/settings/profile`) plus an official **CLI** (auto-generated from the OpenAPI spec,
  ~449 commands covering every endpoint) — create projects/apps/domains/env/tasks
  programmatically. There is **no official Terraform provider** (community ones exist —
  automindz-solutions, j0bIT, ahmedali6, TheFrozenFire — but they're fragmented and
  unverified; Pulumi is an open issue). **Decision (proposed):** base D's IaC on the
  **API/CLI** — committed declarative config + a thin apply script + the setup checklist —
  as the stable foundation; optionally evaluate ONE community TF provider later as a nicer
  declarative layer, but don't depend on it. Durable → ADR.
- **Builds run on the Dokploy host by default**, with three execution contexts: **local**
  (on the Dokploy host), **remote** (over SSH), and dedicated **build servers**. Build
  types: Nixpacks (default), Dockerfile, Railpack, Buildpacks; **docker-compose is a
  supported service type**. The repo already ships Dockerfiles (`api/`, stubs) +
  compose → use the **Dockerfile / Docker Compose** service types; **no Nixpacks needed**.
- **Building on the Dokploy host is RAM/CPU-heavy and can freeze it** (taking running apps
  down); Dokploy's documented mitigation is a **dedicated build server** or CI-side builds.
- **"Build in Proxmox, same Proxmox as Dokploy" → a dedicated build-server VM/LXC on the
  same Proxmox host** (Dokploy remote build over SSH). This keeps builds on the same
  physical Proxmox the user wants, while isolating build load from the deploy VM — the
  documented way to avoid the freeze risk. Simpler fallback: build on the Dokploy VM
  itself, sized for builds (accept contention). Topology choice = an open question below.

### Still to ratify at first checkpoint

- **Build topology** — dedicated build-server VM/LXC on the Proxmox host (isolated,
  recommended) vs building on the Dokploy VM directly (simplest). Both satisfy "same
  Proxmox".
- **Release folder name + file convention** — `docs/releases/vX.Y.Z.md`? and whether the
  version is git-tagged as well as filed.
- **Version granularity** — repo-wide (assumed) vs eventual per-app (`api` vs clients);
  defer per-app unless needed.

## Deferred / pushed forward

- **Dokploy + Proxmox deploy pipeline** — the actual build/deploy wiring; this slice only
  bootstraps the release *tooling* and branch model it plugs into.
- **Release skill (`SKILL.md`)** — DEFERRED this slice, but a **strong forward-commitment**:
  the release tooling (C) is designed to be wrapped by a Claude Code **release skill** that
  drives the interactive `test → trunk` release-PR from the terminal (compute range since
  last release → generate the per-release markdown note → commit it → open the PR). Build
  the script (C) skill-ready; author the skill (`skill-author`) in a follow-up.
- **Lint + auto-format hooks** — added after the test gate lands (the brief sequences them
  "later").
- **e2e in the cloud** — NOT attempted; e2e is local-only (pre-push hook). Only the unit
  gate runs in GitHub Actions.
- **Dokploy/Proxmox deploy pipeline** — infra wiring the branch model plugs into, not the
  tooling this slice bootstraps.

## Open questions

Resolved at planning (see Decisions → Ratified):
- ~~e2e in pre-commit is expensive~~ → **e2e at pre-push, unit at pre-commit.**
- ~~Local hooks bypassable~~ → **GitHub Actions runs the unit gate server-side** (braces);
  e2e stays local (pre-push).
- ~~Branch protection is config not code~~ → **ship ADR + reproducible ruleset tooling +
  setup checklist.**
- ~~Interaction with ADR 0006~~ → **stay on `v3`, treat it as `main`, docs strongly
  recommend completing the rename.**

Resolved at planning (2026-07-03, round 2):
- ~~Hook manager~~ → **lefthook**. ~~Release-notes source + versioning~~ → **per-release
  markdown in `docs/releases/`, Conventional Commits + commitlint, repo-wide SemVer.**
  ~~The release skill~~ → **deferred** with a strong forward-commitment (see Deferred).

Still open:

- **GitHub Actions + local-integration Docker** — `test:dev` spins throwaway
  Postgres/MariaDB containers; confirm the Actions runner provides Docker so the unit gate
  runs unchanged in CI (it should on `ubuntu-latest`).
- ~~**Dokploy IaC approach**~~ → RESOLVED by the spike: **official API/CLI-based IaC**
  (committed config + apply script + checklist); community Terraform provider optional
  later, not the foundation. Record as ADR.
- **Scope split (still to decide)** — with D added the slice has five work items (A hooks,
  B branch policy, C release notes, D Dokploy IaC + build topology). D is deploy-infra,
  loosely coupled to the release tooling. Recommendation: **do the spike + ADR + setup
  guide/checklist + a minimal API/CLI IaC skeleton here; if the full per-app IaC +
  build-server provisioning grows, split it into a sibling deploy slice.** Confirm at
  execute time.
- **Dokploy/Proxmox provisioning boundary** — assume the Dokploy instance is already
  running on Proxmox (IaC declares projects/apps/domains); standing up Dokploy + the
  build-server VM is host provisioning, covered by the setup guide, not the IaC code.

## Learnings

(Fill in as you discover them.) Durable knowledge this slice produces about the tooling,
the release process, or the repo.

- ...

## Retrospective

(Fill in at wrap-up.) What worked, what we'd do differently, what surprised us.
