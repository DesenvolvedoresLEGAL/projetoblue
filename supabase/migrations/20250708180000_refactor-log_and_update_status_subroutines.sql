-- Add helper functions and refactor log_and_update_status

CREATE OR REPLACE FUNCTION public.fetch_asset_info(asset_uuid text)
RETURNS TABLE(status_id bigint, solution_id bigint, radio text, line_number bigint)
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
    SELECT status_id, solution_id, radio, line_number
    FROM assets WHERE uuid = asset_uuid;
EXCEPTION WHEN OTHERS THEN
  RETURN;
END;
$$;
GRANT ALL ON FUNCTION public.fetch_asset_info(text) TO anon;
GRANT ALL ON FUNCTION public.fetch_asset_info(text) TO authenticated;
GRANT ALL ON FUNCTION public.fetch_asset_info(text) TO service_role;

CREATE OR REPLACE FUNCTION public.get_client_name(client_uuid uuid)
RETURNS text
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
DECLARE name text;
BEGIN
  IF client_uuid IS NOT NULL THEN
    SELECT nome INTO name FROM clients WHERE uuid = client_uuid;
  END IF;
  RETURN name;
EXCEPTION WHEN OTHERS THEN
  RETURN NULL;
END;
$$;
GRANT ALL ON FUNCTION public.get_client_name(uuid) TO anon;
GRANT ALL ON FUNCTION public.get_client_name(uuid) TO authenticated;
GRANT ALL ON FUNCTION public.get_client_name(uuid) TO service_role;

CREATE OR REPLACE FUNCTION public.get_solution_name(solution_id bigint)
RETURNS text
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
DECLARE sol text;
BEGIN
  IF solution_id IS NOT NULL THEN
    SELECT solution INTO sol FROM asset_solutions WHERE id = solution_id;
  END IF;
  RETURN sol;
EXCEPTION WHEN OTHERS THEN
  RETURN NULL;
END;
$$;
GRANT ALL ON FUNCTION public.get_solution_name(bigint) TO anon;
GRANT ALL ON FUNCTION public.get_solution_name(bigint) TO authenticated;
GRANT ALL ON FUNCTION public.get_solution_name(bigint) TO service_role;

CREATE OR REPLACE FUNCTION public.load_status_ids()
RETURNS TABLE(em_locacao bigint, disponivel bigint, em_assinatura bigint)
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  SELECT id FROM asset_status WHERE LOWER(status) = 'em locação' LIMIT 1 INTO em_locacao;
  SELECT id FROM asset_status WHERE LOWER(status) IN ('disponível', 'disponivel') LIMIT 1 INTO disponivel;
  SELECT id FROM asset_status WHERE LOWER(status) = 'em assinatura' LIMIT 1 INTO em_assinatura;
  IF em_locacao IS NULL THEN SELECT id INTO em_locacao FROM asset_status WHERE id = 2 LIMIT 1; END IF;
  IF disponivel IS NULL THEN SELECT id INTO disponivel FROM asset_status WHERE id = 1 LIMIT 1; END IF;
  IF em_assinatura IS NULL THEN SELECT id INTO em_assinatura FROM asset_status WHERE id = 3 LIMIT 1; END IF;
END;
$$;
GRANT ALL ON FUNCTION public.load_status_ids() TO anon;
GRANT ALL ON FUNCTION public.load_status_ids() TO authenticated;
GRANT ALL ON FUNCTION public.load_status_ids() TO service_role;

CREATE OR REPLACE FUNCTION public.validate_assoc_id(new_id bigint, old_id bigint)
RETURNS bigint
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
DECLARE result bigint;
BEGIN
  IF new_id IS NOT NULL AND EXISTS (SELECT 1 FROM asset_client_assoc WHERE id = new_id) THEN
    result := new_id;
  ELSIF old_id IS NOT NULL AND EXISTS (SELECT 1 FROM asset_client_assoc WHERE id = old_id) THEN
    result := old_id;
  END IF;
  RETURN result;
END;
$$;
GRANT ALL ON FUNCTION public.validate_assoc_id(bigint, bigint) TO anon;
GRANT ALL ON FUNCTION public.validate_assoc_id(bigint, bigint) TO authenticated;
GRANT ALL ON FUNCTION public.validate_assoc_id(bigint, bigint) TO service_role;

