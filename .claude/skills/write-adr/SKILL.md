---
name: write-adr
description: Record one architecturally significant decision as an ADR, at the right altitude in this monorepo — root docs/adr for cross-cutting decisions, an app's own docs/adr for app-local ones. Use when a decision outlives a single slice — a stack/library choice, module or on-disk layout, an interface other code depends on, a trust boundary — or when the user invokes /write-adr. Slice-local decisions stay in the slice doc, not here.
---

# /write-adr

## I. Context

### A. Definitions

1. **ADR** — Architecture Decision Record: one significant decision, its context,
   the choice, and the consequences.
2. **Significant** — the decision outlives a single slice and constrains future
   work. If it only affects the current slice, it belongs in that slice doc, not an
   ADR.
3. **Scope / location** — where the ADR lives, by reach:
   - **monorepo / cross-cutting → `/docs/adr/`** (spans `api/` + `clients/`).
   - **single app → that app's `docs/adr/`** (e.g. `clients/current/admin/docs/adr/`),
     its own `NNNN` sequence, created lazily on first use.
   - **legacy → `clients/legacy/captive-portal-and-admin/docs/adr/`**, documented
     after the fact with Status `Accepted (Retrospective)`.
4. **Template** — `/docs/adr/template.md`, the canonical ADR body.
5. **Index** — the table in `/docs/adr/README.md` (root scope) or the app's own
   `docs/adr/README.md`.

### B. Governing priority

One decision per ADR. A decided ADR (Accepted) is immutable in substance — never
rewrite it; supersede it with a new ADR and link both ways. When unsure whether a
decision is significant enough, prefer the slice doc over a new ADR. When unsure of
scope, prefer the narrower location (the app) over the root.

### C. Inputs

```
/write-adr <short decision title>
```

## II. Action

1. Confirm significance. If the decision is slice-local, say so and record it in the
   slice doc instead — do not create an ADR.
2. Determine scope (Definition A.3) → pick the target `docs/adr/` folder. If it is an
   app folder that does not exist yet, create it with a `README.md` (index) seeded
   from the root one, and start its sequence at `0001`.
3. Read `/docs/adr/template.md` and scan the target folder's index for the highest
   `NNNN`.
4. Create `<target>/<NNNN+1>-<kebab-title>.md` from the template. Fill Context,
   Decision, Consequences, Alternatives. Set Status (`Proposed`, `Accepted`, or
   `Accepted (Retrospective)` for a back-documented decision), the Scope line, and
   the date.
5. If this supersedes an existing ADR, set the old one's status to
   `Superseded by ADR-<new>` and cross-link.
6. Add a row to the index table in the target folder's `README.md`.
7. Report the file path and status.

## III. Conditions of satisfaction

1. A significant decision produces exactly one ADR file named `NNNN-<slug>.md`,
   sequence continued from the highest in its location.
2. The ADR lives at the correct scope (root vs app) and follows the template's
   sections, carrying Status, Scope, and date.
3. The index in that location's `README.md` gains a matching row.
4. A slice-local decision produces no ADR — it is recorded in the slice doc.
5. A superseding ADR links to and flips the status of the one it replaces.
6. A legacy/app-local decision is recorded in that app's `docs/adr/`, not the root
   index.
