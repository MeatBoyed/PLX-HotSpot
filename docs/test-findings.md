# Test findings — code smells & issues surfaced while writing tests

Running log of defects, smells, and fragilities found **incidentally while adding
test coverage** (slice `docs/projects/2026-06-29--01--…`). These are *not* fixed in
the coverage slices — the goal there is baseline coverage. Each entry is here so a
future slice can triage and fix it.

Severity: 🔴 bug (wrong behaviour reachable in prod) · 🟠 latent (wrong only under
conditions not currently hit) · 🟡 smell (works, but fragile / unclear / risky).

| # | Sev | Location | Issue | Suggested fix | Status |
|---|-----|----------|-------|---------------|--------|
| 1 | 🟠 | `src/features/purchasing/payfast-service.ts:91,144` | **Signing/verify blank-field asymmetry.** `buildPaymentFields` emits `name_first: ''` when no cell number; `pfGenerateSignature` *skips* blank fields, but `verifySignature` *includes* all non-signature keys (`name_first=` empty). So the outgoing form fields do not self-verify through `verifySignature`. Not a live break today (verify is used for inbound IPN, which has no stray blank), but the two code paths disagree on a core rule. | Normalise both paths to one blank-handling rule (skip-blank in both), or drop never-populated blank fields before signing. Add a self-verify invariant test. | open |
| 2 | 🔴 | `src/features/purchasing/voucher-service.ts:30` | **In-memory voucher store.** Issued vouchers live in a module `Map` keyed by `paymentKey`. Lost on restart and not shared across the per-SSID containers / multiple instances → idempotency + voucher recovery break in prod. Already flagged in CLAUDE.md weak spots; recorded here for fix tracking. | Persist vouchers (DB table) keyed by paymentKey; make issuance idempotent at the DB layer. | open |
| 3 | 🟠 | `voucher-service.ts:94`, `permanent-user-service.ts:96` | **No fetch timeout on RadiusDesk calls.** Both `fetch` calls have no `AbortSignal.timeout` — a slow/hung RadiusDesk stalls the request indefinitely (gap B10). | Add `signal: AbortSignal.timeout(ms)` + retry/backoff policy; surface a clear upstream-timeout error. | open |
| 4 | 🟡 | `voucher-service.ts:51` | **Loose voucher-code extraction.** `extractVoucherCode` recursively guesses across `['voucher','code','password','name','username']` and returns the first non-empty string found anywhere in the payload. Could return an unrelated field (e.g. a `name`) as the voucher code if the RD shape shifts. | Pin the exact RadiusDesk response path instead of heuristic search; assert on the known field. | open |

<!-- Append new findings below. Keep the table sorted by discovery order. -->
