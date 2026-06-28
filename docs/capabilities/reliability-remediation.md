# AuraConnect production portal — reliability findings & remediation guidance

**Date:** 2026-06-25 · **Status:** findings for VegaVision engineering · **Author:** Alex Veldtman
**Subject:** the production Next.js captive portal (this repo), which has had reliability
issues in service. All evidence is `file:line` at the repo root.
**Goal:** identify the code-level causes of those reliability issues and give engineering concrete,
prioritised fixes — **not** a rewrite. The codebase is worth keeping; the defects are localised and fixable.

---

## 1. Bottom line

The reliability issues reduce to one symptom: **users intermittently cannot get online and the
portal gives no sign of it**. Our code review finds two causes, both in the same thin slice of code
— the integration boundary between the portal and the MikroTik NAS — and both produce *silent* failure:

1. **The MikroTik hotspot login handoff is not implemented to contract** (§2). The portal ignores
   the variables the NAS hands it, posts credentials to a hardcoded gateway instead of the
   NAS-supplied login link, supports only plaintext PAP (not CHAP), and ships mixed-content
   (HTTPS→HTTP) login targets. Any one of these makes login fail for a site or a session.
2. **The integration tier has no reliability engineering** (§3). No timeouts, no retries, no
   durable state, and — critically — **no error surfacing**. When anything fails, the user sees a
   spinner or a dead page, never a reason or a retry.

Neither is a deep architectural rot. The application's foundation is sound (§5). These are
**bounded defects in ~5 files** that a focused team can fix without a rewrite (§4, §6).

---

## 2. Root cause #1 — the MikroTik login handoff (the main event)

A MikroTik hotspot, when an unauthenticated client connects, redirects the browser to the login
page and injects per-session variables: `mac`, `ip`, `link-login-only` (the exact URL to POST
credentials to), `link-orig`, `chap-id`, `chap-challenge`, `error`, `dst`. The login form must POST
credentials **back to `link-login-only`**, computing a **CHAP** response when the NAS offers a
challenge. The portal does almost none of this.

| # | Defect | Evidence | Field effect |
| --- | --- | --- | --- |
| 1 | **No CHAP support** — only plaintext `password` is sent; no `chap-id`/`chap-challenge` read, no `MD5(id+pw+challenge)`. | `login-form-button.tsx:58,145,309`; `pu-phone-form.tsx:39`; only md5 in repo is PayFast (`payfast-service.ts:161`) | Any CHAP-configured site (a common MikroTik default) → **100% silent login failure**. |
| 2 | **NAS variables ignored** — the inbound redirect's fields are dumped write-only into a cookie and never read; no `link-login-only`/`mac`/`chap`/`error` consumer anywhere. | `post-handler/route.ts:7,12` (write); repo-wide grep finds no reader | Portal cannot use the per-session login link or report the NAS error. Handoff context is destroyed, then `/splash` re-nav drops it entirely (`:26`). |
| 3 | **Login target is a hardcoded per-site gateway**, not `link-login-only`. | `auth-service.ts:36-42`; `env.ts:50`; `docker/env/*.env` | Can't follow per-session/per-site login URLs; one wrong/stale env host or scheme breaks every login for that site. |
| 4 | **Mixed content (HTTPS portal → HTTP gateway).** | `coj.env:12`, `ditsong-museum.env:12`, `joburg-theatre.env:12` (`http://…gateway…`) | Browser blocks/drops the cross-origin submit from an HTTPS page → silent failure. |
| 5 | **`method="GET"` to the login, no `mac` field, `dst` off-gateway.** | `login-form-button.tsx:54,141,305`; `pu-phone-form.tsx:37,40` | Diverges from the expected credential POST; session binding relies on request source, fragile behind NAT/CDN. |
| 6 | **No login-outcome handling** — no `error` read, status check commented out, no retry/timeout/message. | `welcome/page.tsx` (no `error`); `user-session.tsx:15-18` (commented out) | A failed login **hangs or silently dead-ends** — the exact reported symptom. |

