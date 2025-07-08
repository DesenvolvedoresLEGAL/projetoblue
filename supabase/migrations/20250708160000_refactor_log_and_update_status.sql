-- Add helper functions and refactor log_and_update_status

-- Returns asset info needed for logging
CREATE OR REPLACE FUNCTION public.get_asset_info(asset_uuid text)
RETURNS TABLE(status_id bigint, solution_id bigint, radio text, line_number bigint)
LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT a.status_id, a.solution_id, a.radio, a.line_number
  FROM assets a
  WHERE a.uuid = asset_uuid;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE '[get_asset_info] error fetching asset %: %', asset_uuid, SQLERRM;
  RETURN;
END;
$$;

-- Retrieves client name from uuid
CREATE OR REPLACE FUNCTION public.get_client_name(client_uuid text)
RETURNS text LANGUAGE plpgsql AS $$
DECLARE cname text;
BEGIN
  SELECT nome INTO cname FROM clients WHERE uuid = client_uuid;
  RETURN cname;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE '[get_client_name] error fetching client %: %', client_uuid, SQLERRM;
  RETURN NULL;
END;
$$;

-- Retrieves solution name from id
CREATE OR REPLACE FUNCTION public.get_solution_name(solution_id bigint)
RETURNS text LANGUAGE plpgsql AS $$
DECLARE sname text;
BEGIN
  SELECT solution INTO sname FROM asset_solutions WHERE id = solution_id;
  RETURN sname;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE '[get_solution_name] error fetching solution %: %', solution_id, SQLERRM;
  RETURN NULL;
END;
$$;

-- Fetch common status ids
CREATE OR REPLACE FUNCTION public.get_standard_status_ids()
RETURNS TABLE(alocado bigint, disponivel bigint, assinatura bigint)
LANGUAGE plpgsql AS $$
BEGIN
  SELECT id INTO alocado FROM asset_status WHERE LOWER(status) = 'em locacao' LIMIT 1;
  SELECT id INTO disponivel FROM asset_status WHERE LOWER(status) IN ('disponivel','disponível') LIMIT 1;
  SELECT id INTO assinatura FROM asset_status WHERE LOWER(status) = 'em assinatura' LIMIT 1;
  IF alocado IS NULL THEN SELECT id INTO alocado FROM asset_status WHERE id = 2 LIMIT 1; END IF;
  IF disponivel IS NULL THEN SELECT id INTO disponivel FROM asset_status WHERE id = 1 LIMIT 1; END IF;
  IF assinatura IS NULL THEN SELECT id INTO assinatura FROM asset_status WHERE id = 3 LIMIT 1; END IF;
  RETURN NEXT;
END;
$$;

-- Determine new status based on association data
CREATE OR REPLACE FUNCTION public.calculate_new_status(op text, assoc_type_id bigint, new_exit date, old_exit date,
                                                        status_antigo bigint,
                                                        status_alocado bigint, status_disponivel bigint, status_assinatura bigint)
RETURNS TABLE(status_novo bigint, changed boolean)
LANGUAGE plpgsql AS $$
BEGIN
  IF op = 'DELETE' THEN
    status_novo := status_disponivel;
  ELSIF new_exit IS NOT NULL AND (old_exit IS NULL OR old_exit IS DISTINCT FROM new_exit) THEN
    status_novo := status_disponivel;
  ELSIF new_exit IS NULL AND assoc_type_id = 1 THEN
    status_novo := status_alocado;
  ELSIF new_exit IS NULL AND assoc_type_id = 2 THEN
    status_novo := status_assinatura;
  ELSE
    status_novo := status_antigo;
  END IF;
  changed := (status_novo IS DISTINCT FROM status_antigo);
  RETURN NEXT;
END;
$$;

-- Update asset status if old value matches
CREATE OR REPLACE FUNCTION public.update_asset_status_if_needed(asset_uuid text, old_status bigint, new_status bigint)
RETURNS boolean
LANGUAGE plpgsql AS $$
DECLARE current_status bigint;
BEGIN
  SELECT status_id INTO current_status FROM assets WHERE uuid = asset_uuid;
  IF current_status = old_status AND new_status IS NOT NULL AND new_status IS DISTINCT FROM old_status THEN
    UPDATE assets SET status_id = new_status WHERE uuid = asset_uuid AND status_id = old_status;
    RETURN FOUND;
  END IF;
  RETURN false;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE '[update_asset_status_if_needed] error updating asset %: %', asset_uuid, SQLERRM;
  RETURN false;
END;
$$;

-- Insert association log entry
CREATE OR REPLACE FUNCTION public.insert_asset_assoc_log(p_assoc_uuid text, op text, houve boolean,
                                                         status_antigo bigint, status_novo bigint,
                                                         client_id text, client_name text, assoc_type_id bigint,
                                                         entry_date date, exit_date date,
                                                         line_number bigint, radio text,
                                                         solution_name text, solution_id bigint,
                                                         asset_uuid text)
