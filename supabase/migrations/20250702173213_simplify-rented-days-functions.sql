CREATE OR REPLACE FUNCTION public.update_asset_rented_days(asset_uuid text)
RETURNS jsonb
LANGUAGE plpgsql
SET search_path TO 'public, auth'
AS $$
DECLARE
    current_rented_days integer := 0;
    calculated_days integer := 0;
    new_total_days integer := 0;
BEGIN
    -- verificar se o ativo existe
    IF NOT EXISTS (SELECT 1 FROM public.assets WHERE uuid = asset_uuid AND deleted_at IS NULL) THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Asset not found',
            'asset_id', asset_uuid
        );
    END IF;

    -- valor historico
    SELECT COALESCE(rented_days,0) INTO current_rented_days
    FROM public.assets
    WHERE uuid = asset_uuid;

    -- dias calculados a partir das associacoes finalizadas
    SELECT COUNT(DISTINCT d)::integer INTO calculated_days
    FROM (
        SELECT generate_series(entry_date, exit_date, INTERVAL '1 day')::date AS d
        FROM public.asset_client_assoc
        WHERE asset_id = asset_uuid
          AND exit_date IS NOT NULL
          AND entry_date IS NOT NULL
          AND exit_date >= entry_date
          AND deleted_at IS NULL
    ) sub;

    new_total_days := current_rented_days + calculated_days;

    IF new_total_days >= current_rented_days THEN
        UPDATE public.assets
        SET rented_days = new_total_days,
            updated_at = NOW()
        WHERE uuid = asset_uuid;
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'asset_id', asset_uuid,
        'historical_days', current_rented_days,
        'calculated_days', calculated_days,
        'total_days', new_total_days,
        'updated', new_total_days >= current_rented_days
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.update_all_rented_days()
RETURNS jsonb
LANGUAGE plpgsql
SET search_path TO 'public, auth'
AS $$
DECLARE
    asset_record record;
    total_processed integer := 0;
    total_updated integer := 0;
    total_errors integer := 0;
    result jsonb;
BEGIN
    FOR asset_record IN (SELECT uuid FROM public.assets WHERE deleted_at IS NULL) LOOP
        result := public.update_asset_rented_days(asset_record.uuid);
        total_processed := total_processed + 1;
        IF result->>'success' = 'true' THEN
            IF (result->>'updated')::boolean THEN
                total_updated := total_updated + 1;
            END IF;
        ELSE
            total_errors := total_errors + 1;
        END IF;
    END LOOP;

    RETURN jsonb_build_object(
        'success', true,
        'total_processed', total_processed,
        'total_updated', total_updated,
        'total_errors', total_errors,
        'execution_timestamp', NOW()
    );
END;
$$;

GRANT ALL ON FUNCTION public.update_asset_rented_days(text) TO anon;
GRANT ALL ON FUNCTION public.update_asset_rented_days(text) TO authenticated;
GRANT ALL ON FUNCTION public.update_asset_rented_days(text) TO service_role;
GRANT ALL ON FUNCTION public.update_all_rented_days() TO anon;
GRANT ALL ON FUNCTION public.update_all_rented_days() TO authenticated;
GRANT ALL ON FUNCTION public.update_all_rented_days() TO service_role;
