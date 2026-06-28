---
name: capability-reference
description: Read and cite the capability/feature-set assessment in docs/capabilities/ BEFORE judging the code's maturity, completeness, security, or reliability — or before planning work on a capability. Use when answering "how good/complete/secure is X", grading a feature, or scoping a fix, or when the user invokes /capability-reference. Grounds judgements in the recorded evidence instead of fresh guesses.
---

# /capability-reference

## I. Context

### A. Definitions

1. **Assessment** — the point-in-time capability/feature-set analysis in
   `docs/capabilities/`. `README.md` there is the index; the parts are: the JSON
   **source of truth** (`data/capabilities.json`, `data/feature_sets.json`,
   `data/tables.json`), the generated `scorecards.md` (quick tabular view), the
   narrative `system-assessment.md` (summary, per-set prose, system coherence,
   journeys), the requirements `gap-analysis.md`, and the `reliability-remediation.md`
   deep-dive.
2. **Source of truth** — the JSON files. Any maturity/quality/security claim about a
   capability should trace to a row there, cited by its `id`.
3. **Baseline ref** — the git ref the assessment was taken at, recorded in the
   `system-assessment.md` / `README.md` header. Read it from there; do not assume a
   fixed value (it moves when the assessment is re-scored — see `/update-capabilities`).
4. **Rubric** — axes scored 0–4 (Completeness, Quality, Tests, Reliability,
   Security); Maturity 1–5 (Initial→Optimized). Defined in `docs/capabilities/README.md`.

### B. Governing priority

Read before judging. When the recorded assessment and a fresh impression disagree,
cite the recorded score and its `evidence`, then note the discrepancy — do not
silently overwrite the record. Compare the code against the **Baseline ref**; if the
code has moved on, say so and treat the score as stale rather than wrong. Framing is
solutions, not blame: a low score is a backlog candidate, not a verdict.

### C. Inputs

```
/capability-reference <capability, feature set, or question>
```

## II. Action

1. Locate the relevant rows in `data/capabilities.json` / `data/feature_sets.json`
   by `name` or `domain`. Read their scores and `evidence`/`note`.
2. Pull the matching narrative from `system-assessment.md` for context the scores
   don't carry. Route by question type: requirement-coverage / "what's missing" →
   `gap-analysis.md`; reliability / "why does it fail in service" →
   `reliability-remediation.md`.
3. Answer with the cited scores (axis values + maturity) and the `file:line`
   evidence. Quote the `id` so the claim is checkable.
4. If proposing work, anchor it to the lowest-scoring axes for that capability and
   flag whether the evidence may be stale vs the Baseline ref.

### Constraints

- Do not invent scores or capabilities not in the data.
- Do not edit the assessment files from this skill — re-scoring is a separate,
  deliberate act handled by `/update-capabilities`.

## III. Conditions of satisfaction

1. Any maturity/quality/security judgement cites a capability/feature-set `id` and
   its recorded scores before asserting.
2. Coverage/gap questions cite `gap-analysis.md`.
3. Disagreements with the record are surfaced and attributed to possible staleness,
   not silently resolved.
4. The skill reads, never rewrites, the assessment data.
