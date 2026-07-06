---
name: plan-slice
description: Scaffold a planning slice doc in docs/projects/ before building a feature, refactor, or fix. Use when starting a unit of work that's worth thinking through before code, or when the user invokes /plan-slice. Produces one slice doc from this skill's template; does not write code.
---

# /plan-slice

## I. Context

### A. Definitions

1. **Slice** — one planned unit of work (a feature, refactor, or fix) thought
   through in a document before code is written.
2. **Slice Doc** — the single markdown file this skill creates under `docs/projects/`.
3. **Template** — the canonical slice-doc body at `template.md` beside this file.
   It is the source of truth for the slice doc's sections.
4. **Naming Pattern** — `YYYY-MM-DD--NN--<slug>.md`. `NN` is a zero-padded counter
   starting at `01` for the day's first slice, so history sorts in creation order.
5. **Stub** — a placeholder phrased as a prompt for the input wanted, never a bare
   "TODO".

### B. Governing priority

The Template is the source of truth for sections — copy them verbatim, invent none,
drop none. When a section's content is uncertain, write a Stub rather than guessing.

### C. Inputs

```
/plan-slice <title>
/plan-slice <title> -- <one-line description of what this slice delivers>
```

## II. Action

1. Read `template.md` beside this file — its sections are what the new doc contains.
2. List `docs/projects/`. Match the existing filename convention; if empty, use the
   Naming Pattern default. Get today's date.
3. Assign `NN`: `01` if no slice exists for today, else one past the highest.
4. Write the slice doc: populate Status as planning, Started as today, Finished as
   `—`, and Working scope from the `--` description if given. Seed every other
   section as a Stub or from obvious context.
5. Report the file path, the sections left as Stubs, and any open decisions you
   surfaced that the user should resolve before starting.

### Constraints

- Create exactly one file. Do not write code or a second file.
- Do not open the new file for editing after writing it.
- Do not read the codebase exhaustively — a quick scan for context is enough.

## III. Conditions of satisfaction

1. Exactly one slice doc is created, with the Template's sections, none invented or
   dropped.
2. The filename matches the existing convention, or the dated default with an `NN`
   counter when the directory is empty.
3. Working scope is seeded from `-- description` when given, else a Stub.
4. The report names the file path, the Stub sections, and any surfaced decisions.
