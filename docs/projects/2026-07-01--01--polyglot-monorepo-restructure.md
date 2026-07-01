# Slice — Polyglot monorepo restructure (ASP.NET `api/` + yarn-workspace `clients/` on v3)

**Status:** in-progress
**Started:** 2026-07-01
**Finished:** —

## Plan reference

Consolidate the AuraConnect system — currently spread across two branches of
`MeatBoyed/PLX-HotSpot` plus a separate `MeatBoyed/AuraConnect` repo — into one
polyglot monorepo, built on the **`v3`** branch (which is 54 commits ahead of
`main` and is the live development line; `main` is stale as of 2026-06-02).

**Why this slice exists:** the `bootstrap/claude-code-dx` work (docs, skills, dev
tooling, capability assessment) was built on `main`, unaware that `v3` had already
forked at the same base (`d8e6f87`) and taken the codebase in a different
structural direction — a 3-tier split. This slice realigns onto `v3` and gives the
whole system one home with root tooling that spins everything up together.

**Target layout:**

```
/api/                → AuraConnect ASP.NET (net10.0) — subtree from MeatBoyed/AuraConnect
/clients/            → yarn workspaces
  portal/            → v3 thin captive portal (was next-captive-portal-rd on v3)
  admin/             → v3 admin panel        (was auraconnect/ on v3)
  monitor/           → v3 monitoring app     (was monitor-auraconnect.co.za on v3)
  portal-legacy/     → main's monolith portal+admin — FIRST-CLASS but marked legacy
  packages/          → shared, extracted later (api-types, ui, config)
/  root dev tooling  → one command brings up api + db + all clients
```

**Definition of done (draft — confirm in checkpoint):**
- One repo, on a branch off `v3`, containing `api/` (with history via subtree),
  `clients/portal`, `clients/admin`, `clients/portal-legacy` (each with git history
  preserved via `git mv` / subtree).
- Yarn workspaces resolve; `yarn install` at root works; each app builds.
- Root dev tooling (compose + Make/Turbo or equivalent) brings up API + Postgres +
  all three clients together.
- ADR recorded for the monorepo layout AND for the npm→yarn package-manager switch
  (supersedes/updates ADR 0001).
- `docs/` (capabilities, adr, projects) and the bootstrap DX tooling carried onto
  the new line, re-pointed at the new layout.
- Legacy app clearly marked (README banner + isolated deps + own compose service),
  still buildable/deployable for live sites.

## Working scope

Polyglot monorepo restructure: bring the ASP.NET API into `api/` via git subtree,
relocate the v3 thin portal, admin app, and monitoring app into `clients/` as yarn
workspaces, import the legacy monolith as a first-class-but-marked
`clients/portal-legacy` workspace, and add root dev tooling to run the whole system
at once. (Four Next clients total: portal, admin, monitor, portal-legacy.) Built on a
fresh worktree checked out from `v3`. Planning only in this pass — no code until
the plan is reviewed at checkpoint.

**Root cleanup** (part of the restructure): delete the dormant legacy/parallel
trees that sit loose at v3 root — they are dead and not carried into the monorepo
(user-confirmed 2026-07-01). Target set (all present at v3 root):
`captive-portal-design-v1/`, `captive-portal.zip`, `hono-captive-portal/`,
`hotspot/`, `login.html`, `login-original.html`, `login-php-mahmut.html`,
`status-template.html`, `nginx config`. Action: `git rm -r` on the monorepo branch
(history stays reachable pre-delete; nothing to preserve going forward). These are
the same trees the abandoned bootstrap attempt had moved into `archive/`.

**Root dev-stack shape** (part of "run the whole system at once"):
- One Postgres server, **two logical databases** (legacy + new) seeded via an
  init script, so the legacy monolith and the new API/portal run in parallel
  locally without colliding.
- Full local system up with one command: API + Postgres(×2 DB) + all clients.

