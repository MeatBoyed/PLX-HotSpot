-- dev/init/10-current-db.sql — CURRENT group database (EF-migrated).
-- Slice 2026-07-01--02 decision: separate init per group, each independently
-- runnable. Runs once, on first init of a fresh Postgres volume, as the superuser
-- against the bootstrap `postgres` DB. Dev-only credentials — this stack is the
-- local inner loop, never a deployed environment.
CREATE ROLE auraconnect WITH LOGIN PASSWORD 'auraconnect_pw';
CREATE DATABASE auraconnect OWNER auraconnect;
