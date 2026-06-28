# AuraConnect gap analysis — production portal vs the signed-off requirements

**Date:** 2026-06-25, reconciled 2026-06-28 · **Status:** reconciled against the full capability map · **Author:** Alex Veldtman
**Measures:** this production portal (Next.js, repo root) against the signed-off
requirements (~71 IDs across pillars A–F).
**Companion docs (this folder):** the full **system assessment** (`system-assessment.md`,
11 feature sets / ~38 capabilities), the generated **scorecards** (`scorecards.md`), and the
**reliability remediation** deep-dive (`reliability-remediation.md`). Code evidence is `file:line`
at the repo root unless a different layer (RadiusDesk / NAS / infra-ops) is named.

---

## 1. What the production portal is and does (capability summary)

This is a **multi-tenant Next.js captive portal** — a presentation/orchestration front-end
that delegates the actual AAA to RadiusDesk + MikroTik. ~10,241 LOC TS/TSX across 111 `src`
files; Next 16 / React 19 / Prisma 7 / Tailwind 4; `strict` TS, zod-validated env
(`src/env.ts`), Dockerised, one container per SSID.

**Layer map:** `src/app` (routes + colocated actions), `src/components` (+ `ui/` shadcn),
`src/lib/services` (server-only services), `src/features/purchasing` (PayFast + voucher/permanent-user
issuance), `prisma/` (Postgres: branding/packages/marketing/OTP/images — **no payment/voucher/ledger tables**).

**What it does.** The full structural map is in `system-assessment.md` — **~38 capabilities
across 11 as-coded feature sets** (FS1 Connect/MikroTik handoff · FS2 Purchasing/voucher · FS3
Permanent-user auth · FS4 OTP/phone register · FS5 SMS · FS6 Branding/multi-site · FS7
Packages/plans · FS8 Marketing opt-in · FS9 Image storage · FS10 Ads/Revive VAST · FS11 Admin
auth/platform), each scored in `scorecards.md`. The gap tables in §3 below map the **requirements**
onto that code. The user-facing essentials:

| Capability | Feature set | Where | Notes |
| --- | --- | --- | --- |
| **Free-tier connect** | FS1 | `app/page.tsx:91`, `auth-service.ts:92` | "Connect for Free" → hardcoded `click_to_connect` creds → MikroTik `/login`. Default tier, no payment. |
| **Voucher redemption** | FS1/FS2 | `voucher-cta.tsx`, `auth-service.ts:81` | Parallel always-shown option; code used as **both** username + password to RADIUS. |
| **Paid purchase → voucher** | FS2 | `app/api/payfast/ipn/route.ts`, `features/purchasing/voucher-service.ts:117` | PayFast checkout → IPN → RadiusDesk `vouchers/add.json` → SMS. **PayFast, not Capitec Pay.** |
| **Permanent-user (phone) auth + OTP** | FS3/FS4 | `permanent-user-service.ts:68`, `otp-service.ts:29` | RadiusDesk permanent users via Cake4 API; OTP-gated phone register; creds cached in `localStorage` for silent re-login. |
| **Ad display (Revive VAST)** | FS10 | `app/api/vast/route.ts`, `components/revive/ad-video.tsx` | Real VAST fetch/parse + a video player; optional `adGateEnabled`. **Completion is client-side/skippable.** |
| **Branding / multi-site** | FS6 | `branding-service.ts`, `prisma` `branding_config` (keyed by SSID), `[subvenue]` routes | One codebase, per-SSID config; 13 committed site env files. Genuinely strong multi-tenancy. |
| **MikroTik/RADIUS bridge** | FS1 | `auth-service.ts:40`, `login-form-button.tsx:54`, `post-handler/route.ts` | Browser submits a GET form to MikroTik `/login`; NAS does RADIUS; POSTs back to `/post-handler`. |
| **Admin back-office** | FS6–FS9/FS11 | `app/admin/*` (Clerk-gated), `app/dashboard` | Brand config, packages, marketing submissions, image upload — admin surfaces over the same services. |
| **Packages / plans · Marketing opt-in · Image storage** | FS7/FS8/FS9 | `package-service.ts`, `api/marketing-optin`, `image-service.ts` | Supporting CRUD; note FS8/FS9 write routes are **unauthenticated** (see §3 security and `system-assessment.md` §4). |
| **Status polling** | (dead) | `useStatusPolling.ts` | Polls `/api/status-poll` — **a route that does not exist**; its only consumer is commented out (dead). |
| **Product analytics** | cross-cut | `instrumentation-client.ts`, `ConnectContext.tsx:72` | PostHog client-side events (`user_connected`). `posthog-node` declared but unused. |

