# Slice 2026-07-05--01 — AuraConnect dev site seed

**Status:** done
**Started:** 2026-07-05
**Finished:** 2026-07-06

## Goal / definition of done

`dev/seed/captive-site.sql` seeds a second, additive tenant + site + `radius_config` chain
— tenant "AuraConnect" (slug `auraconnect`, `PortalRoutingMode.TenantShared`) and site "Dev"
(ssid `dev`, domain `dev.auraconnect.co.za`, no branding row) — appended after the existing
`tenant-dev`/`site-dev` block, which is left untouched. Done when `yarn test:dev` is green
with `dev/captive-seed.test.mjs` updated to assert both chains, and `yarn dev:aaa` shows both
tenants in the admin client with the new site's `radius_config` pointed at the local AAA
stubs.

**Superseded:** "pointed at the local AAA stubs" above turned out to be only half true — see
the Decisions entry below. `gateway_url`/`free_username`/`free_password` point at the real
physical MikroTik gateway; only `radiusdesk_*` stays stub-pointed. Confirmed done: user ran
`yarn dev:seed` against the corrected values and `yarn test:dev` is green.

**Superseded again:** "no branding row" above was also wrong — see the branding/auth_methods
Decisions entry. A `branding` row (AuraConnect's default palette) and `auth_methods = '{free}'`
are both now seeded for this site.

## Working scope

- Append a new, clearly-commented block to the bottom of `dev/seed/captive-site.sql`:
  `tenants` row (id `auraconnect`), `sites` row (id `auraconnect-dev`), `radius_config` row
  (site_id `auraconnect-dev`) — same idempotent `ON CONFLICT ... DO UPDATE` style as the
  existing rows in the file.
- `radius_config` for the new site reuses the same local-stub endpoints/creds as the existing
  demo site's row (`gateway_url http://localhost:5483`, `free_username click_to_connect@dev`,
  `free_password click_to_connect`, `radiusdesk_url http://radiusdesk:8080`,
  `radiusdesk_api_token dev-radiusdesk-token`, realm/cloud id `1`).
- Seed comment captures the rationale: a physical MikroTik hotspot device is already
  configured to point at this dev host/domain and broadcast ssid `dev`, so any developer who
  clones the repo and brings up the stack gets a pre-wired tenant/site the real hardware can
  immediately talk to, with no per-developer hotspot provisioning.
- `dev/captive-seed.test.mjs` updated test-first: row-count assertions (`tenants`, `sites`,
  `radius_config`) go from `1` to `2`; existing assertions keep checking the original
  `tenant-dev`/`site-dev` chain by id; new assertions added for the `auraconnect`/
  `auraconnect-dev` chain (tenant name/slug/routing-mode, site name/ssid/domain, radius_config
  stub values); idempotency test extended to expect `2` after a re-apply.
- Explicitly out of scope: `.env.current.example`, `.env.legacy.example`, the working
  `.env.current`/`.env.legacy`, and any new seed file — none of these change.

## Assumptions going in

- `dev/seed/*.sql` is applied via `yarn dev:seed` (`cat dev/seed/*.sql | psql ...`), so both
  blocks in `captive-site.sql` always apply together — no ordering concern between them.
- No uniqueness conflicts: tenant slug `auraconnect` vs. existing `dev`; site ssid `dev` vs.
  existing `my-demo-ssid`; site domain `dev.auraconnect.co.za` vs. existing `NULL` — all
  distinct against the unique indexes on `tenants.slug`, `sites.ssid`, `sites.domain`.
- The local AAA stubs (`radiusdesk`, MikroTik login stub on `:5483`) don't validate
  `free_username`/`free_password`/`radiusdesk_api_token` for per-site uniqueness, so reusing
  the existing demo site's stub credentials for the new site's `radius_config` is safe.
- `Site.Branding` is a nullable one-to-one, so omitting a `branding` row entirely is a valid
  "use defaults" state — no branding insert needed.

## Decisions made during the slice

- Additive-only in the existing file, not a new seed file and not a rename of the existing
  placeholder tenant/site — confirmed with the user after two earlier drafts (pull prod data;
  repurpose the existing rows in place) were both rejected in favor of this approach.
- `dev.auraconnect.co.za` (not `dev.auaraconnect.co.za`) — confirmed spelling with the user;
  the original message had a likely typo.
- The new site does get a `radius_config` row wired to the local AAA stubs (vs. existing as a
  listing-only record with no AAA wiring) — confirmed with the user so it's testable
  end-to-end, not just visible in admin listings.
