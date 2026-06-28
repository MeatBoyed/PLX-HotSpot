# Capabilities & feature-set assessment

This folder is a **point-in-time technical assessment** of the production captive
portal, ported in from an external code review (git ref `d8e6f87`, 2026-06).

**Why it's here — solutions, not blame.** These findings exist to give the team a
shared, evidence-backed map of where the code is strong and where it needs work, so
improvements can be planned and prioritised quickly. Scores are a starting point for
fixes, not a verdict on anyone. Treat every low score as a backlog candidate.

## Files

| File | What it is |
| --- | --- |
| `data/capabilities.json` | Per-capability scorecard — **source of truth**. |
| `data/feature_sets.json` | Per-feature-set scorecard — **source of truth**. |
| `data/tables.json` | System-coherence + user-journey tables — **source of truth**. |
| `scorecards.md` | Tables rendered from the JSON — **generated, do not edit by hand**. |
| `system-assessment.md` | Hand-authored narrative report (summary, per-set prose, nuances). |
| `gap-analysis.md` | Production portal vs the signed-off requirements; capability inventory + per-pillar gaps (reconciled against the full capability map). |
| `reliability-remediation.md` | Deep-dive on the in-service reliability defects (MikroTik handoff + integration tier) with prioritised fixes. |

The JSON is the source of truth. `scorecards.md` is generated from it by
`tools/capabilities-doc/render.mjs` so the tables can never drift:

```bash
npm run capabilities:render   # regenerate scorecards.md
npm run capabilities:check    # fail if stale (CI / pre-commit gate)
```

To re-score after a code change, use the `/update-capabilities` skill: edit the JSON,
regenerate, keep the narrative in sync. Never hand-edit `scorecards.md`.

## Scoring rubric

**Capability axes** (`capabilities.json`) — each scored **0–4**:

| Axis | Key | 0 | 4 |
| --- | --- | --- | --- |
| Completeness | `cmpl` | absent | fully implemented |
| Quality | `qual` | poor | exemplary |
| Tests | `test` | none | exemplary coverage |
| Reliability | `rel` | fragile | hardened (timeouts, idempotency, retries) |
| Security | `sec` | exposed | sound |

**Feature-set axes** (`feature_sets.json`): `cohesion`, `coupling`, `completeness`,
`boundary` — each 0–4.

**Maturity** (`maturity`, both files) — **1–5**, a reasoned roll-up over the axes
(not an average):

| 1 | 2 | 3 | 4 | 5 |
| --- | --- | --- | --- | --- |
| Initial | Developing | Defined | Managed | Optimized |

A capability may carry `"dead": true` when it is unreachable / unused code (referenced
only from commented-out or orphaned paths). The generator renders it struck-through
with a `(dead)` maturity. `evidence` / `note` fields cite `file:line` within the repo.
Paths are now repo-root-relative (the production tree was moved to root — see the bootstrap slice
in `docs/projects/`).

## Headline (as assessed)

Fix-in-place, not a rewrite: a sound multi-tenant Next.js front-end that delegates
AAA to RadiusDesk + MikroTik. The UI / data / config two-thirds is a solid
foundation; the integration / reliability one-third (MikroTik handoff, payment IPN,
voucher durability) is where the fixable defects cluster. Capped uniformly at
Developing by **zero tests** — which the test-suite phase of the bootstrap addresses.
