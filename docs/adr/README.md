# Architecture Decision Records

An ADR captures **one architecturally significant decision** — its context, the
choice made, and the consequences — so the reasoning survives the people who made it.

## When to write one

Record a decision here when it outlives a single slice and constrains future work:
a technology or library choice, an on-disk or module layout, an interface other code
depends on, a trust boundary, a data-ownership rule. Slice-local decisions stay in
their slice doc (`docs/projects/`), not here.

## Convention

- One file per decision: `NNNN-kebab-title.md`, `NNNN` a zero-padded sequence
  starting at `0001`.
- Use `template.md` in this folder as the starting point.
- Status moves `Proposed → Accepted → (Superseded by NNNN | Deprecated)`. Never edit
  a decided ADR's substance — supersede it with a new one and link both ways.

## Index

| ADR | Title | Status |
| --- | --- | --- |
| [0001](0001-dependency-pinning-policy.md) | Pin all direct dependencies to exact versions | Accepted |
