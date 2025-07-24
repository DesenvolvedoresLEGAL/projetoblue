-- Migration: 20250724151442_update_function_update_asset_rented_days.sql
-- Description: Update function to schedule daily updates for rented days
-- Table: N/A
-- Autor: Gustavo Macedo
-- Data: 2025-07-24

BEGIN;

CREATE OR REPLACE FUNCTION public.update_asset_rented_days(asset_uuid text)
RETURNS jsonb
LANGUAGE plpgsql
SET search_path = public, auth
AS $$
DECLARE
    current_rented_days integer := 0;
    calculated_days integer := 0;
    new_total_days integer := 0;
BEGIN
    -- Verificar se o ativo existe
    IF NOT EXISTS (
        SELECT 1
        FROM public.assets
        WHERE uuid = asset_uuid
          AND deleted_at IS NULL
    ) THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Asset not found',
            'asset_id', asset_uuid
        );
    END IF;

    -- Valor histórico
    SELECT COALESCE(rented_days, 0)
    INTO current_rented_days
    FROM public.assets
    WHERE uuid = asset_uuid;

    -- Dias calculados a partir das associações finalizadas
    SELECT COUNT(DISTINCT d)::integer
    INTO calculated_days
    FROM (
        SELECT generate_series(entry_date, exit_date, INTERVAL '1 day')::date AS d
        FROM public.associations
        WHERE (equipment_id = asset_uuid OR chip_id = asset_uuid)
          AND status = false
          AND exit_date IS NOT NULL
          AND entry_date IS NOT NULL
          AND exit_date >= entry_date
          AND deleted_at IS NULL
    ) sub;

    new_total_days := current_rented_days + calculated_days;

    -- Atualizar somente se houver mudança
    IF new_total_days > current_rented_days THEN
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
        'updated', new_total_days > current_rented_days
    );
END;
$$;

COMMIT;

-- ROLLBACK;
-- DROP FUNCTION IF EXISTS public.update_asset_rented_days(text);
-- COMMIT;
