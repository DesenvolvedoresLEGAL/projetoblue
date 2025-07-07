-- Update detect_association_inconsistencies to use new associations table and status id
CREATE OR REPLACE FUNCTION public.detect_association_inconsistencies()
RETURNS TABLE(
  asset_id text,
  current_status_id bigint,
  expected_status_id bigint,
  issue_description text,
  corrected boolean
)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  status_disponivel_id BIGINT;
  status_alocado_id BIGINT;
  inconsistency_record RECORD;
  correction_count INT := 0;
BEGIN
  -- Buscar IDs de status
  SELECT id INTO status_disponivel_id FROM asset_status WHERE LOWER(status) IN ('disponível', 'disponivel') LIMIT 1;
  SELECT id INTO status_alocado_id FROM asset_status WHERE id = 2 LIMIT 1;

  -- Verificar assets que deveriam estar disponíveis mas não estão
  FOR inconsistency_record IN
    SELECT DISTINCT
      a.uuid as asset_uuid,
      a.status_id as current_status,
      status_disponivel_id as expected_status,
      'Asset should be available - no active associations' as description
    FROM assets a
    LEFT JOIN associations assoc ON (a.uuid = assoc.equipment_id OR a.uuid = assoc.chip_id)
      AND assoc.exit_date IS NULL
      AND assoc.deleted_at IS NULL
      AND assoc.status = TRUE
    WHERE assoc.uuid IS NULL
      AND a.status_id != status_disponivel_id
      AND a.deleted_at IS NULL
  LOOP
    -- Corrigir o status
    UPDATE assets
    SET status_id = status_disponivel_id
    WHERE uuid = inconsistency_record.asset_uuid;

    correction_count := correction_count + 1;

    -- Registrar a correção no log
    INSERT INTO asset_logs (
      date, event, details, status_before_id, status_after_id
    ) VALUES (
      NOW(),
      'INCONSISTENCY_CORRECTED',
      jsonb_build_object(
        'asset_id', inconsistency_record.asset_uuid,
        'correction_type', 'status_fix',
        'reason', 'Asset had no active associations but wrong status',
        'corrected_by', 'detect_association_inconsistencies'
      ),
      inconsistency_record.current_status,
      status_disponivel_id
    );

    -- Preparar retorno
    asset_id := inconsistency_record.asset_uuid;
    current_status_id := inconsistency_record.current_status;
    expected_status_id := status_disponivel_id;
    issue_description := inconsistency_record.description;
    corrected := TRUE;
    RETURN NEXT;
  END LOOP;

  -- Verificar assets que deveriam estar alocados mas não estão
  FOR inconsistency_record IN
    SELECT DISTINCT
      CASE WHEN assoc.equipment_id IS NOT NULL THEN assoc.equipment_id ELSE assoc.chip_id END AS asset_uuid,
      a.status_id as current_status,
      status_alocado_id as expected_status,
      'Asset should be allocated - has active association' as description
    FROM associations assoc
    JOIN assets a ON a.uuid = assoc.equipment_id OR a.uuid = assoc.chip_id
    WHERE assoc.exit_date IS NULL
      AND assoc.deleted_at IS NULL
      AND assoc.status = TRUE
      AND a.status_id != status_alocado_id
      AND a.deleted_at IS NULL
  LOOP
    -- Corrigir o status
    UPDATE assets
    SET status_id = status_alocado_id
    WHERE uuid = inconsistency_record.asset_uuid;

    correction_count := correction_count + 1;

    -- Registrar a correção no log
    INSERT INTO asset_logs (
      date, event, details, status_before_id, status_after_id
    ) VALUES (
      NOW(),
      'INCONSISTENCY_CORRECTED',
      jsonb_build_object(
        'asset_id', inconsistency_record.asset_uuid,
        'correction_type', 'status_fix',
        'reason', 'Asset had active association but wrong status',
        'corrected_by', 'detect_association_inconsistencies'
      ),
      inconsistency_record.current_status,
      status_alocado_id
    );

    -- Preparar retorno
    asset_id := inconsistency_record.asset_uuid;
    current_status_id := inconsistency_record.current_status;
    expected_status_id := status_alocado_id;
    issue_description := inconsistency_record.description;
    corrected := TRUE;
    RETURN NEXT;
  END LOOP;

  RAISE NOTICE 'Inconsistency detection completed. % corrections made.', correction_count;
  RETURN;
END;
$$;

-- Update prevent_rented_association to use ID for status em locação
CREATE OR REPLACE FUNCTION public.prevent_rented_association() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
AS $$
DECLARE
  current_status_id BIGINT;
  current_status_name TEXT;
  status_alocado_id BIGINT;
BEGIN
  SET LOCAL search_path TO public;

  -- Buscar status atual do asset
  SELECT a.status_id, ast.status
  INTO current_status_id, current_status_name
  FROM assets a
  JOIN asset_status ast ON a.status_id = ast.id
  WHERE a.uuid = NEW.asset_id;

  -- Buscar ID do status alocado dinamicamente
  SELECT id INTO status_alocado_id
  FROM asset_status
  WHERE id = 2
  LIMIT 1;

  -- Verificar se o asset já está alocado
  IF current_status_id = status_alocado_id THEN
    RAISE EXCEPTION 'Não é possível associar o asset %, pois ele já está alocado (status: %).',
      NEW.asset_id, current_status_name;
  END IF;

  RETURN NEW;
END;
$$;