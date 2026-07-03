-- FreeRADIUS accounting-DB stub — schema (AAA slice 2026-07-03--01, stub D).
-- Only the four tables the API reads (RadiusAccountingClient.cs). DDL mirrors the
-- upstream RadiusDesk schema captured in
-- api/tools/radiusdesk-schema-explorer/reports/rd_schema_2026-06-28_14-28.md.
-- NOT-NULL varchar columns with an empty upstream default get DEFAULT '' so the seed
-- can name only the meaningful columns.

-- radacct + radacct_history share one shape; the API UNIONs them. radacct holds live
-- + recent sessions (open rows have NULL acctstoptime); radacct_history is the archive.
CREATE TABLE radacct (
  radacctid            BIGINT           NOT NULL AUTO_INCREMENT PRIMARY KEY,
  acctsessionid        VARCHAR(64)      NOT NULL DEFAULT '',
  acctuniqueid         VARCHAR(32)      NOT NULL UNIQUE,
  username             VARCHAR(64)      NOT NULL DEFAULT '',
  groupname            VARCHAR(64)      NOT NULL DEFAULT '',
  realm                VARCHAR(64)      NULL,
  nasipaddress         VARCHAR(15)      NOT NULL DEFAULT '',
  nasidentifier        VARCHAR(64)      NOT NULL DEFAULT '',
  nasportid            VARCHAR(15)      NULL,
  nasporttype          VARCHAR(32)      NULL,
  acctstarttime        DATETIME         NULL,
  acctupdatetime       DATETIME         NULL,
  acctstoptime         DATETIME         NULL,
  acctinterval         INT              NULL,
  acctsessiontime      INT UNSIGNED     NULL,
  acctauthentic        VARCHAR(32)      NULL,
  connectinfo_start    VARCHAR(50)      NULL,
  connectinfo_stop     VARCHAR(50)      NULL,
  acctinputoctets      BIGINT           NULL,
  acctoutputoctets     BIGINT           NULL,
  calledstationid      VARCHAR(50)      NOT NULL DEFAULT '',
  callingstationid     VARCHAR(50)      NOT NULL DEFAULT '',
  acctterminatecause   VARCHAR(32)      NOT NULL DEFAULT '',
  servicetype          VARCHAR(32)      NULL,
  framedprotocol       VARCHAR(32)      NULL,
  framedipaddress      VARCHAR(15)      NOT NULL DEFAULT '',
  acctstartdelay       INT              NULL,
  acctstopdelay        INT              NULL,
  xascendsessionsvrkey VARCHAR(20)      NULL,
  operator_name        VARCHAR(32)      NOT NULL DEFAULT '',
  KEY idx_radacct_start   (acctstarttime),
  KEY idx_radacct_stop    (acctstoptime),
  KEY idx_radacct_user    (username),
  KEY idx_radacct_station (calledstationid)
);

CREATE TABLE radacct_history LIKE radacct;

-- Post-auth log — the API groups by `reply` (Access-Accept / Access-Reject) over authdate.
CREATE TABLE radpostauth (
  id        INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
  username  VARCHAR(64)  NOT NULL DEFAULT '',
  realm     VARCHAR(64)  NULL,
  pass      VARCHAR(64)  NOT NULL DEFAULT '',
  reply     VARCHAR(32)  NOT NULL DEFAULT '',
  nasname   VARCHAR(128) NOT NULL DEFAULT '',
  authdate  TIMESTAMP    NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  KEY idx_radpostauth_authdate (authdate),
  KEY idx_radpostauth_username (username)
);

-- Per-user daily usage rollup — API sums octets by DATE(timestamp) per username.
CREATE TABLE user_stats_dailies (
  id               INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_stat_id     INT          NOT NULL DEFAULT 0,
  username         VARCHAR(64)  NOT NULL DEFAULT '',
  realm            VARCHAR(64)  NULL,
  nasidentifier    VARCHAR(64)  NOT NULL DEFAULT '',
  callingstationid VARCHAR(50)  NOT NULL DEFAULT '',
  timestamp        TIMESTAMP    NOT NULL DEFAULT current_timestamp(),
  acctinputoctets  BIGINT       NOT NULL DEFAULT 0,
  acctoutputoctets BIGINT       NOT NULL DEFAULT 0,
  KEY idx_usd_username  (username),
  KEY idx_usd_timestamp (timestamp)
);
