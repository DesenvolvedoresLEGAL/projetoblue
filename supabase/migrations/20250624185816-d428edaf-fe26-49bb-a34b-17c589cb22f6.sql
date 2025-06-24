
-- Corrigir a função validate_association_state removendo o GROUP BY problemático
CREATE OR REPLACE FUNCTION validate_association_state(
    p_asset_id TEXT,
    p_operation TEXT, -- 'CREATE' ou 'END'
    p_association_id BIGINT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    asset_exists BOOLEAN := FALSE;
    asset_status_id BIGINT;
    asset_status_name TEXT;
    active_associations_count INTEGER := 0;
    status_disponivel_id BIGINT;
    status_alocado_id BIGINT;
    status_assinatura_id BIGINT;
    validation_result JSONB;
BEGIN
    -- Buscar IDs de status dinamicamente
    SELECT id INTO status_disponivel_id FROM asset_status WHERE LOWER(status) IN ('disponível', 'disponivel') LIMIT 1;
    SELECT id INTO status_alocado_id FROM asset_status WHERE LOWER(status) = 'em locação' LIMIT 1;
    SELECT id INTO status_assinatura_id FROM asset_status WHERE LOWER(status) = 'em assinatura' LIMIT 1;

    -- Verificar se o asset existe e obter seu status (SEM GROUP BY)
    SELECT 
        TRUE,
        status_id
    INTO asset_exists, asset_status_id
    FROM assets 
    WHERE uuid = p_asset_id AND deleted_at IS NULL
    LIMIT 1;

    -- Se não encontrou o asset, asset_exists permanece FALSE
    IF asset_status_id IS NULL THEN
        asset_exists := FALSE;
    END IF;

    IF NOT asset_exists THEN
        RETURN jsonb_build_object(
            'valid', false,
            'error_code', 'ASSET_NOT_FOUND',
            'message', 'Asset não encontrado',
            'asset_id', p_asset_id
        );
    END IF;

    -- Buscar nome do status atual
    SELECT status INTO asset_status_name FROM asset_status WHERE id = asset_status_id;

    -- Contar associações ativas
    SELECT COUNT(*) INTO active_associations_count
    FROM asset_client_assoc
    WHERE asset_id = p_asset_id 
      AND exit_date IS NULL 
      AND deleted_at IS NULL;

    -- Validações específicas por operação
    IF p_operation = 'CREATE' THEN
        -- Verificar se asset já está associado
        IF active_associations_count > 0 THEN
            RETURN jsonb_build_object(
                'valid', false,
                'error_code', 'ASSET_ALREADY_ASSOCIATED',
                'message', 'Asset já possui associação ativa',
                'asset_id', p_asset_id,
                'current_status', asset_status_name,
                'active_associations', active_associations_count
            );
        END IF;

        -- Verificar se status permite nova associação
        IF asset_status_id NOT IN (status_disponivel_id) THEN
            RETURN jsonb_build_object(
                'valid', false,
                'error_code', 'INVALID_STATUS_FOR_ASSOCIATION',
                'message', 'Status do asset não permite nova associação',
                'asset_id', p_asset_id,
                'current_status', asset_status_name,
                'current_status_id', asset_status_id
            );
        END IF;

    ELSIF p_operation = 'END' THEN
        -- Verificar se existe associação para encerrar
        IF active_associations_count = 0 THEN
            RETURN jsonb_build_object(
                'valid', false,
                'error_code', 'NO_ACTIVE_ASSOCIATION',
                'message', 'Não há associação ativa para encerrar',
                'asset_id', p_asset_id,
                'current_status', asset_status_name
            );
        END IF;

        -- Verificar se a associação específica existe (se fornecida)
        IF p_association_id IS NOT NULL THEN
            IF NOT EXISTS (
                SELECT 1 FROM asset_client_assoc 
                WHERE id = p_association_id 
                  AND asset_id = p_asset_id 
                  AND exit_date IS NULL 
                  AND deleted_at IS NULL
            ) THEN
                RETURN jsonb_build_object(
                    'valid', false,
                    'error_code', 'ASSOCIATION_NOT_FOUND',
                    'message', 'Associação específica não encontrada ou já encerrada',
                    'asset_id', p_asset_id,
                    'association_id', p_association_id
                );
            END IF;
        END IF;
    END IF;

    -- Se chegou até aqui, validação passou
    RETURN jsonb_build_object(
        'valid', true,
        'asset_id', p_asset_id,
        'current_status', asset_status_name,
        'current_status_id', asset_status_id,
        'active_associations', active_associations_count,
        'message', 'Validação passou - operação pode prosseguir'
    );

EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'valid', false,
            'error_code', 'VALIDATION_ERROR',
            'message', 'Erro interno na validação',
            'error_detail', SQLERRM,
            'asset_id', p_asset_id
        );
END;
$$ LANGUAGE plpgsql;
