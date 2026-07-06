# Slice 2026-07-03--01 — AAA emulation for dev (thin stubs + FreeRADIUS DB + e2e in dev/)

**Status:** done
**Started:** 2026-07-03
**Finished:** 2026-07-06

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
  HTTP-shaped; real backends buy unused fidelity). ~~Candidate ADR if it holds.~~ →
  RATIFIED as [ADR 0005](../adr/0005-aaa-emulation-stub-architecture.md) at Checkpoint 8
  (pattern proven across stubs A + C).

### Checkpoint 1 (2026-07-03) — ratified

- **Draft DoD ratified** as written (no changes). The five sub-goals stand.
- **Thin stubs confirmed** — direction above holds; ADR deferred until the stub
  pattern is proven across ≥2 systems (revisit after stub A).
- **Packaging: stub-per-system** — one compose service per backend behind `aaa`,
  not one multi-route image. (Resolves the "stub packaging" open question.)
- **Stub impl: hand-rolled Node, Fastify** (over Express/Koa) — modern, schema
  validation useful for asserting stub request shapes. *Provisional* — does not bite
  until stub A (D is a DB, no Node service); ratify Fastify-vs-Koa when A lands.
- **e2e: Playwright under `dev/`, gated like `test:dev`** — but *deferred* to a late
  increment once flows exist; early increments stay infra-only.
- **Increment order** — build D (FreeRADIUS accounting DB) first; split into
  **Inc 1 compose wiring** + **Inc 2 schema/seed**.
- **MariaDB pinned `mariadb:11.4.5`** (LTS), exact tag per ADR 0002. `radius-db`
  publishes host port **5482** on the new **548x AAA lane** (5480 radiusdesk /
  5481 mikrotik reserved).
- **FreeRADIUS schema source: hand-author the 4 tables the API reads** (not import
  the full upstream RD schema) — the API touches only `radacct`, `radacct_history`,
  `radpostauth`, `user_stats_dailies`. (Resolves that open question.)

Inc 1 delivered: `radius-db` MariaDB service behind `aaa`, off by default, on its own
port lane. Pinned by `dev/aaa.test.mjs` (compose-config assertions). Gate `yarn
test:dev` green (19/19).

### Checkpoint 2 (2026-07-03) — Inc 2: RADIUS DB schema + seed

- **DDL faithfulness** — `radacct` authored with the full upstream column set (from the
  schema-explorer report), `radacct_history` via `CREATE TABLE … LIKE radacct` (identical
  shape, no drift). NOT-NULL varchars with an empty upstream default get `DEFAULT ''` so
  the seed names only meaningful columns. Slice-local.
- **Seed uses `NOW()`-relative timestamps** (`NOW() - INTERVAL n DAY/HOUR`), not literal
  dates — telemetry stays inside a rolling "last N days" window whenever the volume is
  initialised. 4 users / 2 sites, mix of open (NULL `acctstoptime` = active) + closed
  sessions, a week of `radacct_history`, one `Access-Reject` among the auth log.
- **Test strategy** — `dev/radius-db-init.test.mjs` runs a throwaway MariaDB, mounts the
  init dir, and executes the API's *own* aggregate SQL (copied from
  `RadiusAccountingClient.cs`), asserting non-empty. Schema/seed drift from what the API
  expects goes red. Mirrors `db-init.test.mjs`.

