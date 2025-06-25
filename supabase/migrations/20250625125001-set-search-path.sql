-- Corrigir warnings de search_path nas funções
-- Linter: function_search_path_mutable

ALTER FUNCTION IF EXISTS public.update_asset_rented_days(text)
  SET search_path = public;
ALTER FUNCTION IF EXISTS public.update_all_rented_days()
  SET search_path = public;
ALTER FUNCTION IF EXISTS public.validate_rented_days_integrity()
  SET search_path = public;
ALTER FUNCTION IF EXISTS public.log_and_update_status()
  SET search_path = public;
ALTER FUNCTION IF EXISTS public.acquire_operation_lock(text, text, jsonb, integer)
  SET search_path = public;
ALTER FUNCTION IF EXISTS public.release_operation_lock(uuid)
  SET search_path = public;
ALTER FUNCTION IF EXISTS public.validate_association_state(text, text, bigint)
  SET search_path = public;
