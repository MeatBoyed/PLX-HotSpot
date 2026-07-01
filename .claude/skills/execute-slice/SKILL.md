---
name: execute-slice
description: "Execute a coding slice doc increment by increment with strict TDD (red-green-refactor), running the project's gates and syncing the slice doc after each increment. Use after plan-slice when building or implementing a planned software slice, or when the user invokes /execute-slice. Software-specific counterpart to the domain-agnostic plan-slice."
trigger: /execute-slice
---

# /execute-slice

## I. Context

### A. Definitions

1. Slice Doc: the planning document produced by the `plan-slice` skill, the unit
   this skill executes. It is read by role, not by exact wording: the Plan
   reference supplies the Definition of Done, Working scope bounds the build, and
   the Decisions, Open questions, Learnings, and Retrospective sections are where
   the log is kept. These are the Required Sections the plan-slice workflow
   guarantees; match them to the doc's actual headings so a reworded-but-present
   section still works.
2. Definition of Done: the observable result the Slice Doc's Plan reference says
   the slice must reach. Execution stops when it is met.
3. Increment: the smallest change in behaviour that moves the slice toward its
   Definition of Done and can be pinned by a single test.
4. TDD Cycle: the three-step loop for one Increment. RED writes a test that fails
   for the right reason; GREEN writes the minimal code to pass it; REFACTOR
   cleans up with the tests staying green.
5. Gates: the project's full verification command (lint, typecheck, tests), for
   example `yarn check`. Read it from the project's CLAUDE.md or package scripts.
6. Drift Sync: recording in the Slice Doc what changed and why before moving on,
   so the doc matches reality. It is append-only: new entries are added and a
   superseded one is marked as changed, never overwritten or deleted, because the
   record of how the plan moved is itself the value.
7. Checkpoint: the pause after one Increment where the skill reports and waits for
   the user before starting the next.

### B. Governing Priority

Discipline beats progress. When following a rule here would slow delivery (writing
the failing test first, stopping at a Checkpoint, running Drift Sync before moving
on), the disciplined path wins. Never trade the test-first order or a Checkpoint
for speed. Within that, the Slice Doc is the source of intent: when code and doc
diverge, the doc is updated append-only (see Drift Sync), never quietly ignored.

### C. Inputs

1. Required: a path to an existing Slice Doc.
2. Optional: which Increment or section to start from. Default is the next
   unfinished one.

Invocation forms:

```
/execute-slice <path-to-slice-doc>
/execute-slice docs/projects/slice-8-foo.md -- start from the parser work
```

### D. Constraints

1. Do not start the loop on a Slice Doc whose Definition of Done is still an
   unfilled placeholder or empty. Stop and ask the user to fill the Plan reference
   first.
2. Do not write production code before a test that fails for the right reason (see
   TDD Cycle).
3. Do not proceed past a Checkpoint without the user's go-ahead.
4. Do not mark an Increment done while the Gates are red.
5. Do not batch Slice Doc updates to the end. Run Drift Sync before each
   Checkpoint.
6. Do not overwrite or delete prior Slice Doc entries during Drift Sync. Append
   the change and its reason; mark a superseded entry rather than erasing it.
7. Do not expand beyond the Slice Doc's Working scope. Surface new scope as an
   Open question or a Decision, do not build it silently.
8. Do not commit or push unless the user asks, and then follow the project's git
   conventions.

## II. Action

### A. Scope

Execute one coding Slice Doc, one Increment at a time, to its Definition of Done.

### B. Tasks

Work in order. The loop in tasks 3 to 7 repeats per Increment.

1. Load the Slice Doc and the Gates command. Read the Slice Doc named in the
   input. Note its Definition of Done, Working scope, Open questions, and Status.
   If the Definition of Done is still an unfilled placeholder or empty, stop and
   ask the user to fill the Plan reference before going further. Find the project's
   Gates command.
2. Set Status to in-progress if it is not already.
3. Pick the next Increment: the smallest behaviour change advancing the Definition
   of Done.
4. Run the TDD Cycle. RED: write a test pinning the Increment's observable
   behaviour and run it; confirm it fails for the intended reason, not a typo or
   compile error. GREEN: write the minimal code to pass. REFACTOR: clean up with
   tests staying green.
5. Run the Gates. All must pass before the Increment counts as done.
6. Drift Sync. Append to the Slice Doc: decisions made, learnings, deferred items,
   and resolved or newly opened questions. When the plan itself changes, log what
   changed and why and mark the superseded entry; do not rewrite the original.
   Route a big or cross-cutting decision to the repo's decisions log and link it
   from the Slice Doc (see Method Note 3).
7. Checkpoint. Report what the Increment delivered, the Gate result, and the
   proposed next Increment. Stop and wait for the user.
8. At the Definition of Done: fill the Slice Doc's Learnings and Retrospective,
   set Status to done, and report.

### C. Method Notes

1. A test that fails on a compile error or typo is not RED. Confirm the failure is
   the missing behaviour before writing production code.
2. If an Increment cannot be expressed as a failing test (config, docs, pure
   glue), it is probably not a behaviour change. Note it and handle it outside the
   TDD Cycle rather than forcing a hollow test.
3. Route decisions by reach to keep each log lean. A slice-local decision stays in
   the Slice Doc. Only a decision that outlives this slice (toolchain, layout, an
   interface others depend on) earns an entry in the repo's decisions log (for
   example `DECISIONS.md`); link it from the Slice Doc. When unsure, keep it in
   the Slice Doc rather than bloating the global log.
4. Scope discovered mid-flight is material for the Checkpoint, not silent work.

## III. Conditions of Satisfaction

1. When an Increment ships, a test for its behaviour was written and seen failing
   before the production code existed.
2. When an Increment is marked done, the project's Gates are green.
3. When an Increment completes, the skill stops at a Checkpoint and reports before
   the next one.
4. When code and the Slice Doc diverge, the Slice Doc is updated before the
   Checkpoint, not at the end.
5. When the plan changes, the change and its reason are appended to the Slice Doc
   and no prior entry is erased; a superseded entry is marked, not deleted.
6. When new scope appears, it is surfaced as an Open question or Decision rather
   than silently built.
7. When the Definition of Done is met, Status is `done` and Learnings and
   Retrospective are filled.
8. When invoked, the skill works only within the named Slice Doc's Working scope.
9. When the Definition of Done is still an unfilled placeholder or empty, the skill
   stops and asks for it rather than starting the loop.
