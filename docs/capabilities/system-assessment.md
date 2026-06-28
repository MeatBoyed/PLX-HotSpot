# AuraConnect — System assessment

**Capabilities · feature sets · maturity**
Final · 2026-06-26 · Author: Alex Veldtman
Subject: production captive portal (RadiusDesk + MikroTik), Next.js, git ref `d8e6f87`.
Code paths are repo-root-relative (the production tree, formerly `next-captive-portal-rd/`, is now the root).

> **Framing — solutions, not blame.** This is an evidence-backed map of where the
> code is strong and where it needs work, to help prioritise fixes. Scores are a
> baseline for improvement, not a verdict.

## Executive summary

> **Fix-in-place, not a rewrite.** The production portal is a sound but **untested**
> multi-tenant Next.js front-end that delegates AAA to RadiusDesk + MikroTik.
> Branding/tenancy and the identity flows reach **Defined**; everything else is
> **Developing**, ads **Initial**. **System coherence is Developing (2/4)** —
> directory-tidy but seam-leaky, with the AAA access path and the trust boundary
> lacking a clear seam. Nothing reaches Managed, capped by zero tests and no
> integration-tier reliability.

> **Top risk.** The blanket-public `/api(.*)` (`middleware.ts:8`) leaves write
> endpoints unauthenticated:
> - **`POST /api/image`** — anyone can upload (FS9)
> - **`POST/PATCH /api/marketing-optin`** — anyone can write/alter opt-ins (FS8)
> - **`GET /api/vast`** — server-side request forgery / SSRF (FS10)
>
> The PayFast IPN being public is correct (signature-verified). PII full-payload
> logging and an ephemeral in-memory voucher `Map` (lost on restart / multi-instance)
> are the next concerns.

> **Bright spots.** Branding / multi-site tenancy (FS6, maturity 3) and the identity
> flows — permanent-user auth (FS3, 3) and OTP / phone register (FS4, 3) — are the
> strongest, with the PayFast signature core (build / sign / verify) also at 3.

**Maturity spread (44 graded capabilities):** maturity 1 ×7 · maturity 2 ×16 ·
maturity 3 ×21 — nothing reaches Managed (4) or Optimized (5).

**Approach.** The codebase is assessed as a **System** of **Feature Sets** of
**Capabilities**, grouped *as the code groups them*, each level graded on its own
scorecard; user journeys are a map-only coverage cross-check. Capabilities anchored
at `file:line`.

> Scope: legacy `captive-portal-design-v1/` (PHP) and `hono-captive-portal/` (TS) are
> out of scope (not production; now under `archive/`).

---

## 1. System overview

A multi-tenant Next.js captive portal — a presentation/orchestration front-end that
**delegates AAA to the RadiusDesk back-end + MikroTik NAS**. ~10,241 src LOC across
111 TS/TSX files; Next 16 / React 19 / Prisma 7 / Tailwind 4; `strict` TS;
zod-validated env (`src/env.ts`); Dockerised, one container per SSID.
**Inventory: ~38 Capabilities across 11 as-coded Feature Sets.**

**As-coded layer map:** `src/app` (routes + colocated server actions),
`src/components` (+ `ui/` shadcn), `src/lib/services` (server-only services),
`src/features/purchasing` (PayFast + voucher/permanent-user issuance), `src/lib/hooks`,
`src/lib/utils`, `prisma/` (Postgres: branding / packages / marketing / OTP / images —
**no payment / voucher / ledger tables**).

---

## 2. Feature Sets (as-coded grouping + attributes)

Grouping follows the code's own seams (directory/module/call-cluster), **not** an
idealised architecture — the gap between this and the ideal is scored in §5 (system
coherence). Importance = criticality to the product; Audience = who the Feature Set
serves (end-user / admin / internal).