- **Superseded in part** — after running the seed, the user corrected the `auraconnect-dev`
  site's `radius_config`: `gateway_url` is not the local stub host lane (`http://localhost:5483`)
  but the real pre-configured hotspot gateway, `dev-gateway.auraconnect.co.za`; and
  `free_username`/`free_password` are both `dev_trail` (not the stub's
  `click_to_connect@dev`/`click_to_connect`). This makes sense in hindsight given the slice's
  own rationale (a physical MikroTik device already configured for this site) — the
  browser-facing gateway URL and click-to-connect creds must match what that real hardware
  actually points at, not the local AAA stub. `radiusdesk_url`/`radiusdesk_api_token`/realm/cloud
  are UNCHANGED — those are the API container's own backend call to RadiusDesk (still the local
  stub via compose DNS), a separate integration point from what the physical device redirects
  the browser to. Assumed `https://` scheme for `gateway_url` (required by
  `RadiusConfig.SetGatewayUrl`'s `Uri.IsWellFormedUriString(..., UriKind.Absolute)` check) since
  the user gave a bare domain — flagged to the user, and confirmed correct once they re-ran
  `yarn dev:seed` and `yarn test:dev` against it successfully.
- **Superseded** — the tenant/site `id` values (`auraconnect`, `auraconnect-dev`) were
  hand-picked human-readable strings, not real GUIDs. Every other `Tenant`/`Site` in the system
  gets its `id` auto-generated by `BaseEntity` (`Guid.NewGuid().ToString("N")`) — the API's
  `CreateTenantRequest`/`CreateSiteRequest` DTOs don't even expose an `id` field, so this could
  only happen because the seed writes raw SQL directly to Postgres, bypassing the domain layer
  entirely. Consequence discovered by the user: the admin UI's tenant URL
  (`/admin/tenants/{id}/sites`) and Scalar both render the raw `id`, so it showed the readable
  string instead of a UUID — not a product change, just this slice's seed breaking convention.
  It also collided with slice `2026-07-05--02`'s `TENANT_ID` hex/UUID requirement, since neither
  seeded tenant id could ever pass that regex. Fix (this increment): `tenants.id` becomes
  `96f20055f69a475cbfe549d960a8d51a`, `sites.id` becomes `79cca231d2a34e869db7a7ccdbaf50f1`
  (both freshly generated, matching the `Guid.NewGuid().ToString("N")` shape) — `slug`
  (`auraconnect`), `ssid` (`dev`), and `domain` (`dev.auraconnect.co.za`) are UNCHANGED, since
  those are the intentionally human-facing fields. `radius_config.site_id` moves with the new
  site id. A schema-level guardrail (native Postgres `uuid` column type, so the DB itself
  rejects a non-UUID `id` regardless of what writes it) was discussed and explicitly deferred —
  that's an ADR-sized change (touches every FK referencing these columns plus the shared
  `BaseEntity.Id` C# type), not a seed fix.
- Per the user: also update the working `.env.current`'s `TENANT_ID` (currently `auraconnect`,
  set outside this slice) to the new tenant id, so the already-configured captive portal
  actually resolves it once the corrected seed is re-applied.
- **Superseded — wrong assumption found by the user actually using the site**: "`Site.Branding`
  is a nullable one-to-one, so omitting a `branding` row entirely is a valid 'use defaults'
  state" (original Assumptions section) is WRONG for the portal-rendering path. Confirmed in
  `BrandingService.GetPortalBrandingAsync` (`api/AuraConnect.Application/Services/BrandingService.cs`):
  `if (site.Branding == null) throw new InvalidOperationException(...)` — no fallback to the
  `Branding` entity's C# default property values. Those defaults (`BrandPrimary = "#301358"`,
  etc., in `api/AuraConnect.Core/Entities/Branding.cs`) only ever materialize via the ADMIN edit
  path (`GetOrCreateBrandingAsync`), never for the portal. The `branding` table's color/logo
  columns are also `NOT NULL` with no SQL-level default (confirmed in the
  `AddRemainingEntities` migration), so a seeded row must supply every value explicitly — it
  can't rely on Postgres defaults either. **Fix**: insert a `branding` row for the
  `auraconnect-dev` site, using the exact values already hardcoded as `Branding`'s C# property
  defaults (this IS "the AuraConnect default branding" — the generic pre-customization look).
- **Also fixed**: `sites.auth_methods` was left at its DB default (`'{}'`, empty) for the
  `auraconnect-dev` site — the seed never set it. Admin UI's "Free Access" option maps to the
  stored value `'free'` (`AuthMethod.Free` in `api/AuraConnect.Core/Entities/AuthMethod.cs`).
  Fix: set `auth_methods = '{free}'` for this site.

