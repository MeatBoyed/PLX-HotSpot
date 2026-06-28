---
name: write-adr
description: Record one architecturally significant decision as an ADR in docs/adr/. Use when a decision outlives a single slice — a stack/library choice, module or on-disk layout, an interface other code depends on, a trust boundary — or when the user invokes /write-adr. Slice-local decisions stay in the slice doc, not here.
---

# /write-adr

## I. Context

### A. Definitions

1. **ADR** — Architecture Decision Record: one significant decision, its context,
   the choice, and the consequences.
2. **Significant** — the decision outlives a single slice and constrains future
   work. If it only affects the current slice, it belongs in that slice doc, not an
   ADR.
3. **Template** — `docs/adr/template.md`, the canonical ADR body.
4. **Index** — the table in `docs/adr/README.md` listing every ADR and its status.

### B. Governing priority

One decision per ADR. A decided ADR (Accepted) is immutable in substance — never
rewrite it; supersede it with a new ADR and link both ways. When unsure whether a
decision is significant enough, prefer the slice doc over a new ADR.

### C. Inputs

```
/write-adr <short decision title>
```

## II. Action

1. Confirm significance. If the decision is slice-local, say so and record it in the
   slice doc instead — do not create an ADR.
2. Read `docs/adr/template.md` and scan `docs/adr/README.md` for the highest `NNNN`.
3. Create `docs/adr/<NNNN+1>-<kebab-title>.md` from the template. Fill Context,
   Decision, Consequences, Alternatives. Set Status (usually `Proposed`, or
   `Accepted` if already agreed) and the date.
4. If this supersedes an existing ADR, set the old one's status to
   `Superseded by ADR-<new>` and cross-link.
5. Add a row to the Index table in `docs/adr/README.md`.
6. Report the file path and status.

## III. Conditions of satisfaction

1. A significant decision produces exactly one ADR file named `NNNN-<slug>.md`,
   sequence continued from the existing highest.
2. The ADR follows the template's sections and carries a Status and date.
3. The Index in `README.md` gains a matching row.
4. A slice-local decision produces no ADR — it is recorded in the slice doc.
5. A superseding ADR links to and flips the status of the one it replaces.
