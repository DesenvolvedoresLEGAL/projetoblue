-- Helper function to fetch asset info
CREATE OR REPLACE FUNCTION public.fetch_asset_info(p_asset text)
RETURNS TABLE(status_id bigint, solution_id bigint, radio text, line_number bigint)
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
DECLARE
  s_id bigint;
  sol_id bigint;
  r text;
  ln bigint;
BEGIN
  BEGIN
    SELECT status_id, solution_id, radio, line_number
      INTO s_id, sol_id, r, ln
    FROM assets
    WHERE uuid = p_asset;

    IF NOT FOUND THEN
      RAISE NOTICE '[fetch_asset_info] AVISO: Asset % nao encontrado', p_asset;
    ELSE
      RAISE NOTICE '[fetch_asset_info] Asset encontrado - status_id: %, solution_id: %', s_id, sol_id;
    END IF;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE NOTICE '[fetch_asset_info] ERRO ao buscar dados do asset %: %', p_asset, SQLERRM;
      s_id := NULL;
      sol_id := NULL;
      r := NULL;
      ln := NULL;
  END;

  status_id := s_id;
  solution_id := sol_id;
  radio := r;
  line_number := ln;
  RETURN NEXT;
END;
$$;

-- Helper function to fetch client and solution names
CREATE OR REPLACE FUNCTION public.fetch_aux_names(p_client text, p_solution bigint)
RETURNS TABLE(client_name text, solution_name text)
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
DECLARE
  c_name text;
  s_name text;
BEGIN
  BEGIN
    IF p_client IS NOT NULL THEN
      SELECT nome INTO c_name FROM clients WHERE uuid = p_client;
      IF FOUND THEN
        RAISE NOTICE '[fetch_aux_names] Cliente encontrado: %', c_name;
      END IF;
    END IF;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE NOTICE '[fetch_aux_names] ERRO ao buscar cliente %: %', p_client, SQLERRM;
      c_name := NULL;
  END;

  BEGIN
    IF p_solution IS NOT NULL THEN
      SELECT solution INTO s_name FROM asset_solutions WHERE id = p_solution;
      IF FOUND THEN
        RAISE NOTICE '[fetch_aux_names] Solucao encontrada: %', s_name;
      END IF;
    END IF;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE NOTICE '[fetch_aux_names] ERRO ao buscar solucao %: %', p_solution, SQLERRM;
      s_name := NULL;
  END;

  client_name := c_name;
  solution_name := s_name;
  RETURN NEXT;
END;
$$;

-- Helper function to retrieve status ids
CREATE OR REPLACE FUNCTION public.get_status_ids()
RETURNS TABLE(disponivel_id bigint, alocado_id bigint, assinatura_id bigint)
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
DECLARE
  s_disp bigint;
  s_loc bigint;
  s_ass bigint;
BEGIN
  BEGIN
    SELECT id INTO s_loc FROM asset_status WHERE LOWER(status) = 'em locacao' LIMIT 1;
    SELECT id INTO s_disp FROM asset_status WHERE LOWER(status) IN ('disponivel', 'disponível') LIMIT 1;
    SELECT id INTO s_ass FROM asset_status WHERE LOWER(status) = 'em assinatura' LIMIT 1;

    RAISE NOTICE '[get_status_ids] Status IDs - alocado: %, disponivel: %, assinatura: %',
      s_loc, s_disp, s_ass;

    IF s_loc IS NULL THEN
      SELECT id INTO s_loc FROM asset_status WHERE id = 2 LIMIT 1;
    END IF;
    IF s_disp IS NULL THEN
      SELECT id INTO s_disp FROM asset_status WHERE id = 1 LIMIT 1;
    END IF;
    IF s_ass IS NULL THEN
      SELECT id INTO s_ass FROM asset_status WHERE id = 3 LIMIT 1;
    END IF;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE NOTICE '[get_status_ids] ERRO ao buscar IDs de status: %', SQLERRM;
      s_loc := 2;
      s_disp := 1;
      s_ass := 3;
  END;

  disponivel_id := s_disp;
  alocado_id := s_loc;
  assinatura_id := s_ass;
  RETURN NEXT;
END;
$$;

-- Helper function to update asset status with concurrency check
CREATE OR REPLACE FUNCTION public.update_asset_status_if_needed(p_asset text, p_old bigint, p_new bigint)
RETURNS boolean
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
DECLARE
  current_status bigint;
  updated boolean := false;
