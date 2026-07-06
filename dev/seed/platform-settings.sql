-- API RADIUS-DB config seed (AAA slice 2026-07-03--01, stub H).
-- Points the API at the radius-db MariaDB stub so RadiusAccountingClient connects with
-- zero manual admin setup. Applied to the API's Postgres (`auraconnect` DB) AFTER the API
-- has migrated on startup (Program.cs MigrateAsync creates platform_settings) — run via
-- `yarn dev:seed` once the stack is up.
--
-- platform_settings is a SINGLETON (repo fetches with SingleOrDefault). Upserting the
-- fixed id='platform' row keeps it single and idempotent. Host/creds mirror the radius-db
-- compose service (dev/docker-compose.yml + .env.example RADIUS_DB_*). Password is stored
-- plaintext (the API reads it verbatim into the MySQL connection string).
-- mikrotik_* points the API's gateway-verification (MikroTikGatewayService) at stub A's
-- HTTPS REST listener (`https://mikrotik:8443/rest`); the API's MikroTik HttpClient accepts
-- the self-signed cert. Creds mirror the stub (MIKROTIK_STUB_USER/PASS).
INSERT INTO platform_settings
  (id, radius_db_host, radius_db_port, radius_db_name, radius_db_username, radius_db_password,
   mikrotik_api_host, mikrotik_username, mikrotik_password, updated_at)
VALUES
  ('platform', 'radius-db', 3306, 'radius', 'radius', 'radius_pw',
   'mikrotik:8443', 'admin', 'admin', CURRENT_TIMESTAMP)
ON CONFLICT (id) DO UPDATE SET
  radius_db_host     = EXCLUDED.radius_db_host,
  radius_db_port     = EXCLUDED.radius_db_port,
  radius_db_name     = EXCLUDED.radius_db_name,
  radius_db_username = EXCLUDED.radius_db_username,
  radius_db_password = EXCLUDED.radius_db_password,
  mikrotik_api_host  = EXCLUDED.mikrotik_api_host,
  mikrotik_username  = EXCLUDED.mikrotik_username,
  mikrotik_password  = EXCLUDED.mikrotik_password,
  updated_at         = CURRENT_TIMESTAMP;
