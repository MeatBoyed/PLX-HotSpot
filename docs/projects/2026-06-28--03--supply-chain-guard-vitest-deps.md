# Slice — Supply-chain vetting of the new Vitest dev dependencies

**Status:** done
**Started:** 2026-06-28
**Finished:** 2026-06-29

## Plan reference

`CLAUDE.md` mandates: "**Vet dependencies** with `/supply-chain-guard` before
adding or bumping packages. Keep `package.json` and `package-lock.json` committed
together; never delete the lockfile to resolve a conflict." The prior slice
(`2026-06-28--02--bootstrap-dev-tooling-vitest.md`) added `vitest@4.1.9` and its
transitive tree (~1148 lines of `package-lock.json` growth) under time pressure,
with the vetting **explicitly deferred to this slice** (see that slice's
carry-forward / Retrospective). This slice pays that debt: run the guard
retroactively over what landed, before any further dependency work builds on it.

**Definition of done:**

- Every package newly introduced by slice 02 (the `vitest@4.1.9` subtree — derive
  the exact set from the slice-02 `package-lock.json` diff) has been run through
  `/supply-chain-guard`: checked for typosquatting, recent maintainer/owner
  changes, suspicious `postinstall`/lifecycle scripts, and age/popularity/provenance
  red flags. Findings recorded in this doc (or an ADR if cross-cutting).
- Lockfile integrity confirmed: `npm ci` installs cleanly from
  `package-lock.json` alone, every entry has `resolved` + `integrity`, and all
  resolve to the public npm registry (no unexpected hosts).
- A recorded decision on **version-pinning policy** for dev tooling (keep `^4.1.9`
  caret vs pin exact `4.1.9`) and whether to adopt any install-time guardrails
  (e.g. `.npmrc` with `save-exact` / `ignore-scripts`).
- Outcome is explicit: either "clean — no action" with the evidence, **or**
  remediation applied (pins, overrides, removals) with `package.json` +
  `package-lock.json` committed together.
- No production-dependency changes and no functional behaviour change — this is a
  review/hardening slice only.

## Working scope

Run `/supply-chain-guard` retroactively over the dev dependencies added in slice
02 (`vitest@4.1.9` + transitives), verify lockfile integrity, and record a
pinning/guardrail decision. Confirmed framing: **review + optional hardening
only**, no new features.

In scope:
- Enumerate the exact new packages from the slice-02 lockfile diff (commit
  `06160b7`).
- Guard checks per package (typosquat, maintainer change, lifecycle scripts,
  provenance, popularity/age).
- `npm ci` clean-room integrity check + registry/host audit of resolved URLs.
- Decision: caret vs exact pin for dev tooling; whether to add `.npmrc` guardrails.
- Any remediation that falls out (pins/overrides), committed with the lockfile.

## Assumptions going in

- The only new dependency tree from slice 02 is `vitest@4.1.9` and its
  transitives; `dotenv` and the Prisma packages were already present (confirm
  against the lockfile diff before relying on this).
- `/supply-chain-guard` is the canonical tool/skill for this and its checks are
  sufficient; this slice runs it rather than re-inventing the methodology.
- Network access to the npm registry / advisory sources is available for the
  guard's provenance and maintainer-change checks.

## Decisions made during the slice

Slice-local decisions only. Cross-cutting ones go into `docs/adr/` — link the ADR
here. Candidate that may warrant an ADR: a repo-wide dependency-pinning policy
(exact vs caret) and any `.npmrc` guardrail, since later slices depend on it.

- **2026-06-29 — scope expanded beyond the vitest subtree (append-only).** The
  original DoD scoped the pin/guardrail decision to slice-02's vitest deps. Mid-slice
  the user reframed the goal: pin the **whole** direct-dependency tree as-is now (to
  freeze a supply-chain-safe baseline), *then* build test coverage, *then* update
  dependencies under test. The vitest vetting still stands as the gate that proved
  the tree clean; the pin just applies repo-wide instead of to one subtree.