CREATE OR REPLACE FUNCTION public.calc_new_status(
    op text, new_exit date, old_exit date, association_id bigint,
    ids record, status_antigo bigint)
RETURNS TABLE(status_novo bigint, houve_alteracao boolean)
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF op = 'DELETE' THEN
    status_novo := ids.disponivel;
  ELSIF new_exit IS NOT NULL AND (old_exit IS NULL OR old_exit IS DISTINCT FROM new_exit) THEN
    status_novo := ids.disponivel;
  ELSIF new_exit IS NULL AND association_id = 1 THEN
    status_novo := ids.em_locacao;
  ELSIF new_exit IS NULL AND association_id = 2 THEN
    status_novo := ids.em_assinatura;
  ELSE
    status_novo := status_antigo;
  END IF;
  houve_alteracao := (status_novo IS DISTINCT FROM status_antigo);
END;
$$;
GRANT ALL ON FUNCTION public.calc_new_status(text, date, date, bigint, record, bigint) TO anon;
GRANT ALL ON FUNCTION public.calc_new_status(text, date, date, bigint, record, bigint) TO authenticated;
GRANT ALL ON FUNCTION public.calc_new_status(text, date, date, bigint, record, bigint) TO service_role;

CREATE OR REPLACE FUNCTION public.update_asset_status(asset_uuid text, old_status bigint, new_status bigint)
RETURNS boolean
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
DECLARE current_status bigint;
BEGIN
  SELECT status_id INTO current_status FROM assets WHERE uuid = asset_uuid;
  IF current_status = old_status THEN
    UPDATE assets SET status_id = new_status
    WHERE uuid = asset_uuid AND status_id = old_status;
    RETURN FOUND;
  END IF;
  RETURN FALSE;
EXCEPTION WHEN OTHERS THEN
  RETURN FALSE;
END;
$$;
GRANT ALL ON FUNCTION public.update_asset_status(text, bigint, bigint) TO anon;
GRANT ALL ON FUNCTION public.update_asset_status(text, bigint, bigint) TO authenticated;
GRANT ALL ON FUNCTION public.update_asset_status(text, bigint, bigint) TO service_role;

CREATE OR REPLACE FUNCTION public.insert_asset_log(
    p_assoc_id bigint, p_event text, p_details jsonb, p_status_before bigint, p_status_after bigint)
RETURNS void
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM asset_logs
      WHERE assoc_id = p_assoc_id
        AND event = p_event
        AND status_before_id = p_status_before
        AND status_after_id = p_status_after
        AND date > NOW() - INTERVAL '5 seconds'
  ) THEN
    INSERT INTO asset_logs (assoc_id, date, event, details, status_before_id, status_after_id)
    VALUES (p_assoc_id, NOW(), p_event, p_details, p_status_before, p_status_after);
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE '[insert_asset_log] erro: %', SQLERRM;
END;
$$;
GRANT ALL ON FUNCTION public.insert_asset_log(bigint, text, jsonb, bigint, bigint) TO anon;
GRANT ALL ON FUNCTION public.insert_asset_log(bigint, text, jsonb, bigint, bigint) TO authenticated;
GRANT ALL ON FUNCTION public.insert_asset_log(bigint, text, jsonb, bigint, bigint) TO service_role;

CREATE OR REPLACE FUNCTION public.log_trigger_error(
    p_assoc_id bigint, p_asset_uuid text, p_op text, p_err text, p_state text)
RETURNS void
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO asset_logs (
    assoc_id, date, event, details, status_before_id, status_after_id
  ) VALUES (
    p_assoc_id, NOW(), 'TRIGGER_ERROR',
    jsonb_build_object(
      'error', p_err,
      'sqlstate', p_state,
      'asset_id', p_asset_uuid,
      'operation', p_op,
      'timestamp', NOW()
    ),
    NULL, NULL
  );
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE '[log_trigger_error] falha: %', SQLERRM;
END;
$$;
GRANT ALL ON FUNCTION public.log_trigger_error(bigint, text, text, text, text) TO anon;
GRANT ALL ON FUNCTION public.log_trigger_error(bigint, text, text, text, text) TO authenticated;
GRANT ALL ON FUNCTION public.log_trigger_error(bigint, text, text, text, text) TO service_role;

CREATE OR REPLACE FUNCTION public.log_and_update_status()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public, auth'
AS $$
DECLARE
  status_antigo bigint;
  status_novo bigint;
  houve_alteracao boolean;
  asset_info record;
  ids record;
  valid_assoc_id bigint;
  current_asset_id text;
  client_name text;
  solution_name text;
  asset_radio text;
  asset_line_number bigint;
  updated boolean;
