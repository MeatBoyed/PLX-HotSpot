<!-- GENERATED from docs/capabilities/data/*.json by tools/capabilities-doc/render.mjs.
     Do not edit by hand — edit the JSON and run `npm run capabilities:render`. -->

# Capability scorecards (generated)

Rendered from the JSON source of truth in `data/`. Axes are **C·Q·T·R·S**
(Completeness · Quality · Tests · Reliability · Security), each 0–4; **Maturity**
is 1–5 (Initial→Optimized). See `README.md` for the rubric and
`system-assessment.md` for the narrative analysis.

## Capabilities by feature set

### FS1 — Connect / MikroTik handoff
*Importance Critical · Audience end-user*

| Capability | C·Q·T·R·S | Maturity | Evidence |
|---|---|---|---|
| C1.1 resolve login form target | 4·4·0·4·3 | 3 | `auth-service.ts:40` |
| C1.2 build free-tier creds | 4·4·0·4·2 | 3 | `auth-service.ts:44` (env-driven `click_to_connect`) |
| C1.3 build voucher creds | 4·4·0·4·2 | 3 | `auth-service.ts:44` (code = user+pass) |
| C1.4 MikroTik form submit (GET) | 3·3·0·2·1 | 2 | `login-form-button.tsx:54`; no CHAP (~:58); `method=GET` |
| C1.5 capture post-handback | 1·3·0·3·2 | 2 | `post-handler/route.ts:7,12` — NAS vars (`link-login-only`/`mac`/`chap`/`error`) written to cookie, never read |
| ~~C1.6 depletion/quota prompt~~ | 0·0·0·0·0 | 1 (dead) | `connect-card.tsx:64` stub |

### FS2 — Purchasing / voucher
*Importance High · Audience end-user*

| Capability | C·Q·T·R·S | Maturity | Evidence |
|---|---|---|---|
| C2.1 Issue voucher (RadiusDesk) | 2·2·0·1·2 | 2 | mints `never_expire` ignoring `ttlHours` (`voucher-service.ts:88,127`); no timeout on fetch (`:94`); idempotency in-memory `Map` (`:30,120`); logs code+MSISDN PII (`:130`); heuristic `extractVoucherCode` (`:51-74`) |
| C2.2 Voucher lookup | 1·3·0·1·3 | 1 | trivial getter over ephemeral `Map` (`voucher-service.ts:134`) — lost on restart / multi-instance |
| C2.3 Build PayFast fields | 3·3·0·3·3 | 3 | ordered fields per PayFast spec, amount `toFixed(2)`, env guard (`payfast-service.ts:91-118`); smell: `name_first` reused for MSISDN (`:111`) |
| C2.4 Generate signature | 4·3·0·4·3 | 3 | pure, MD5 per PayFast mandate (`payfast-service.ts:42,80`) — algorithm not a free choice |
| C2.5 Verify IPN signature | 3·3·0·4·3 | 3 | correct param-string rebuild, excludes `signature`, passphrase handling (`payfast-service.ts:144-166`) |
| ~~C2.6 Build m_payment_id~~ | 1·3·0·3·3 | 1 (dead) | only referenced in commented-out `checkout-button.tsx:30`; live path uses `pkg.id` inline (`payfast-service.ts:113`) |
| ~~C2.7 Plan catalog~~ | 1·3·0·3·3 | 1 (dead) | hardcoded `PLANS` (`plan-catalog.ts:28`) superseded by DB `packageService.getByName`; `getPlan/listPlans` only in commented code → **drift vs DB** |
| C2.8 PayFast IPN handler | 2·2·0·1·2 | 2 | self-labelled MVP (`ipn/route.ts:9-24`): **no** server-side validation POST-back; **500 on business reject** (`:67,103,116`) → PayFast retries compound dupes; no downstream timeout; per-request DNS (`:80-91`); PII full-payload log (`:120`); x-forwarded-for IP spoofable (`:78`) |

### FS3 — Permanent-user (phone) auth
*Importance High · Audience end-user*

| Capability | C·Q·T·R·S | Maturity | Evidence |
|---|---|---|---|
| C3.1 create RD permanent user | 4·4·0·2·3 | 3 | `permanent-user-service.ts:60`; config validation + error handling, **no timeout** (`:96`) |
| C3.2 generate username/password | 4·4·0·4·4 | 3 | `permanent-user-service.ts:144,153` (12-char random pw) |
| C3.3 phone-flow hook | 4·4·0·3·2 | 3 | `usePUPhoneFlow.ts:15` (form→OTP→verify; localStorage auto-login) |

### FS4 — OTP / phone register
*Importance Med-High · Audience end-user*

| Capability | C·Q·T·R·S | Maturity | Evidence |
|---|---|---|---|
| C4.1 generate & send OTP | 4·4·0·3·3 | 3 | `otp-service.ts:29` (4-digit, 5-min expiry, resend cooldown) |
| C4.2 verify OTP | 4·4·0·4·3 | 3 | `otp-service.ts:76` (attempt counter + expiry) |
| C4.3 send-OTP route | 4·4·0·3·3 | 3 | `pu-phonename/send-otp/route.ts:5` (SA phone regex, SSID scope) |
| C4.4 pu-phonename register route | 4·4·0·2·3 | 3 | `pu-phonename/route.ts:7` (verify→create→dup handling) |
| C4.5 register route (email) | 4·4·0·2·3 | 3 | `register/route.ts:6` |

### FS5 — SMS delivery
*Importance Medium · Audience internal*

| Capability | C·Q·T·R·S | Maturity | Evidence |
|---|---|---|---|
| C5.1 send voucher SMS (wrapper) | 2·2·0·1·3 | 2 | `sms-service.ts:24`; no timeout, silent best-effort; OTP path bypasses this wrapper |
| C5.2 send SMS via EC1 | 3·3·0·2·3 | 3 | `ec1-sms-service.ts:121`; MSISDN validation, session cache + 1× retry (`:159`), no network timeout |

### FS6 — Branding / multi-site
*Importance High · Audience end-user+admin*

| Capability | C·Q·T·R·S | Maturity | Evidence |
|---|---|---|---|
| C6.1 get branding (cache+dedupe) | 4·4·0·3·3 | 3 | `branding-service.ts:22` (TTL + in-flight dedupe) |
| C6.2 branding DB CRUD | 4·4·0·3·3 | 3 | `database-service.ts:177-284` (typed Prisma, P2002/P2025 mapping) |
| C6.3 sub-venue hierarchy | 3·3·0·2·3 | 2 | `database-service.ts:287`; no pagination/cycle check |
| C6.4 fetch-branding action | 3·3·0·2·3 | 2 | `branding-actions.ts:6` — `force:true` bypasses cache every call (anti-pattern) |
| C6.5 admin brand editor | 4·3·0·2·4 | 3 | `admin/brandconfig/actions.ts:58-79` (zod; Clerk-gated; no per-SSID authz) |
| C6.6 theming transform | 4·4·0·3·4 | 3 | `branding-normalize.ts:9,26` (allowlist sanitization) |

### FS7 — Packages / plans
*Importance Medium · Audience end-user+admin*

| Capability | C·Q·T·R·S | Maturity | Evidence |
|---|---|---|---|
| C7.1 package-service CRUD | 4·4·0·2·3 | 2 | `package-service.ts:63-118` (canonical; `.catch` swallows at `:104`) |
| ~~C7.2 packages-service CRUD~~ | 1·2·0·2·2 | 1 (dead) | `packages-service.ts:42-71` — zero imports, parallel duplicate |
| C7.3 admin packages actions | 3·3·0·2·3 | 2 | `admin/packages/actions.ts:6-25` (zod; no per-SSID authz) |
| C7.4 packages API GET | 3·3·0·2·2 | 2 | `api/packages/route.ts:4` — **public** (`middleware.ts:8`), no auth |

### FS8 — Marketing opt-in
*Importance Low-Med · Audience end-user+admin*

| Capability | C·Q·T·R·S | Maturity | Evidence |
|---|---|---|---|
| C8.1 opt-in capture (POST/PATCH) | 4·3·0·2·2 | 2 | `marketing-optin/route.ts:16,58` — **public POST**, no authz/rate-limit, dup validation |
| C8.2 list submissions (admin) | 4·3·0·2·2 | 2 | `admin/marketing/actions.ts:15` — no server-side authz (middleware-only) |

### FS9 — Image storage / serving
*Importance Medium · Audience admin+internal*

| Capability | C·Q·T·R·S | Maturity | Evidence |
|---|---|---|---|
| C9.1 get image by slug | 4·4·0·3·3 | 3 | `image-service.ts:12`; cache headers; base64-in-DB |
| C9.2 upsert + overwrite+backup | 4·3·0·2·2 | 2 | `image-service.ts:26,49`; no transaction around backup→overwrite |
| C9.3 POST upload + GET | 3·3·0·2·2 | 2 | `api/image/route.ts:29` — **unauthenticated upload** (MIME allowlist + 20MB cap, but `/api` public); base64 in DB |

### FS10 — Ads (Revive VAST)
*Importance Medium · Audience end-user*

| Capability | C·Q·T·R·S | Maturity | Evidence |
|---|---|---|---|
| C10.1 VAST fetch/parse proxy | 3·2·0·1·1 | 1 | `api/vast/route.ts:190-217` — **unauthenticated SSRF**: `url` param fetched server-side, no allowlist |
| C10.2 ad video player / banner | 4·3·0·2·2 | 2 | `revive/ad-video.tsx` (skip after 5s — client-side, unenforceable), `ad-banner.tsx` (3rd-party JS, no CSP) |

### FS11 — Admin auth / platform
*Importance High · Audience admin*

| Capability | C·Q·T·R·S | Maturity | Evidence |
|---|---|---|---|
| C11.1 route gating | 2·2·0·2·1 | 1 | `middleware.ts:4-16` — **`/api(.*)` marked public (`:8`)**; `/admin` gated only by negation |
| C11.2 Clerk sign-in + provider | 4·4·0·3·3 | 3 | `middleware.ts` (clerkMiddleware), `app/sign-in/...`, `layout.tsx` |
| C11.3 dashboard / admin shells | 3·2·0·2·1 | 2 | `app/admin/*` (no route-level guard; relies on middleware) |

## Feature-set summary

| Feature Set | Coh | Coup | Compl | Bound | Maturity | Note |
|---|---|---|---|---|---|---|
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

## System coherence scorecard

| Sub-aspect | Score | Note |
|---|---|---|
| Seam cleanliness | 2 | `features/` vs `lib/services/` split is arbitrary; `lib/services` is a catch-all |
| Cross-set coupling | 2 | RADIUS scattered 3×, SMS split + bypassed, IPN reaches into 3 services |
| Names match function | 3 | mostly honest; `purchasing` holds non-purchase auth |
| Decomposition correctness | 2 | dead duplicates, no AAA seam, trust boundary not in layout |
| **Overall coherence** | 2 | directory-tidy but seam-leaky — the modular split is partly cosmetic; the two concerns that matter most (AAA access, trust boundary) have no seam |

## User-journey coverage

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