BEGIN
  IF p_new IS NULL OR p_new IS NOT DISTINCT FROM p_old THEN
    RETURN false;
  END IF;

  BEGIN
    SELECT status_id INTO current_status FROM assets WHERE uuid = p_asset;

    IF current_status = p_old THEN
      UPDATE assets SET status_id = p_new
      WHERE uuid = p_asset AND status_id = p_old;

      IF FOUND THEN
        RAISE NOTICE '[update_asset_status_if_needed] Status atualizado de % para % no asset %',
          p_old, p_new, p_asset;
        updated := true;
      END IF;
    END IF;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE NOTICE '[update_asset_status_if_needed] ERRO ao atualizar status do asset %: %', p_asset, SQLERRM;
      updated := false;
  END;

  RETURN updated;
END;
$$;

-- Helper function to write an entry to asset_logs
CREATE OR REPLACE FUNCTION public.write_asset_log(
  p_assoc_uuid text,
  p_event text,
  p_before bigint,
  p_after bigint,
  p_details jsonb
)
RETURNS void
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO asset_logs (
    assoc_id,
    date,
    event,
    details,
    status_before_id,
    status_after_id
  ) VALUES (
    p_assoc_uuid,
    NOW(),
    p_event,
    p_details,
    p_before,
    p_after
  );
  RAISE NOTICE '[write_asset_log] Log registrado para assoc % - evento %', p_assoc_uuid, p_event;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '[write_asset_log] ERRO ao inserir log para assoc %: %', p_assoc_uuid, SQLERRM;
END;
$$;

-- Redefine log_and_update_status to work with associations uuid
CREATE OR REPLACE FUNCTION public.log_and_update_status()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public, auth'
AS $$
DECLARE
  status_antigo BIGINT;
  status_novo BIGINT;
  asset_solution_id BIGINT;
  status_alocado_id BIGINT;
  status_assinatura_id BIGINT;
  status_disponivel_id BIGINT;
  houve_alteracao BOOLEAN := FALSE;
  client_name TEXT;
  asset_radio TEXT;
  asset_line_number BIGINT;
  solution_name TEXT;
  valid_assoc_uuid TEXT := NULL;
  validation_result JSONB;
  current_asset_id TEXT;
  log_event TEXT;
  details JSONB;
