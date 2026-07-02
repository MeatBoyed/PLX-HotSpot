-- dev/init/20-legacy-db.sql — LEGACY group database (Prisma-managed monolith).
-- Slice 2026-07-01--02 decision: separate init per group, each independently
-- runnable. The legacy app connects via DATABASE_URL (wired in Inc 4); this creates
-- the role + database that URL points at. Dev-only credentials.
CREATE ROLE legacy WITH LOGIN PASSWORD 'legacy_pw';
CREATE DATABASE phs_portal OWNER legacy;
