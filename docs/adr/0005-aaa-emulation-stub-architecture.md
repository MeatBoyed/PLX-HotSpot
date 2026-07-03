# ADR 0005 — AAA-emulation stub architecture: thin HTTP stubs as Fastify workspaces

**Status:** Accepted
**Date:** 2026-07-03
**Deciders:** Alex Veldtman
**Scope:** monorepo

## Context

The apps' core flows (captive auth, voucher purchase, session telemetry, payment)
depend on integration backends that don't exist in local dev: MikroTik RouterOS,
RadiusDesk, a FreeRADIUS accounting DB, PayFast, an SMS gateway. ADR 0004 reserved an
`aaa` compose profile for these but wired nothing. The AAA-emulation slice
(`docs/projects/2026-07-03--01`) fills it. A 2026-07-03 integration-surface map (five
investigators over `api/` + four clients) established the shape of the dependency:

- The whole surface is **HTTP + one SQL schema**. RouterOS is consumed as *REST*, the
  hotspot as a *login page*, RadiusDesk as *rd_cake HTTP*, and FreeRADIUS purely as
  *SQL tables* (via MySqlConnector) — nothing uses the RouterOS binary API or RADIUS
  UDP. So real CHR / RadiusDesk / FreeRADIUS servers would buy protocol fidelity the
  code never exercises.
- The portals call some backends (RadiusDesk, MikroTik login, SMS, PayFast) **directly**
  from the host Next servers, not only via the API — so emulators must be reachable from
  both the API container and host clients.

This decision fixes how those emulators are built, packaged, and depended on across the
monorepo, so it is monorepo-scoped, not slice-local. The stub pattern has now been
proven across two independent systems (MikroTik REST — stub A; RadiusDesk rd_cake —
stub C), which is the trigger for recording it.

## Decision

We will emulate the AAA integration surface with **thin, hand-rolled HTTP stubs, one per
system, each a Yarn workspace under `dev/stubs/*` built on Fastify** — not real backend
images and not a mock-server tool.

- **Thin HTTP stubs over real backends.** Each stub reproduces only the request/response
  shapes the code actually consumes (paths, auth, field names, encoding quirks), backed
  by small in-memory fixtures. The one exception is FreeRADIUS, which the API reads as
  SQL — that is a real MariaDB with the four consumed tables (stub D), not a stub server.
- **Fastify, hand-rolled.** Full control over stateful and quirk-heavy behaviour
  (RouterOS kebab-case + `.id` keys, RadiusDesk `{success,data}` with token-in-query-or-body
  and form-urlencoded bodies) that a declarative mock tool models awkwardly. Fastify over
  Express/Koa: maintained, schema-capable, first-class `app.inject()` for transport-free tests.
- **One workspace per stub** (`@auraconnect/stub-<system>` under `dev/stubs/*`, added to
  the root `workspaces` glob). Deps pin in the single root `yarn.lock` per ADR 0002;
  `nmHoistingLimits: workspaces` keeps each stub's `node_modules` local, so its Dockerfile
  can copy the workspace as-is with no in-image install.
- **One compose service per stub**, behind the `aaa` profile, on the `548x` host-port
  lane (radiusdesk 5480, mikrotik 5481, radius-db 5482), reachable by compose-service DNS
  in-network and `localhost:<lane>` on host.
- **Transport matches the consumer.** MikroTik hardcodes `https://…/rest` and bypasses
  cert verification, so its stub serves self-signed HTTPS with a committed dev-only cert.
  RadiusDesk's base URL is fully configurable, so its stub serves plain HTTP.
- **Tested at two altitudes.** Route/auth/shape behaviour via `app.inject()` in
  `dev/*.test.mjs` (fast, flake-free, no network); compose wiring via
  `docker compose config` assertions. Both run under the existing `yarn test:dev` gate.

## Consequences

- **Easier:** one command (`yarn dev:both --profile aaa`) brings up a testable system;
  stubs boot in milliseconds; new stubs follow a copy-the-workspace template; deps stay
  under the hardened single-lockfile supply-chain policy; tests need no live network.
- **Harder / costs:** stubs must be kept faithful **by hand** as the consuming code
  evolves — a field the code starts reading that the stub doesn't emit is a silent gap,
  caught only if a test asserts it (mitigated for the API by chain-consistency tests, and
  later by the e2e suite). Stubs deliberately do **not** validate requests or enforce
  RADIUS/RouterOS semantics; they are dev/e2e fixtures, not conformance servers.
- **Follow-on:** if a future need demands protocol-level accuracy (real CHR, a real
  RadiusDesk), that supersedes this per-stub, not wholesale. A committed self-signed cert
  lives in-repo (dev-only, non-secret).

## Alternatives considered

- **Real backend images (RouterOS CHR, RadiusDesk, FreeRADIUS server).** Heavy, slow to
  boot, licensing/pinning burden, and they emulate protocols (binary API, RADIUS UDP)
  the code never touches. Fidelity we wouldn't use.
- **A mock-server tool (Prism / WireMock / Mockoon).** Another runtime + image, and a
  poor fit for the stateful, quirk-heavy behaviour (token-in-query-or-body, recursive
  voucher-code scanning, RouterOS encodings). Less control than a few Fastify routes.
- **One multi-route service for all stubs.** Fewer images, but couples unrelated systems,
  muddies the per-system port lanes, and blocks bringing one stub up in isolation.
- **Express or Koa instead of Fastify.** Express is effectively legacy; Koa is thin but
  needs middleware assembly for body parsing/validation Fastify gives natively.