Local AAA test fidelity (RadiusDesk + MikroTik emulator) is a **stated goal** —
engineers report the AAA/MikroTik seam is the hardest thing to test and it has no
coverage. Its design is captured below, but the build is split into a **follow-up
slice** (see Deferred) to keep this restructure focused.

## Assumptions going in

- `v3` is the correct base: it already contains the thin portal + admin panel with
  full git history, so relocating them is `git mv` (history preserved).
- Monorepo base = **this** repo (`PLX-HotSpot`, 295 commits on v3 — most history +
  both Next apps). The ASP.NET repo (`AuraConnect`, 66 commits) is imported into it.
- The two Next apps on v3 already consume the ASP.NET API via generated OpenAPI
  types — the client/server split is real, not aspirational.
- Legacy monolith (`main`'s `next-captive-portal-rd`: portal + admin + Prisma +
  RadiusDesk/MikroTik/PayFast) is maintenance-track: bugfixes yes, no new shared-
  package coupling. It keeps its own Postgres and direct integrations.
- Yarn workspaces can still honour exact-version pinning (`.yarnrc.yml`), so ADR
  0001's *intent* (no caret drift, deliberate updates) survives the tooling switch.
- The bootstrap branch's root-relocation of the app is superseded — the app returns
  to a subfolder under `clients/`.
- Local Postgres: **one server, two logical DBs** (legacy + new), created by an
  init script (the ASP.NET repo already has `init-db.sql` — extend that pattern).
  Legacy keeps its Prisma-managed schema; new keeps its EF-migrated schema.
- A dockerized RadiusDesk gives both the CakePHP provisioning REST API *and* the
  FreeRADIUS `radacct`/`radacct_history` accounting tables the API reads — one
  container satisfies both integration paths.

## Decisions made during the slice

Slice-local decisions only. Cross-cutting ones go into the repo's decisions log
(`docs/adr/`) — link the entry here.

Confirmed with user at planning:
- **Package manager: yarn workspaces** (user choice, over npm/pnpm). → needs an ADR
  that updates/supersedes **ADR 0001** (npm `save-exact`, `.npmrc`,
  supply-chain-guard, "never delete package-lock.json") for the yarn world.
- **API import: git subtree** — full code + history merged into `/api`; the source
  repo can be retired or kept as a read-only mirror.
- **Legacy app: first-class workspace member**, loudly marked legacy (README banner,
  own compose service, dep-isolated), not parked outside the workspace graph.
- **MikroTik emulation: two-tier, one test suite.** A lightweight RouterOS-REST
  **stub** (fast, deterministic, CI default) + **CHR-under-QEMU** as an opt-in
  compose profile (high-fidelity, pre-release / seam-debug). Confirmed with user.
- **E2E runs against EITHER backend, unchanged.** One e2e suite, backend chosen by
  env var / compose profile (stub vs CHR) — no test edits to switch. Contract:
  green-against-stub must predict green-against-CHR; the CHR run is the drift-catcher
  that proves the stub stayed faithful. CI default = stub; CHR = opt-in/nightly.
  (Same swap-the-backend shape can extend to RadiusDesk later.)
- **Branch & worktree:** build on a new branch **`auraconnect-monorepo-bootstrap`**
  off `v3`, checked out in its **own worktree under `~/lab`** (e.g.
  `~/lab/auraconnect-monorepo-bootstrap`). Once the structure is in place, Claude
  runs from that worktree folder, not this one. `main`/`v3` stay untouched until the
  monorepo is proven.
- **Package manager: Yarn Berry** (v4) with **`nodeLinker: node-modules`** — Berry's
  workspaces / protocols / constraints / `workspaces foreach` without PnP's Next-16
  and tooling-compat friction. (Revisit PnP later if desired.)
