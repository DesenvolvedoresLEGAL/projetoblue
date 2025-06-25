
-- Melhorar a função validate_association_state com logging detalhado e tratamento de erros mais específico
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
    -- Log detalhado dos parâmetros de entrada
    RAISE NOTICE '[validate_association_state] Iniciando validação - asset_id: %, operation: %, association_id: %', 
        p_asset_id, p_operation, p_association_id;

    -- Verificar se os parâmetros obrigatórios foram fornecidos
    IF p_asset_id IS NULL OR trim(p_asset_id) = '' THEN
        RAISE NOTICE '[validate_association_state] ERRO: asset_id é obrigatório';
        RETURN jsonb_build_object(
            'valid', false,
            'error_code', 'INVALID_PARAMETERS',
            'message', 'asset_id é obrigatório',
            'asset_id', p_asset_id
        );
    END IF;

    IF p_operation IS NULL OR p_operation NOT IN ('CREATE', 'END') THEN
        RAISE NOTICE '[validate_association_state] ERRO: operation deve ser CREATE ou END, recebido: %', p_operation;
        RETURN jsonb_build_object(
            'valid', false,
            'error_code', 'INVALID_PARAMETERS',
            'message', 'operation deve ser CREATE ou END',
            'operation', p_operation
        );
    END IF;

    -- Buscar IDs de status dinamicamente com logging
    SELECT id INTO status_disponivel_id FROM asset_status WHERE LOWER(status) IN ('disponível', 'disponivel') LIMIT 1;
    SELECT id INTO status_alocado_id FROM asset_status WHERE LOWER(status) = 'em locação' LIMIT 1;
    SELECT id INTO status_assinatura_id FROM asset_status WHERE LOWER(status) = 'em assinatura' LIMIT 1;

    RAISE NOTICE '[validate_association_state] Status IDs encontrados - disponível: %, alocado: %, assinatura: %', 
        status_disponivel_id, status_alocado_id, status_assinatura_id;

    -- Verificar se encontrou os status necessários
    IF status_disponivel_id IS NULL THEN
        RAISE NOTICE '[validate_association_state] ERRO: Status disponível não encontrado';
        RETURN jsonb_build_object(
            'valid', false,
            'error_code', 'STATUS_CONFIG_ERROR',
            'message', 'Status disponível não encontrado no sistema'
        );
    END IF;

    -- Verificar se o asset existe e obter status atual
    BEGIN
        SELECT 
            CASE WHEN COUNT(*) > 0 THEN TRUE ELSE FALSE END,
            MAX(status_id)
        INTO asset_exists, asset_status_id
        FROM assets 
        WHERE uuid = p_asset_id AND deleted_at IS NULL;

        RAISE NOTICE '[validate_association_state] Asset encontrado: %, status_id atual: %', asset_exists, asset_status_id;
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE '[validate_association_state] ERRO ao buscar asset: %', SQLERRM;
            RETURN jsonb_build_object(
                'valid', false,
                'error_code', 'DATABASE_ERROR',
                'message', 'Erro ao verificar existência do asset',
                'error_detail', SQLERRM,
                'asset_id', p_asset_id
            );
    END;

    IF NOT asset_exists THEN
        RAISE NOTICE '[validate_association_state] ERRO: Asset não encontrado - %', p_asset_id;
        RETURN jsonb_build_object(
            'valid', false,
            'error_code', 'ASSET_NOT_FOUND',
            'message', 'Asset não encontrado',
            'asset_id', p_asset_id
        );
    END IF;

    -- Buscar nome do status atual
    BEGIN
        SELECT status INTO asset_status_name FROM asset_status WHERE id = asset_status_id;
        RAISE NOTICE '[validate_association_state] Nome do status atual: %', asset_status_name;
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE '[validate_association_state] ERRO ao buscar nome do status: %', SQLERRM;
            asset_status_name := 'Status desconhecido';
    END;

    -- Contar associações ativas
    BEGIN
        SELECT COUNT(*) INTO active_associations_count
        FROM asset_client_assoc
        WHERE asset_id = p_asset_id 
          AND exit_date IS NULL 
          AND deleted_at IS NULL;

        RAISE NOTICE '[validate_association_state] Associações ativas encontradas: %', active_associations_count;
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE '[validate_association_state] ERRO ao contar associações ativas: %', SQLERRM;
            RETURN jsonb_build_object(
                'valid', false,
                'error_code', 'DATABASE_ERROR',
                'message', 'Erro ao verificar associações ativas',
                'error_detail', SQLERRM,
                'asset_id', p_asset_id
            );
    END;

    -- Validações específicas por operação
    IF p_operation = 'CREATE' THEN
        RAISE NOTICE '[validate_association_state] Validando operação CREATE';
        
        -- Verificar se asset já está associado
        IF active_associations_count > 0 THEN
            RAISE NOTICE '[validate_association_state] Asset já possui % associação(ões) ativa(s)', active_associations_count;
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
            RAISE NOTICE '[validate_association_state] Status % não permite nova associação', asset_status_name;
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
        RAISE NOTICE '[validate_association_state] Validando operação END';
        
        -- Verificar se existe associação para encerrar
        IF active_associations_count = 0 THEN
            RAISE NOTICE '[validate_association_state] Nenhuma associação ativa encontrada para encerrar';
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
                RAISE NOTICE '[validate_association_state] Associação específica % não encontrada', p_association_id;
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
    RAISE NOTICE '[validate_association_state] Validação APROVADA para asset %', p_asset_id;
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
        RAISE NOTICE '[validate_association_state] EXCEÇÃO CAPTURADA: % (SQLSTATE: %)', SQLERRM, SQLSTATE;
        RETURN jsonb_build_object(
            'valid', false,
            'error_code', 'VALIDATION_ERROR',
            'message', 'Erro interno na validação',
            'error_detail', SQLERRM,
            'sqlstate', SQLSTATE,
            'asset_id', p_asset_id
        );