BEGIN
  SET LOCAL search_path TO public;
  current_asset_id := COALESCE(NEW.asset_id, OLD.asset_id);

  RAISE NOTICE '[log_and_update_status] Trigger executada - asset_id: %, operação: %, timestamp: %',
    current_asset_id, TG_OP, NOW();

  IF current_asset_id IS NULL OR trim(current_asset_id) = '' THEN
    RAISE NOTICE '[log_and_update_status] ERRO: asset_id inválido ou vazio';
    CASE TG_OP WHEN 'DELETE' THEN RETURN OLD; ELSE RETURN NEW; END CASE;
  END IF;

  asset_info := fetch_asset_info(current_asset_id);
  status_antigo := asset_info.status_id;
  asset_radio := asset_info.radio;
  asset_line_number := asset_info.line_number;

  client_name := get_client_name(NEW.client_id);
  solution_name := get_solution_name(asset_info.solution_id);

  ids := load_status_ids();

  valid_assoc_id := validate_assoc_id(NEW.id, OLD.id);

  SELECT status_novo, houve_alteracao
  INTO status_novo, houve_alteracao
  FROM calc_new_status(
    TG_OP,
    NEW.exit_date,
    OLD.exit_date,
    COALESCE(NEW.association_id, OLD.association_id),
    ids,
    status_antigo
  );

  IF houve_alteracao THEN
    updated := update_asset_status(current_asset_id, status_antigo, status_novo);
    IF NOT updated THEN
      houve_alteracao := FALSE;
    END IF;
  END IF;

  IF houve_alteracao OR TG_OP IN ('INSERT','DELETE') THEN
    insert_asset_log(
      valid_assoc_id,
      CASE
        WHEN TG_OP = 'INSERT' THEN 'ASSOCIATION_CREATED'
        WHEN TG_OP = 'DELETE' THEN 'ASSOCIATION_REMOVED'
        WHEN houve_alteracao THEN 'ASSOCIATION_STATUS_UPDATED'
        ELSE 'ASSOCIATION_MODIFIED'
      END,
      jsonb_build_object(
        'user_id', COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'),
        'username', COALESCE(current_setting('request.jwt.claim.sub', true), 'system'),
        'asset_id', current_asset_id,
        'client_id', COALESCE(NEW.client_id, OLD.client_id),
        'client_name', client_name,
        'association_id', COALESCE(NEW.association_id, OLD.association_id),
        'association_type', CASE
          WHEN COALESCE(NEW.association_id, OLD.association_id) = 1 THEN 'Aluguel'
          WHEN COALESCE(NEW.association_id, OLD.association_id) = 2 THEN 'Assinatura'
          ELSE 'Outros'
        END,
        'entry_date', COALESCE(NEW.entry_date, OLD.entry_date),
        'exit_date', COALESCE(NEW.exit_date, OLD.exit_date),
        'line_number', asset_line_number,
        'radio', asset_radio,
        'solution_name', solution_name,
        'solution_id', asset_info.solution_id,
        'old_status_id', status_antigo,
        'new_status_id', status_novo,
        'old_status_name', (SELECT status FROM asset_status WHERE id = status_antigo),
        'new_status_name', (SELECT status FROM asset_status WHERE id = status_novo),
        'operation', TG_OP,
        'timestamp', NOW(),
        'valid_assoc_id', valid_assoc_id,
        'idempotent_operation', NOT houve_alteracao AND TG_OP != 'INSERT'
      ),
      status_antigo,
      status_novo
    );
  END IF;

  CASE TG_OP
    WHEN 'DELETE' THEN RETURN OLD;
    ELSE RETURN NEW;
  END CASE;
EXCEPTION WHEN OTHERS THEN
  log_trigger_error(valid_assoc_id, current_asset_id, TG_OP, SQLERRM, SQLSTATE);
  CASE TG_OP WHEN 'DELETE' THEN RETURN OLD; ELSE RETURN NEW; END CASE;
END;
$$;
GRANT ALL ON FUNCTION public.log_and_update_status() TO anon;
GRANT ALL ON FUNCTION public.log_and_update_status() TO authenticated;
GRANT ALL ON FUNCTION public.log_and_update_status() TO service_role;
