
-- Corrigir ambiguidade da coluna asset_id na função add_assets_to_association
CREATE OR REPLACE FUNCTION add_assets_to_association(
  p_client_id text,
  p_association_id bigint,
  p_entry_date date,
  p_asset_ids text[],
  p_exit_date date DEFAULT NULL,
  p_notes text DEFAULT NULL,
  p_ssid text DEFAULT NULL,
  p_pass text DEFAULT NULL,
  p_gb bigint DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  asset_id text;
  inserted_count integer := 0;
  failed_count integer := 0;
  validation_result jsonb;
  inserted_ids bigint[] := ARRAY[]::bigint[];
  failed_assets jsonb[] := ARRAY[]::jsonb[];
  new_association_id bigint;
BEGIN
  -- Validar se o cliente existe
  IF NOT EXISTS (SELECT 1 FROM clients WHERE uuid = p_client_id AND deleted_at IS NULL) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error_code', 'CLIENT_NOT_FOUND',
      'message', 'Cliente não encontrado'
    );
  END IF;

  -- Validar se o tipo de associação existe
  IF NOT EXISTS (SELECT 1 FROM association_types WHERE id = p_association_id) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error_code', 'ASSOCIATION_TYPE_NOT_FOUND',
      'message', 'Tipo de associação não encontrado'
    );
  END IF;

  -- Processar cada ativo
  FOREACH asset_id IN ARRAY p_asset_ids
  LOOP
    BEGIN
      -- Validar estado do ativo
      SELECT validate_association_state(asset_id, 'CREATE') INTO validation_result;
      
      IF (validation_result->>'valid')::boolean = false THEN
        failed_count := failed_count + 1;
        failed_assets := failed_assets || jsonb_build_object(
          'asset_id', asset_id,
          'error_code', validation_result->>'error_code',
          'message', validation_result->>'message'
        );
        CONTINUE;
      END IF;

      -- Verificar se o ativo já está associado ao mesmo cliente (CORREÇÃO DA AMBIGUIDADE)
      IF EXISTS (
        SELECT 1 FROM asset_client_assoc aca
        WHERE aca.asset_id = asset_id 
          AND aca.client_id = p_client_id 
          AND aca.exit_date IS NULL 
          AND aca.deleted_at IS NULL
      ) THEN
        failed_count := failed_count + 1;
        failed_assets := failed_assets || jsonb_build_object(
          'asset_id', asset_id,
          'error_code', 'ASSET_ALREADY_ASSOCIATED_TO_CLIENT',
          'message', 'Ativo já está associado a este cliente'
        );
        CONTINUE;
      END IF;

      -- Inserir nova associação
      INSERT INTO asset_client_assoc (
        asset_id,
        client_id,
        association_id,
        entry_date,
        exit_date,
        notes,
        ssid,
        pass,
        gb
      ) VALUES (
        asset_id,
        p_client_id,
        p_association_id,
        p_entry_date,
        p_exit_date,
        p_notes,
        p_ssid,
        p_pass,
        p_gb
      ) RETURNING id INTO new_association_id;

      inserted_count := inserted_count + 1;
      inserted_ids := inserted_ids || new_association_id;

      RAISE NOTICE 'Ativo % adicionado à associação com sucesso (ID: %)', asset_id, new_association_id;

    EXCEPTION
      WHEN OTHERS THEN
        failed_count := failed_count + 1;
        failed_assets := failed_assets || jsonb_build_object(
          'asset_id', asset_id,
          'error_code', 'INSERT_ERROR',
          'message', SQLERRM
        );
        RAISE NOTICE 'Erro ao inserir ativo %: %', asset_id, SQLERRM;
        CONTINUE;
    END;
  END LOOP;

  -- Retornar resultado
  RETURN jsonb_build_object(
    'success', true,
    'inserted_count', inserted_count,
    'failed_count', failed_count,
    'inserted_ids', inserted_ids,
    'failed_assets', failed_assets,
    'total_processed', array_length(p_asset_ids, 1),
    'message', format('Processados %s ativos: %s inseridos, %s falharam', 
                     array_length(p_asset_ids, 1), inserted_count, failed_count)
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error_code', 'PROCEDURE_ERROR',
      'message', 'Erro interno na stored procedure',
      'error_detail', SQLERRM
    );
END;
$function$;
;
