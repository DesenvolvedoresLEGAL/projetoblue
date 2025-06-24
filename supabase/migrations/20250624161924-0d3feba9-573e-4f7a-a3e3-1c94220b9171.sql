
-- Fase 1: Criar função centralizada de validação de estado de associação
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

    -- Verificar se o asset existe
    SELECT 
        CASE WHEN COUNT(*) > 0 THEN TRUE ELSE FALSE END,
        status_id
    INTO asset_exists, asset_status_id
    FROM assets 
    WHERE uuid = p_asset_id AND deleted_at IS NULL;

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

-- Fase 2: Criar tabela de controle de operações para evitar operações simultâneas
CREATE TABLE IF NOT EXISTS public.operation_locks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operation_type TEXT NOT NULL, -- 'CREATE_ASSOCIATION', 'END_ASSOCIATION', etc
    resource_id TEXT NOT NULL, -- asset_id ou association_id
    user_id UUID REFERENCES auth.users(id),
    acquired_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() + INTERVAL '5 minutes'),
    operation_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_operation_locks_resource ON operation_locks(resource_id, operation_type);
CREATE INDEX IF NOT EXISTS idx_operation_locks_expires ON operation_locks(expires_at);

-- Função para limpar locks expirados automaticamente
CREATE OR REPLACE FUNCTION cleanup_expired_locks()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM operation_locks WHERE expires_at < NOW();
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Função para adquirir lock de operação
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
    -- Limpar locks expirados primeiro
    PERFORM cleanup_expired_locks();
    
    -- Obter user_id atual
    current_user_id := auth.uid();
    
    -- Verificar se já existe lock ativo para este recurso
    SELECT * INTO existing_lock
    FROM operation_locks
    WHERE resource_id = p_resource_id 
      AND operation_type = p_operation_type
      AND expires_at > NOW()
    LIMIT 1;
    
    IF existing_lock.id IS NOT NULL THEN
        -- Se o lock é do mesmo usuário, renovar
        IF existing_lock.user_id = current_user_id THEN
            UPDATE operation_locks 
            SET expires_at = NOW() + (p_timeout_minutes || ' minutes')::INTERVAL,
                operation_data = COALESCE(p_operation_data, operation_data)
            WHERE id = existing_lock.id;
            
            RETURN jsonb_build_object(
                'acquired', true,
                'lock_id', existing_lock.id,
                'renewed', true,
                'expires_at', NOW() + (p_timeout_minutes || ' minutes')::INTERVAL
            );
        ELSE
            -- Lock de outro usuário ainda ativo
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
    
    RETURN jsonb_build_object(
        'acquired', true,
        'lock_id', lock_id,
        'renewed', false,
        'expires_at', NOW() + (p_timeout_minutes || ' minutes')::INTERVAL
    );

EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'acquired', false,
            'error_code', 'LOCK_ERROR',
            'message', 'Erro ao adquirir lock',
            'error_detail', SQLERRM
        );
END;
$$ LANGUAGE plpgsql;