- **Dev orchestration: hybrid, no-rebuild-on-edit.**
  - Docker: backing services (Postgres w/ 2 DBs; later RadiusDesk + MikroTik) **+ the
    .NET API** via `dotnet watch` + bind mount (hot reload, no image rebuild).
  - Node clients: run on **host** via **`concurrently`** + Yarn Berry workspaces
    (fastest HMR; matches team preference).
  - Root `dev`: `docker compose up -d` (infra + API) → `concurrently` the client dev
    servers. One command, whole system.
  - No `docker build` on source edits — only on dependency/manifest changes. Bind
    mounts + `dotnet watch`, with **`docker compose watch`** (`develop.watch`:
    `sync` for source, `rebuild` only on manifest change) available for a
    fully-in-container parity mode.
- **Legacy history import: `git-filter-repo` + unrelated-histories merge.** Decided
  by spike (2026-07-01, see Learnings). Recipe:
  ```
  # 1. fresh clone of the legacy source line (main)
  git clone --single-branch --branch main <PLX-HotSpot> legacy-fr && cd legacy-fr
  # 2. rewrite: keep only the app subdir, rename it to the target path
  git filter-repo --path next-captive-portal-rd/ \
                  --path-rename next-captive-portal-rd/:clients/portal-legacy/
  # 3. graft onto the monorepo branch (checked out from v3)
  git remote add legacy ../legacy-fr && git fetch legacy main
  git merge --allow-unrelated-histories --no-edit legacy/main
  ```
  Prereq: `git-filter-repo` on PATH (single Python script; `pip install
  git-filter-repo` needs `--break-system-packages` on this box, or drop the script
  on PATH). Result proven: clean merge (no conflicts), legacy coexists with the thin
  `next-captive-portal-rd`, and `git log` + `git log --follow` + `git blame` all
  resolve full history (back to 2025-10-04, original authors) at
  `clients/portal-legacy/`.

To be recorded as ADRs (cross-cutting — link here once written):
- ADR: polyglot monorepo layout (`api/` + `clients/`).
- ADR: npm → yarn workspaces + revised pinning/supply-chain policy.

## Deferred / pushed forward

What we explicitly are not doing this slice, and where it picks up.

- **Auth-model reconciliation.** API uses JWT + ASP.NET Identity; admin panel uses
  Clerk. Two identity systems — known gap, out of scope here. Picks up in a
  dedicated auth slice once the monorepo exists.
- **Local AAA emulation stack (RadiusDesk + MikroTik) — its own follow-up slice.**
  Depends on this monorepo landing. Design captured in Open questions. Rationale
  for splitting: it's substantial (dockerizing RadiusDesk, choosing/building the
  MikroTik emulation tier, seeding fixtures, wiring the API's `RadiusConfig`/
  MikroTik settings to point at local emulators) and shouldn't gate the structural
  move. This restructure only needs to leave room for it in the root compose.
- **Extracting shared packages** (`packages/api-types`, `ui`, `config`). Structure
  leaves room (`clients/packages/`) but extraction is a follow-up slice.
- **Migrating live sites off the legacy system.** Not this slice — legacy stays
  deployable; cutover is its own initiative.
- **Retiring `main`.** Keep `main` intact until the monorepo branch is proven; the
  branch/rename/default-branch swap is a wrap-up step, not mid-slice.
- **Re-scoring capabilities** for the new-stack apps — do via `/update-capabilities`
  after the layout lands, not during the move.

## Open questions

Still TBD as the slice progresses.

- ~~**Branch & rollout:** new branch vs evolve v3 in place?~~ **RESOLVED** → branch
  `auraconnect-monorepo-bootstrap` off `v3` in its own `~/lab` worktree (see
  Decisions). Still open: *when* it becomes the new `main` (deferred to wrap-up).
- ~~**Legacy history import:** which method preserves history best?~~ **RESOLVED by
  spike** → `git-filter-repo` (see Decisions + Learnings). Remaining: install
  `git-filter-repo` in the toolchain / document the one-liner.
- ~~**Yarn version / linker?**~~ **RESOLVED** → Yarn Berry v4, `nodeLinker:
  node-modules` (see Decisions).
- ~~**Root task runner?**~~ **RESOLVED** → `concurrently` for host node dev servers +
  `docker compose` for API/infra (see Decisions). Turborepo/Nx deferred — revisit
  only if build-graph caching becomes worth it. API participates via compose, not the
  node task graph.
