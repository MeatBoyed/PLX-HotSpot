# CLAUDE.md

Guidance for Claude Code working in this repository.

## What this is

A **multi-tenant captive portal** for public WiFi. It is a presentation /
orchestration front-end that delegates AAA (authentication, authorisation,
accounting) to **RadiusDesk + MikroTik**, with **PayFast** for paid purchases. One
codebase serves many sites (SSIDs), each branded and configured independently.

Stack: **Next.js 16** (App Router, Turbopack) · **React 19** · **TypeScript**
(strict) · **Prisma 7** (Postgres) · **Tailwind 4** + shadcn/ui · **Clerk** (admin
auth) · **zod**-validated env · **PostHog** analytics. Deployed as one Docker
container per site.

## Layout

- `src/app/` — routes (App Router) with colocated server actions; `api/` route
  handlers.
- `src/components/` — UI; `ui/` is shadcn.
- `src/lib/services/` — server-only services (branding, auth, SMS).
- `src/features/purchasing/` — PayFast + voucher / permanent-user issuance.
- `prisma/` — schema + migrations (branding, packages, marketing, OTP).
- `docker/` — Dockerfile + per-site compose files; build context is the repo root.
- `docs/` — `projects/` (slice docs), `adr/` (decision records), `capabilities/`
  (assessment scorecard + gap analysis). Start at `docs/capabilities/README.md` for
  the current state of the code.
- `archive/` — dormant legacy/parallel trees (old PHP portal, the Hono rewrite,
  raw MikroTik hotspot templates). **Not production. Don't build on it.**

The production app sits at the repo root (it was relocated from a subfolder — see
the bootstrap slice in `docs/projects/`).

## Commands

- `npm run dev` — local dev (Turbopack).
- `npm run build` — production build. Run before declaring a change done.
- `npm run lint` — ESLint (`eslint-config-next`).
- `npm run capabilities:render` / `capabilities:check` — regenerate / drift-check the
  capability scorecards from their JSON source of truth.
- Tests: a Vitest + Testing Library suite is being bootstrapped; once present,
  `npm test` is part of the gate.

## How we work

- **Plan before building.** Use `/plan-slice` to scaffold a slice doc in
  `docs/projects/`, then work it increment by increment. The slice doc is a living
  record: log what changed and why; don't overwrite history.
- **Record lasting decisions** with `/write-adr` into `docs/adr/`. Slice-local
  decisions stay in the slice doc.
- **Ground code judgements** in `/capability-reference` before claiming how
  complete/secure/reliable a capability is — the assessment in `docs/capabilities/`
  is the recorded baseline (git ref `d8e6f87`). Framing is solutions, not blame.
- **Re-score with `/update-capabilities`** when code changes move a capability: edit
  the JSON in `docs/capabilities/data/`, run `npm run capabilities:render`, keep the
  narrative in sync. The tables (`scorecards.md`) are generated — never hand-edited.
- **Vet dependencies** with `/supply-chain-guard` before adding or bumping packages.
  Keep `package.json` and `package-lock.json` committed together; never delete the
  lockfile to resolve a conflict.

## Conventions

- TypeScript `strict`; keep it that way (the assessment counted only 3 `any`).
- Validate env through `src/env.ts` (zod) — don't read `process.env` ad hoc.
- Secrets live in env / per-site `.env` files, never in committed code.
- Known weak spots to handle with care (see `docs/capabilities/gap-analysis.md`):
  the MikroTik login handoff, payment IPN durability, the in-memory voucher store,
  and the blanket-public `/api(.*)` middleware matcher.
