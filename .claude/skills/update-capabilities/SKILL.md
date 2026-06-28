---
name: update-capabilities
description: Update the capability/feature-set assessment — re-score after a code change, add/remove a capability, mark dead code, or restructure (move a capability between feature sets, split/merge sets) as the codebase is refactored. Edit the JSON source of truth, propagate the change up the chain, regenerate the scorecards, keep the narrative in sync. Use when scores change or capabilities move, or when the user invokes /update-capabilities. The JSON is the source of truth; tables are generated, never hand-edited.
---

# /update-capabilities

## I. Context

### A. Definitions

1. **Source of truth** — the JSON in `docs/capabilities/data/`
   (`capabilities.json`, `feature_sets.json`, `tables.json`). Every score and piece
   of evidence is edited here, nowhere else.
2. **The chain** — the assessment is a System → Feature Sets → Capabilities, with
   user journeys as a cross-check. The three data files are the three levels:
   capabilities (`capabilities.json`, keyed to a `feature_set`), feature sets
   (`feature_sets.json`), and the system-coherence + journeys tables (`tables.json`).
   A change at one level can ripple **up** to the levels above it. This skill is the
   write half; `/capability-reference` is the read half over the same data.
3. **Dead capability** — unreachable / unused code (referenced only from
   commented-out or orphaned paths). Marked `"dead": true`; rendered struck-through.
4. **Generated scorecards** — `docs/capabilities/scorecards.md`, produced from the
   JSON by `tools/capabilities-doc/render.mjs`. Never hand-edited.
5. **Narrative** — `docs/capabilities/system-assessment.md`, the hand-authored report
   (summary, per-set prose, nuances).
6. **Rubric** — axes C·Q·T·R·S scored 0–4; Maturity 1–5. Defined in
   `docs/capabilities/README.md`.

### B. Governing priority

Edit the JSON, then regenerate — never edit `scorecards.md` by hand (the generator
overwrites it). **Propagate up the chain:** a change to a capability can change its
feature set's scores, which can change system coherence and journey coverage — walk
each level above the one you touched and correct it, don't stop at the leaf. A score
change must cite `file:line` evidence; a score without evidence is not an update.
Framing is solutions, not blame: the point of re-scoring is to track improvement, so
record what changed in the code that moved the number.

### C. Inputs

```
/update-capabilities <what changed — capability/feature set + the code change>
```

## II. Action

### A. Make the edit at the right level

- **Re-score a capability** — find the row in `capabilities.json` by `id`/`name`;
  update the axis scores and/or `maturity`; rewrite `evidence` with the new
  `file:line`.
- **Mark/unmark dead** — set or remove `"dead": true` on the capability row.
- **Add a capability** — append a row with a unique `id`, its `feature_set`, all five
  axes, `maturity`, and `evidence`.
- **Move a capability** (refactor relocated it) — change its `feature_set` to the new
  set's id. Then re-evaluate **both** the source and the target feature set (below).
- **Split / merge / add / remove a feature set** — edit `feature_sets.json`, and
  repoint every affected capability's `feature_set`.

### B. Propagate up the chain

After any edit, walk upward and correct each level the change reaches:

1. **Feature set** (`feature_sets.json`) — if a capability's score moved, or
   capabilities entered/left the set, re-judge that set's `cohesion`, `coupling`,
   `completeness`, `boundary`, `maturity`, and `note`.
2. **System coherence** (`tables.json` → `system_scorecard`) — if seams moved
   (capabilities relocated, sets split/merged), re-judge seam cleanliness, coupling,
   naming, decomposition, and overall coherence.
3. **Journeys** (`tables.json` → `journeys`) — if a capability id changed, moved, or
   died, fix every journey path that references it; check for new gaps/orphans.

### C. Regenerate, sync, verify

4. `npm run capabilities:render`; review the `scorecards.md` diff.
5. Reflect material changes (a maturity shift, a new/removed/moved capability, a
   changed verdict) in the narrative `system-assessment.md` — summary, the relevant
   per-set prose, system-coherence section, and headline.
6. Update the **Baseline ref** (the git ref in the `system-assessment.md` /
   `README.md` header) to the ref you re-scored against, so `/capability-reference`
   cites the right baseline.
7. `npm run capabilities:check` must pass (no drift).
8. Report what moved, at which levels, and why — citing the evidence.

### Constraints

- Do not edit `scorecards.md` directly.
- Do not invent scores — every number traces to code evidence.
- Keep the JSON valid (the generator parses it); don't break the schema.
- Don't stop at the capability level when the change ripples up — an un-propagated
  feature-set or system score is a stale assessment.

## III. Conditions of satisfaction

1. Scores/evidence change in the JSON only; `scorecards.md` is regenerated, not
   hand-edited.
2. A change is propagated up every level it reaches — capability → feature set →
   system coherence → journeys — not left at the leaf.
3. A moved capability points to its new `feature_set`, and both source and target
   feature sets are re-judged.
4. `npm run capabilities:check` passes (no drift between data and generated tables).
5. Every changed score carries updated `file:line` evidence; dead code is flagged
   `"dead": true`.
6. A material change is mirrored in `system-assessment.md`, and the Baseline ref is
   updated to the ref re-scored against.
7. The report states what moved, at which levels, and the code reason for it.
