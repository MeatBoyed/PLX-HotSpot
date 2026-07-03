# Slice 2026-07-03--01 — AAA emulation for dev (thin stubs + FreeRADIUS DB + e2e in dev/)

**Status:** planning
**Started:** 2026-07-03
**Finished:** —

## Plan reference

Promoted out of the root dev-orchestration slice
([2026-07-01--02](2026-07-01--02--root-dev-orchestration.md)), which reserved the
`aaa` compose profile but wired no emulators. That slice made the apps **boot**; this
one makes them **testable** — the product's core flows (captive auth, voucher, session
telemetry, payment) all depend on integration backends that don't exist in local dev.

**Definition of done (draft — confirm at first checkpoint):**
- The reserved `aaa` compose profile brings up **thin stubs** of the integration
  backends the apps call, reachable from both the ASP.NET API and the host-run Next
  clients.
- The API's runtime integration config (`PlatformSettings` + per-site `RadiusConfig`,
  normally set via admin PATCH) is **seeded** to point at the stubs, so API-mediated
  flows work without manual setup.
- At least one **end-to-end flow proven green** through the stubs, driven by an e2e
  suite that lives in `dev/` and runs against the local stack: the target flow is
  **captive-portal voucher purchase → PayFast IPN → RadiusDesk voucher issued → SMS
  delivered → MikroTik login**, plus **monitor telemetry** rendering real stub data.
- `yarn dev:both --profile aaa` (or an equivalent one-command mode) brings the whole
  testable system up.
- ADR recorded if the stub architecture / e2e tooling choice proves durable.

## Working scope

Build thin, HTTP-shaped emulators for the AAA integration surface mapped on 2026-07-03
(five parallel investigators over api + 4 clients), behind the `aaa` compose profile,
plus the config-seeding and e2e harness that make them useful. Decomposes into:

- **A — MikroTik RouterOS REST stub** (`https://{host}/rest`, HTTP Basic): serve the
  GET paths monitor hits (`/system/resource`, `/ip/hotspot`, `/ip/hotspot/active`,
  `/ip/dhcp-server/lease`, `/interface`, `/log`, …) and the API's set (`/certificate`,
  `/ip/address`, `/ip/pool`, `/ip/dhcp-server*`, `/ip/firewall/address-list`,
  `/ip/hotspot/profile`, `/ip/hotspot`). Honour the self-signed-cert bypass.
- **B — MikroTik hotspot `/login` stub**: accept the credential form POST/GET the two
  captive portals submit and redirect as a real hotspot would.
- **C — RadiusDesk rd_cake stub** (`{base}/cake4/rd_cake/…`, token): `vouchers/add.json`,
  `permanent-users/add.json`, `permanent-users/enable-disable.json`, `profiles/*`.
- **D — FreeRADIUS accounting DB**: a MariaDB/MySQL with the FreeRADIUS schema
  (`radacct`, `radacct_history`, `radpostauth`, `user_stats_dailies`) + seed rows — the
  API reads these as SQL, so this is a real DB container, **not** a RADIUS server.
- **E — PayFast stub** (optional): `/eng/process` accept + fire a signed IPN back, so
  payment is testable offline (sandbox works online).
- **F — SMS stub** (optional): capture-and-assert endpoint for generic + EC1 gateways
  (dry-run mode already exists when unset).
- **G — Clerk**: NOT emulated (external SaaS) — use test keys / Clerk test mode; only
  admin + legacy-admin need it, not the captive flows.
- **H — Config seeding**: seed `PlatformSettings` + `RadiusConfig` DB rows (or script
  the admin PATCH endpoints) to point the API at A/C/D.
- **e2e harness**: tooling (likely Playwright) + tests under `dev/`, run against the
  local ports, gated like `yarn test:dev`.

## Assumptions going in

From the 2026-07-03 integration-surface map (investigators over api + admin + current
captive-portal + monitor + legacy):

- The whole surface is **HTTP + one SQL schema** — RouterOS *REST*, hotspot *login page*,
  RadiusDesk *rd_cake* HTTP, and RADIUS consumed as *SQL tables*. Nothing consumes the
  RouterOS binary API or RADIUS UDP, so **thin HTTP stubs beat real CHR/FreeRADIUS** —
  fidelity those bring is unused here.
- The API is the hub for most admin + captive UI, **but** the portals also call
  RadiusDesk / MikroTik-login / SMS / PayFast **directly**, so stubs must be reachable
  from the host Next servers, not just from the API container.
- API integration config is **DB-resident** (`PlatformSettings`, per-site `RadiusConfig`
  via admin PATCH), gated by `IsXConfigured` flags — not env/appsettings. Seeding those
  rows is a required step, not an env tweak.
- Clerk is the only genuinely-external dependency and only blocks admin/legacy-admin;
  captive flows are Clerk-free.
- PostHog + Revive/VAST ads are non-blocking (fail silently) — ignored this slice.

## Decisions made during the slice

Slice-local decisions only. A decision that outlives the slice (stub architecture, e2e
tooling, on-disk layout) goes in an ADR under `docs/adr/` — link it here.

To ratify at first checkpoint:
- **Thin HTTP stubs over real CHR/RadiusDesk/FreeRADIUS** (from the map — surface is
  HTTP-shaped; real backends buy unused fidelity). Candidate ADR if it holds.

## Deferred / pushed forward

What we explicitly are not doing this slice, and where it picks up.

- **Real RouterOS CHR / RadiusDesk / FreeRADIUS fidelity** — only if a later need
  demands protocol-level accuracy; the stubs cover dev + e2e.
- **Clerk emulation** — not attempted; test keys/mode instead.
- **Production/deploy wiring** — local inner loop + e2e only.
- **Ad server + PostHog emulation** — non-blocking, skipped.

## Open questions

Still TBD as the slice progresses.

- **Stub packaging**: one small multi-route service (single image) vs a stub per system
  (A/B/C/E/F as separate compose services)? Fewer images vs cleaner separation.
- **Stub implementation**: hand-rolled Node/Express, a mock tool (Prism/WireMock/
  mockoon), or record-replay? Trade fidelity/effort.
- **e2e framework**: Playwright (assumed) vs alternative; where the runner lives in
  `dev/` and how it hooks the gate.
- **Config seeding mechanism**: raw SQL seed into the app DB vs a script that drives the
  admin PATCH endpoints (exercises the real code path but needs Clerk/auth).
- **Clerk in e2e**: Clerk test mode / testing tokens vs a bypass for automated runs.
- **FreeRADIUS schema source**: import the upstream schema vs hand-author the ~4 tables
  the API reads; how much seed data a realistic telemetry view needs.
- **TLS for the MikroTik REST stub**: self-signed cert + `MIKROTIK_TLS_VERIFY=false`, or
  plain HTTP with the base URL overridden.

## Learnings

(Fill in as you discover them.) Durable knowledge this slice produces about the codebase,
the domain, or the tooling — facts that outlive the slice and inform later ones.

- ...

## Retrospective

(Fill in at wrap-up.) What worked, what we'd do differently, what surprised us.