BEGIN
  SET LOCAL search_path TO public;

  current_asset_id := COALESCE(NEW.equipment_id, NEW.chip_id, OLD.equipment_id, OLD.chip_id);

  -- Log de debug
  RAISE NOTICE '[log_and_update_status] Trigger executada - asset_id: %, operacao: %, timestamp: %',
    current_asset_id, TG_OP, NOW();

  IF current_asset_id IS NULL OR trim(current_asset_id) = '' THEN
    RAISE NOTICE '[log_and_update_status] ERRO: asset_id invalido ou vazio';
    CASE TG_OP
      WHEN 'DELETE' THEN RETURN OLD;
      ELSE RETURN NEW;
    END CASE;
  END IF;

  -- Recuperar informacoes do asset
  SELECT status_id, solution_id, radio, line_number
    INTO status_antigo, asset_solution_id, asset_radio, asset_line_number
    FROM fetch_asset_info(current_asset_id);

  -- Buscar nomes auxiliares
  SELECT client_name, solution_name
    INTO client_name, solution_name
    FROM fetch_aux_names(NEW.client_id, asset_solution_id);

  -- Obter IDs de status
  SELECT disponivel_id, alocado_id, assinatura_id
    INTO status_disponivel_id, status_alocado_id, status_assinatura_id
    FROM get_status_ids();

  -- Validar UUID da associacao
  IF TG_OP = 'DELETE' THEN
    IF OLD.uuid IS NOT NULL AND EXISTS (SELECT 1 FROM associations WHERE uuid = OLD.uuid) THEN
      valid_assoc_uuid := OLD.uuid;
    END IF;
  ELSIF NEW.uuid IS NOT NULL THEN
    IF EXISTS (SELECT 1 FROM associations WHERE uuid = NEW.uuid) THEN
      valid_assoc_uuid := NEW.uuid;
    END IF;
  END IF;

  RAISE NOTICE '[log_and_update_status] Association UUID validado: %', valid_assoc_uuid;

  -- Definir novo status
  IF TG_OP = 'DELETE' THEN
    status_novo := status_disponivel_id;
  ELSIF NEW.exit_date IS NOT NULL AND (OLD.exit_date IS NULL OR OLD.exit_date IS DISTINCT FROM NEW.exit_date) THEN
    status_novo := status_disponivel_id;
  ELSIF NEW.exit_date IS NULL AND NEW.association_type_id = 1 THEN
    status_novo := status_alocado_id;
  ELSIF NEW.exit_date IS NULL AND NEW.association_type_id = 2 THEN
    status_novo := status_assinatura_id;
  ELSE
    status_novo := status_antigo;
  END IF;

  houve_alteracao := status_novo IS DISTINCT FROM status_antigo;

  IF houve_alteracao THEN
    houve_alteracao := update_asset_status_if_needed(current_asset_id, status_antigo, status_novo);
  END IF;

  log_event := CASE
    WHEN TG_OP = 'INSERT' THEN 'ASSOCIATION_CREATED'
    WHEN TG_OP = 'DELETE' THEN 'ASSOCIATION_REMOVED'
    WHEN houve_alteracao THEN 'ASSOCIATION_STATUS_UPDATED'
    ELSE 'ASSOCIATION_MODIFIED'
  END;

  IF houve_alteracao OR TG_OP = 'INSERT' OR TG_OP = 'DELETE' THEN
    IF NOT EXISTS (
      SELECT 1 FROM asset_logs
      WHERE assoc_id = valid_assoc_uuid
        AND event = log_event
        AND status_before_id = status_antigo
        AND status_after_id = status_novo
        AND date > NOW() - INTERVAL '5 seconds'
    ) THEN
      details := jsonb_build_object(
        'user_id', COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'),
        'username', COALESCE(current_setting('request.jwt.claim.sub', true), 'system'),
        'asset_id', current_asset_id,
        'client_id', COALESCE(NEW.client_id, OLD.client_id),
        'client_name', client_name,
        'association_type_id', COALESCE(NEW.association_type_id, OLD.association_type_id),
        'association_type', CASE
          WHEN COALESCE(NEW.association_type_id, OLD.association_type_id) = 1 THEN 'Aluguel'
          WHEN COALESCE(NEW.association_type_id, OLD.association_type_id) = 2 THEN 'Assinatura'
          ELSE 'Outros'
        END,
        'entry_date', COALESCE(NEW.entry_date, OLD.entry_date),
        'exit_date', COALESCE(NEW.exit_date, OLD.exit_date),
        'line_number', asset_line_number,
        'radio', asset_radio,
        'solution_name', solution_name,
        'solution_id', asset_solution_id,
        'old_status_id', status_antigo,
        'new_status_id', status_novo,
        'old_status_name', (SELECT status FROM asset_status WHERE id = status_antigo),
        'new_status_name', (SELECT status FROM asset_status WHERE id = status_novo),
        'operation', TG_OP,
        'timestamp', NOW(),
        'valid_assoc_uuid', valid_assoc_uuid,
        'idempotent_operation', NOT houve_alteracao AND TG_OP != 'INSERT'
      );

      PERFORM write_asset_log(valid_assoc_uuid, log_event, status_antigo, status_novo, details);
    END IF;
  END IF;

  CASE TG_OP
    WHEN 'DELETE' THEN RETURN OLD;
    ELSE RETURN NEW;
  END CASE;

EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '[log_and_update_status] EXCECAO CAPTURADA: % (SQLSTATE: %)', SQLERRM, SQLSTATE;
    BEGIN
      details := jsonb_build_object(
        'error', SQLERRM,
        'sqlstate', SQLSTATE,
        'asset_id', current_asset_id,
        'operation', TG_OP,
        'timestamp', NOW()
      );
      PERFORM write_asset_log(valid_assoc_uuid, 'TRIGGER_ERROR', status_antigo, status_antigo, details);
    EXCEPTION
      WHEN OTHERS THEN
        RAISE NOTICE '[log_and_update_status] Falha ao inserir log de erro: %', SQLERRM;
    END;

    CASE TG_OP
      WHEN 'DELETE' THEN RETURN OLD;
      ELSE RETURN NEW;
    END CASE;
END;$$;