Inc 2 delivered: `dev/radius-db/init/{10-schema,20-seed}.sql` — the four tables +
realistic seed, the API's real queries proven non-empty against them. Gate `yarn
test:dev` green (24/24).

### Checkpoint 3 (2026-07-03) — Inc 3: API RADIUS-DB config seed (stub H)

- **Mechanism** (as ratified Checkpoint 2): raw SQL upsert of the singleton
  `platform_settings` row (`id='platform'`) into the API's Postgres, pointing the five
  `radius_db_*` columns at the stub (`radius-db:3306`, `radius`/`radius`/`radius_pw`).
  `IsRadiusDbConfigured` is a *computed* C# property requiring all five non-empty — the
  seed satisfies exactly that. Password stored plaintext (API reads it verbatim).
- **Ordering constraint** — `platform_settings` is created by EF `MigrateAsync()` at API
  startup (`Program.cs`), NOT by `dev/init/*`. So the seed must run *after* the API has
  booted once. Wired as `yarn dev:seed` (psql into the compose `postgres` service),
  run-after-up — not an auto-init. Documented, not automated this increment.
- **Idempotent** via `ON CONFLICT (id) DO UPDATE`; keeps the row single (repo uses
  `SingleOrDefault` — a second row would throw).
- **Flaky-test fix (durable)** — the two container-based DB tests intermittently failed
  with `FATAL: the database system is shutting down`. Cause: the official Postgres/MariaDB
  images run a **socket-only temporary server** during init, then restart the real one; a
  unix-socket connection catches the temp server mid-restart. Fix: connect over **TCP
  (`-h127.0.0.1`)** — the temp server binds socket-only, so TCP is refused until the real
  server is up, eliminating the window. (See Learnings.) Gate now deterministic across 3×
  full runs.

Inc 3 delivered: `dev/seed/platform-settings.sql` + `yarn dev:seed` + gates
`dev/platform-settings-seed.test.mjs` (integration) and a `dev:seed` contract check in
`scripts.test.mjs`. Gate `yarn test:dev` green (28/28, stable ×3).

### Checkpoint 4 (2026-07-03) — Inc 4: MikroTik REST stub skeleton (stub A, part 1)

- **Fastify 5.9.0 confirmed** (over Express/Koa) and supply-chain-vetted: MIT, official
  repo, core-team maintainers (incl. Matteo Collina), no install/lifecycle scripts (no
  `built:` allowlist entry needed), exact-pinned, `yarn install --immutable` clean.
- **On-disk layout: stubs are yarn workspaces under `dev/stubs/*`** (added to the root
  `workspaces` glob) — so each stub's deps are pinned in the single root `yarn.lock` per
  ADR 0002, and `nmHoistingLimits: workspaces` keeps them in the stub's own
  `node_modules`. First stub: `@auraconnect/stub-mikrotik` (`dev/stubs/mikrotik`).
  *Durable* → ADR candidate; defer until the pattern proves across ≥2 stub services
  (revisit after stub C), consistent with the thin-stub ADR deferral.
- **Test strategy: `app.inject()`** (Fastify in-process) for route/auth behaviour — no
  network/TLS/docker, so fast + flake-free. A top-level `dev/mikrotik-stub.test.mjs`
  imports the app by relative path; the app resolves its own `fastify` from the
  workspace `node_modules`, so the `dev/*.test.mjs` gate glob still runs it. TLS +
  compose wiring get their own pins in a later increment.
- **Auth model** — `buildApp({user, pass})` (env `MIKROTIK_STUB_USER`/`_PASS`, default
  `admin`/`admin`); an `onRequest` hook gates the whole `/rest` surface with HTTP Basic,
  answering 401 + `WWW-Authenticate` like RouterOS.

Inc 4 delivered: `dev/stubs/mikrotik/{package.json,app.mjs}` (Fastify app, Basic auth,
`GET /rest/system/resource` → the lone RouterOS object the monitor dashboard reads).
Gate `yarn test:dev` green (31/31).

### Checkpoint 5 (2026-07-03) — Inc 5: monitor-facing RouterOS paths (stub A, part 2)

- Added the seven remaining monitor calls: array GETs `/ip/hotspot/active` (honours
  `?server=`), `/ip/dhcp-server/lease`, `/ip/hotspot/user`, `/ip/hotspot`, `/log`
  (honours `?topics=`), `/interface`; `POST /interface/monitor-traffic` (one-shot
  bits/sec sample for the requested interface); `DELETE /ip/hotspot/active/:id` (204).
- **Fidelity choices** (slice-local): two hotspot sites (`hs-site-01/02`) so `?server=`
  filtering is exercisable; RouterOS `.id` dot-key + kebab-case throughout; counters as
  strings (RouterOS REST encoding) EXCEPT `monitor-traffic` bits/sec as numbers (matches
  what `TrafficChart.tsx` reads). Query filters honoured server-side for active + log.
- All routes stay behind the same Basic-auth hook (POST/DELETE 401 without creds, pinned).

Inc 5 delivered: 10 new `app.inject()` tests, all monitor RouterOS paths served with the
rendered fields. Gate `yarn test:dev` green (41/41).

### Checkpoint 6 (2026-07-03) — Inc 6: API-facing RouterOS paths (stub A, part 3)

- Added the API gateway-verification GETs (all arrays): `/ip/hotspot/profile`,
  `/certificate`, `/ip/address`, `/ip/pool`, `/ip/dhcp-server`,
  `/ip/dhcp-server/network`, `/ip/firewall/address-list` (plus reusing `/ip/hotspot`).
- **Fixtures form a consistent chain** for two sites: profile→cert (ssl-certificate),
  server.profile→profile, server.interface→ip/address→CIDR, server.address-pool→pool,
  server.interface→dhcp-server, CIDR→dhcp network + `hotspot-list` firewall entry. A
  dedicated test walks the whole chain and asserts every link resolves — stronger than
  field-presence, and the exact shape `MikroTikGatewayService` needs to report healthy.
- **RouterOS encoding honoured**: bools as `"yes"`; cert `flags:"KAT"` (no `E`=expired);
  dates in accepted formats (`invalid-after` = `yyyy-MM-dd HH:mm:ss`, `creation-time` =
  `MMM/dd/yyyy HH:mm:ss`) — pinned by a date-format test.
- Route note: `/ip/dhcp-server`, `/ip/dhcp-server/lease`, `/ip/dhcp-server/network` and
  the `/ip/hotspot*` family are distinct static Fastify routes — no path conflicts.

**Stub A app functionally complete** (all monitor + API RouterOS paths). Remaining for A:
self-signed TLS + compose service on the `aaa` lane (`5481`) — next increment.

Inc 6 delivered: 9 new `app.inject()` tests incl. the chain-resolves check. Gate
`yarn test:dev` green (50/50).

### Checkpoint 7 (2026-07-03) — Inc 7: containerize stub A + wire into `aaa`

- **TLS decision: self-signed HTTPS** (over plain HTTP). Both consumers hardcode
  `https://{host}/rest` and already bypass verify (`MIKROTIK_TLS_VERIFY=false` /
  `ServerCertificateCustomValidationCallback`); plain HTTP would force code changes in
  API + monitor — out of scope. Dev-only cert committed at
  `dev/stubs/mikrotik/certs/{cert,key}.pem` (CN `mikrotik-stub`, SAN `mikrotik`,
  `localhost`, `127.0.0.1`, 10y). Resolves the TLS open question.
- `buildApp({https})` now passes a `{key,cert}` pair to Fastify (omitted → plain, for
  `app.inject`). `server.mjs` loads the cert + listens on `$PORT` (8443). `Dockerfile`
  (`node:22.20.0-alpine`, exact pin) copies the workspace as-is incl. its local
  `node_modules` (fastify pure-JS, no install/build in image).
- Compose service `mikrotik` (build `./stubs/mikrotik`, `aaa` profile, `5481:8443`),
  reachable as `mikrotik:8443` in-network and `localhost:5481` on host.
- **Two RED→GREEN cycles**: (1) real-HTTPS test (`mikrotik-stub-tls.test.mjs`) — RED
  `EPROTO packet length too long` (server was plaintext) → GREEN; (2) compose wiring in
  `aaa.test.mjs` — RED (service missing) → GREEN.
- **Container verified manually**: `docker build` + run + `curl -k -u admin:admin` →
  `/rest/system/resource` 200, no-auth 401, `/rest/ip/hotspot/profile` returns the chain
  data. (Container smoke kept out of the gate to stay fast/deterministic; real
  end-to-end proof lands in the e2e increment.)

**Stub A COMPLETE** (app + TLS + container + compose). Inc 7 delivered:
`server.mjs`, `Dockerfile`, `certs/`, `mikrotik` compose service, `.env.example` creds,
2 TLS tests + 2 compose tests. Gate `yarn test:dev` green (54/54).

### Checkpoint 8 (2026-07-03) — Inc 8: RadiusDesk rd_cake stub app (stub C, part 1)

- Second Fastify stub → the stub pattern is now proven across two systems, so the
  **stubs-architecture ADR is written: [ADR 0005](../adr/0005-aaa-emulation-stub-architecture.md)**
  (thin HTTP stubs, Fastify, one workspace + one compose service per system, transport
  matches the consumer). This ratifies and supersedes the two earlier ADR-candidate
  notes (thin-stubs; stubs-as-workspaces layout).
- **rd_cake surface** (from the 2026-07-03 map): 8 endpoints under `cake4/rd_cake/`.
  Token via `?token=` query OR a body field (never a login step); most POSTs
  form-urlencoded, `permanent-users/add` (TS) + `profiles/delete` are JSON;
  responses `{success, data}` except `profiles/index.json` → top-level `{items:[{id,name}]}`.
  Auth failure = HTTP 200 + `success:false` (RadiusDesk's actual behaviour), not 401.
- **Transport: plain HTTP** (base URL is fully configurable, unlike MikroTik) — no cert.
- Form bodies parsed via a `node:querystring` content-type parser (no extra dep, keeps
  Fastify the only stub dependency).

Inc 8 delivered: `dev/stubs/radiusdesk/{package.json,app.mjs}` (Fastify app, token guard,
8 rd_cake routes) + `dev/radiusdesk-stub.test.mjs` (7 `app.inject()` tests) + ADR 0005.
Gate `yarn test:dev` green (61/61). Remaining for C: containerize + compose wiring.

### Checkpoint 9 (2026-07-03) — Inc 9: containerize stub C + wire into `aaa`

- `server.mjs` (plain HTTP on `$PORT` 8080) + `Dockerfile` (same `node:22.20.0-alpine`
  copy-workspace template as stub A). Compose service `radiusdesk` (`build
  ./stubs/radiusdesk`, `aaa`, `5480:8080`), `.env.example` token documented.
- RED (`aaa.test.mjs` radiusdesk assertions, service missing) → GREEN.
- **Container verified manually**: build + curl — voucher issue with good token
  (`{success:true,data:{voucher:"VCH-…"}}`), bad token (`{success:false}`), profiles
  index (`{items:[…]}`).

**Stub C COMPLETE** (app + container + compose). Inc 9 delivered: `server.mjs`,
`Dockerfile`, `radiusdesk` compose service, `.env.example` token, 2 compose tests. Gate
`yarn test:dev` green (63/63).

### Checkpoint 10 (2026-07-03) — Inc 10: MikroTik hotspot /login stub (stub B)

- **Login contract** (from the 2026-07-03 map): both captive portals submit via a **real
  browser GET navigation** to `<gateway>/login?username=&password=[&dst=]`, **PAP
  plaintext** (no CHAP), and rely on the gateway's **HTML redirect** — the stub returns
  302/HTML, never JSON. No `link-login-only`/`chap-*` in the submit (those are the
  reverse router→portal direction, handled by the portals' own `post-handler`).
- **Behaviour**: `GET /login` with creds → 302 to `dst` (portal's `/welcome`) else the
  status page; without creds → HTML login form; `GET /status` → HTML "Connected".
- **PACKAGING (supersedes the earlier `mikrotik-login` reservation note)**: hotspot login
  is the **same RouterOS system** as stub A, so per [ADR 0005](../adr/0005-aaa-emulation-stub-architecture.md)
  it lives in the **one `mikrotik` service** — `login.mjs` (`buildLoginApp`) served by a
  **second plain-HTTP listener** in `server.mjs` (REST HTTPS 8443 + login HTTP 8080),
  published on a new `5483` lane. Not a separate compose service.
- Two RED→GREEN cycles: (1) `mikrotik-login-stub.test.mjs` — 5 `app.inject()` tests, RED
  (routes 404) → GREEN; (2) compose second port in `aaa.test.mjs`, RED → GREEN.
- **Container verified**: one image, both listeners — REST HTTPS 200, `/login` 302→dst,
  login form HTML.

**Stub B COMPLETE.** Inc 10 delivered: `login.mjs`, `server.mjs` dual listener, Dockerfile
`EXPOSE 8080`, `mikrotik` second port, `.env.example` `MIKROTIK_LOGIN_HOST_PORT`, 5 login
tests + 1 compose test. Gate `yarn test:dev` green (69/69).

### Checkpoint 11 (2026-07-03) — Inc 11: PlatformSettings MikroTik config seed (stub H, part 2)

- Extended `dev/seed/platform-settings.sql` to set `mikrotik_api_host='mikrotik:8443'`,
  `mikrotik_username/password='admin'` on the singleton row → points the API's
  `MikroTikGatewayService` at stub A's HTTPS REST listener (self-signed cert accepted by
  the API's MikroTik HttpClient). `IsMikroTikConfigured` (computed, needs all 3) satisfied.
- The **singleton `platform_settings` config seed is now complete**: RadiusDb (Inc 3) +
  MikroTik (Inc 11). Pinned by extending `platform-settings-seed.test.mjs` (fixture +
  mikrotik-columns assertion).
- **Scope surfaced (not silently built)**: the remaining config seeds are bigger and get
  their own increments —
  - **Inc 12 — per-site captive DB seed (J1)**: `radius_config` (→ stub C:
    `radiusdesk_url='http://radiusdesk:8080'`, token, realm/cloud) has a **FK chain**
    `tenants → sites → radius_config` (+ `packages` for voucher `profile_id`). Multi-table
    seed; needs a dev tenant + site + package.
  - **Inc 13 — host-client env**: monitor `MIKROTIK_HOST/USER/PASS/TLS_VERIFY` → stub A;
    captive `MIKROTIK_RADIUS_DESK_BASE_URL`/`RADIUSDESK_TOKEN`/realm/cloud/profile +
    `NEXT_PUBLIC_MIKROTIK_BASE_URL` (login) → stubs, in `.env.current.example` (different
    mechanism from SQL, so a separate increment).

Inc 11 delivered: mikrotik columns in the platform seed + test. Gate `yarn test:dev`
green (70/70).

### Checkpoint 12+13 (2026-07-03) — captive DB seed + host-client env (stub H, parts 3–4)

Batched two config-seed increments (both "point consumers at stubs", different mechanisms).

**Inc 12 — per-site captive DB seed** (`dev/seed/captive-site.sql`):
- Installs the `tenants → sites → radius_config` chain (`tenant-dev` → `site-dev` →
  config). `radius_config` points the API at stub C (`radiusdesk_url='http://radiusdesk:8080'`,
  token `dev-radiusdesk-token`, realm/cloud `1`) and the browser at stub B
  (`gateway_url='http://localhost:5483'`). Both network perspectives are correct:
  in-network DNS for the API container, host lane for the browser.
- Pinned by `dev/captive-seed.test.mjs` — throwaway PG with the **real FK chain** (so an
  out-of-order/dangling seed fails loudly), asserts the chain joins + stub-pointing config
  + idempotency. Uses the TCP-connect pattern (no temp-server flake).
- **`dev:seed` generalized**: now `cat dev/seed/*.sql | psql …` (applies platform-settings
  + captive-site + any later seed). Superseded the single-file `dev:seed`; the
  `scripts.test.mjs` assertion updated from the `platform-settings.sql` literal to the
  `dev/seed/*.sql` glob (mechanism change, logged here).

**Inc 13 — host-client env** (`.env.current.example`, pinned by `dev/aaa-env.test.mjs`):
- Monitor telemetry → stub A: `MIKROTIK_HOST=localhost:5481`, `MIKROTIK_USER/PASS=admin`,
  `MIKROTIK_TLS_VERIFY=false` (uncommented the reserved AAA block).
- Captive direct RadiusDesk → stub C: `MIKROTIK_RADIUS_DESK_BASE_URL=http://localhost:5480`,
  `RADIUSDESK_TOKEN=dev-radiusdesk-token`, realm/profile/cloud = `1/102/1`.
- Captive browser login → stub B: `NEXT_PUBLIC_MIKROTIK_BASE_URL=http://localhost:5483`.

**Journey readiness now**: J2 (monitor telemetry) is fully wired — stub A + D + config
(H) + monitor env — ready for an e2e proof. J1 (voucher purchase) has tenant/site/radius
config + captive env, but the **voucher path's `profile_id`/`realm_id`/`cloud_id` come from
a Package** (`voucher-service.ts` reads `pkg.*`) — a `packages` row is NOT yet seeded.
Deferred to the J1 e2e increment (seed a dev package there, or drive the permanent-user
path which reads the env ids).

Inc 12+13 delivered: `captive-site.sql`, generalized `dev:seed`, `.env.current.example`
stub wiring, `captive-seed.test.mjs` (4) + `aaa-env.test.mjs` (3) + updated scripts test.
Gate `yarn test:dev` green (77/77, deterministic ×2).

### Checkpoint 14 (2026-07-03) — Inc 14: Playwright e2e harness + first green e2e

- **Harness**: new workspace `@auraconnect/e2e` (`dev/e2e`, added to `workspaces`),
  `@playwright/test@1.61.1` (exact, supply-chain-vetted: official MS repo/maintainers, no
  own scripts). `playwright.config.mjs` + `global-setup`/`global-teardown` +
  `dev/e2e/tests/`. Root gate `yarn test:e2e` (separate from `test:dev` — e2e builds/ups
  containers, too heavy for the unit gate). Contract check added to `scripts.test.mjs`.
- **DELIBERATE: API request-context, no browser.** Playwright's `request` context (Node
  fetch) hits the stubs over the real network — so the `playwright` browser-download
  postinstall stays blocked by `enableScripts:false` (no `built:` entry, 30 KiB added,
  no browsers), and we dodge the sandbox loopback limits. `global-setup` does
  `docker compose --profile aaa up -d --build mikrotik radiusdesk` + polls readiness;
  `global-teardown` stops them.
- **First e2e green (4 tests)** against the running stack: monitor-telemetry data path →
  stub A (`/rest/system/resource` + `/rest/ip/hotspot/active`, HTTPS + Basic, self-signed
  cert accepted), 401 without auth; captive voucher → stub C (`vouchers/add.json` with
  token → `VCH-…`), `success:false` on bad token. This is the DoD's "≥1 end-to-end flow
  proven green through the stubs, driven by a `dev/` suite against the local stack".
- RED (no-op setup → stubs down → 4× 30s timeout) → GREEN (setup builds+ups stubs).

**Staged next (need the full app stack booted, per the sandbox constraint — run in a
separate console):**
- **Browser-UI J2**: drive the monitor dashboard in a real browser, assert it renders the
  stub A + FreeRADIUS-D telemetry (needs API + monitor up; needs `playwright install`
  browsers, i.e. allowlisting the download or a host install).
- **J1 full chain**: voucher purchase through the captive UI incl. a seeded dev `packages`
  row (voucher `profile_id` source) + optional PayFast (E) / SMS (F) stubs.

Inc 14 delivered: `dev/e2e/*` harness, `yarn test:e2e`, 4 request-context e2e tests, Playwright
dep. Unit gate `yarn test:dev` 78/78; `yarn test:e2e` 4/4 against the live stubs.

### Checkpoint 15 (2026-07-03) — Inc 15: one-command `yarn dev:aaa`

- **`dev:aaa`** brings up the full `aaa` stack (`--profile aaa up -d --build postgres api
  radius-db mikrotik radiusdesk`), waits for the API to migrate (`node
  dev/wait-migrated.mjs` polls until `platform_settings` exists — dodges the
  seed-races-migration hazard), runs `yarn dev:seed`, then starts the current clients
  (admin/captive/monitor) on their ports with `.env.current` layered (now stub-pointed).
- Pinned by a `dev:aaa` contract test in `scripts.test.mjs` (profile, up, the three
  stubs, seed, the three clients + `.env.current`), matching how the other `dev:*` modes
  are gated (contract, not live boot).
- **LIVE-VALIDATED end to end**: booted the real stack, `wait-migrated` returned ready,
  and `yarn dev:seed` applied cleanly against the **actual EF-migrated schema** — 4
  INSERTs (platform_settings + tenant + site + radius_config), no column mismatch. This
  confirms `platform-settings.sql` + `captive-site.sql` match real migrations, not just
  the test fixtures. (A repo hook blocks direct `psql` in the shell; the successful
  seed INSERTs are the proof.) Stack torn down after.

Inc 15 delivered: `dev:aaa` script, `dev/wait-migrated.mjs`, contract test. Closes the
DoD's one-command-mode bullet. Gate `yarn test:dev` green (79/79).

### Checkpoint 16 (2026-07-03) — coordination + wrap

Stepped back to make the slice pushable: a fresh engineer must be able to bootstrap + run.

- **Docs coordinated**: `dev/README.md` rewritten (install-first quick start, `dev:aaa`,
  AAA stub table, port map incl. 5480–5483, `dev:seed`, both gates + prereqs, Tests
  section); `CLAUDE.md` updated (Commands `dev:aaa`/`dev:seed`/`test:e2e`, AAA lane in
  Ports, an AAA-emulation section + the `yarn install`-before-build gotcha). Stale compose
  reservation comment (`mikrotik-login`) fixed — B is in the `mikrotik` service; E/F noted
  optional.
- **Coordination verified from clean state**: `yarn install --immutable` clean, `yarn
  test:dev` 79/79, `yarn test:e2e` 4/4. `git` state sane — real `.env*` git-ignored
  (`.example` committed), dev-only stub cert committed (intended), `node_modules`
  git-ignored, `yarn.lock` carries fastify + playwright.
- **Bootstrap contract** for the branch: `yarn install` → `cp .env*.example` → `yarn
  dev:aaa`; gates `yarn test:dev` (unit/integration, Docker) + `yarn test:e2e` (live
  stubs, Docker). The one sharp edge — stub images `COPY` their workspace `node_modules`,
  so `yarn install` MUST precede `dev:aaa`/`test:e2e` — is documented in both READMEs.

### Checkpoint 17 (2026-07-06) — post-completion correction: real GUID ids

Reopened after this slice had already been marked done. While building on top of this seed
in a later slice ([2026-07-05--01](2026-07-05--01--auraconnect-dev-site-seed.md), then
[2026-07-05--02](2026-07-05--02--captive-portal-tenant-id-required.md)), it surfaced that
`captive-site.sql`'s `tenant-dev`/`site-dev` ids are hand-picked human-readable strings, not
real GUIDs — same defect as the one found and fixed on the AuraConnect tenant/site added in
2026-07-05--01. Every `Tenant`/`Site` normally gets an opaque auto-generated id from
`BaseEntity` (`Guid.NewGuid().ToString("N")`); the API's create DTOs don't even expose an `id`
field, so this could only happen via this seed's raw SQL bypassing the domain layer.

**Fix**: `tenants.id` becomes `de49b6cbe9d24edfb7d32dcec06a474f` (was `tenant-dev`),
`sites.id` becomes `eaafa0ff706d4a52b6f45dbcced67b3b` (was `site-dev`) — freshly generated,
matching the `Guid.NewGuid().ToString("N")` shape. `name` (`Dev Tenant`/`Dev Site`), `slug`
(`dev`), and `ssid` (`my-demo-ssid`) are UNCHANGED. `radius_config.site_id` moves with the new
site id. Blast radius checked before changing: only `dev/seed/captive-site.sql`,
`dev/captive-seed.test.mjs`, and slice docs reference the literal old ids — no e2e tests,
client code, or `.env*` files depend on them.

Same migration note as the AuraConnect correction: this changes the `ON CONFLICT (id) DO
UPDATE` key, so re-applying against an already-seeded local DB inserts new rows rather than
updating the old `tenant-dev`/`site-dev` ones — `yarn db:reset` (or a manual delete) avoids
orphaned duplicates.

**Done (2026-07-06)**: implemented test-first in `dev/captive-seed.test.mjs` (RED confirmed
against the old ids for the right reason, GREEN after the seed update); `yarn test:dev` 81/81.

## Deferred / pushed forward

What we explicitly are not doing this slice, and where it picks up.

- **Real RouterOS CHR / RadiusDesk / FreeRADIUS fidelity** — only if a later need
  demands protocol-level accuracy; the stubs cover dev + e2e.
- **Clerk emulation** — not attempted; test keys/mode instead.
- **Production/deploy wiring** — local inner loop + e2e only.
- **Ad server + PostHog emulation** — non-blocking, skipped.

## Open questions

Still TBD as the slice progresses.

- ~~**Stub packaging**~~ — RESOLVED (Checkpoint 1): stub-per-system, separate compose
  services behind `aaa`.
- ~~**Stub implementation**~~ — RESOLVED (Checkpoint 4): hand-rolled Node + **Fastify
  5.9.0** (ratified when stub A landed), stubs as workspaces under `dev/stubs/*`.
- ~~**e2e framework**~~ — RESOLVED + BUILT (Checkpoint 14): Playwright
  (`@playwright/test`) as workspace `@auraconnect/e2e` under `dev/e2e`, gate `yarn
  test:e2e`. First suite uses the API request context (no browser) against the live stubs.
- ~~**FreeRADIUS schema source**~~ — RESOLVED (Checkpoint 1): hand-author only the 4
  tables the API reads (`radacct`, `radacct_history`, `radpostauth`,
  `user_stats_dailies`). Seed-data volume for a realistic monitor view: TBD at Inc 2.
- ~~**Config seeding mechanism**~~ — RESOLVED (Checkpoint 2): raw SQL seed of the
  `PlatformSettings` row into the API's Postgres (dev-only, no Clerk/auth). Trade-off
  accepted: skips the real admin-PATCH code path. Stub H / Inc 3.
- **Clerk in e2e**: Clerk test mode / testing tokens vs a bypass for automated runs.
- ~~**TLS for the MikroTik REST stub**~~ — RESOLVED (Checkpoint 7): self-signed HTTPS +
  `MIKROTIK_TLS_VERIFY=false`; committed dev-only cert. Plain HTTP rejected (would need
  API/monitor code changes).

## Learnings

(Fill in as you discover them.) Durable knowledge this slice produces about the codebase,
the domain, or the tooling — facts that outlive the slice and inform later ones.

- **The API's FreeRADIUS surface is exactly 4 tables**, all in
  `api/AuraConnect.Infrastructure/Services/RadiusAccountingClient.cs` (+ read notes in
  `UsageReportingService.cs`): `radacct` + `radacct_history` (UNIONed; identical schema),
  `user_stats_dailies`, `radpostauth`. Columns actually read: `calledstationid`,
  `acctstarttime`, `acctstoptime`, `acctinputoctets`, `acctoutputoctets`, `username`
  (radacct*); `username`, `timestamp`, `acctinputoctets`, `acctoutputoctets`
  (user_stats_dailies); `reply`, `authdate`, `username` (radpostauth). Authoritative
  full DDL: `api/tools/radiusdesk-schema-explorer/reports/rd_schema_2026-06-28_14-28.md`.
- **Consumed over the MySQL wire (MySqlConnector), not RADIUS UDP** — hence MariaDB, not
  a RADIUS server. Connection is built at runtime from `PlatformSettings`
  (`RadiusDbHost/Port/Name/Username/Password`), gated by `IsRadiusDbConfigured`; unset →
  `InvalidOperationException`. That flag is why config seeding (stub H) is a required step.
- **Docker bind-mount gotcha (WSL2)** — mounting a bind source that does not yet exist
  makes Docker auto-create the path **root-owned**, so a later `Write` into it fails
  `EACCES`. When a stub needs a host dir the compose service bind-mounts, create the dir
  *before* first `compose up` (or `docker run … chown` it back). Bit us on
  `dev/radius-db/init` in Inc 2.
- **RouterOS REST surface the monorepo consumes (full map, 2026-07-03).** Both consumers:
  `https://{host}/rest…`, HTTP Basic, self-signed-cert bypass. **Monitor**
  (`clients/current/monitor/src/lib/mikrotik/client.ts`, env `MIKROTIK_HOST/USER/PASS`,
  `MIKROTIK_TLS_VERIFY=false` → `NODE_TLS_REJECT_UNAUTHORIZED=0`): GET `/system/resource`
  (lone **object**), GET `/ip/hotspot/active?server=`, GET `/ip/dhcp-server/lease`, GET
  `/ip/hotspot/user`, GET `/ip/hotspot`, GET `/log?topics=`, GET `/interface`, POST
  `/interface/monitor-traffic` (body `{interface, once:""}` → `{name,
  rx-bits-per-second, tx-bits-per-second}`), DELETE `/ip/hotspot/active/{id}`. **API**
  (`AuraConnect.Infrastructure/Services/MikroTikGatewayService.cs`, host+creds from
  `PlatformSettings.MikroTik*`, `HttpClientHandler` cert-callback-true + **TLS 1.2 only**,
  15s timeout): all GET, all **arrays** — `/ip/hotspot/profile`, `/ip/hotspot`,
  `/certificate`, `/ip/address`, `/ip/pool`, `/ip/dhcp-server`, `/ip/dhcp-server/network`,
  `/ip/firewall/address-list`. Quirks a stub MUST reproduce: kebab-case keys; RouterOS
  bools read as JSON bool OR strings `"yes"`/`"true"`; date fields (`invalid-after`,
  `creation-time`) in one of `yyyy-MM-dd HH:mm:ss` / `MMM/dd/yyyy HH:mm:ss` / `MMM/dd/yyyy`.
- **DB-init container tests must connect over TCP, not the unix socket** — the official
  Postgres AND MariaDB images run a **socket-only temporary server** during first-init
  (runs the init scripts) then stop it and start the real server. A test that execs
  `psql`/`mariadb` over the default unix socket can hit the temp server *mid-restart* and
  fail with `FATAL: the database system is shutting down` — intermittently, worse under
  parallel Docker load. Connecting over **TCP (`-h127.0.0.1`)** sidesteps it: the temp
  server binds socket-only (`--skip-networking`), so TCP is refused until the real server
  is up. Costs: Postgres TCP needs `PGPASSWORD`; MariaDB root over TCP needs
  `MARIADB_ROOT_HOST=%`. NOTE: `dev/db-init.test.mjs` still uses the socket (retry loop
  has masked it so far) — a candidate to harden if it ever flakes.

- **Stub images bake workspace `node_modules`** — with `nmHoistingLimits: workspaces` each
  stub keeps its own `node_modules`, so the Dockerfiles `COPY . .` (no in-image install,
  fastify is pure JS). Consequence: `yarn install` must run before `dev:aaa`/`test:e2e`,
  or the images ship without deps and crash at import.
- **Playwright request-context = browser-free e2e** — `request.newContext()` uses Node
  fetch, so the `playwright` browser-download postinstall stays blocked by
  `enableScripts: false` (no `built:` entry, ~30 KiB installed) and we sidestep the
  sandbox's loopback limits. The right tool for HTTP/stack e2e; browser-UI journeys need a
  real `playwright install` + the full app stack.
- **DB seeds must run AFTER the API migrates** — the API applies EF migrations on startup
  (`Program.cs`), so `platform_settings` / `radius_config` exist only once it has booted.
  `dev:aaa` encodes the order (`wait-migrated` → `dev:seed`). Verified live: both seed
  files apply cleanly against the real EF schema, so they match the migrations, not just
  the test fixtures.
- **Captive config is a FK chain** — `tenants → sites → radius_config` (+ `packages` for
  voucher `profile_id`). Seeding one site is 3 dependent inserts in order; the voucher
  path additionally needs a `packages` row (deferred).
- **A hand-written dev seed can silently violate a convention the application layer itself
  enforces everywhere else.** `tenants.id`/`sites.id` are plain `varchar(32)`, so raw SQL can
  insert any string — but every real `Tenant`/`Site` gets an opaque GUID from `BaseEntity`,
  and the API's create DTOs don't even expose `id` as settable. Nothing caught the mismatch
  until a much later slice needed the id to look like a UUID. Worth checking, next time a seed
  hand-picks a primary key, whether the domain model normally auto-generates it.

## Retrospective

**What worked**
- Strict TDD per increment with the project's own gate. `app.inject()` for stub behaviour
  (fast, flake-free) split cleanly from `docker compose config` wiring assertions and
  throwaway-container integration tests — three altitudes, each cheap.
- An `Explore` agent mapping each backend's real consumed surface (RouterOS REST, rd_cake,
  hotspot login, PlatformSettings/RadiusConfig persistence) BEFORE writing the stub. Every
  stub was built to fields the code actually reads, and the API chain-consistency test
  caught what field-presence wouldn't.
- Append-only drift sync at every checkpoint kept this doc a trustworthy history; the ADR
  written at the 2-stub trigger (not upfront) matched the "durable when proven" rule.
- Live-validating the seeds against the real migrated schema (not only fixtures) gave real
  confidence the DB seed matches production EF.

**What surprised us**
- The Postgres/MariaDB temp-init-server restart window causing flaky `system is shutting
  down` — fixed by connecting over TCP (temp server is socket-only). Non-obvious; now a
  documented learning.
- Docker auto-creating a missing bind-mount source as root → `EACCES` on later writes.
- How deep the captive config FK chain runs vs a one-row settings seed.

**What we'd do differently**
- Front-load the surface maps: several increments each spawned a mapping agent; one upfront
  pass over the whole AAA surface would have cut latency.
- The browser-UI e2e journeys were deferred because this environment's sandbox can't drive
  a browser at loopback — worth a dedicated console/CI lane so J1/J2 get true UI proofs.

**Deferred (documented, not silently dropped)**: stubs E (PayFast) + F (SMS); a dev
`packages` seed for the full voucher purchase; browser-UI J1/J2 journeys. All need either
optional scope or the full app stack booted outside this constrained session.