| # | Feature Set | Code seam | Importance | Audience | Caps |
|---|----------------|--------------------------------------------------|-----------|-------------|:---:|
| FS1 | Connect / MikroTik handoff | `lib/services/auth-service.ts`, `app/post-handler/`, `components/ui/login-form-button.tsx` | **Critical** | end-user | 5 |
| FS2 | Purchasing / voucher | `features/purchasing/` (voucher, payfast, plan-catalog), `app/api/payfast/ipn`, `app/checkout` | High | end-user | 8 |
| FS3 | Permanent-user (phone) auth | `features/purchasing/permanent-user-service.ts`, `lib/hooks/usePUPhoneFlow.ts` | High | end-user | 3 |
| FS4 | OTP / phone register | `lib/services/otp-service.ts`, `app/api/pu-phonename/*`, `app/api/register` | Med-High | end-user | 5 |
| FS5 | SMS delivery | `features/purchasing/sms-service.ts`, `lib/services/ec1-sms-service.ts` | Medium | internal | 2 |
| FS6 | Branding / multi-site | `lib/services/branding-service.ts`, `database-service.ts`, `lib/utils/branding-normalize.ts`, `app/admin/brandconfig`, `lib/actions/*` | High | end-user + admin | 8 |
| FS7 | Packages / plans | `lib/services/package-service.ts` **+ `packages-service.ts` (dup)**, `app/admin/packages`, `app/api/packages` | Medium | end-user + admin | 4 |
| FS8 | Marketing opt-in | `app/api/marketing-optin`, `app/admin/marketing`, `components/marketing-optin-card.tsx` | Low-Med | end-user + admin | 2 |
| FS9 | Image storage / serving | `lib/services/image-service.ts`, `app/api/image/*` | Medium | admin + internal | 3 |
| FS10 | Ads (Revive VAST) | `app/api/vast/route.ts`, `components/revive/*` | Medium | end-user | 2 |
| FS11 | Admin auth / platform | `src/middleware.ts` (Clerk), `app/sign-in`, `app/layout.tsx`, `app/dashboard`, `app/admin/*` shells | High | admin | 3 |

Cross-cutting (not a Feature Set; folded where they live): PostHog analytics
(`components/home-page/ConnectContext.tsx:72,75`, `instrumentation-client.ts:3`),
light/dark theme (`components/theme-provider.tsx`). Dead: status-poll hook → absent
`/api/status-poll` (`lib/hooks/useStatusPolling.ts:20`).

---

## 3. Capabilities (anchored, by Feature Set)

### FS1 — Connect / MikroTik handoff
- C1.1 Resolve login form target — `auth-service.ts:40`
- C1.2 Build free-tier credentials (`click_to_connect`) — `auth-service.ts:44`
- C1.3 Build voucher credentials (code = user+pass) — `auth-service.ts:44` (voucher path)
- C1.4 MikroTik form submit (GET) — `components/ui/login-form-button.tsx:54`
- C1.5 Capture MikroTik post-handback (write-only; NAS vars dropped) — `app/post-handler/route.ts:7`
- *Stub:* depletion/quota prompt (dead) — `components/home-page/connect-card.tsx:64`

### FS2 — Purchasing / voucher
- C2.1 Issue voucher via RadiusDesk — `voucher-service.ts:117`
- C2.2 Look up issued voucher (in-memory `Map`) — `voucher-service.ts:134`
- C2.3 Build PayFast payment fields — `payfast-service.ts:91`
- C2.4 Generate PayFast signature — `payfast-service.ts:80`
- C2.5 Verify PayFast IPN signature — `payfast-service.ts:144`
- C2.6 Build m_payment_id — `payment-utils.ts:4`
- C2.7 Plan catalog get/list — `plan-catalog.ts:64,68`
- C2.8 PayFast IPN handler — `app/api/payfast/ipn/route.ts:57`; checkout-fields action — `app/checkout/[planId]/actions.ts:14`

### FS3 — Permanent-user (phone) auth
- C3.1 Create RadiusDesk permanent user (Cake4) — `permanent-user-service.ts:60`
- C3.2 Generate username / password — `permanent-user-service.ts:144,153`
- C3.3 Phone-flow orchestration hook — `lib/hooks/usePUPhoneFlow.ts:15`

