# Slice 2026-07-03--04 — Release-notes tooling

**Status:** planning
**Started:** 2026-07-03
**Finished:** —

## Plan reference

Child of the release-engineering epic
([2026-07-03--02](2026-07-03--02--release-management-tooling.md)). Delivers the
**release-notes generation + interactive release-PR flow**. Depends on Conventional
Commits being enforced by [2026-07-03--03](2026-07-03--03--test-gates-and-branch-governance.md)
(commitlint hook), so notes are reliably derivable from history.

**Definition of done:**
- A **generator script** that, from the **Conventional Commits since the last release**,
  writes **one markdown note per release into `docs/releases/`**, committed to source.
- Repo-wide **SemVer**; a release is cut on a **`test → trunk`** promotion.
- The release **PR (`test → trunk`) is created interactively from the Claude Code
  terminal**, committing the new release note.
- The **release skill is deferred** (see epic) — but the script is built **skill-ready** so
  a later `SKILL.md` can wrap it.

## Working scope

Work item C from the epic: the `docs/releases/` convention, the notes generator, and the
terminal release-PR flow. Not the skill itself (deferred).

## Assumptions going in

- Conventional Commits are enforced (slice --03) so `git log` is a reliable notes source.
- Trunk = `v3`-as-`main`; `test` is the only source into trunk (slice --03).

## Decisions made during the slice

- (from epic) per-release markdown in `docs/releases/`; Conventional-Commits-derived;
  repo-wide SemVer; skill deferred with a strong forward-commitment.

## Deferred / pushed forward

- **Release skill (`SKILL.md`)** — the interactive flow wrapped as a Claude Code skill
  (`skill-author`), in a follow-up. Build the script skill-ready.
- **Per-app versioning** (`api` vs clients) — repo-wide for now.

## Open questions

- **File convention** — `docs/releases/vX.Y.Z.md`? plus a git **tag** per release?
- **Version bump source** — auto from Conventional-Commit types (feat→minor, fix→patch,
  `!`/BREAKING→major) vs manual.
- **Generator implementation** — a small bespoke script vs `conventional-changelog` /
  `changesets` (new dep → `supply-chain-guard`). Bespoke keeps deps minimal + control over
  the per-file format.
- **First release/baseline** — what "since last release" means for the first cut (from repo
  root, or a seeded `v0` tag).

## Learnings

- ...

## Retrospective

(Fill in at wrap-up.)
