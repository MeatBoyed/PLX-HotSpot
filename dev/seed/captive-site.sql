-- Captive-site config seed (AAA slice 2026-07-03--01, stub H part 3).
-- Installs a dev tenant → site → radius_config chain so the API's provisioning
-- (RadiusProvisioningService reads per-site RadiusConfig) and the captive portal's gateway
-- lookup resolve against the local stubs. Applied to the API's Postgres (`auraconnect`)
-- AFTER the API has migrated (Program.cs) — run via `yarn dev:seed`. Idempotent upserts.
--
-- Network perspectives differ by consumer and are BOTH correct:
--   radiusdesk_url → the API container calls stub C via compose DNS  (http://radiusdesk:8080)
--   gateway_url    → the browser navigates to stub B on the host lane (http://localhost:5483)

-- Insert order follows the FK chain: tenant, then site, then radius_config.
--
-- Ids are fixed, real GUID-hex strings (Checkpoint 17, 2026-07-06 correction — matching
-- BaseEntity's Guid.NewGuid().ToString("N") convention), not the earlier human-readable
-- 'tenant-dev'/'site-dev'. name ('Dev Tenant'/'Dev Site'), slug ('dev'), and ssid
-- ('my-demo-ssid') are unchanged — those are the intended human-facing fields.
INSERT INTO tenants (id, name, slug, updated_at)
VALUES ('de49b6cbe9d24edfb7d32dcec06a474f', 'Dev Tenant', 'dev', CURRENT_TIMESTAMP)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, slug = EXCLUDED.slug, updated_at = CURRENT_TIMESTAMP;

INSERT INTO sites (id, tenant_id, ssid, name, updated_at)
VALUES ('eaafa0ff706d4a52b6f45dbcced67b3b', 'de49b6cbe9d24edfb7d32dcec06a474f', 'my-demo-ssid', 'Dev Site', CURRENT_TIMESTAMP)
ON CONFLICT (id) DO UPDATE SET tenant_id = EXCLUDED.tenant_id, ssid = EXCLUDED.ssid,
  name = EXCLUDED.name, updated_at = CURRENT_TIMESTAMP;

INSERT INTO radius_config
  (site_id, gateway_url, free_username, free_password,
   radiusdesk_url, radiusdesk_api_token, radiusdesk_realm_id, radiusdesk_cloud_id, updated_at)
VALUES
  ('eaafa0ff706d4a52b6f45dbcced67b3b', 'http://localhost:5483', 'click_to_connect@dev', 'click_to_connect',
   'http://radiusdesk:8080', 'dev-radiusdesk-token', '1', '1', CURRENT_TIMESTAMP)
ON CONFLICT (site_id) DO UPDATE SET
  gateway_url          = EXCLUDED.gateway_url,
  free_username        = EXCLUDED.free_username,
  free_password        = EXCLUDED.free_password,
  radiusdesk_url       = EXCLUDED.radiusdesk_url,
  radiusdesk_api_token = EXCLUDED.radiusdesk_api_token,
  radiusdesk_realm_id  = EXCLUDED.radiusdesk_realm_id,
  radiusdesk_cloud_id  = EXCLUDED.radiusdesk_cloud_id,
  updated_at           = CURRENT_TIMESTAMP;

-- Additive: a second, real-shaped dev tenant/site (2026-07-05--01), alongside the generic
-- placeholder above — NOT a replacement. A physical MikroTik hotspot device is already
-- configured to point at this dev host/domain and broadcast ssid "dev", so any developer who
-- clones the repo and brings up the stack gets a tenant/site the real hardware can talk to
-- immediately, with no per-developer hotspot provisioning.
--
-- auth_methods = 'free' (Free Access) and a branding row ARE required: the portal-facing
-- BrandingService.GetPortalBrandingAsync throws "No branding configured" when no `branding`
-- row exists — it does NOT fall back to the Branding entity's C# default property values (an
-- earlier version of this seed wrongly assumed omitting the row was a valid "use defaults"
-- state). The branding row below uses those exact same C# defaults verbatim (Branding.cs) —
-- this IS "the AuraConnect default branding", just materialized as a real row instead of
-- assumed. The `branding` table's color/logo columns are NOT NULL with no SQL-level default,
-- so every value must be supplied explicitly.
--
-- Ids are fixed, real GUID-hex strings (matching BaseEntity's Guid.NewGuid().ToString("N")
-- convention) — NOT the slug/ssid. An earlier version of this seed used the human-readable
-- 'auraconnect'/'auraconnect-dev' as the literal ids, which broke convention (every other
-- Tenant/Site gets an opaque auto-generated id — the API's create DTOs don't even expose an
-- id field) and made it impossible to satisfy captive-portal's TENANT_ID hex/UUID requirement.
-- slug ('auraconnect') and ssid ('dev') are unchanged — those are the intended human-facing
-- fields. NOTE: changing an id changes the ON CONFLICT upsert key — if you already had the old
-- 'auraconnect'/'auraconnect-dev' rows locally, `yarn db:reset` (or manually delete them) to
-- avoid orphaned duplicates.
--
-- radius_config here is a MIX of real and stub-pointing values: gateway_url/free_username/
-- free_password must match what the real physical device is actually configured with (the
-- browser is redirected there by the hardware itself), so they are NOT the local stub.
-- radiusdesk_* stay pointed at the local stub — that's the API container's own backend call
-- to RadiusDesk, a separate integration point untouched by the physical device.
INSERT INTO tenants (id, name, slug, portal_routing_mode, updated_at)
VALUES ('96f20055f69a475cbfe549d960a8d51a', 'AuraConnect', 'auraconnect', 1, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, slug = EXCLUDED.slug,
  portal_routing_mode = EXCLUDED.portal_routing_mode, updated_at = CURRENT_TIMESTAMP;

INSERT INTO sites (id, tenant_id, ssid, name, domain, auth_methods, updated_at)
VALUES ('79cca231d2a34e869db7a7ccdbaf50f1', '96f20055f69a475cbfe549d960a8d51a', 'dev', 'Dev',
  'dev.auraconnect.co.za', '{free}', CURRENT_TIMESTAMP)
ON CONFLICT (id) DO UPDATE SET tenant_id = EXCLUDED.tenant_id, ssid = EXCLUDED.ssid,
  name = EXCLUDED.name, domain = EXCLUDED.domain, auth_methods = EXCLUDED.auth_methods,
  updated_at = CURRENT_TIMESTAMP;

INSERT INTO radius_config
  (site_id, gateway_url, free_username, free_password,
   radiusdesk_url, radiusdesk_api_token, radiusdesk_realm_id, radiusdesk_cloud_id, updated_at)
VALUES
  ('79cca231d2a34e869db7a7ccdbaf50f1', 'https://dev-gateway.auraconnect.co.za', 'dev_trail', 'dev_trail',
   'http://radiusdesk:8080', 'dev-radiusdesk-token', '1', '1', CURRENT_TIMESTAMP)
ON CONFLICT (site_id) DO UPDATE SET
  gateway_url          = EXCLUDED.gateway_url,
  free_username        = EXCLUDED.free_username,
  free_password        = EXCLUDED.free_password,
  radiusdesk_url       = EXCLUDED.radiusdesk_url,
  radiusdesk_api_token = EXCLUDED.radiusdesk_api_token,
  radiusdesk_realm_id  = EXCLUDED.radiusdesk_realm_id,
  radiusdesk_cloud_id  = EXCLUDED.radiusdesk_cloud_id,
  updated_at           = CURRENT_TIMESTAMP;

INSERT INTO branding
  (site_id, brand_primary, brand_primary_hover, brand_secondary, brand_accent,
   text_primary, text_secondary, text_tertiary, text_muted,
   surface_card, surface_white, surface_border,
   button_primary, button_primary_hover, button_primary_text,
   button_secondary, button_secondary_hover, button_secondary_text,
   logo_url, logo_white_url, connect_card_bg_url, updated_at)
VALUES
  ('79cca231d2a34e869db7a7ccdbaf50f1', '#301358', '#5B3393', '#F2F2F2', '#F60031',
   '#181818', '#5D5D5D', '#7A7A7A', '#CECECE',
   '#F2F2F2', '#FFFFFF', '#CECECE',
   '#301358', '#5B3393', '#FFFFFF',
   '#FFFFFF', '#f5f5f5', '#301358',
   '/logo-default.svg', '/logo-white-default.svg', '/connect-bg-default.png', CURRENT_TIMESTAMP)
ON CONFLICT (site_id) DO UPDATE SET
  brand_primary          = EXCLUDED.brand_primary,
  brand_primary_hover    = EXCLUDED.brand_primary_hover,
  brand_secondary        = EXCLUDED.brand_secondary,
  brand_accent           = EXCLUDED.brand_accent,
  text_primary           = EXCLUDED.text_primary,
  text_secondary         = EXCLUDED.text_secondary,
  text_tertiary          = EXCLUDED.text_tertiary,
  text_muted             = EXCLUDED.text_muted,
  surface_card           = EXCLUDED.surface_card,
  surface_white          = EXCLUDED.surface_white,
  surface_border         = EXCLUDED.surface_border,
  button_primary         = EXCLUDED.button_primary,
  button_primary_hover   = EXCLUDED.button_primary_hover,
  button_primary_text    = EXCLUDED.button_primary_text,
  button_secondary       = EXCLUDED.button_secondary,
  button_secondary_hover = EXCLUDED.button_secondary_hover,
  button_secondary_text  = EXCLUDED.button_secondary_text,
  logo_url               = EXCLUDED.logo_url,
  logo_white_url         = EXCLUDED.logo_white_url,
  connect_card_bg_url    = EXCLUDED.connect_card_bg_url,
  updated_at             = CURRENT_TIMESTAMP;