### FS4 — OTP / phone register
- C4.1 Generate & send OTP — `otp-service.ts:29`
- C4.2 Verify OTP — `otp-service.ts:76`
- C4.3 Send-OTP route — `app/api/pu-phonename/send-otp/route.ts:5`
- C4.4 pu-phonename register route — `app/api/pu-phonename/route.ts:7`
- C4.5 register route — `app/api/register/route.ts:6`

### FS5 — SMS delivery
- C5.1 Send voucher SMS (wrapper) — `sms-service.ts:24`
- C5.2 Send SMS via EC1 — `ec1-sms-service.ts:121`

### FS6 — Branding / multi-site
- C6.1 Get branding w/ cache+dedupe — `branding-service.ts:22`
- C6.2 Branding DB CRUD — `database-service.ts:177,186,205,223,277`
- C6.3 Sub-venue hierarchy — `database-service.ts:287`, `lib/actions/sub-venue-actions.ts:5`
- C6.4 Fetch-branding action — `lib/actions/branding-actions.ts:6`
- C6.5 Admin brand editor (identity/colors/buttons/ads) — `app/admin/brandconfig/actions.ts:58,65,72,79`
- C6.6 Branding theming transform — `lib/utils/branding-normalize.ts:9,26`

### FS7 — Packages / plans
- C7.1 package-service CRUD — `package-service.ts:63,67,72,76,92,112`
- C7.2 packages-service CRUD (**parallel duplicate / dead-code candidate**) — `packages-service.ts:42,46,57,68`
- C7.3 Admin packages actions — `app/admin/packages/actions.ts:6,10,15,22`
- C7.4 Packages API GET — `app/api/packages/route.ts:4`

### FS8 — Marketing opt-in
- C8.1 Marketing opt-in capture (POST/PATCH) — `app/api/marketing-optin/route.ts:16,58`
- C8.2 List marketing submissions (admin) — `app/admin/marketing/actions.ts:15`

### FS9 — Image storage / serving
- C9.1 Get image by slug — `image-service.ts:12`
- C9.2 Upsert / overwrite+backup image — `image-service.ts:49,26`
- C9.3 Image GET by slug / POST upload — `app/api/image/[slug]/route.ts:4`, `app/api/image/route.ts:29`

### FS10 — Ads (Revive VAST)
- C10.1 VAST fetch/parse proxy ((!) unauthenticated SSRF) — `app/api/vast/route.ts:190`
- C10.2 Ad video player / banner — `components/revive/ad-video.tsx`, `ad-banner.tsx`

### FS11 — Admin auth / platform
- C11.1 Route gating (admin private, rest public) — `src/middleware.ts:4`
- C11.2 Sign-in (Clerk) + ClerkProvider — `app/sign-in/[[...sign-in]]/page.tsx`, `app/layout.tsx`
- C11.3 Dashboard / admin shells — `app/dashboard`, `app/admin/*`

---

## 4. Scorecards

The **C·Q·T·R·S** column is the five axes scored 0–4 in order — **C**ompleteness ·
code **Q**uality · **T**ests · **R**eliability · **S**ecurity (0 absent · 4 exemplary).
**Maturity** 1–5 (1 Initial · 2 Developing · 3 Defined · 4 Managed · 5 Optimized) is a
reasoned roll-up over the axes, not an average. `tests = 0` is fleet-wide (no test
files in the repo) and is stated once here rather than re-justified per row.

### FS2 — Purchasing / voucher