-- Função para liberar lock de operação
CREATE OR REPLACE FUNCTION release_operation_lock(p_lock_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    current_user_id UUID;
    deleted_count INTEGER;
BEGIN
    current_user_id := auth.uid();
    
    DELETE FROM operation_locks 
    WHERE id = p_lock_id 
      AND user_id = current_user_id;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count > 0;
END;
$$ LANGUAGE plpgsql;

-- Fase 3: Aprimorar trigger log_and_update_status com validações e locks
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
  lock_result JSONB;
  current_asset_id TEXT;
BEGIN
  SET LOCAL search_path TO public;

  current_asset_id := COALESCE(NEW.asset_id, OLD.asset_id);

  -- Log de debug para rastreamento
  RAISE NOTICE '[log_and_update_status] Trigger executada para asset_id=%, operação=%', 
    current_asset_id, TG_OP;

  -- Validar estado antes de prosseguir (apenas para CREATE e UPDATE)
  IF TG_OP IN ('INSERT', 'UPDATE') THEN
    SELECT validate_association_state(
      current_asset_id,
      CASE WHEN TG_OP = 'INSERT' THEN 'CREATE' ELSE 'END' END,
      CASE WHEN TG_OP = 'UPDATE' THEN NEW.id ELSE NULL END
    ) INTO validation_result;
    
    -- Se validação falhou e não é um caso de idempotência, bloquear
    IF (validation_result->>'valid')::boolean = false THEN
      -- Permitir operações idempotentes em alguns casos específicos
      IF validation_result->>'error_code' NOT IN ('ASSET_ALREADY_ASSOCIATED', 'NO_ACTIVE_ASSOCIATION') THEN
        RAISE EXCEPTION 'Validação de estado falhou: % (Código: %)', 
          validation_result->>'message', 
          validation_result->>'error_code';
      ELSE
        -- Log de operação idempotente detectada
        RAISE NOTICE 'Operação idempotente detectada: %', validation_result->>'message';
      END IF;
    END IF;
  END IF;

  -- Buscar dados do asset (status atual e solution)
  SELECT status_id, solution_id, radio, line_number 
  INTO status_antigo, asset_solution_id, asset_radio, asset_line_number
  FROM assets 
  WHERE uuid = current_asset_id;

  -- Buscar informações adicionais para logging
  IF NEW.client_id IS NOT NULL THEN
    SELECT nome INTO client_name FROM clients WHERE uuid = NEW.client_id;
  END IF;
  
  SELECT solution INTO solution_name FROM asset_solutions WHERE id = asset_solution_id;

  -- Buscar IDs de status dinamicamente (evitar hardcoded)
  SELECT id INTO status_alocado_id FROM asset_status WHERE LOWER(status) = 'em locação' LIMIT 1;
  SELECT id INTO status_disponivel_id FROM asset_status WHERE LOWER(status) IN ('disponível', 'disponivel') LIMIT 1;
  SELECT id INTO status_assinatura_id FROM asset_status WHERE LOWER(status) = 'em assinatura' LIMIT 1;

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

  -- Validar ASSOC_ID antes de usar
  IF TG_OP = 'DELETE' THEN
    IF EXISTS (SELECT 1 FROM asset_client_assoc WHERE id = OLD.id) THEN
      valid_assoc_id := OLD.id;
    END IF;
  ELSIF NEW.id IS NOT NULL THEN
    IF EXISTS (SELECT 1 FROM asset_client_assoc WHERE id = NEW.id) THEN
      valid_assoc_id := NEW.id;
    END IF;
  END IF;

  -- Lógica de cálculo do novo status (com verificação de mudança real)
  IF TG_OP = 'DELETE' THEN
    status_novo := status_disponivel_id;
    houve_alteracao := (status_novo IS DISTINCT FROM status_antigo);
    
  ELSIF NEW.exit_date IS NOT NULL AND (OLD.exit_date IS NULL OR OLD.exit_date IS DISTINCT FROM NEW.exit_date) THEN
    status_novo := status_disponivel_id;
    houve_alteracao := (status_novo IS DISTINCT FROM status_antigo);
    
  ELSIF NEW.exit_date IS NULL AND (NEW.association_id = 1) THEN
    status_novo := status_alocado_id;
    houve_alteracao := (status_novo IS DISTINCT FROM status_antigo);
  
  ELSIF NEW.exit_date IS NULL AND (NEW.association_id = 2) THEN
    status_novo := status_assinatura_id;
    houve_alteracao := (status_novo IS DISTINCT FROM status_antigo);
    
  ELSE
    status_novo := status_antigo;
  END IF;

  -- Atualizar status do asset SE necessário E se realmente houve mudança
  IF houve_alteracao AND status_novo IS NOT NULL AND status_novo IS DISTINCT FROM status_antigo THEN
    -- Verificar se o status não foi alterado por outra transação concorrente
    DECLARE
      current_status_check BIGINT;
    BEGIN
      SELECT status_id INTO current_status_check FROM assets WHERE uuid = current_asset_id;
      
      IF current_status_check = status_antigo THEN
        UPDATE assets 
        SET status_id = status_novo 
        WHERE uuid = current_asset_id AND status_id = status_antigo; -- Condição adicional para evitar race condition
        
        IF FOUND THEN
          RAISE NOTICE '[log_and_update_status] Status atualizado de % para % no asset %', 
            status_antigo, status_novo, current_asset_id;
        ELSE
          RAISE NOTICE '[log_and_update_status] Status já foi alterado por outra transação para asset %', current_asset_id;
          houve_alteracao := FALSE; -- Não houve alteração efetiva
        END IF;
      ELSE
        RAISE NOTICE '[log_and_update_status] Status do asset % foi alterado concorrentemente (esperado: %, atual: %)', 
          current_asset_id, status_antigo, current_status_check;
        houve_alteracao := FALSE;
      END IF;
    END;
  END IF;

  -- Registrar log apenas para mudanças relevantes e não duplicadas
  IF houve_alteracao OR TG_OP = 'INSERT' OR TG_OP = 'DELETE' THEN
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
    ELSE
      RAISE NOTICE '[log_and_update_status] Log duplicado detectado - operação idempotente para asset %', current_asset_id;
    END IF;
  END IF;

  -- Retornar conforme operação
  CASE TG_OP
    WHEN 'DELETE' THEN RETURN OLD;
    ELSE RETURN NEW;
  END CASE;

EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '[log_and_update_status] Erro no trigger: %', SQLERRM;
    -- Em caso de erro, permitir que a operação continue mas log o erro
    INSERT INTO asset_logs (
      assoc_id, date, event, details, status_before_id, status_after_id
    ) VALUES (
      valid_assoc_id, NOW(), 'TRIGGER_ERROR',
      jsonb_build_object(
        'error', SQLERRM,
        'asset_id', current_asset_id,
        'operation', TG_OP,
        'timestamp', NOW()
      ),
      status_antigo, status_antigo
    );
    
    CASE TG_OP
      WHEN 'DELETE' THEN RETURN OLD;
      ELSE RETURN NEW;
    END CASE;
END;
$$ LANGUAGE plpgsql;