**Verdict:** the handoff is a *strong, likely root cause* of the field unreliability — the portal
does not honour the MikroTik hotspot contract, and every failure mode above is invisible to the user.

---

## 3. Root cause #2 — no reliability engineering on the integration tier

Even where the handoff would succeed, the surrounding calls (RadiusDesk Cake4, MikroTik, EC1-SMS,
PayFast) are happy-path only:

- **No timeouts anywhere** — zero `AbortController`/`AbortSignal` on any outbound `fetch`
  (`voucher-service.ts:94`, `permanent-user-service.ts:96`, `sms-service.ts:40`). On a flaky
  taxi-rank uplink, a hung upstream hangs the request indefinitely.
- **No retries / backoff** on transient failure (only a single SMS re-auth, `ec1-sms-service.ts:159`).
- **Idempotency is in-memory** (`voucher-service.ts:30`, self-labelled "demo scope") and **no
  durable payment/voucher record exists** (the Prisma schema has none) — a restart or a redelivered
  PayFast IPN loses or double-issues a voucher.
- **No error surfacing** — failures are `console.log`/`warn` only (and several leak PII, incl. full
  MSISDN at `ipn/route.ts:120`), never shown to the user.

This is why "intermittent" is the right word: on a clean network with a matching gateway it works;
the moment the link wobbles or an upstream is slow, it stalls with no feedback.

---

## 4. Contributing issue (fix, but not the unreliability cause)

- **Unauthenticated SSRF in `/api/vast`** (`api/vast/route.ts:190-217`) — fetches an
  attacker-supplied `url` server-side with no allowlist; can reach `169.254.169.254` / internal
  `*.pluxnet.co.za`. Security, not reliability — but fix it.
- **PII in logs** — strip MSISDN/username from `console` output.

---

## 5. What is sound — do not rewrite

The diagnosis is *not* "the codebase is bad." The foundation is good and worth building on:
modern stack (Next 16 / React 19 / Prisma 7, lockfile-pinned), `strict` TypeScript (3 `any` in
~10k LOC), a single zod-validated env schema, a clean Prisma data layer (dedupe + cache + typed
errors), confirmed-clean secret hygiene, and a genuinely strong **single-codebase multi-tenant**
model (per-SSID `branding_config`, `[subvenue]` routes). The defects above are concentrated in the
**~5 integration files** — fix those, keep the rest.

---

## 6. Remediation guidance (prioritised)

**P0 — restore reliable connectivity (the reliability issues in service).**
1. **Implement the MikroTik handoff contract.** Capture the NAS variables on inbound redirect
   (`link-login-only`, `link-orig`, `mac`, `chap-id`, `chap-challenge`, `error`, `username`); stop
   discarding them in `post-handler`. *(Fixes §2-#2.)*
2. **POST credentials to the NAS-supplied `link-login-only`** (per session), not the build-time
   `MIKROTIK_BASE_URL`; use `method="POST"`. *(§2-#3, #5.)*
3. **Support CHAP** — when `chap-id`/`chap-challenge` are present, send
   `password = MD5(chap-id + password + chap-challenge)`; PAP only when the NAS offers it. *(§2-#1.)*
4. **Eliminate mixed content** — gateway login URL must be HTTPS (match the portal), the host must
   be in the walled-garden allowlist and resolvable pre-auth. *(§2-#4.)*
5. **Surface login outcome** — read `$(error)`, re-enable the status check, add a timeout + retry +
   a visible failure message instead of a silent dead-end. *(§2-#6.)*

**P1 — make the integration tier robust.**
6. Add timeouts + bounded retries (backoff+jitter) to every RADIUS/MikroTik/SMS/PayFast call.
7. Replace the in-memory idempotency `Map` with a durable, unique-constrained table; persist a
   payment/voucher record before returning success.
8. Consolidate the scattered RADIUS call-sites behind one client (a clean seam for the future
   backend swap).

**P2 — security & hygiene.**
9. Allowlist `/api/vast` (SSRF); strip PII from logs; add a `/health` route + container healthcheck;
   add the missing test + CI scaffolding so a fix can't regress.

The P0 set is what restores reliable connectivity. None of it requires a rewrite.