| Capability | C·Q·T·R·S | Maturity | Evidence |
|----------------|:-------:|:------:|--------------------------------------------|
| C2.1 Issue voucher (RadiusDesk) | 2·2·0·1·2 | 2 | mints `never_expire` ignoring `ttlHours` (`voucher-service.ts:88,127`); no timeout on fetch (`:94`); idempotency in-memory `Map` (`:30,120`); logs code+MSISDN PII (`:130`); heuristic `extractVoucherCode` (`:51-74`) |
| C2.2 Voucher lookup | 1·3·0·1·3 | 1 | trivial getter over ephemeral `Map` (`voucher-service.ts:134`) — lost on restart / multi-instance |
| C2.3 Build PayFast fields | 3·3·0·3·3 | 3 | ordered fields per PayFast spec, amount `toFixed(2)`, env guard (`payfast-service.ts:91-118`); smell: `name_first` reused for MSISDN (`:111`) |
| C2.4 Generate signature | 4·3·0·4·3 | 3 | pure, MD5 per PayFast mandate (`payfast-service.ts:42,80`) — algorithm not a free choice |
| C2.5 Verify IPN signature | 3·3·0·4·3 | 3 | correct param-string rebuild, excludes `signature`, passphrase handling (`payfast-service.ts:144-166`) |
| C2.6 Build m_payment_id | 1·3·0·3·3 | 1 (dead) | only referenced in commented-out `checkout-button.tsx:30`; live path uses `pkg.id` inline (`payfast-service.ts:113`) |
| C2.7 Plan catalog | 1·3·0·3·3 | 1 (dead) | hardcoded `PLANS` (`plan-catalog.ts:28`) superseded by DB `packageService.getByName`; `getPlan/listPlans` only in commented code → **drift vs DB** |
| C2.8 PayFast IPN handler | 2·2·0·1·2 | 2 | self-labelled MVP (`ipn/route.ts:9-24`): **no** server-side validation POST-back; **500 on business reject** (`:67,103,116`) → PayFast retries compound dupes; no downstream timeout; per-request DNS (`:80-91`); PII full-payload log (`:120`); x-forwarded-for IP spoofable (`:78`) |

**FS2 Feature Set Scorecard**

| Axis | Score | Justification |
|--------------------|:------:|----------------------------------------------|
| Cohesion | 3 | members genuinely form the purchase→voucher flow; payment + issuance + catalog sit together coherently |
| Coupling | 2 | IPN reaches directly into `voucherService` + `smsService` + `packageService` with no adapter (`ipn/route.ts:2-5,130,132`); RadiusDesk access **duplicated** outside the seam in `permanent-user-service.ts` |
| Completeness-of-set | 2 | no durable persistence (Prisma has no payment/voucher table), no voucher lifecycle (revoke/expiry), no reconciliation, no PayFast validation POST-back; **2 dead members** |
| Boundary clarity | 2 | `features/purchasing/` is a clean dir, but carries dead code (`plan-catalog`, `payment-utils`, commented `checkout-button`) and leaks RD logic to another seam |
| Child Maturity rollup | — | live caps 2–3 (signature core strongest), two dead at 1 |
| **Feature Set Maturity** | 2 | a solid PayFast-signature core (C2.3–2.5 = Defined) dragged down by ephemeral/untested voucher issuance, an MVP IPN with replay + retry-compounding risk, and dead members |

**Attributes:** Importance **High** (monetization path) · Audience **end-user**.

**Two nuances worth flagging here:** (1) the IPN's **IP + merchant + amount** checks
*do* exist (`ipn/route.ts:71-117`); the real IPN defects are **500-on-reject** (causes
PayFast retry storms) and the missing validation POST-back; (2) `plan-catalog` +
`payment-utils` are **dead, drifted from the DB package model**.

### FS1, FS3–FS11

Grading conventions for this batch: `tests = 0` fleet-wide (no test files exist in the
repo); a no-timeout external call caps reliability ≈ 1–2; a live core with a dead
sibling rolls up to the live grade, not the dead one (FS7 and FS11 reflect this; FS10
stays Initial because the defect is *in* its core capability).

**FS1 — Connect / MikroTik handoff** *(Critical · end-user · the field-failure locus)*

| Capability | C·Q·T·R·S | Maturity | Evidence |
|----------------|:-------:|:------:|--------------------------------------------|
| C1.1 resolve login form target | 4·4·0·4·3 | 3 | `auth-service.ts:40` |
| C1.2 build free-tier creds | 4·4·0·4·2 | 3 | `auth-service.ts:44` (env-driven `click_to_connect`) |
| C1.3 build voucher creds | 4·4·0·4·2 | 3 | `auth-service.ts:44` (code = user+pass) |
| C1.4 MikroTik form submit (GET) | 3·3·0·2·1 | 2 | `login-form-button.tsx:54`; no CHAP (~:58); `method=GET` |
| C1.5 capture post-handback | 1·3·0·3·2 | 2 | `post-handler/route.ts:7,12` — NAS vars (`link-login-only`/`mac`/`chap`/`error`) written to cookie, never read |
| C1.6 depletion/quota prompt | 0·0·0·0·0 | 1 (dead) | `connect-card.tsx:64` stub |

