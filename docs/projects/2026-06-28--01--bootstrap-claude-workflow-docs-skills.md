# Slice 2026-06-28--01 — Bootstrap Claude Code workflow: reorg, docs, skills

**Status:** in-progress
**Started:** 2026-06-28
**Finished:** —

## Goal / definition of done

Stand up a Claude Code development workflow in this repo: a clean root layout, a docs
system (slice docs, ADRs, capability assessment), a set of project skills, and the
guidance (`CLAUDE.md`) that ties them together — so future work is planned as slices,
significant decisions are recorded as ADRs, and code judgements are grounded in the
ported assessment.

**Done when:** the production app is at the repo root; `docs/{projects,adr,capabilities}`
exist and are populated (capabilities ported, ADRs scaffolded); `.claude/skills/`
carries the four skills below; `CLAUDE.md` is at root; and a Vitest + Testing Library
suite runs green via `npm test`.

## Working scope

This is the founding slice — it overlaps with an external bootstrapping effort and is
the only doc carried across from it. It covers:

1. **Repo reorg** — move the production Next.js app from the `next-captive-portal-rd/`
   subfolder to the repo root; demote dormant legacy/parallel trees into `archive/`.
   _(Done — see Learnings.)_
2. **Docs system** — `docs/projects/` (slice docs), `docs/adr/` (decision records,
   scaffolded), `docs/capabilities/` (assessment scorecard + gap analysis, ported in).
3. **Skills** — `.claude/skills/`: `plan-slice`, `write-adr`, `capability-reference`,
   `supply-chain-guard`, `update-capabilities`.
4. **Tooling** — `tools/capabilities-doc/render.mjs` renders the capability
   scorecards from the JSON source of truth into `docs/capabilities/scorecards.md`
   (wired as `npm run capabilities:render` / `capabilities:check`), so the tables
   can't drift from the data.
5. **`CLAUDE.md`** — root guidance describing the stack, layout, commands, and how to
   use the skills.
6. **Test suite** — Vitest + @testing-library/react, with a seed of real passing tests.

## Assumptions going in

- The production tree is `next-captive-portal-rd/` (now the root); legacy trees are
  out of scope and archived, not deleted.
- The ported assessment reflects git ref `d8e6f87`; treat scores as a baseline that
  may go stale as code changes.

## Decisions made during the slice

- **Relocate the app to the repo root** so `.claude/` and `docs/` sit where Claude
  Code expects them. Done with `git mv` to preserve history. _(A lasting structural
  decision — promote to an ADR.)_
- **Archive, don't delete** dormant trees — keep them in-repo under `archive/` for
  reference.
- **Test stack: Vitest + @testing-library/react** (over the Jest preset). _(Promote
  to an ADR when the suite lands.)_
- **Port the capability assessment as-is**, framed as solutions-not-blame — it is a
  shared map for prioritising fixes, not a verdict.

## Deferred / pushed forward

- **ADR entries** — folder + template scaffolded this slice; actual ADRs (starting
  with the relocate and test-stack decisions above) are written next.
- **Test suite** — bootstrapped as the closing step of this effort.
- **Broad test coverage** and any E2E (Playwright) layer — later slices.

## Open questions

- Which decisions get the first ADRs — relocate, test stack, archive policy?
- Vitest config shape for Next 16 + Turbopack, and the mock boundary for Prisma /
  Clerk / external HTTP (RadiusDesk, PayFast, MikroTik).
- CI: run lint + test on PR now, or as a follow-up?

## Learnings

- **Repo reorg landed cleanly.** Pure `git mv`: 368 renames, 371 files conserved,
  history preserved. All production paths were already tree-relative (`docker/*.yml`
  use `context: ..`; Dockerfiles use `WORKDIR /app`), so no build/deploy path edits
  were needed. README/.gitignore collisions resolved (old root tree-map README →
  `archive/README.md`; the app's README and `.gitignore` now sit at root).
- The capability assessment's `file:line` evidence stays valid after the move — paths
  were already relative to the production tree, which is now the root.
- `docs/capabilities/` carries the full set: JSON source of truth + generated
  `scorecards.md`, the narrative `system-assessment.md`, the `gap-analysis.md`
  (reconciled against the 11-feature-set / ~38-capability map), and the
  `reliability-remediation.md` deep-dive. Highest-severity systemic issue across all
  of them: the blanket-public `/api(.*)` matcher (`middleware.ts:8`) leaving
  `POST /api/image`, `/api/marketing-optin`, and `GET /api/vast` unauthenticated.

## Retrospective

(Fill in at wrap-up.)