- **One root lockfile vs per-app:** yarn workspaces imply one root `yarn.lock` —
  confirm acceptable given the "commit lock with every change / review the diff"
  discipline from ADR 0001.
- **`.env` / secrets layout** across api + 3 clients + shared dev compose — one root
  `.env`, per-app, or layered?
- **Legacy dep reconciliation:** legacy is npm/Prisma 7/Clerk-admin; does it install
  cleanly under the shared yarn root, or does it need workspace `nohoist`/isolation?
- **Does `next-captive-portal-rd` keep its name** as `clients/portal`, and does the
  admin app rename from `auraconnect` → `admin` (package `name` field + imports)?
- **MikroTik emulation tier — DECIDED** (two-tier stub + CHR, one e2e suite against
  either; see Decisions). Remaining unknowns for the follow-up slice: exact
  RouterOS REST endpoints/verbs `MikroTikGatewayService` calls (spike → defines the
  stub's contract surface); the env/config switch the e2e harness flips to retarget
  stub↔CHR; whether CHR runs nightly or on-demand only.
- **RadiusDesk in local compose:** use the official RadiusDesk docker image (MariaDB
  + Nginx/PHP + FreeRADIUS) as-is, or a trimmed FreeRADIUS+MariaDB with just the
  `radacct` tables + the CakePHP endpoints the API's `RadiusProvisioningService`
  hits? Full image is higher-fidelity but heavier. Spike the endpoint surface.
- **Emulator profiles vs always-on:** are RadiusDesk/MikroTik in the default
  `up`, or behind opt-in compose profiles so the everyday inner loop stays light?

## Learnings

(Fill in as you discover them.) Durable knowledge this slice produced about the
codebase, the domain, or the tooling — facts that outlive the slice and inform
later ones. Promote anything cross-cutting to `docs/adr/`.

- `v3` (not `main`) is the live line: 54 commits ahead, 0 behind, base `d8e6f87` —
  the same ref the capability baseline was pinned to. The capabilities assessment
  describes the *pre-split* monolith and is stale for the new stack.
- The v3 split is already real: portal gutted to a pure API client (Prisma, admin,
  local services all removed; new `src/infrastructure/http` client against
  `API_URL`/`NEXT_PUBLIC_API_URL`); admin panel (`auraconnect/`) is standalone,
  Clerk-auth, `openapi-fetch`, no DB.
- The ASP.NET API (`net10.0`, EF Core + Postgres, JWT/ASP.NET Identity) owns AAA and
  all external integrations (RadiusDesk REST, MikroTik RouterOS REST, PayFast,
  RADIUS accounting via MySqlConnector) and exposes auth/gateway/portal/admin
  controller groups. Its own Postgres is separate from the RADIUS MySQL DB.
- Auth mismatch: API = JWT/Identity, admin = Clerk. Real seam to resolve later.
- **Legacy-history-import spike (2026-07-01, throwaway local clone).** Three methods
  compared for importing `main`'s monolith into `clients/portal-legacy/` on a
  v3-based branch:
  | method | blame | `git log <path>` | `--follow` | merge | tooling |
  |---|---|---|---|---|---|
  | naive `git checkout main -- …` + `git mv` | ❌ 1 commit | ❌ | ❌ | n/a | none |
  | `git subtree split` + `subtree add` | ✅ real authors | ❌ shows only import | ❌ | clean | built-in |
  | **`git-filter-repo` + merge** | ✅ | ✅ 12 | ✅ 12 | ✅ clean | needs filter-repo |
  - Winner: **filter-repo**. Only method where plain `git log <path>` works — subtree
    keeps blame but hides commit history behind the merge because it grafts at a
    renamed prefix via a second parent (first-parent log simplification hides it).
  - Gotcha found: a home-rolled `filter-branch` rewrite hit an **add/add README.md
    conflict** — root-level files collide with v3's root. filter-repo's `--path`
    filter avoids this by dropping everything outside the subdir, so the merge is
    clean and legacy contributes no root files.
  - Numbers: legacy = 191 files / ~207 commits touching the path; rewritten history
    resolves back to 2025-10-04 (authors `charlesmbv`, `cianb-vegavisions`).
  - `git-filter-repo` is not installed on this box (pip blocked by PEP-668; grab the
    single script or `--break-system-packages`). Spike used the downloaded script.
- Local AAA emulation is feasible (verified 2026-07-01):
  - RadiusDesk has an official docker image (MariaDB + Nginx/PHP + FreeRADIUS,
    split-container). Bundles FreeRADIUS `radacct` tables → satisfies both the
    provisioning REST path (`RadiusProvisioningService` → CakePHP
    `cake4/rd_cake/...`) and the accounting path (`RadiusAccountingClient` →
    `radacct`/`radacct_history` via MySqlConnector) with one stack.
    Refs: https://radiusdesk.com/wiki/install_docker
  - MikroTik RouterOS CHR runs under QEMU in Docker
    (https://github.com/EvilFreelancer/docker-routeros ,
    hossein3piol/mikrotik-routeros) exposing the real RouterOS REST API that
    `MikroTikGatewayService` targets (`https://{host}/rest{path}`). Cost: QEMU +
    ~30–60s boot + CHR 1Mbps free-tier cap → good for opt-in high-fidelity, poor
    for the fast CI loop → argues for the two-tier stub+CHR design.

## Execution log

- **Increment 1 — root cleanup (2026-07-01, done, uncommitted).** `git rm -r` the
  9 dead trees at v3 root: `captive-portal-design-v1/` (73), `hono-captive-portal/`
  (70), `hotspot/` (30), `captive-portal.zip`, `login.html`, `login-original.html`,
  `login-php-mahmut.html`, `status-template.html`, `nginx config` (1 each) = **179
  files** staged as deletions. Root now = `auraconnect/` (→ admin), `next-captive-
  portal-rd/` (→ portal), `monitor-auraconnect.co.za/` (→ monitor), `docs/`,
  `README.md`. No live app referenced the removed trees → no-regression gate holds
  (bootstrap slice, gate = no-regression per rescue-slice convention). Not committed.

- **Increment 2 — relocate v3 clients (2026-07-01, done, uncommitted).** `git mv`
  only (no package renames — user choice at I1 checkpoint): `next-captive-portal-rd/`
  → `clients/portal/`, `auraconnect/` → `clients/admin/`, `monitor-auraconnect.co.za/`
  → `clients/monitor/`. **514 renames, all R100** (100% similarity → pure moves,
  full history preserved on commit). Root now = `clients/` + `docs/` + `README.md`.
  Package `name` fields + internal imports untouched → open questions "keep portal
  name / rename admin→admin" remain deferred to a later rename increment. No-
  regression: dirs moved with relative paths intact, no root workspace wired yet.

- **Increment 3 — API import: PARKED (2026-07-01).** Prereq check done, import not
  run. Findings:
  - **Source branch = `main`** on `git@github.com:MeatBoyed/AuraConnect.git`. Both
    `main` and `claude/cool-carson-jayaqc` are 66 commits but **diverged at
    `26565bf`** (10 ahead / 10 behind each). `main` is the live line: newer
    (2026-06-29 vs 2026-06-11), feature commits (gateway session events, RADIUS
    metrics, migrations), and default HEAD. `claude/...` is an older debug fork.
    (Checked branches before importing — same lesson as v3-vs-main.)
  - **Method stays subtree** (Decision unchanged after review). subtree vs filter-
    repo differ only in `git log <path>` ergonomics: subtree hides the 66 commits
    behind the import merge's second parent (visible via `--follow` / logging the
    merge parent; blame unaffected), filter-repo rewrites paths so plain `git log`
    works. Both keep full history → ADR extraction fine under either. subtree is
    built-in; filter-repo is an uninstalled external dep. Keep the split: **subtree
    for api/ (imported once, read via tooling), filter-repo for legacy (daily
    `git log`/`blame` on a maintenance track).**
  - **Blocked on commit policy, deliberately.** Any history-preserving import
    (subtree or merge) runs a merge → needs a clean tree → would require committing
    I1+I2 first. **User: hold all commits — too much uncertainty, radical changes
    still possible, keep git history unloaded.** So the import waits until the
    structure is de-risked. I1+I2 remain uncommitted in the working tree (revertible
    via `git checkout` / `git reset`). Import is not part of the committed record yet
    by design.