*Individual credential-builders are sound, but the **set is broken**: posts to a
hardcoded gateway (`auth-service.ts:36-42`) not the NAS `link-login-only`, no CHAP, NAS
vars discarded, no error surface.*

**FS3 — Permanent-user (phone) auth** *(High · end-user)*

| Capability | C·Q·T·R·S | Maturity | Evidence |
|----------------|:-------:|:------:|--------------------------------------------|
| C3.1 create RD permanent user | 4·4·0·2·3 | 3 | `permanent-user-service.ts:60`; config validation + error handling, **no timeout** (`:96`) |
| C3.2 generate username/password | 4·4·0·4·4 | 3 | `permanent-user-service.ts:144,153` (12-char random pw) |
| C3.3 phone-flow hook | 4·4·0·3·2 | 3 | `usePUPhoneFlow.ts:15` (form→OTP→verify; localStorage auto-login) |

**FS4 — OTP / phone register** *(Med-High · end-user)*

| Capability | C·Q·T·R·S | Maturity | Evidence |
|----------------|:-------:|:------:|--------------------------------------------|
| C4.1 generate & send OTP | 4·4·0·3·3 | 3 | `otp-service.ts:29` (4-digit, 5-min expiry, resend cooldown) |
| C4.2 verify OTP | 4·4·0·4·3 | 3 | `otp-service.ts:76` (attempt counter + expiry) |
| C4.3 send-OTP route | 4·4·0·3·3 | 3 | `pu-phonename/send-otp/route.ts:5` (SA phone regex, SSID scope) |
| C4.4 pu-phonename register route | 4·4·0·2·3 | 3 | `pu-phonename/route.ts:7` (verify→create→dup handling) |
| C4.5 register route (email) | 4·4·0·2·3 | 3 | `register/route.ts:6` |

**FS5 — SMS delivery** *(Medium · internal)*

| Capability | C·Q·T·R·S | Maturity | Evidence |
|----------------|:-------:|:------:|--------------------------------------------|
| C5.1 send voucher SMS (wrapper) | 2·2·0·1·3 | 2 | `sms-service.ts:24`; no timeout, silent best-effort; OTP path bypasses this wrapper |
| C5.2 send SMS via EC1 | 3·3·0·2·3 | 3 | `ec1-sms-service.ts:121`; MSISDN validation, session cache + 1× retry (`:159`), no network timeout |

**FS6 — Branding / multi-site** *(High · end-user+admin — the best-engineered area)*

| Capability | C·Q·T·R·S | Maturity | Evidence |
|----------------|:-------:|:------:|--------------------------------------------|
| C6.1 get branding (cache+dedupe) | 4·4·0·3·3 | 3 | `branding-service.ts:22` (TTL + in-flight dedupe) |
| C6.2 branding DB CRUD | 4·4·0·3·3 | 3 | `database-service.ts:177-284` (typed Prisma, P2002/P2025 mapping) |
| C6.3 sub-venue hierarchy | 3·3·0·2·3 | 2 | `database-service.ts:287`; no pagination/cycle check |
| C6.4 fetch-branding action | 3·3·0·2·3 | 2 | `branding-actions.ts:6` — `force:true` bypasses cache every call (anti-pattern) |
| C6.5 admin brand editor | 4·3·0·2·4 | 3 | `admin/brandconfig/actions.ts:58-79` (zod; Clerk-gated; no per-SSID authz) |
| C6.6 theming transform | 4·4·0·3·4 | 3 | `branding-normalize.ts:9,26` (allowlist sanitization) |

**FS7 — Packages / plans** *(Medium · end-user+admin)*

