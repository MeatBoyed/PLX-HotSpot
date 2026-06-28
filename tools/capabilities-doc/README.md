# capabilities-doc

Renders the capability scorecards from their JSON source of truth into markdown, so
the tables can never drift from the data.

## Source of truth

`docs/capabilities/data/`:
- `capabilities.json` — per-capability rows (axes + maturity + evidence).
- `feature_sets.json` — per-feature-set rows.
- `tables.json` — system-coherence + user-journey tables.

## Generated output

`docs/capabilities/scorecards.md` — **generated; do not edit by hand.** It carries a
header banner saying so.

## Usage

```bash
npm run capabilities:render   # regenerate scorecards.md from the JSON
npm run capabilities:check    # exit 1 if scorecards.md is stale (CI / pre-commit gate)
```

Workflow: edit the JSON → `npm run capabilities:render` → review the diff → commit the
JSON and the regenerated `scorecards.md` together. The `/update-capabilities` skill
drives this.

## Scope / limitations

- It renders the uniform tables (capabilities by feature set, feature-set summary,
  system coherence, journeys). A capability with `"dead": true` is rendered
  struck-through with a `(dead)` maturity. The narrative report `system-assessment.md`
  — executive summary, per-set prose, design nuances — is hand-authored; keep it in
  sync with the data when scores change materially.
- LaTeX score helpers (`\axis{}`, `\mat{}`, `\matt{}{DEAD}`) found in `tables.json`
  cells are normalised to plain numbers on render.
