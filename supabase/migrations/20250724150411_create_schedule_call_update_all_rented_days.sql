-- Migration: 20250724150711_create_schedule_call_update_all_rented_days.sql
-- Description: Create a scheduled task to update all rented days daily
-- Table: N/A
-- Autor: Gustavo Macedo
-- Data: 2025-07-24

BEGIN;
SELECT cron.schedule(
  'daily_update_all_rented_days',                   -- nome descritivo
  '0 18 * * *',                  -- expressão CRON (ex: todo dia às 3h)
  $$CALL update_all_rented_days();$$  -- query a ser executada
);
COMMIT;

-- ROLLBACK;
-- DELETE FROM cron.job WHERE schedule = '0 18 * * *' AND command = $$CALL update_all_rented_days();$$;
-- COMMIT;