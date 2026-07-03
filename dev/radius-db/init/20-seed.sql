-- FreeRADIUS accounting-DB stub — seed (AAA slice 2026-07-03--01, stub D).
-- Small but realistic dataset so the monitor telemetry views + the API's aggregate
-- queries render non-empty. Timestamps are NOW()-relative so the data stays inside a
-- rolling "last N days" window regardless of when the volume is initialised.
-- Two sites (calledstationid = NAS MAC), four users, a mix of closed + open sessions.

-- ── radacct: live + recent (open rows = NULL acctstoptime → "active sessions") ──
INSERT INTO radacct
  (acctsessionid, acctuniqueid, username, groupname, nasipaddress, nasidentifier,
   acctstarttime, acctstoptime, acctsessiontime, acctinputoctets, acctoutputoctets,
   calledstationid, callingstationid, framedipaddress, operator_name)
VALUES
  -- Site 01 — one open (active) session, one closed today.
  ('sess-01a', 'uniq-01a', 'user01@aura', 'voucher-1h', '10.0.0.1', 'nas-site-01',
   NOW() - INTERVAL 20 MINUTE, NULL, NULL, 15000000, 45000000,
   'AA:BB:CC:DD:EE:01', '11:22:33:44:55:01', '100.64.0.10', 'aura'),
  ('sess-01b', 'uniq-01b', 'user02@aura', 'voucher-1h', '10.0.0.1', 'nas-site-01',
   NOW() - INTERVAL 3 HOUR, NOW() - INTERVAL 2 HOUR, 3600, 8000000, 20000000,
   'AA:BB:CC:DD:EE:01', '11:22:33:44:55:02', '100.64.0.11', 'aura'),
  -- Site 02 — one open session, one closed yesterday.
  ('sess-02a', 'uniq-02a', 'user03@aura', 'voucher-24h', '10.0.0.2', 'nas-site-02',
   NOW() - INTERVAL 45 MINUTE, NULL, NULL, 30000000, 90000000,
   'AA:BB:CC:DD:EE:02', '11:22:33:44:55:03', '100.64.1.10', 'aura'),
  ('sess-02b', 'uniq-02b', 'user04@aura', 'voucher-24h', '10.0.0.2', 'nas-site-02',
   NOW() - INTERVAL 1 DAY, NOW() - INTERVAL 23 HOUR, 3600, 12000000, 33000000,
   'AA:BB:CC:DD:EE:02', '11:22:33:44:55:04', '100.64.1.11', 'aura');

-- ── radacct_history: archived sessions across the past week (all closed) ────────
INSERT INTO radacct_history
  (acctsessionid, acctuniqueid, username, groupname, nasipaddress, nasidentifier,
   acctstarttime, acctstoptime, acctsessiontime, acctinputoctets, acctoutputoctets,
   calledstationid, callingstationid, framedipaddress, operator_name)
VALUES
  ('hist-01a', 'huniq-01a', 'user01@aura', 'voucher-1h', '10.0.0.1', 'nas-site-01',
   NOW() - INTERVAL 2 DAY, NOW() - INTERVAL 2 DAY + INTERVAL 1 HOUR, 3600, 20000000, 60000000,
   'AA:BB:CC:DD:EE:01', '11:22:33:44:55:01', '100.64.0.10', 'aura'),
  ('hist-01b', 'huniq-01b', 'user02@aura', 'voucher-1h', '10.0.0.1', 'nas-site-01',
   NOW() - INTERVAL 4 DAY, NOW() - INTERVAL 4 DAY + INTERVAL 30 MINUTE, 1800, 5000000, 15000000,
   'AA:BB:CC:DD:EE:01', '11:22:33:44:55:02', '100.64.0.11', 'aura'),
  ('hist-02a', 'huniq-02a', 'user03@aura', 'voucher-24h', '10.0.0.2', 'nas-site-02',
   NOW() - INTERVAL 5 DAY, NOW() - INTERVAL 5 DAY + INTERVAL 2 HOUR, 7200, 40000000, 120000000,
   'AA:BB:CC:DD:EE:02', '11:22:33:44:55:03', '100.64.1.10', 'aura');

-- ── radpostauth: auth outcomes (mostly accepts, one reject) ─────────────────────
INSERT INTO radpostauth (username, reply, nasname, authdate) VALUES
  ('user01@aura', 'Access-Accept', 'nas-site-01', NOW() - INTERVAL 20 MINUTE),
  ('user02@aura', 'Access-Accept', 'nas-site-01', NOW() - INTERVAL 3 HOUR),
  ('user03@aura', 'Access-Accept', 'nas-site-02', NOW() - INTERVAL 45 MINUTE),
  ('user04@aura', 'Access-Accept', 'nas-site-02', NOW() - INTERVAL 1 DAY),
  ('user99@aura', 'Access-Reject', 'nas-site-01', NOW() - INTERVAL 10 MINUTE);

-- ── user_stats_dailies: per-user daily octet rollups over the past few days ──────
INSERT INTO user_stats_dailies
  (user_stat_id, username, nasidentifier, callingstationid, timestamp, acctinputoctets, acctoutputoctets)
VALUES
  (1, 'user01@aura', 'nas-site-01', '11:22:33:44:55:01', NOW() - INTERVAL 0 DAY, 35000000, 105000000),
  (2, 'user01@aura', 'nas-site-01', '11:22:33:44:55:01', NOW() - INTERVAL 2 DAY, 20000000, 60000000),
  (3, 'user02@aura', 'nas-site-01', '11:22:33:44:55:02', NOW() - INTERVAL 0 DAY, 8000000, 20000000),
  (4, 'user03@aura', 'nas-site-02', '11:22:33:44:55:03', NOW() - INTERVAL 0 DAY, 30000000, 90000000),
  (5, 'user04@aura', 'nas-site-02', '11:22:33:44:55:04', NOW() - INTERVAL 1 DAY, 12000000, 33000000);
