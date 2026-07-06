-- Run as an admin, e.g.: sudo mysql -u root < create_readonly_user.sql
-- (or paste into the `sudo mysql -u root` session you already had open)
--
-- Creates a read-only credential scoped to just the `rd` database — no writes,
-- no DDL, no admin grants. Used by both the schema-explorer script and (later)
-- the production usage-reporting integration.

-- 1. Create the user.
--    'connecting_host' should be the specific IP that will connect — the
--    AuraConnect API server's IP, or your machine's IP if running the
--    schema-explorer script from there. Use '%' only if you can't pin down a
--    specific source IP (e.g. NAT'd/dynamic egress) — prefer a specific IP if
--    your firewall/security-group setup doesn't already restrict this at the
--    network level.
CREATE USER 'auraconnect_ro'@'connecting_host'
    IDENTIFIED BY 'REPLACE_WITH_A_STRONG_RANDOM_PASSWORD';

-- 2. Grant SELECT only, on the whole `rd` database (the schema-explorer needs
--    to read every table; the reporting integration's exact table set isn't
--    known yet either, so don't narrow this to a hand-picked list).
GRANT SELECT ON rd.* TO 'auraconnect_ro'@'connecting_host';

-- 3. Cap concurrent connections so a runaway reporting query can't starve the
--    live RADIUS workload sharing this same database.
ALTER USER 'auraconnect_ro'@'connecting_host' WITH MAX_USER_CONNECTIONS 5;

FLUSH PRIVILEGES;

-- Verify — should show exactly one SELECT grant, nothing else.
SHOW GRANTS FOR 'auraconnect_ro'@'connecting_host';
