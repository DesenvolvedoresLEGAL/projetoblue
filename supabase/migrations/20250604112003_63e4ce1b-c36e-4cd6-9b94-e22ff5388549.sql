
-- Etapa 1: Remover constraints duplicadas de foreign key
ALTER TABLE asset_logs DROP CONSTRAINT IF EXISTS asset_histories_assoc_id_fkey;
ALTER TABLE asset_logs DROP CONSTRAINT IF EXISTS asset_histories_assoc_id_fkey1;
ALTER TABLE asset_logs DROP CONSTRAINT IF EXISTS fk_asset_logs_association;

-- Etapa 2: Recriar uma única constraint com ON DELETE SET NULL
ALTER TABLE asset_logs ADD CONSTRAINT fk_asset_logs_assoc_id 
FOREIGN KEY (assoc_id) REFERENCES asset_client_assoc(id) ON DELETE SET NULL;

-- Etapa 3: Modificar o trigger log_and_update_status para lidar melhor com assoc_id
CREATE OR REPLACE FUNCTION public.log_and_update_status()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  status_antigo BIGINT;
  status_novo BIGINT;
  asset_solution_id BIGINT;
  status_alocado_id BIGINT;
  status_disponivel_id BIGINT;
  houve_alteracao BOOLEAN := FALSE;
  client_name TEXT;
  asset_radio TEXT;
  asset_line_number BIGINT;
  solution_name TEXT;
  valid_assoc_id BIGINT := NULL;
BEGIN
  SET LOCAL search_path TO public;

  -- Log de debug para rastreamento
  RAISE NOTICE '[log_and_update_status] Trigger executada para asset_id=%, operação=%', 
    COALESCE(NEW.asset_id, OLD.asset_id), TG_OP;

  -- Buscar dados do asset (status atual e solution)
  SELECT status_id, solution_id, radio, line_number 
  INTO status_antigo, asset_solution_id, asset_radio, asset_line_number
  FROM assets 
  WHERE uuid = COALESCE(NEW.asset_id, OLD.asset_id);

  -- Buscar informações adicionais para logging
  IF NEW.client_id IS NOT NULL THEN
    SELECT nome INTO client_name FROM clients WHERE uuid = NEW.client_id;
  END IF;
  
  SELECT solution INTO solution_name FROM asset_solutions WHERE id = asset_solution_id;

  -- Buscar IDs de status dinamicamente (evitar hardcoded)
  SELECT id INTO status_alocado_id FROM asset_status WHERE LOWER(status) = 'alocado' LIMIT 1;
  SELECT id INTO status_disponivel_id FROM asset_status WHERE LOWER(status) IN ('disponível', 'disponivel') LIMIT 1;

  -- Fallback caso não encontre os status
  IF status_alocado_id IS NULL THEN
    SELECT id INTO status_alocado_id FROM asset_status WHERE id = 2 LIMIT 1; -- Fallback para ID 2
  END IF;
  
  IF status_disponivel_id IS NULL THEN
    SELECT id INTO status_disponivel_id FROM asset_status WHERE id = 1 LIMIT 1; -- Fallback para ID 1
  END IF;

  -- ==========================================
  -- VALIDAR ASSOC_ID ANTES DE USAR
  -- ==========================================
  
  IF TG_OP = 'DELETE' THEN
    -- Para DELETE, verificar se OLD.id existe
    IF EXISTS (SELECT 1 FROM asset_client_assoc WHERE id = OLD.id) THEN
      valid_assoc_id := OLD.id;
    END IF;
  ELSIF NEW.id IS NOT NULL THEN
    -- Para INSERT/UPDATE, verificar se NEW.id existe
    IF EXISTS (SELECT 1 FROM asset_client_assoc WHERE id = NEW.id) THEN
      valid_assoc_id := NEW.id;
    END IF;
  END IF;

  -- ==========================================
  -- LÓGICA DE CÁLCULO DO NOVO STATUS
  -- ==========================================
  
  IF TG_OP = 'DELETE' THEN
    -- Asset foi removido da associação - volta para disponível
    status_novo := status_disponivel_id;
    houve_alteracao := TRUE;
    
  ELSIF NEW.exit_date IS NOT NULL THEN
    -- Asset tem data de saída - volta para disponível
    status_novo := status_disponivel_id;
    houve_alteracao := (status_novo IS DISTINCT FROM status_antigo);
    
  ELSIF NEW.exit_date IS NULL AND (NEW.association_id = 1 OR NEW.association_id = 2) THEN
    -- Asset está sendo associado (aluguel ou assinatura) - vai para alocado
    status_novo := status_alocado_id;
    houve_alteracao := (status_novo IS DISTINCT FROM status_antigo);
    
  ELSE
    -- Mantém status atual para outros casos
    status_novo := status_antigo;
  END IF;

  -- ==========================================
  -- ATUALIZAR STATUS DO ASSET SE NECESSÁRIO
  -- ==========================================
  
  IF houve_alteracao AND status_novo IS NOT NULL AND status_novo IS DISTINCT FROM status_antigo THEN
    UPDATE assets 
    SET status_id = status_novo 
    WHERE uuid = COALESCE(NEW.asset_id, OLD.asset_id);
    
    RAISE NOTICE '[log_and_update_status] Status atualizado de % para % no asset %', 
      status_antigo, status_novo, COALESCE(NEW.asset_id, OLD.asset_id);
  END IF;

  -- ==========================================
  -- REGISTRAR LOG UNIFICADO COM ASSOC_ID VALIDADO
  -- ==========================================
  
  -- Registra log apenas para mudanças relevantes
  IF houve_alteracao OR TG_OP = 'INSERT' OR TG_OP = 'DELETE' THEN
    INSERT INTO asset_logs (
      assoc_id,
      date,
      event,
      details,
      status_before_id,
      status_after_id
    )
    VALUES (
      valid_assoc_id, -- Usar NULL se não existe
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
        'asset_id', COALESCE(NEW.asset_id, OLD.asset_id),
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
        'valid_assoc_id', valid_assoc_id -- Para debug
      ),
      status_antigo,
      status_novo
    );
  END IF;

  -- Retornar conforme operação
  CASE TG_OP
    WHEN 'DELETE' THEN RETURN OLD;
    ELSE RETURN NEW;
  END CASE;
END;
$function$;
;