| Capability | C·Q·T·R·S | Maturity | Evidence |
|----------------|:-------:|:------:|--------------------------------------------|
| C7.1 package-service CRUD | 4·4·0·2·3 | 2 | `package-service.ts:63-118` (canonical; `.catch` swallows at `:104`) |
| C7.2 packages-service CRUD | 1·2·0·2·2 | 1 (dead) | `packages-service.ts:42-71` — zero imports, parallel duplicate |
| C7.3 admin packages actions | 3·3·0·2·3 | 2 | `admin/packages/actions.ts:6-25` (zod; no per-SSID authz) |
| C7.4 packages API GET | 3·3·0·2·2 | 2 | `api/packages/route.ts:4` — **public** (`middleware.ts:8`), no auth |

**FS8 — Marketing opt-in** *(Low-Med · end-user+admin)*

| Capability | C·Q·T·R·S | Maturity | Evidence |
|----------------|:-------:|:------:|--------------------------------------------|
| C8.1 opt-in capture (POST/PATCH) | 4·3·0·2·2 | 2 | `marketing-optin/route.ts:16,58` — **public POST**, no authz/rate-limit, dup validation |
| C8.2 list submissions (admin) | 4·3·0·2·2 | 2 | `admin/marketing/actions.ts:15` — no server-side authz (middleware-only) |

**FS9 — Image storage / serving** *(Medium · admin+internal)*

| Capability | C·Q·T·R·S | Maturity | Evidence |
|----------------|:-------:|:------:|--------------------------------------------|
| C9.1 get image by slug | 4·4·0·3·3 | 3 | `image-service.ts:12`; cache headers; base64-in-DB |
| C9.2 upsert + overwrite+backup | 4·3·0·2·2 | 2 | `image-service.ts:26,49`; no transaction around backup→overwrite |
| C9.3 POST upload + GET | 3·3·0·2·2 | 2 | `api/image/route.ts:29` — **unauthenticated upload** (MIME allowlist + 20MB cap, but `/api` public); base64 in DB |

**FS10 — Ads (Revive VAST)** *(Medium · end-user)*

| Capability | C·Q·T·R·S | Maturity | Evidence |
|----------------|:-------:|:------:|--------------------------------------------|
| C10.1 VAST fetch/parse proxy | 3·2·0·1·1 | 1 | `api/vast/route.ts:190-217` — **unauthenticated SSRF**: `url` param fetched server-side, no allowlist |
| C10.2 ad video player / banner | 4·3·0·2·2 | 2 | `revive/ad-video.tsx` (skip after 5s — client-side, unenforceable), `ad-banner.tsx` (3rd-party JS, no CSP) |

**FS11 — Admin auth / platform** *(High · admin)*

| Capability | C·Q·T·R·S | Maturity | Evidence |
|----------------|:-------:|:------:|--------------------------------------------|
| C11.1 route gating | 2·2·0·2·1 | 1 | `middleware.ts:4-16` — **`/api(.*)` marked public (`:8`)**; `/admin` gated only by negation |
| C11.2 Clerk sign-in + provider | 4·4·0·3·3 | 3 | `middleware.ts` (clerkMiddleware), `app/sign-in/...`, `layout.tsx` |
| C11.3 dashboard / admin shells | 3·2·0·2·1 | 2 | `app/admin/*` (no route-level guard; relies on middleware) |

#### Feature Set scorecard summary (all 11)