## Deferred / pushed forward

- Pointing a developer's local client at the new "Dev" site by default (flipping
  `SSID`/`NEXT_PUBLIC_SSID` env vars to `dev`) is left to whoever wants to do it — not part of
  this slice, since the existing demo site's env-driven default keeps working unchanged.
- A separate, earlier-discussed idea (pulling a sanitized sample of real production data into
  dev seed) was dropped in favor of this slice and is not being pursued as a follow-up here.
  If wanted later, it would need its own slice — notably to solve `Profile`'s foreign key to
  ASP.NET Identity (`AspNetUsers`), which blocks a direct data pull for user-level tables.

## Open questions

- ...

## Learnings

(Fill in as you go.)

- `dev/captive-seed.test.mjs`'s `FIXTURE_DDL` was a minimal hand-maintained mirror of the real
  `tenants`/`sites`/`radius_config` schema and was missing `tenants.portal_routing_mode` and
  `sites.domain` entirely (the original seed never touched either column). Both had to be added
  to the fixture before the new INSERT columns would even apply — a fixture drift that only
  surfaces when a seed starts using a column the fixture never modeled. Worth remembering for
  any future seed change that touches a column this fixture doesn't yet have.
- Confirmed empirically (not just by reading the config): none of the AAA stub sources (RADIUS,
  MikroTik login, RadiusDesk) validate `free_username`/`free_password`/`radiusdesk_api_token`
  for per-site uniqueness, so two sites can safely share the exact same stub credentials in
  `radius_config`.
- `radius_config` doesn't have to be all-stub or all-real: a site can point its browser-facing
  fields (`gateway_url`, `free_username`, `free_password`) at real infrastructure while its
  backend-integration fields (`radiusdesk_*`) stay pointed at the local stub, since those are
  two independent integration points (physical device → browser vs. API container → RadiusDesk).
  This only became apparent after the user ran the seed against real expectations and corrected
  it — worth designing for up front next time a site's config mixes real and local-dev targets.
- Tests that assert on a row's own `id` column shouldn't also *look up* that row by `id` — do it
  by a stable field instead (`slug`, `ssid`) so the test can actually pin "the id must have this
  shape" as a real assertion, rather than trivially matching whatever value the `WHERE` clause
  already assumed.
- **"Nullable FK, so omitting the row is fine" is a code-path-specific claim, not a schema-wide
  one.** `Site.Branding` being nullable at the EF/schema level says nothing about whether every
  *consumer* of it tolerates null — `BrandingService.GetPortalBrandingAsync` (the one the portal
  actually calls) explicitly throws when it's null, while the admin-edit path silently
  auto-creates a default row. Same entity, same nullable relationship, two different behaviors
  depending which code path reads it. The lesson: check the actual read path a seed needs to
  satisfy, not just the schema's nullability.
- The `branding` table's color/logo columns are `NOT NULL` with no SQL-level default — even
  though the C# `Branding` entity has default property values, those only apply when a `Branding`
  object is constructed in code (`new Branding(siteId)`); raw SQL bypasses the constructor
  entirely, same root cause as the id-generation gap found earlier in this slice.

## Retrospective

The plan moved through three distinct shapes before landing (pull-and-sanitize prod data →
rename the existing placeholder in place → additive block in the same file) and even the final
shape needed one post-hoc correction (real gateway/creds vs. local-stub ones) once the user
actually ran it. None of that was wasted motion: each pivot was a real constraint surfacing
(no PII policy, `Profile`'s Identity FK, "don't touch existing test data", "this must match
real hardware") that wouldn't have been visible from reading the request alone. Small, cheap
TDD increments made each pivot low-cost — the RED→GREEN cycle for the correction took minutes
because the test structure was already in place from the first increment. Confirming an
assumption (the `https://` scheme) explicitly at the checkpoint rather than silently guessing
paid off — it surfaced as confirmed rather than as a second bug report.

A second correction landed after this slice had already been marked done: a hand-picked
human-readable `id` (instead of a real GUID) turned out to matter more than it looked like at
seed-writing time — it surfaced downstream in a completely different slice (`TENANT_ID`'s
format requirement) and in the admin UI's URL. The fix itself was small, but it only got found
because the user actually used the seeded data end-to-end and noticed something looked off.
Reopening a "done" slice via the same append-only Drift Sync pattern (rather than spinning up a
new slice for what's really a defect in this one) kept the full history of *why* the id looks
the way it does in one place.