END;
$$ LANGUAGE plpgsql;

-- Melhorar o trigger log_and_update_status com melhor tratamento de erros
CREATE OR REPLACE FUNCTION log_and_update_status()
RETURNS TRIGGER AS $$
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
  valid_assoc_id BIGINT := NULL;
  validation_result JSONB;
  current_asset_id TEXT;
BEGIN
  SET LOCAL search_path TO public;

  current_asset_id := COALESCE(NEW.asset_id, OLD.asset_id);

  -- Log de debug para rastreamento com mais detalhes
  RAISE NOTICE '[log_and_update_status] Trigger executada - asset_id: %, operação: %, timestamp: %', 
    current_asset_id, TG_OP, NOW();

  -- Validação de entrada mais robusta
  IF current_asset_id IS NULL OR trim(current_asset_id) = '' THEN
    RAISE NOTICE '[log_and_update_status] ERRO: asset_id inválido ou vazio';
    CASE TG_OP
      WHEN 'DELETE' THEN RETURN OLD;
      ELSE RETURN NEW;
    END CASE;
  END IF;

  -- Buscar dados do asset com tratamento de erro
  BEGIN
    SELECT status_id, solution_id, radio, line_number 
    INTO status_antigo, asset_solution_id, asset_radio, asset_line_number
    FROM assets 
    WHERE uuid = current_asset_id;

    IF NOT FOUND THEN
      RAISE NOTICE '[log_and_update_status] AVISO: Asset % não encontrado na tabela assets', current_asset_id;
      -- Continuar processamento mesmo sem encontrar o asset
    ELSE
      RAISE NOTICE '[log_and_update_status] Asset encontrado - status_id: %, solution_id: %', status_antigo, asset_solution_id;
    END IF;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE NOTICE '[log_and_update_status] ERRO ao buscar dados do asset %: %', current_asset_id, SQLERRM;
      status_antigo := NULL;
      asset_solution_id := NULL;
  END;

  -- Buscar informações adicionais para logging
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
      RAISE NOTICE '[log_and_update_status] Solução encontrada: %', solution_name;
    EXCEPTION
      WHEN OTHERS THEN
        RAISE NOTICE '[log_and_update_status] ERRO ao buscar solução %: %', asset_solution_id, SQLERRM;
        solution_name := NULL;
    END;
  END IF;

  -- Buscar IDs de status dinamicamente com tratamento de erro
  BEGIN
    SELECT id INTO status_alocado_id FROM asset_status WHERE LOWER(status) = 'em locação' LIMIT 1;
    SELECT id INTO status_disponivel_id FROM asset_status WHERE LOWER(status) IN ('disponível', 'disponivel') LIMIT 1;
    SELECT id INTO status_assinatura_id FROM asset_status WHERE LOWER(status) = 'em assinatura' LIMIT 1;

    RAISE NOTICE '[log_and_update_status] Status IDs - alocado: %, disponível: %, assinatura: %', 
      status_alocado_id, status_disponivel_id, status_assinatura_id;

    -- Fallback caso não encontre os status
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
      -- Usar valores padrão
      status_alocado_id := 2;
      status_disponivel_id := 1;
      status_assinatura_id := 3;
  END;

  -- Validar ASSOC_ID antes de usar
  IF TG_OP = 'DELETE' THEN
    IF OLD.id IS NOT NULL AND EXISTS (SELECT 1 FROM asset_client_assoc WHERE id = OLD.id) THEN
      valid_assoc_id := OLD.id;
    END IF;
  ELSIF NEW.id IS NOT NULL THEN
    IF EXISTS (SELECT 1 FROM asset_client_assoc WHERE id = NEW.id) THEN
      valid_assoc_id := NEW.id;
    END IF;
  END IF;

  RAISE NOTICE '[log_and_update_status] Association ID validado: %', valid_assoc_id;

  -- Lógica de cálculo do novo status (com verificação de mudança real)
  IF TG_OP = 'DELETE' THEN
    status_novo := status_disponivel_id;
    houve_alteracao := (status_novo IS DISTINCT FROM status_antigo);
    RAISE NOTICE '[log_and_update_status] DELETE - Status novo: %, houve alteração: %', status_novo, houve_alteracao;
    
  ELSIF NEW.exit_date IS NOT NULL AND (OLD.exit_date IS NULL OR OLD.exit_date IS DISTINCT FROM NEW.exit_date) THEN
    status_novo := status_disponivel_id;
    houve_alteracao := (status_novo IS DISTINCT FROM status_antigo);
    RAISE NOTICE '[log_and_update_status] EXIT_DATE definida - Status novo: %, houve alteração: %', status_novo, houve_alteracao;
    
  ELSIF NEW.exit_date IS NULL AND (NEW.association_id = 1) THEN
    status_novo := status_alocado_id;
    houve_alteracao := (status_novo IS DISTINCT FROM status_antigo);
    RAISE NOTICE '[log_and_update_status] Associação tipo 1 (aluguel) - Status novo: %, houve alteração: %', status_novo, houve_alteracao;
  
  ELSIF NEW.exit_date IS NULL AND (NEW.association_id = 2) THEN
    status_novo := status_assinatura_id;
    houve_alteracao := (status_novo IS DISTINCT FROM status_antigo);
    RAISE NOTICE '[log_and_update_status] Associação tipo 2 (assinatura) - Status novo: %, houve alteração: %', status_novo, houve_alteracao;
    
  ELSE
    status_novo := status_antigo;
    RAISE NOTICE '[log_and_update_status] Nenhuma alteração de status necessária';
  END IF;

  -- Atualizar status do asset SE necessário E se realmente houve mudança
  IF houve_alteracao AND status_novo IS NOT NULL AND status_novo IS DISTINCT FROM status_antigo THEN
    BEGIN
      -- Verificar se o status não foi alterado por outra transação concorrente
      DECLARE
        current_status_check BIGINT;
      BEGIN
        SELECT status_id INTO current_status_check FROM assets WHERE uuid = current_asset_id;
        
        IF current_status_check = status_antigo THEN
          UPDATE assets 
          SET status_id = status_novo 
          WHERE uuid = current_asset_id AND status_id = status_antigo;
          
          IF FOUND THEN
            RAISE NOTICE '[log_and_update_status] Status atualizado com sucesso de % para % no asset %', 
              status_antigo, status_novo, current_asset_id;
          ELSE
            RAISE NOTICE '[log_and_update_status] Status já foi alterado por outra transação para asset %', current_asset_id;
            houve_alteracao := FALSE;
          END IF;
        ELSE
          RAISE NOTICE '[log_and_update_status] Status do asset % foi alterado concorrentemente (esperado: %, atual: %)', 
            current_asset_id, status_antigo, current_status_check;
          houve_alteracao := FALSE;
        END IF;
      END;
    EXCEPTION
      WHEN OTHERS THEN
        RAISE NOTICE '[log_and_update_status] ERRO ao atualizar status do asset %: %', current_asset_id, SQLERRM;
        houve_alteracao := FALSE;
    END;
  END IF;

  -- Registrar log apenas para mudanças relevantes e não duplicadas
  IF houve_alteracao OR TG_OP = 'INSERT' OR TG_OP = 'DELETE' THEN
    BEGIN
      -- Verificar se não existe log idêntico recente (últimos 5 segundos)
      IF NOT EXISTS (
        SELECT 1 FROM asset_logs 
        WHERE assoc_id = valid_assoc_id
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
          valid_assoc_id,
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
            'solution_id', asset_solution_id,
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
        
        RAISE NOTICE '[log_and_update_status] Log registrado com sucesso para asset %', current_asset_id;
      ELSE
        RAISE NOTICE '[log_and_update_status] Log duplicado detectado - operação idempotente para asset %', current_asset_id;
      END IF;
    EXCEPTION
      WHEN OTHERS THEN
        RAISE NOTICE '[log_and_update_status] ERRO ao inserir log para asset %: %', current_asset_id, SQLERRM;
        -- Continuar processamento mesmo se falhar o log
    END;
  END IF;

  -- Retornar conforme operação
  CASE TG_OP
    WHEN 'DELETE' THEN RETURN OLD;
    ELSE RETURN NEW;
  END CASE;

EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '[log_and_update_status] EXCEÇÃO CAPTURADA: % (SQLSTATE: %)', SQLERRM, SQLSTATE;
    
    -- Tentar inserir log de erro
    BEGIN
      INSERT INTO asset_logs (
        assoc_id, date, event, details, status_before_id, status_after_id
      ) VALUES (
        valid_assoc_id, NOW(), 'TRIGGER_ERROR',
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
$$ LANGUAGE plpgsql;

-- Adicionar função para adquirir lock com melhor tratamento de erros
CREATE OR REPLACE FUNCTION acquire_operation_lock(
    p_operation_type TEXT,
    p_resource_id TEXT,
    p_operation_data JSONB DEFAULT NULL,
    p_timeout_minutes INTEGER DEFAULT 5
)
RETURNS JSONB AS $$
DECLARE
    lock_id UUID;
    existing_lock RECORD;
    current_user_id UUID;
BEGIN
    -- Log dos parâmetros de entrada
    RAISE NOTICE '[acquire_operation_lock] Tentando adquirir lock - type: %, resource: %, timeout: %min', 
        p_operation_type, p_resource_id, p_timeout_minutes;

    -- Validar parâmetros de entrada
    IF p_operation_type IS NULL OR trim(p_operation_type) = '' THEN
        RETURN jsonb_build_object(
            'acquired', false,
            'error_code', 'INVALID_PARAMETERS',
            'message', 'operation_type é obrigatório'
        );
    END IF;

    IF p_resource_id IS NULL OR trim(p_resource_id) = '' THEN
        RETURN jsonb_build_object(
            'acquired', false,
            'error_code', 'INVALID_PARAMETERS',
            'message', 'resource_id é obrigatório'
        );
    END IF;

    -- Limpar locks expirados primeiro
    PERFORM cleanup_expired_locks();
    
    -- Obter user_id atual
    current_user_id := auth.uid();
    RAISE NOTICE '[acquire_operation_lock] User ID atual: %', current_user_id;
    
    -- Verificar se já existe lock ativo para este recurso
    SELECT * INTO existing_lock
    FROM operation_locks
    WHERE resource_id = p_resource_id 
      AND operation_type = p_operation_type
      AND expires_at > NOW()
    LIMIT 1;
    
    IF existing_lock.id IS NOT NULL THEN
        RAISE NOTICE '[acquire_operation_lock] Lock existente encontrado: %, owner: %', existing_lock.id, existing_lock.user_id;
        
        -- Se o lock é do mesmo usuário, renovar
        IF existing_lock.user_id = current_user_id THEN
            UPDATE operation_locks 
            SET expires_at = NOW() + (p_timeout_minutes || ' minutes')::INTERVAL,
                operation_data = COALESCE(p_operation_data, operation_data)
            WHERE id = existing_lock.id;
            
            RAISE NOTICE '[acquire_operation_lock] Lock renovado para user %', current_user_id;
            RETURN jsonb_build_object(
                'acquired', true,
                'lock_id', existing_lock.id,
                'renewed', true,
                'expires_at', NOW() + (p_timeout_minutes || ' minutes')::INTERVAL
            );
        ELSE
            -- Lock de outro usuário ainda ativo
            RAISE NOTICE '[acquire_operation_lock] Recurso já está bloqueado por outro usuário';
            RETURN jsonb_build_object(
                'acquired', false,
                'error_code', 'RESOURCE_LOCKED',
                'message', 'Recurso está sendo usado por outro usuário',
                'lock_owner', existing_lock.user_id,
                'expires_at', existing_lock.expires_at
            );
        END IF;
    END IF;
    
    -- Criar novo lock
    INSERT INTO operation_locks (
        operation_type,
        resource_id,
        user_id,
        expires_at,
        operation_data
    ) VALUES (
        p_operation_type,
        p_resource_id,
        current_user_id,
        NOW() + (p_timeout_minutes || ' minutes')::INTERVAL,
        p_operation_data
    ) RETURNING id INTO lock_id;
    
    RAISE NOTICE '[acquire_operation_lock] Novo lock criado: %', lock_id;
    RETURN jsonb_build_object(
        'acquired', true,
        'lock_id', lock_id,
        'renewed', false,
        'expires_at', NOW() + (p_timeout_minutes || ' minutes')::INTERVAL
    );

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '[acquire_operation_lock] ERRO: % (SQLSTATE: %)', SQLERRM, SQLSTATE;
        RETURN jsonb_build_object(
            'acquired', false,
            'error_code', 'LOCK_ERROR',
            'message', 'Erro ao adquirir lock',
            'error_detail', SQLERRM,
            'sqlstate', SQLSTATE
        );
END;
$$ LANGUAGE plpgsql;