| Feature Set | Coh | Coup | Compl | Bound | Maturity | Note |
|-------------|:---:|:---:|:---:|:---:|:------:|----------------------------------------|
| Connect / MikroTik handoff | 2 | 2 | 1 | 2 | 2 | credential builders are sound, but the **set is broken** — hardcoded gateway, no CHAP, NAS vars discarded |
| Purchasing / voucher | 3 | 2 | 2 | 2 | 2 | solid PayFast signature core; ephemeral in-memory voucher `Map`, MVP IPN with replay/retry risk, 2 dead members |
| Permanent-user (phone) auth | 4 | 3 | 4 | 4 | 3 | permanent-user RADIUS create; clean but untested |
| OTP / phone register | 4 | 3 | 4 | 4 | 3 | OTP generate/verify + register routes; untested |
| SMS delivery | 2 | 2 | 2 | 3 | 2 | split across two dirs; the OTP path bypasses the wrapper |
| Branding / multi-site | 3 | 3 | 3 | 2 | 3 | best-engineered area — clean, well-bounded branding/tenancy |
| Packages / plans | 2 | 1 | 2 | 1 | 2 | duplicate package services (one dead) — two seams for one domain |
| Marketing opt-in | 2 | 3 | 3 | 2 | 2 | **public POST**, no authz/rate-limit; dup-validation only |
| Image storage / serving | 2 | 3 | 3 | 2 | 2 | **unauthenticated upload**; base64-in-DB, no tx around overwrite |
| Ads (Revive VAST) | 2 | 1 | 2 | 2 | 1 | **unauthenticated SSRF** in the core VAST-proxy capability |
| Admin auth / platform | 2 | 4 | 2 | 1 | 2 | Clerk admin auth; route-gating by negation, no route-level guards |

**Maturity distribution:** Defined 3 (FS3, FS4, FS6) · Developing 7 (FS1, FS2, FS5,
FS7, FS8, FS9, FS11) · Initial 1 (FS10). None Managed/Optimized — driven by **0 tests
fleet-wide** and **no integration-tier reliability** (timeouts/retries) across every
external call.

#### (!) Cross-cutting security finding (system-level)

**`/api(.*)` is marked public in `middleware.ts:8`**, so several write endpoints are
**unauthenticated**:

- `POST /api/image` — anyone can upload (FS9 C9.3)
- `POST/PATCH /api/marketing-optin` — anyone can write/alter opt-ins (FS8 C8.1)
- `GET /api/vast` — the SSRF (FS10 C10.1)

The PayFast IPN being public is *correct* (it is signature-verified, FS2 C2.8). The
image + marketing write routes are not — they rely on the SSID param for isolation,
with no caller auth. Combined with the VAST SSRF, the public `/api` surface is the
highest-severity systemic issue. Feeds §5/§6.

## 5. System coherence