**Quality in one line:** salvageable — the **UI / data / config two-thirds is a
sound foundation** (modern stack, strict TS with 3 `any`, clean Prisma layer with dedupe+cache, real
multi-tenancy, clean secrets); the **integration / reliability one-third is broken** (no timeouts, no
durable idempotency, scattered RADIUS access, demo-grade payment handling) — and that one-third is
exactly what the unreliable-edge target depends on. No tests, no CI.

---

## 2. The headline: fix-in-place, not a rewrite

> **Note.** The happy-path connect code *exists*, but the portal does **not implement the MikroTik
> hotspot login contract** (no CHAP, ignores NAS `link-login-only`/`mac`/`error`, hardcoded gateway,
> mixed HTTPS→HTTP, no error surfacing), so connectivity **fails silently** across much of the fleet
> — consistent with the reliability issues seen in service. Connectivity is **the** problem, not a
> non-issue. Full diagnosis + fixes: **`reliability-remediation.md`** (this folder).

**Verdict — no rewrite; fix the localised defects in place.** The foundation is sound (modern
stack, strict TS, clean Prisma layer, strong per-SSID multi-tenancy F10) and several AAA/tenancy
requirements are genuinely met — by RadiusDesk OOB (C2, C9, C11), by the portal's correct trust
*architecture* (C6, C7, C13 — MAC isn't trusted for authz), and by F10. But the **integration
boundary** — the MikroTik handoff (§2 correction above) and the reliability tier (no timeouts, no
durable state, no error surfacing) — is genuinely broken and is the field-failure cause. The fix is
a focused remediation of ~5 integration files, not a rewrite.

So **P1 shrinks from "rewrite the core loop" to a hardening + completion sprint on this codebase:**

1. **AAA-adapter seam (the §2 invariant).** Consolidate the 3 scattered RADIUS call-sites
   (`voucher-service`, `permanent-user-service`, browser `auth-service`) behind one client so the
   backend is swappable. Today there is no seam — the headline architectural gap. *(Refactor, not rewrite.)*
2. **Reliability on the integration tier.** Add timeouts (zero exist) + bounded retries on the
   RADIUS/MikroTik/SMS calls — load-bearing even in P1 on flaky links.
3. **Complete the voucher lifecycle (C8).** Vouchers are minted `never_expire`, no revoke path,
   issue-ledger is an in-memory `Map` that dies on restart. Add expiry, revoke, durable persistence.
4. **Wire quota/depletion surfacing.** Fix the dead `/api/status-poll` + the always-hidden
   depletion prompt so the portal can reflect/gate on quota (enforcement itself stays RadiusDesk's job).
5. **Platform foundation — tests + CI (F7).** The decisive P1 gap: zero tests, no CI. Plus digest-pin
   base images (F2), add health checks (F9), a `/health` route.
6. **Security fixes (urgent, any phase) — the systemic one first.** `middleware.ts:8` marks
   **`/api(.*)` public**, leaving every write route unauthenticated: `POST /api/image` (anyone
   uploads, FS9), `POST/PATCH /api/marketing-optin` (anyone writes/alters opt-ins, FS8), and the
   **SSRF in `GET /api/vast`** (FS10). Scope the matcher to genuinely-public routes and gate the
   rest; the PayFast IPN stays public (it is signature-verified). Then add the `/api/vast`
   allowlist and strip **PII (MSISDN) from logs**. (System-level finding — see
   `system-assessment.md` §4.)

Deferred to **P2** (arrive with money): durable payment record + double-entry ledger + reconciliation
+ outbox/saga/DLQ (all of Pillar B's resilience machinery and D3–D9/D14), Capitec Pay migration.
Deferred to **P3:** USSD/MoMo (D10), server-verified ad-funded grant (D13). **Pillar A** (edge fleet
mgmt) is an **infra/ops track entirely outside this codebase** — P1c, not portal work.

---

## 3. Per-requirement gap tables

Legend: **MEETS** · **PARTIAL** · **MISSING** · **N-A** (not this codebase's concern). Layer noted
where the requirement is delegated (RadiusDesk / NAS / infra-ops).

### Pillar A — Edge fleet management (P1c / target) — entirely infra/ops, **not a portal gap**
All A1–A11 **MISSING** at the portal because they belong to MikroTik fleet management (config-as-code,
ZTP, PKI, OOB, firmware, drift); A12 **N-A**. The repo's `deploy-ssid.sh` is a *false friend* — it
deploys the **portal container** per SSID (`deploy-ssid.sh:99-150`), not router config. No
`.rsc`/Ansible/NetBox/Terraform/Oxidized/WireGuard anywhere. The one portal-side signal is *negative*:
the portal relies on **shared** `NEXT_PUBLIC_MIKROTIK_*` creds (`README.md:11`), the opposite of A5's
per-device PKI. → **Pillar A = the P1c infra/ops track; nothing to do in the portal.**

### Pillar B — Resilience (P2 / target) — online-only happy path
| ID | Verdict | Evidence | Note |
| --- | --- | --- | --- |
| B1 | MISSING (target) | absent | No edge-local/offline auth; every grant needs a live RADIUS call. |
| B2 | MISSING (P2) | `ipn/route.ts:130,138` | Returns success on volatile state; no durable payment/grant record (schema has none). |
| B3 | MISSING (P2) | absent | No store-and-forward outbox; edge→cloud calls fire inline. |
| B4 | **PARTIAL** (P2) | `voucher-service.ts:120-121,30` | Idempotency key exists but **non-atomic** read/write + **in-memory** (dies on restart). |
| B5 | MISSING (P2) | absent | No inbox/processed-ID dedup; redelivered IPN re-issues a voucher. |
| B6 | MISSING (P2) | absent | No reconciliation job. |
| B7 | MISSING (P2) | `ipn/route.ts:130-135` | Linear inline sequence, not a saga; SMS failure swallowed, no compensation. |
| B8 | MISSING (target) | absent | No pre-issued offline voucher batches / double-spend detection. |
| B9 | MISSING (P2) | `ec1-sms-service.ts:159` | No backoff/jitter/retry-budget; only a single SMS re-auth. |
| B10 | MISSING (P2) | `voucher-service.ts:94`, `permanent-user-service.ts:96`, `sms-service.ts:40` | **Zero timeouts** on any payment/RADIUS/SMS call. |
| B11 | MISSING (target) | `voucher-service.ts:33-34` | Single RadiusDesk base/token; no HA, no edge fallback. |
| B12 | MISSING (P2) | absent | No sync-boundary health surface. |

### Pillar C — AAA & access (P1 / target) — mostly already met
| ID | Verdict | Layer | Evidence | Note |
| --- | --- | --- | --- | --- |
| C1 | N-A portal / config (target) | RadiusDesk↔NAS | absent | Portal speaks Cake4 HTTPS, not RADIUS; RadSec is a FreeRADIUS↔NAS link. |
| C2 | **MEETS** (P1) | RadiusDesk | `voucher-service.ts:84-88` | Quota = `rlm_sqlcounter`; portal does no quota (correct). |
| C3 | MISSING/config (P1) | FreeRADIUS↔NAS | absent | CoA is a backend setting, not portal code. |
| C4 | MISSING/config (P1) | NAS+FreeRADIUS | absent | `Acct-Interim-Interval` is a NAS/profile setting. |
| C5 | MISSING (target) | NAS/DHCP + portal | absent | RFC 8908 API *could* be a new portal route; opt-114 is NAS/DHCP. |
| C6 | **MEETS** (P1) | portal+AAA | `auth-service.ts:40-42`, `login-form-button.tsx:54` | Portal asserts nothing authoritative; NAS/RADIUS grants. |
| C7 | **MEETS** (P1) | portal+AAA | `post-handler/route.ts:7,12` (MAC stored, never read) | Authz binds to voucher/PU credential, not MAC. |
| C8 | **PARTIAL** (P1) | RadiusDesk+portal | `voucher-service.ts:84-88,30` | Issue+activate-on-login set, but `never_expire`, **no revoke path**, ephemeral issue ledger. |
| C9 | **MEETS** (P1) | RadiusDesk | profile `Simultaneous-Use` | Backend concern. |
| C10 | MISSING/config (P1) | RadiusDesk | absent | Rate/time = RADIUS reply attrs from the profile. |
| C11 | **MEETS** (P1) | RadiusDesk | `voucher-service.ts:37,83` | Tiering = RadiusDesk profiles, selected by id. |
| C12 | MISSING (target) | infra/PKI | absent | Cert rotation; depends on C1/C5. |
| C13 | **MEETS** (target) | portal+AAA | (as C7) | MAC never used for identity → randomization-resilient. Passpoint absent (optional). |

### Pillar D — Payments & monetization (P2 / P3) — verification strong, system-of-record absent
| ID | Verdict | Evidence | Note |
| --- | --- | --- | --- |
| D1 | **PARTIAL** (P2) | `payfast-service.ts:144-167` | PSP webhook IS sig-verified (MD5/PayFast legacy) before mutating; **no ad-SSV verifier** (D13). |
| D2 | **PARTIAL** (P2) | `voucher-service.ts:30,120` | Stable key, but in-memory/non-atomic → dupes on restart/replica. |
| D3 | MISSING (P2) | absent | No payment state machine; `payment_status` unhandled (`ipn/route.ts:22`). |
| D4 | MISSING (P2) | `ipn/route.ts:130-138` | Synchronous; no verify-then-enqueue, no async worker. |
| D5 | MISSING (P2) | absent | No transactional outbox; activation is best-effort inline. |
| D6 | MISSING (P2) | absent | No reconcile-by-polling; dropped IPN = lost activation, undetected. |
| D7 | MISSING (P2) | absent | None of the 3 mismatch classes detectable (no ledger). |
| D8 | MISSING (P2) | `schema.prisma` (no financial models) | No double-entry ledger. |
| D9 | MISSING (P2) | `ipn/route.ts:112-117` | gross/fee/net discarded; no payout reconciliation. |
| D10 | MISSING (**P3**) | absent | Card-only via PayFast; no USSD/MoMo/agent cash-in. |
| D11 | **PARTIAL** (P2) | `AuthMethodsCard.tsx:12`, `schema.prisma:49` | Free path exists but ungated + unmodelled as payment. |
| D12 | **MEETS** (P2) | `payfast-service.ts:91-116` (redirect to hosted page) | No PAN handled → PCI SAQ A. Re-validate on Capitec migration. |
| D13 | MISSING (**P3**) | `ad-video.tsx:218-226,151-157` | Ad-funded grant is **client-side & skippable**; no server-verified completion. |
| D14 | MISSING (P2) | `ipn/route.ts:*` returns 500 on reject | No DLQ; 500-on-reject → PayFast retry storm amplifies dupes. |

### Pillar E — Observability & SRE (P1b / P2) — near-zero telemetry
| ID | Verdict | Layer | Evidence | Note |
| --- | --- | --- | --- | --- |
| E1 | MISSING (P1b) | portal | no `@opentelemetry/*` in `package.json` | Telemetry = PostHog client events + 100 `console.*`. |
| E2 | MISSING (P1b) | portal | no `traceparent`/correlation in `src` | No context propagation; unstructured logs. |
| E3 | MISSING (P1b) | portal | `ipn/route.ts:57-143` isolated logs | No end-to-end trace. |
| E4 | MISSING (P2) | infra | absent | "paid but no internet" structurally unobservable. |
| E5 | MISSING (P1b) | portal | no RED on the 9 API routes | No request metrics. |
| E6 | N-A (P1b) | infra-ops | n/a | mktxp/Prometheus is infra. |
| E7 | N-A (P1b) | infra-ops | no `/health` to probe | Add a health route as prerequisite. |
| E8 | MISSING (P2) | infra-ops | absent | SLO/burn-rate process artefacts. |
| E9 | MISSING (P2) | infra-ops | absent | On-call/postmortem process. |

*Note: several `console.log`s leak PII — full IPN payload incl. MSISDN (`ipn/route.ts:120`),
plaintext usernames (`pu-phonename/route.ts:40`). Strip as part of E1/E2.*

### Pillar F — Platform & delivery (P1 foundation / target) — strong base, delivery spine missing
| ID | Verdict | Evidence | Note |
| --- | --- | --- | --- |
| F1 | **MEETS** (P1) | `Dockerfile:1-67` (multi-stage, Next standalone) | Ships as OCI image; no bare-metal apt. **Strength.** |
| F2 | MISSING (P1) | `Dockerfile:3` `node:20-alpine` (mutable tag) | No `@sha256` digest pin. |
| F3 | **PARTIAL** (P1) | single `package-lock.json`; OS pkgs unpinned (`Dockerfile:6`) | One JS lockfile (good); OS versions unpinned. |
| F4 | **PARTIAL** (P1) | `.gitignore:33-44`; no Gitleaks | No live secrets leaked; **no secret-scanning gate**. |
| F5 | **PARTIAL** (P1) | `src/env.ts` (zod/12-Factor) | Strong config; but build-time env baked into image, no Vault/dynamic creds. |
| F6 | MISSING (P1) | no `*.tf`/IaC | Infra is imperative `deploy-ssid.sh` + Swarm compose. |
| F7 | MISSING (P1) | no `.github/`, no tests | **Critical:** zero merge-blocking gates; nothing enforces lint/strict-TS/scan. |
| F8 | MISSING (target) | absent | SBOM/SLSA — target-state. |
| F9 | **PARTIAL** (P1) | `docker-compose.swarm.yml:8-23` (replicas/rollback) | Rolling+rollback semantics, but **no health checks** + `deploy-ssid.sh` path has downtime. |
| F10 | **MEETS** (P1) | `branding_config` by `ssid`, `[subvenue]` routes, one container/tenant | Single codebase, per-tenant config. **Strength.** |
| F11 | MISSING (target) | no Renovate/Dependabot | Target-state. |

---

## 4. Rollup & the P1 work-list

**By verdict (71 IDs):** ~9 MEETS · ~9 PARTIAL · rest MISSING/N-A — but the MISSING set is dominated
by **P2 / P3 / target / infra-ops** requirements, not P1. Read by phase, the picture inverts: the **P1
requirement set is largely met or small-gap**, which is what makes the reframe hold.

**P1 status by phase-set:**
- **P1 AAA (C2,C3,C4,C6,C7,C8,C9,C10,C11):** 5 MEETS (RadiusDesk/architecture), 3 backend-config
  (C3/C4/C10 — ops, not portal), **1 real portal gap: C8** (voucher lifecycle/revoke/persistence).
- **P1 platform (F1–F7,F9,F10):** 2 MEETS (F1,F10), 4 PARTIAL (F3,F4,F5,F9), **decisive gap F7
  (tests/CI)** + F2/F6.
- **P1 working hotspot:** connect/voucher/ad-display all **already work**.

**The P1 work-list (harden-and-complete on this codebase):**
1. AAA-adapter seam — consolidate the 3 RADIUS call-sites behind one swappable client (§2 invariant).
2. Timeouts + bounded retries on RADIUS/MikroTik/SMS (B10/B9 minimum for P1 reliability).
3. Complete C8 — voucher expiry + revoke + durable issue ledger (replace the in-memory `Map`).
4. Wire quota/depletion surfacing — fix dead `/api/status-poll`; the depletion prompt.
5. Tests + CI (F7); digest-pin images (F2); health checks + `/health` (F9/E7).
6. **Urgent security:** scope the blanket-public `/api(.*)` matcher (`middleware.ts:8`) so
   `POST /api/image` + `/api/marketing-optin` are authenticated; `/api/vast` SSRF allowlist;
   strip PII from logs.

**Explicitly deferred:** P2 — durable payment record + double-entry ledger + reconciliation +
outbox/saga/DLQ (B2–B7,B12, D3–D9,D14), Capitec Pay migration. P3 — USSD/MoMo (D10), server-verified
ad-funded grant (D13). P1c (infra/ops track) — all of Pillar A.

---

## 5. Feedback to the requirements doc

- **§5 P1 framing** ("current code is functionally incorrect → rewrite the core loop") is **overstated**
  and should be softened to: *connectivity is correct; P1 hardens the integration tier, adds the AAA
  adapter seam, completes the voucher lifecycle, and adds tests/CI on the existing codebase.*
  (Confirmed by the salvageability assessment and corroborated by the full capability map in
  `system-assessment.md`.)
- Everything else in the requirements doc stands; this analysis adds the production-state column, it
  does not change the targets.