RETURNS void
LANGUAGE plpgsql AS $$
BEGIN
  IF NOT EXISTS (
        SELECT 1 FROM asset_logs
         WHERE assoc_id = p_assoc_uuid
           AND event = CASE
               WHEN op = 'INSERT' THEN 'ASSOCIATION_CREATED'
               WHEN op = 'DELETE' THEN 'ASSOCIATION_REMOVED'
               WHEN houve THEN 'ASSOCIATION_STATUS_UPDATED'
               ELSE 'ASSOCIATION_MODIFIED'
             END
           AND status_before_id = status_antigo
           AND status_after_id = status_novo
           AND date > NOW() - INTERVAL '5 seconds'
     ) THEN
    INSERT INTO asset_logs (
      assoc_id, date, event, details, status_before_id, status_after_id)
    VALUES (
      p_assoc_uuid,
      NOW(),
      CASE
        WHEN op = 'INSERT' THEN 'ASSOCIATION_CREATED'
        WHEN op = 'DELETE' THEN 'ASSOCIATION_REMOVED'
        WHEN houve THEN 'ASSOCIATION_STATUS_UPDATED'
        ELSE 'ASSOCIATION_MODIFIED'
      END,
      jsonb_build_object(
        'user_id', COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'),
        'username', COALESCE(current_setting('request.jwt.claim.sub', true), 'system'),
        'asset_id', asset_uuid,
        'client_id', client_id,
        'client_name', client_name,
        'association_type_id', assoc_type_id,
        'association_type', CASE
            WHEN assoc_type_id = 1 THEN 'Aluguel'
            WHEN assoc_type_id = 2 THEN 'Assinatura'
            ELSE 'Outros'
        END,
        'entry_date', entry_date,
        'exit_date', exit_date,
        'line_number', line_number,
        'radio', radio,
        'solution_name', solution_name,
        'solution_id', solution_id,
        'old_status_id', status_antigo,
        'new_status_id', status_novo,
        'old_status_name', (SELECT status FROM asset_status WHERE id = status_antigo),
        'new_status_name', (SELECT status FROM asset_status WHERE id = status_novo),
        'operation', op,
        'timestamp', NOW(),
        'valid_assoc_uuid', p_assoc_uuid,
        'idempotent_operation', NOT houve AND op <> 'INSERT'
      ),
      status_antigo,
      status_novo
    );
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE '[insert_asset_assoc_log] error inserting log for asset %: %', asset_uuid, SQLERRM;
END;
$$;

-- Log errors raised by trigger
CREATE OR REPLACE FUNCTION public.log_trigger_error(p_assoc_uuid text, err text, err_state text,
                                                    asset_uuid text, op text, status_antigo bigint)
RETURNS void
LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO asset_logs (
    assoc_id, date, event, details, status_before_id, status_after_id)
  VALUES (
    p_assoc_uuid, NOW(), 'TRIGGER_ERROR',
    jsonb_build_object(
      'error', err,
      'sqlstate', err_state,
      'asset_id', asset_uuid,
      'operation', op,
      'timestamp', NOW()
    ),
    status_antigo, status_antigo
  );
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE '[log_trigger_error] failed to insert error log: %', SQLERRM;
END;
$$;

-- Refactor main trigger function using helpers
CREATE OR REPLACE FUNCTION public.log_and_update_status()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public, auth'
AS $$
DECLARE
  status_antigo BIGINT;
  status_novo   BIGINT;
  asset_solution_id BIGINT;
  status_ids RECORD;
  houve_alteracao BOOLEAN := FALSE;
  client_name TEXT;
  asset_radio TEXT;
  asset_line_number BIGINT;
  solution_name TEXT;
  valid_assoc_uuid TEXT := NULL;
  current_asset_id TEXT;
BEGIN
  SET LOCAL search_path TO public;

  current_asset_id := COALESCE(NEW.equipment_id, NEW.chip_id, OLD.equipment_id, OLD.chip_id);
  IF current_asset_id IS NULL OR trim(current_asset_id) = '' THEN
    CASE TG_OP
      WHEN 'DELETE' THEN RETURN OLD;
      ELSE RETURN NEW;
    END CASE;
  END IF;

  SELECT * INTO status_antigo, asset_solution_id, asset_radio, asset_line_number
  FROM get_asset_info(current_asset_id)
  LIMIT 1;

  client_name := get_client_name(NEW.client_id);
  solution_name := get_solution_name(asset_solution_id);

  SELECT * INTO status_ids FROM get_standard_status_ids();

  IF TG_OP = 'DELETE' THEN
    valid_assoc_uuid := OLD.uuid;
  ELSE
    valid_assoc_uuid := NEW.uuid;
  END IF;

  SELECT * INTO status_novo, houve_alteracao FROM calculate_new_status(
      TG_OP,
      COALESCE(NEW.association_type_id, OLD.association_type_id),
      NEW.exit_date,
      OLD.exit_date,
      status_antigo,
      status_ids.alocado,
      status_ids.disponivel,
      status_ids.assinatura
  );

  IF update_asset_status_if_needed(current_asset_id, status_antigo, status_novo) THEN
    houve_alteracao := true;
  END IF;

  IF houve_alteracao OR TG_OP = 'INSERT' OR TG_OP = 'DELETE' THEN
    PERFORM insert_asset_assoc_log(
      valid_assoc_uuid, TG_OP, houve_alteracao,
      status_antigo, status_novo,
      COALESCE(NEW.client_id, OLD.client_id), client_name,
      COALESCE(NEW.association_type_id, OLD.association_type_id),
      COALESCE(NEW.entry_date, OLD.entry_date), COALESCE(NEW.exit_date, OLD.exit_date),
      asset_line_number, asset_radio,
      solution_name, asset_solution_id,
      current_asset_id
    );
  END IF;

  CASE TG_OP
    WHEN 'DELETE' THEN RETURN OLD;
    ELSE RETURN NEW;
  END CASE;

EXCEPTION WHEN OTHERS THEN
  PERFORM log_trigger_error(valid_assoc_uuid, SQLERRM, SQLSTATE, current_asset_id, TG_OP, status_antigo);
  CASE TG_OP
    WHEN 'DELETE' THEN RETURN OLD;
    ELSE RETURN NEW;
  END CASE;
END;
$$;