- **Increment 4 — client naming — ⚠️ REVERTED (2026-07-01).** Executed the rename
  mid-brainstorm; user was still exploring. `git mv` undone (`clients/captive-portal`
  → back to `clients/portal`). Entry kept for the record; the naming below is a
  *candidate*, not settled. Convention still being worked (want symmetry + clarity,
  legacy must show admin-inside). Superseded by whatever the convention discussion
  lands on.
  Candidate direction (not applied): names describe content, resolving the `next-captive-portal-rd` collision (v3 thin vs
  main monolith share that path — thin has no Prisma/Clerk, monolith has both).
  - `clients/portal` → **`clients/captive-portal`** (`git mv`, uncommitted). Thin =
    captive portal only (admin was split into `clients/admin`).
  - Legacy import target changes: monolith imports to
    **`clients/admin-and-captive-portal-legacy`** (was `clients/portal-legacy` in
    the Plan-reference layout and the filter-repo recipe above). User chose the
    verbose name over `captive-portal-legacy` **because the monolith bundles admin
    + portal, and the name must show the admin-inside** (`ls` alone tells the truth;
    don't rely on the README banner for that fact). **Supersedes** the
    `portal-legacy` naming in the Target-layout block and in the filter-repo recipe's
    `--path-rename next-captive-portal-rd/:clients/portal-legacy/` → replace target
    with `clients/admin-and-captive-portal-legacy/` when the import runs.
  - Package `name` fields still untouched (git mv only) — deferred rename increment.
  - Final `clients/` set: `admin`, `captive-portal`, `monitor`,
    `admin-and-captive-portal-legacy` (on import), `packages/` (later).

- **Increment 5 — client naming convention SETTLED: C3 nest-by-era (2026-07-01,
  done, uncommitted).** Supersedes the reverted I4 candidate and the `portal-legacy`
  naming in the Plan-reference layout + filter-repo recipe.
  - **Convention:** `clients/<era>/<domains>` — era ∈ {`current`, `legacy`}; domain
    ∈ {captive-portal, admin, monitor}; multi-domain apps join with `-and-` in
    **function-first** order (public portal was the primary purpose). Era is
    physical nesting, not a suffix → eras group cleanly, scales to future legacy
    imports, no interleaving in `ls`.
  - **Applied (`git mv`, uncommitted):** `clients/portal` → `clients/current/
    captive-portal`, `clients/admin` → `clients/current/admin`, `clients/monitor`
    → `clients/current/monitor`.
  - **Legacy import target (on import):** `clients/legacy/captive-portal-and-admin/`
    — the monolith bundles portal+admin, so the name shows the admin-inside. This
    **replaces** the filter-repo recipe's `--path-rename next-captive-portal-rd/:
    clients/portal-legacy/` → new target `clients/legacy/captive-portal-and-admin/`.
  - **Consequences to handle later:** yarn workspace globs become `clients/*/*`
    (two levels); Target-layout diagram in Plan reference is superseded by this
    nesting; `clients/current/admin` kept bare (only current admin — revisit if a
    second admin appears); package `name` fields still untouched (deferred rename).

- **Naming threads closed (2026-07-01).** `clients/current/admin` stays bare —
  confirmed domain *is* "admin" (single current admin). Package `name` fields
  remain untouched until the full structure is visible, then a dedicated rename
  increment. Client-folder naming is now fully settled (see I5 convention).

## Retrospective

(Fill in at wrap-up.) What worked, what we'd do differently, what surprised us.