- **Pin policy → exact, repo-wide.** Chosen over keeping carets. Recorded as a
  cross-cutting decision in **[ADR 0001](../adr/0001-dependency-pinning-policy.md)**
  because later slices (test coverage, guarded updates) depend on this baseline.
  Superseded the earlier open question "caret vs exact for dev tooling" — answer is
  exact, for **all** direct deps, not just dev tooling.
- **Guardrail → `.npmrc` with `save-exact=true`; NOT `ignore-scripts`.** `save-exact`
  stops a future `npm install <pkg>` from reintroducing a caret. `ignore-scripts` was
  rejected — it would break the existing `postinstall: prisma generate`, and the
  vetted tree has no other install scripts. See ADR 0001.
- **2026-06-29 — will NOT adopt the Clerk `SKILL.md` (`clerk.com/SKILL.md`).** Clerk
  advertises an agent skill to auto-add its auth. Reviewed it (read-only fetch): it is
  a *greenfield* installer — runs `clerk init`, which rewrites middleware/providers/
  auth routes and `npm install @clerk/ui`. For this repo that does more harm than
  good: our Clerk integration already exists, our `src/middleware.ts` is hand-tuned
  (with known weak spots we don't want silently overwritten), and the skill bypasses
  `/supply-chain-guard` (new unvetted dep) and plan/execute-slice (un-recorded file
  changes). Any future Clerk work goes through our flow instead: `/plan-slice` →
  `/supply-chain-guard` for any new dep → `/execute-slice`. The skill may be consulted
  as *reference* knowledge, never run as an installer.

## Deferred / pushed forward

What we explicitly are not doing this slice, and where it picks up.

- **CI enforcement** of the lockfile-integrity / audit checks — belongs to the
  deferred CI-workflow slice, not here. This slice establishes the manual check
  first.
- **Auditing production dependencies** broadly — out of scope; this slice is
  scoped to what slice 02 introduced. A full `npm audit` / SBOM pass over the
  whole tree is a separate, larger initiative.
- **Upgrading or bumping** any package — this slice vets what exists; bumps are
  their own guarded change.

## Open questions

Still TBD as the slice progresses.

- ~~**Pin policy:** keep `vitest` at `^4.1.9` (caret) or pin exact `4.1.9`?~~
  **Resolved (ADR 0001):** pin exact, repo-wide — not just dev tooling.
- ~~**Guardrails:** adopt a committed `.npmrc`?~~ **Resolved (ADR 0001):**
  `.npmrc` with `save-exact=true`; deliberately not `ignore-scripts` (breaks
  `prisma generate`).
- ~~**Remediation threshold** for the vitest subtree.~~ **Resolved:** subtree is
  clean — no remediation needed. Threshold question moot for this tree.
- ~~Does the prod app load any new dev deps at runtime?~~ **Resolved:** no.
  `vitest` is `devDependencies`; the production `npm run build` succeeded and the
  pin change moved zero installed versions, so nothing new leaks into the bundle.
- **Carried forward:** the 45 outstanding `npm audit` advisories on the prod/tooling
  tree (Clerk critical, Next high, Prisma, axios, …) are untouched by design — they
  are dependency *updates*, which ADR 0001 sequences after test coverage. Picks up
  in the test-coverage slice → then a guarded-updates slice.

## Learnings

(Fill in as you discover them.) Durable knowledge this slice produces about the
codebase, the domain, or the tooling — facts that outlive the slice and inform
later ones.

- **`vitest@4.1.9` rides the rolldown/VoidZero stack.** Its subtree pulls `rolldown`,
  the `@rolldown/binding-*` native bindings, `lightningcss-*`, and `obug`. All publish
  with npm **attestations**; maintainers are the known Vite/Vitest/VoidZero team
  (`antfu`, `yyx990803`, `ariperkkio`, `sxzz`, `rolldownbot@voidzero.dev`).
- **`obug` is a deliberate false-alarm trap.** It *looks* like a `debug` typosquat —
  even its funding points at `opencollective.com/debug` — but it is a legitimate
  `debug` rewrite by `sxzz`, declared **directly** by `vitest@4.1.9`
  (`obug: "^2.1.1"`), repo `github.com/sxzz/obug`, attested. Provenance, not name
  shape, settles it.
- **The whole vitest subtree has zero `hasInstallScript`.** No lifecycle-script
  attack surface from the test tooling — relevant to the `ignore-scripts` decision.
- **`@zodios/core` in the slice-02 lockfile diff was a reshuffle, not a new dep** (`-`
  and `+` at the same `10.9.6`, from the pre-existing `openapi-zod-client`). When
  reading a lockfile diff, match `-`/`+` pairs before counting something as "new".
- **`npm ci` is the integrity gate.** It hard-fails on any `resolved`/`integrity`
  mismatch, so a clean `npm ci` *is* the lockfile-integrity proof — no separate check
  needed.
- **Carets had already drifted** several installed versions above their declared floor
  (`fast-xml-parser`, `typescript`, `eslint`, `@types/node`, tailwind) — concrete
  evidence motivating ADR 0001.

## Supply-chain posture after this slice

Are we safe against supply-chain attacks now? **Mostly yes — with two honest
caveats.** Captured so the claim isn't overstated.

Solid:

- **No silent version movement.** Every *direct* dep pinned exact (ADR 0001);
  `.npmrc save-exact=true` stops carets sneaking back. A hijacked patch release can't
  enter on the next install via a widened range.
- **Lockfile integrity proven.** `npm ci` installs clean — every entry has `resolved`
  + `integrity`, all on `registry.npmjs.org`, no rogue hosts.
- **Vitest subtree vetted** — attested, known maintainers, zero install scripts.
- **Process guardrails** — `/supply-chain-guard` mandatory before any add/bump/remove
  (now reinforced in `CLAUDE.md` + the skill); declined Clerk's auto-installer skill.

Caveats (so "safe" is not overclaimed):

1. **Transitive deps are pinned by the lockfile, not by us.** Direct deps are exact,
   but transitives keep their own caret ranges; only the committed lockfile freezes
   them. A casual lockfile regeneration could move them — hence the hardened
   "never delete `package-lock.json`" rule and the deferred CI integrity-enforcement
   slice. Inherent to npm.
2. **45 known `npm audit` advisories remain** (Clerk critical, Next high, …). This is
   *known-vulnerable installed versions* — a different risk class from injection.
   Pinning freezes them; it does not fix them. Deferred by design to the
   test-coverage → guarded-updates sequence (ADR 0001).

Bottom line: **safe against silent injection through our dependency ranges — yes.**
Free of all known vulnerabilities — **no, by design** — those are sequenced next.

## Retrospective

What worked:

- The guard methodology caught the real signal (provenance/attestation/maintainer)
  and correctly cleared the scary-looking `obug` instead of false-flagging on the
  name. Verdict: **vitest subtree clean — no remediation**.
- Pinning was a metadata-only lockfile change: `git diff package-lock.json` showed
  **no `version`/`resolved`/`integrity` lines changed**, only the root range
  specifiers. `npm ci` + `npm run build` + `npm test` (4/4) all green afterward,
  confirming the freeze moved nothing.

What changed mid-slice:

- Scope widened from "vet the vitest subtree" to "pin the entire direct tree as a
  safe baseline." Logged append-only in Decisions; the originating vetting still
  gates it. This is the planned `pin → test → update` sequence, now recorded in
  ADR 0001.

Surprised us:

- `obug`'s funding link genuinely points at `debug`'s OpenCollective — a textbook
  "looks malicious, is fine" case. Worth remembering that legitimate forks can carry
  the original's metadata.

Carried forward: 45 `npm audit` advisories on the prod tree, deferred by design to
the test-coverage then guarded-updates slices (see Open questions).
