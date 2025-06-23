
-- Função para atualizar rented_days de um ativo específico
-- Preserva valores históricos e adiciona apenas dias de associações finalizadas
CREATE OR REPLACE FUNCTION update_asset_rented_days(asset_uuid TEXT)
RETURNS JSONB AS $$
DECLARE
    current_rented_days INTEGER := 0;
    calculated_days INTEGER := 0;
    new_total_days INTEGER := 0;
    association_record RECORD;
    merged_periods DATE[][] := ARRAY[]::DATE[][];
    period_start DATE;
    period_end DATE;
    total_calculated_days INTEGER := 0;
    i INTEGER;
    j INTEGER;
    temp_start DATE;
    temp_end DATE;
BEGIN
    -- Verificar se o ativo existe
    IF NOT EXISTS (SELECT 1 FROM assets WHERE uuid = asset_uuid AND deleted_at IS NULL) THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Asset not found',
            'asset_id', asset_uuid
        );
    END IF;

    -- Buscar valor atual de rented_days (valor histórico)
    SELECT rented_days INTO current_rented_days 
    FROM assets 
    WHERE uuid = asset_uuid;
    
    -- Se rented_days for NULL, considerar como 0
    current_rented_days := COALESCE(current_rented_days, 0);

    -- Buscar todas as associações finalizadas (com exit_date) do ativo
    -- Criar array de períodos [start_date, end_date]
    FOR association_record IN
        SELECT entry_date, exit_date
        FROM asset_client_assoc
        WHERE asset_id = asset_uuid 
          AND exit_date IS NOT NULL
          AND deleted_at IS NULL
          AND entry_date IS NOT NULL
          AND exit_date >= entry_date
        ORDER BY entry_date
    LOOP
        merged_periods := merged_periods || ARRAY[ARRAY[association_record.entry_date, association_record.exit_date]];
    END LOOP;

    -- Se não há associações finalizadas, manter valor atual
    IF array_length(merged_periods, 1) IS NULL THEN
        RETURN jsonb_build_object(
            'success', true,
            'asset_id', asset_uuid,
            'historical_days', current_rented_days,
            'calculated_days', 0,
            'total_days', current_rented_days,
            'periods_processed', 0,
            'message', 'No finished associations found - keeping historical value'
        );
    END IF;

    -- Algoritmo de merge de intervalos para evitar sobreposição
    -- Ordenar períodos por data de início (já ordenado na query)
    -- Mesclar períodos sobrepostos
    i := 1;
    WHILE i <= array_length(merged_periods, 1) LOOP
        period_start := merged_periods[i][1];
        period_end := merged_periods[i][2];
        
        -- Verificar sobreposição com próximos períodos
        j := i + 1;
        WHILE j <= array_length(merged_periods, 1) LOOP
            temp_start := merged_periods[j][1];
            temp_end := merged_periods[j][2];
            
            -- Se há sobreposição ou períodos adjacentes
            IF temp_start <= period_end + INTERVAL '1 day' THEN
                -- Mesclar períodos
                period_end := GREATEST(period_end, temp_end);
                -- Remover período mesclado
                merged_periods := merged_periods[1:j-1] || merged_periods[j+1:array_length(merged_periods,1)];
            ELSE
                j := j + 1;
            END IF;
        END LOOP;
        
        -- Calcular dias do período mesclado
        total_calculated_days := total_calculated_days + (period_end - period_start + 1);
        
        i := i + 1;
    END LOOP;

    -- Calcular novo total (histórico + calculado)
    new_total_days := current_rented_days + total_calculated_days;

    -- Atualizar apenas se o novo valor for maior ou igual ao atual
    -- (garantir que nunca diminua)
    IF new_total_days >= current_rented_days THEN
        UPDATE assets 
        SET rented_days = new_total_days,
            updated_at = NOW()
        WHERE uuid = asset_uuid;
        
        -- Log da atualização para auditoria
        RAISE NOTICE 'Updated rented_days for asset %: % (historical) + % (calculated) = % (total)', 
            asset_uuid, current_rented_days, total_calculated_days, new_total_days;
    END IF;

    -- Retornar resultado detalhado
    RETURN jsonb_build_object(
        'success', true,
        'asset_id', asset_uuid,
        'historical_days', current_rented_days,
        'calculated_days', total_calculated_days,
        'total_days', new_total_days,
        'periods_processed', array_length(merged_periods, 1),
        'updated', new_total_days >= current_rented_days
    );

EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', SQLERRM,
            'asset_id', asset_uuid,
            'sqlstate', SQLSTATE
        );
END;
$$ LANGUAGE plpgsql;

-- Função para atualizar rented_days de todos os ativos
CREATE OR REPLACE FUNCTION update_all_rented_days()
RETURNS JSONB AS $$
DECLARE
    asset_record RECORD;
    result_summary JSONB;
    total_processed INTEGER := 0;
    total_updated INTEGER := 0;
    total_errors INTEGER := 0;
    individual_result JSONB;
    all_results JSONB[] := ARRAY[]::JSONB[];
BEGIN
    -- Processar todos os ativos não deletados
    FOR asset_record IN
        SELECT uuid, rented_days
        FROM assets 
        WHERE deleted_at IS NULL
        ORDER BY uuid
    LOOP
        -- Processar cada ativo individualmente
        SELECT update_asset_rented_days(asset_record.uuid) INTO individual_result;
        
        -- Contar resultados
        total_processed := total_processed + 1;
        
        IF individual_result->>'success' = 'true' THEN
            IF (individual_result->>'updated')::boolean THEN
                total_updated := total_updated + 1;
            END IF;
        ELSE
            total_errors := total_errors + 1;
            -- Adicionar erros ao array de resultados
            all_results := all_results || individual_result;
        END IF;
        
        -- Log de progresso a cada 10 ativos processados
        IF total_processed % 10 = 0 THEN
            RAISE NOTICE 'Processed % assets, % updated, % errors', total_processed, total_updated, total_errors;
        END IF;
    END LOOP;

    -- Compilar resultado final
    result_summary := jsonb_build_object(
        'success', true,
        'total_processed', total_processed,
        'total_updated', total_updated,
        'total_errors', total_errors,
        'execution_timestamp', NOW(),
        'errors', all_results
    );

    RAISE NOTICE 'Completed batch update: % processed, % updated, % errors', total_processed, total_updated, total_errors;
    
    RETURN result_summary;

EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', SQLERRM,
            'sqlstate', SQLSTATE,
            'total_processed', total_processed,
            'execution_timestamp', NOW()
        );
END;
$$ LANGUAGE plpgsql;

-- Função de validação para verificar integridade dos dados
CREATE OR REPLACE FUNCTION validate_rented_days_integrity()
RETURNS TABLE(
    asset_id TEXT,
    current_rented_days INTEGER,
    calculated_days INTEGER,
    is_consistent BOOLEAN,
    message TEXT
) AS $$
DECLARE
    asset_record RECORD;
    calc_result JSONB;
BEGIN
    FOR asset_record IN
        SELECT uuid, rented_days
        FROM assets 
        WHERE deleted_at IS NULL
        ORDER BY uuid
        LIMIT 10 -- Limitar para teste inicial
    LOOP
        -- Simular cálculo sem atualizar
        WITH periods AS (
            SELECT entry_date, exit_date
            FROM asset_client_assoc
            WHERE asset_id = asset_record.uuid 
              AND exit_date IS NOT NULL
              AND deleted_at IS NULL
              AND entry_date IS NOT NULL
              AND exit_date >= entry_date
        ),
        merged AS (
            -- Simplificação: somar todos os períodos (pode ter pequena imprecisão por sobreposição)
            SELECT COALESCE(SUM(exit_date - entry_date + 1), 0) as total_days
            FROM periods
        )
        SELECT total_days INTO calculated_days
        FROM merged;
        
        asset_id := asset_record.uuid;
        current_rented_days := COALESCE(asset_record.rented_days, 0);
        is_consistent := (current_rented_days >= calculated_days);
        message := CASE 
            WHEN current_rented_days >= calculated_days THEN 'OK - Historical + Blue periods'
            ELSE 'INCONSISTENT - Current value less than calculated'
        END;
        
        RETURN NEXT;
    END LOOP;
END;
$$ LANGUAGE plpgsql;
