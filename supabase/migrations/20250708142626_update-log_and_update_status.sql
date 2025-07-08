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

  BEGIN
    SELECT status_id, solution_id, radio, line_number
      INTO status_antigo, asset_solution_id, asset_radio, asset_line_number
    FROM assets
    WHERE uuid = current_asset_id;

    IF NOT FOUND THEN
      RAISE NOTICE '[log_and_update_status] AVISO: Asset % nao encontrado', current_asset_id;
    ELSE
      RAISE NOTICE '[log_and_update_status] Asset encontrado - status_id: %, solution_id: %', status_antigo, asset_solution_id;
    END IF;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE NOTICE '[log_and_update_status] ERRO ao buscar dados do asset %: %', current_asset_id, SQLERRM;
      status_antigo := NULL;
      asset_solution_id := NULL;
  END;

  IF NEW.client_id IS NOT NULL THEN
    BEGIN
      SELECT nome INTO client_name FROM clients WHERE uuid = NEW.client_id;
      RAISE NOTICE '[log_and_update_status] Cliente encontrado: %', client_name;
    EXCEPTION
      WHEN OTHERS THEN
        RAISE NOTICE '[log_and_update_status] ERRO ao buscar cliente %: %', NEW.client_id, SQLERRM;
        client_name := NULL;
    END;
  END IF;

  IF asset_solution_id IS NOT NULL THEN
    BEGIN
      SELECT solution INTO solution_name FROM asset_solutions WHERE id = asset_solution_id;
      RAISE NOTICE '[log_and_update_status] Solucao encontrada: %', solution_name;
    EXCEPTION
      WHEN OTHERS THEN
        RAISE NOTICE '[log_and_update_status] ERRO ao buscar solucao %: %', asset_solution_id, SQLERRM;
        solution_name := NULL;
    END;
  END IF;

  BEGIN
    SELECT id INTO status_alocado_id FROM asset_status WHERE LOWER(status) = 'em locacao' LIMIT 1;
    SELECT id INTO status_disponivel_id FROM asset_status WHERE LOWER(status) IN ('disponivel', 'disponível') LIMIT 1;
    SELECT id INTO status_assinatura_id FROM asset_status WHERE LOWER(status) = 'em assinatura' LIMIT 1;

    RAISE NOTICE '[log_and_update_status] Status IDs - alocado: %, disponivel: %, assinatura: %',
      status_alocado_id, status_disponivel_id, status_assinatura_id;

    IF status_alocado_id IS NULL THEN
      SELECT id INTO status_alocado_id FROM asset_status WHERE id = 2 LIMIT 1;
    END IF;
    IF status_disponivel_id IS NULL THEN
      SELECT id INTO status_disponivel_id FROM asset_status WHERE id = 1 LIMIT 1;
    END IF;
    IF status_assinatura_id IS NULL THEN
      SELECT id INTO status_assinatura_id FROM asset_status WHERE id = 3 LIMIT 1;
    END IF;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE NOTICE '[log_and_update_status] ERRO ao buscar IDs de status: %', SQLERRM;
      status_alocado_id := 2;
      status_disponivel_id := 1;
      status_assinatura_id := 3;
  END;

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

  IF TG_OP = 'DELETE' THEN
    status_novo := status_disponivel_id;
    houve_alteracao := (status_novo IS DISTINCT FROM status_antigo);
  ELSIF NEW.exit_date IS NOT NULL AND (OLD.exit_date IS NULL OR OLD.exit_date IS DISTINCT FROM NEW.exit_date) THEN
    status_novo := status_disponivel_id;
    houve_alteracao := (status_novo IS DISTINCT FROM status_antigo);
  ELSIF NEW.exit_date IS NULL AND (NEW.association_type_id = 1) THEN
    status_novo := status_alocado_id;
    houve_alteracao := (status_novo IS DISTINCT FROM status_antigo);
  ELSIF NEW.exit_date IS NULL AND (NEW.association_type_id = 2) THEN
    status_novo := status_assinatura_id;
    houve_alteracao := (status_novo IS DISTINCT FROM status_antigo);
  ELSE
    status_novo := status_antigo;
  END IF;

  IF houve_alteracao AND status_novo IS NOT NULL AND status_novo IS DISTINCT FROM status_antigo THEN
    BEGIN
      DECLARE current_status_check BIGINT;
      BEGIN
        SELECT status_id INTO current_status_check FROM assets WHERE uuid = current_asset_id;
        IF current_status_check = status_antigo THEN
          UPDATE assets
          SET status_id = status_novo
          WHERE uuid = current_asset_id AND status_id = status_antigo;
          IF FOUND THEN
            RAISE NOTICE '[log_and_update_status] Status atualizado de % para % no asset %',
              status_antigo, status_novo, current_asset_id;
          ELSE
            houve_alteracao := FALSE;
          END IF;
        ELSE
          houve_alteracao := FALSE;
        END IF;
      END;
    EXCEPTION
      WHEN OTHERS THEN
        RAISE NOTICE '[log_and_update_status] ERRO ao atualizar status do asset %: %', current_asset_id, SQLERRM;
        houve_alteracao := FALSE;
    END;
  END IF;

  IF houve_alteracao OR TG_OP = 'INSERT' OR TG_OP = 'DELETE' THEN
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM asset_logs
        WHERE assoc_id = valid_assoc_uuid
          AND event = CASE
            WHEN TG_OP = 'INSERT' THEN 'ASSOCIATION_CREATED'
            WHEN TG_OP = 'DELETE' THEN 'ASSOCIATION_REMOVED'
            WHEN houve_alteracao THEN 'ASSOCIATION_STATUS_UPDATED'
            ELSE 'ASSOCIATION_MODIFIED'
          END
          AND status_before_id = status_antigo
          AND status_after_id = status_novo
          AND date > NOW() - INTERVAL '5 seconds'
      ) THEN
        INSERT INTO asset_logs (
          assoc_id,
          date,
          event,
          details,
          status_before_id,
          status_after_id
        )
        VALUES (
          valid_assoc_uuid,
          NOW(),
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
          ),
          status_antigo,
          status_novo
        );
      END IF;
    EXCEPTION
      WHEN OTHERS THEN
        RAISE NOTICE '[log_and_update_status] ERRO ao inserir log para asset %: %', current_asset_id, SQLERRM;
    END;
  END IF;

  CASE TG_OP
    WHEN 'DELETE' THEN RETURN OLD;
    ELSE RETURN NEW;
  END CASE;

EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '[log_and_update_status] EXCECAO CAPTURADA: % (SQLSTATE: %)', SQLERRM, SQLSTATE;
    BEGIN
      INSERT INTO asset_logs (
        assoc_id, date, event, details, status_before_id, status_after_id
      ) VALUES (
        valid_assoc_uuid, NOW(), 'TRIGGER_ERROR',
        jsonb_build_object(
          'error', SQLERRM,
          'sqlstate', SQLSTATE,
          'asset_id', current_asset_id,
          'operation', TG_OP,
          'timestamp', NOW()
        ),
        status_antigo, status_antigo
      );
    EXCEPTION
      WHEN OTHERS THEN
        RAISE NOTICE '[log_and_update_status] Falha ao inserir log de erro: %', SQLERRM;
    END;

    CASE TG_OP
      WHEN 'DELETE' THEN RETURN OLD;
      ELSE RETURN NEW;
    END CASE;
END;
$$;