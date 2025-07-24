-- Migration: 20250724150050_create_extension_pg_cron.sql
-- Description: Create pg_cron extension
-- Table: N/A
-- Autor: Gustavo Macedo
-- Data: 2025-07-24

BEGIN;
CREATE EXTENSION IF NOT EXISTS pg_cron;
COMMIT;

-- ROLLBACK;
-- DROP EXTENSION IF EXISTS pg_cron;
-- COMMIT;