Coherence = how well the **As-Coded Grouping** (§2, the code's own seams) matches an
**Ideal Grouping** (a sensible decomposition). Scored on the four sub-aspects of the
System Scorecard.

**Ideal Grouping** (what a clean decomposition would be):

1. **AAA adapter** — one client wrapping the RadiusDesk back-end + the MikroTik handoff
   (consolidating the connect + voucher-issue + permanent-user RADIUS calls).
2. **Identity / access** — free, voucher, phone/OTP, permanent-user (how a user
   authenticates).
3. **Monetization** — PayFast + voucher lifecycle.
4. **Notifications** — SMS (one seam).
5. **Tenancy / branding**, 6. **Catalog / packages**, 7. **Media / ads**, 8.
   **Platform / authz**.

**As-Coded vs Ideal — the gaps** (anchors for each are in §3–§4):

- **No AAA seam** (the biggest gap) — RadiusDesk access is scattered across three
  call-sites with no adapter, so the ideal's access-control module has nowhere to sit.
- **`features/purchasing/` conflates three ideal domains** — monetization, phone
  **auth**, and notifications all live under one "purchasing" directory; the name
  misleads.
- **`lib/services/` is a grab-bag** — connect-auth, branding, OTP, SMS, image and
  packages sit flat in one directory with no sub-grouping; cohesion is incidental.
- **SMS is split across two directories**, and the OTP path bypasses the wrapper to
  call the gateway directly.
- **Duplicate package services** (`package-service.ts` vs `packages-service.ts`) — two
  seams for one domain.
- **Trust boundary not encoded** — `middleware.ts` blanket-marks `/api(.*)` public, so
  public and authenticated routes are not separated in the layout (see §4).

**What is coherent:** branding (FS6) is a genuinely clean, well-bounded module; naming
is mostly honest (`branding`, `otp`, `payfast`, `image` say what they do — `purchasing`
is the main misnomer).

**System Scorecard — coherence**

| Sub-aspect | Score | Note |
|----------------|:-----:|----------------------------------------------|
| Seam cleanliness | 2 | `features/` vs `lib/services/` split is arbitrary; `lib/services` is a catch-all |
| Cross-set coupling | 2 | RADIUS scattered 3×, SMS split + bypassed, IPN reaches into 3 services |
| Names match function | 3 | mostly honest; `purchasing` holds non-purchase auth |
| Decomposition correctness | 2 | dead duplicates, no AAA seam, trust boundary not in layout |
| **Overall coherence** | 2 | directory-tidy but seam-leaky — the modular split is partly cosmetic; the two concerns that matter most (AAA access, trust boundary) have no seam |

## 6. User-journey coverage cross-check

Map-only validation (journeys are **not** graded). Each journey step must map to a real
Capability; unmapped steps are **gaps**, Capabilities touched by no journey are
**orphans**.

| Journey | Capability path | Coverage |
|---|---|---|
| J1 Free-tier connect | C1.2 → C1.4 → (NAS/RADIUS) → C1.5 | mapped (handoff defects per §4) |
| J2 Voucher redeem | voucher UI → C1.3 → C1.4 → (NAS) | mapped |
| J3 Paid purchase → voucher | C7.4 → C2.3/C2.8 → (PayFast) → C2.8 → C2.5 → C2.1 → C5.1/C5.2 → (J2) | mapped; **gap at tail** (no voucher lifecycle: expiry/revoke) |
| J4 Phone / permanent-user signup | C3.3 → C4.1/C4.3 → C4.2/C4.4 → C3.1 | mapped |
| J5 Email register | C4.5 → C7.x → C3.1 | mapped |
| J6 Ad-funded view | connect → C10.1 → C10.2 → **(grant)** | **GAP**: no server-side ad→grant; completion client-side/skippable |
| J7 Admin back-office | C11.2 → C11.3 → {C6.5, C7.3, C8.2, C9.3} | mapped |
| J8 Tenant branding render | `[subvenue]` → C6.1 → C6.6 (+ C9.1 logos) | mapped |
| J9 Marketing opt-in | marketing card → C8.1 | mapped |

**Gaps (journey step with no Capability):**

1. **Ad-funded grant** (J6) — ad completion is client-side and skippable; no
   server-verified ad→access grant exists. Confirms the monetization/gating hole.
2. **Quota / usage display** — `useStatusPolling.ts:20` targets `/api/status-poll`,
   which **does not exist**. Any "show me my usage" journey dead-ends.
3. **Voucher lifecycle** (J3 tail) — issue works; no expiry/revoke/reconciliation
   capability.

**Orphans (Capability with no journey):** exactly the **dead code** — C2.6
`buildMPaymentId`, C2.7 `plan-catalog`, C7.2 `packages-service`, C1.6 depletion stub.
No *live* capability is orphaned.

**Coverage verdict — sweep is complete (dry).** Every live Capability maps to ≥1
journey, and every orphan is already-flagged dead code; no journey step requires a
capability that exists but was missed in the inventory. The gaps are genuine product
holes (gating/lifecycle/usage), not inventory misses. The structural coverage criterion
is met.

---

## 7. Headline

The production portal is **structurally a System of 11 Feature Sets / ~38
Capabilities**, with a **sound but untested core**: branding/tenancy (FS6) and the
identity flows (FS3 OTP/permanent-user, FS4) reach **Defined** maturity, while
everything else sits at **Developing** and ads (FS10) at **Initial**. Nothing reaches
Managed/Optimized — capped uniformly by **zero tests** and **no integration-tier
reliability** (no timeouts/retries on any external call). **System coherence is
Developing (2/4)**: directory-tidy but seam-leaky, with the AAA access path and the
trust boundary both lacking a seam. The **highest-severity systemic issue is the
blanket-public `/api(.*)`** exposing unauthenticated image upload, marketing writes,
and the VAST SSRF. Journey coverage confirms the inventory is complete; the only
journey gaps are real product holes (ad-funded grant, usage display, voucher
lifecycle). This corroborates the prior verdict — **fix-in-place, not rewrite** — and
adds the structural map + per-feature grades the earlier defect-list lacked.
