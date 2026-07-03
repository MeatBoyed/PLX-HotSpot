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
INSERT INTO tenants (id, name, slug, updated_at)
VALUES ('tenant-dev', 'Dev Tenant', 'dev', CURRENT_TIMESTAMP)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, slug = EXCLUDED.slug, updated_at = CURRENT_TIMESTAMP;

INSERT INTO sites (id, tenant_id, ssid, name, updated_at)
VALUES ('site-dev', 'tenant-dev', 'my-demo-ssid', 'Dev Site', CURRENT_TIMESTAMP)
ON CONFLICT (id) DO UPDATE SET tenant_id = EXCLUDED.tenant_id, ssid = EXCLUDED.ssid,
  name = EXCLUDED.name, updated_at = CURRENT_TIMESTAMP;

INSERT INTO radius_config
  (site_id, gateway_url, free_username, free_password,
   radiusdesk_url, radiusdesk_api_token, radiusdesk_realm_id, radiusdesk_cloud_id, updated_at)
VALUES
  ('site-dev', 'http://localhost:5483', 'click_to_connect@dev', 'click_to_connect',
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
