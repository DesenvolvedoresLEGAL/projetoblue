set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.acquire_operation_lock(p_operation_type text, p_resource_id text, p_operation_data jsonb DEFAULT NULL::jsonb, p_timeout_minutes integer DEFAULT 5)
 RETURNS jsonb
 LANGUAGE plpgsql
 SET search_path TO 'public, auth'
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.add_assets_to_association(p_client_id text, p_association_id bigint, p_entry_date date, p_asset_ids text[], p_exit_date date DEFAULT NULL::date, p_notes text DEFAULT NULL::text, p_ssid text DEFAULT NULL::text, p_pass text DEFAULT NULL::text, p_gb bigint DEFAULT NULL::bigint)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  current_asset_id text;
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
  FOREACH current_asset_id IN ARRAY p_asset_ids
  LOOP
    BEGIN
      -- Validar estado do ativo
      SELECT validate_association_state(current_asset_id, 'CREATE') INTO validation_result;
      
      IF (validation_result->>'valid')::boolean = false THEN
        failed_count := failed_count + 1;
        failed_assets := failed_assets || jsonb_build_object(
          'asset_id', current_asset_id,
          'error_code', validation_result->>'error_code',
          'message', validation_result->>'message'
        );
        CONTINUE;
      END IF;

      -- Verificar se o ativo já está associado ao mesmo cliente
      IF EXISTS (
        SELECT 1 FROM asset_client_assoc aca
        WHERE aca.asset_id = current_asset_id 
          AND aca.client_id = p_client_id 
          AND aca.exit_date IS NULL 
          AND aca.deleted_at IS NULL
      ) THEN
        failed_count := failed_count + 1;
        failed_assets := failed_assets || jsonb_build_object(
          'asset_id', current_asset_id,
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
        current_asset_id,
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

      RAISE NOTICE 'Ativo % adicionado à associação com sucesso (ID: %)', current_asset_id, new_association_id;

    EXCEPTION
      WHEN OTHERS THEN
        failed_count := failed_count + 1;
        failed_assets := failed_assets || jsonb_build_object(
          'asset_id', current_asset_id,
          'error_code', 'INSERT_ERROR',
          'message', SQLERRM
        );
        RAISE NOTICE 'Erro ao inserir ativo %: %', current_asset_id, SQLERRM;
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
$function$
;

CREATE OR REPLACE FUNCTION public.admin_delete_user(user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  user_email text;
  current_user_id uuid;
BEGIN
  -- Verificar se o usuário atual é admin
  IF NOT (SELECT has_role('admin'::user_role_enum)) THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores podem deletar usuários';
  END IF;

  -- Obter ID do usuário atual
  current_user_id := auth.uid();
  
  -- Prevenir auto-deleção
  IF user_id = current_user_id THEN
    RAISE EXCEPTION 'Não é possível deletar seu próprio usuário';
  END IF;

  -- Obter email do usuário para logs
  SELECT email INTO user_email FROM profiles WHERE id = user_id;
  
  IF user_email IS NULL THEN
    RAISE EXCEPTION 'Usuário não encontrado';
  END IF;

  -- Marcar perfil como deletado (soft delete)
  UPDATE profiles 
  SET deleted_at = NOW(), 
      is_active = false
  WHERE id = user_id;

  -- Log da ação
  INSERT INTO profile_logs (
    user_id, email, operation, table_name, 
    old_data, new_data
  ) VALUES (
    current_user_id,
    (SELECT email FROM profiles WHERE id = current_user_id),
    'ADMIN_DELETE_USER',
    'profiles',
    jsonb_build_object('deleted_user_id', user_id, 'deleted_user_email', user_email),
    NULL
  );

  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Erro ao deletar usuário: %', SQLERRM;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.admin_list_users()
 RETURNS TABLE(id uuid, email text, role user_role_enum, is_active boolean, is_approved boolean, created_at text, last_login text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Check if the current user is admin
  IF NOT (SELECT has_role('admin'::user_role_enum)) THEN
    RAISE EXCEPTION 'Access denied: only administrators can list users';
  END IF;

  RETURN QUERY
  SELECT 
    p.id,
    p.email,
    p.role,
    p.is_active,
    p.is_approved,
    p.created_at::text,
    p.last_login::text
  FROM profiles p
  WHERE p.deleted_at IS NULL
  ORDER BY p.created_at DESC;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.admin_update_user_profile(user_id uuid, profile_updates jsonb)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  old_data jsonb;
  user_email text;
  current_user_id uuid;
  new_email text;
  new_is_active boolean;
  new_is_approved boolean;
BEGIN
  -- Verificar se o usuário atual é admin
  IF NOT (SELECT has_role('admin'::user_role_enum)) THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores podem atualizar perfis';
  END IF;

  -- Obter dados atuais do usuário
  SELECT row_to_json(profiles.*), email 
  INTO old_data, user_email
  FROM profiles 
  WHERE id = user_id AND deleted_at IS NULL;
  
  IF user_email IS NULL THEN
    RAISE EXCEPTION 'Usuário não encontrado';
  END IF;

  -- Obter ID do usuário atual
  current_user_id := auth.uid();

  -- Extrair campos permitidos do JSON
  new_email := profile_updates->>'email';
  new_is_active := (profile_updates->>'is_active')::boolean;
  new_is_approved := (profile_updates->>'is_approved')::boolean;

  -- Atualizar apenas campos permitidos
  UPDATE profiles 
  SET 
    email = COALESCE(new_email, email),
    is_active = COALESCE(new_is_active, is_active),
    is_approved = COALESCE(new_is_approved, is_approved),
    updated_at = NOW()
  WHERE id = user_id;

  -- Log da ação
  INSERT INTO profile_logs (
    user_id, email, operation, table_name, 
    old_data, new_data
  ) VALUES (
    current_user_id,
    (SELECT email FROM profiles WHERE id = current_user_id),
    'ADMIN_UPDATE_PROFILE',
    'profiles',
    jsonb_build_object(
      'target_user_id', user_id,
      'target_user_email', user_email,
      'old_data', old_data
    ),
    jsonb_build_object(
      'target_user_id', user_id,
      'updates', profile_updates
    )
  );

  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Erro ao atualizar perfil: %', SQLERRM;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.admin_update_user_role(user_id uuid, new_role user_role_enum)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  old_role user_role_enum;
  user_email text;
  current_user_id uuid;
BEGIN
  -- Verificar se o usuário atual é admin
  IF NOT (SELECT has_role('admin'::user_role_enum)) THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores podem alterar roles';
  END IF;

  -- Obter dados atuais do usuário
  SELECT role, email INTO old_role, user_email 
  FROM profiles 
  WHERE id = user_id AND deleted_at IS NULL;
  
  IF user_email IS NULL THEN
    RAISE EXCEPTION 'Usuário não encontrado';
  END IF;

  -- Verificar se há mudança real
  IF old_role = new_role THEN
    RETURN TRUE; -- Nada a fazer
  END IF;

  -- Obter ID do usuário atual
  current_user_id := auth.uid();

  -- Atualizar role
  UPDATE profiles 
  SET role = new_role, updated_at = NOW()
  WHERE id = user_id;

  -- Log da ação
  INSERT INTO profile_logs (
    user_id, email, operation, table_name, 
    old_data, new_data
  ) VALUES (
    current_user_id,
    (SELECT email FROM profiles WHERE id = current_user_id),
    'ADMIN_UPDATE_ROLE',
    'profiles',
    jsonb_build_object(
      'target_user_id', user_id, 
      'target_user_email', user_email,
      'old_role', old_role
    ),
    jsonb_build_object(
      'target_user_id', user_id, 
      'target_user_email', user_email,
      'new_role', new_role
    )
  );

  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Erro ao atualizar role: %', SQLERRM;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.cleanup_expired_locks()
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM operation_locks WHERE expires_at < NOW();
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.detect_association_inconsistencies()
 RETURNS TABLE(asset_id text, current_status_id bigint, expected_status_id bigint, issue_description text, corrected boolean)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  status_disponivel_id BIGINT;
  status_alocado_id BIGINT;
  inconsistency_record RECORD;
  correction_count INT := 0;
BEGIN
  -- Buscar IDs de status
  SELECT id INTO status_disponivel_id FROM asset_status WHERE LOWER(status) IN ('disponível', 'disponivel') LIMIT 1;
  SELECT id INTO status_alocado_id FROM asset_status WHERE LOWER(status) = 'alocado' LIMIT 1;
  
  -- Verificar assets que deveriam estar disponíveis mas não estão
  FOR inconsistency_record IN
    SELECT DISTINCT 
      a.uuid as asset_uuid,
      a.status_id as current_status,
      status_disponivel_id as expected_status,
      'Asset should be available - no active associations' as description
    FROM assets a
    LEFT JOIN asset_client_assoc aca ON a.uuid = aca.asset_id AND aca.exit_date IS NULL
    WHERE aca.asset_id IS NULL 
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
      aca.asset_id as asset_uuid,
      a.status_id as current_status,
      status_alocado_id as expected_status,
      'Asset should be allocated - has active association' as description
    FROM asset_client_assoc aca
    JOIN assets a ON aca.asset_id = a.uuid
    WHERE aca.exit_date IS NULL 
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
$function$
;

CREATE OR REPLACE FUNCTION public.ensure_user_profile(user_id uuid, user_email text, user_role user_role_enum)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Try to insert the profile if it doesn't exist
  INSERT INTO public.profiles (id, email, role, is_active, is_approved)
  VALUES (user_id, user_email, user_role, true, true)
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = NOW();
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error ensuring profile for %: %', user_email, SQLERRM;
    RETURN FALSE;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.fix_missing_profiles()
 RETURNS TABLE(user_id uuid, email text, fixed boolean)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  u RECORD;
  fixed_count INT := 0;
  error_count INT := 0;
BEGIN
  FOR u IN 
    SELECT au.id, au.email 
    FROM auth.users au
    LEFT JOIN public.profiles p ON au.id = p.id
    WHERE p.id IS NULL
  LOOP
    BEGIN
      INSERT INTO public.profiles (id, email, role, is_active, is_approved)
      VALUES (
        u.id,
        u.email,
        'cliente'::user_role_enum,
        true,
        true
      );
      fixed_count := fixed_count + 1;
      user_id := u.id;
      email := u.email;
      fixed := true;
      RAISE NOTICE 'Perfil criado com sucesso para usuário %', u.email;
      RETURN NEXT;
    EXCEPTION WHEN OTHERS THEN
      error_count := error_count + 1;
      user_id := u.id;
      email := u.email;
      fixed := false;
      RAISE NOTICE 'Erro ao criar perfil para %: %', u.email, SQLERRM;
      RETURN NEXT;
    END;
  END LOOP;
  
  RAISE NOTICE 'Resumo: % perfis criados, % erros', fixed_count, error_count;
  RETURN;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  user_role user_role_enum;
BEGIN
  -- Log de início da função
  RAISE NOTICE 'handle_new_user: Iniciando criação de perfil para usuário % (email: %)', new.id, new.email;
  
  -- Tentar converter o role dos metadados do usuário
  BEGIN
    user_role := (new.raw_user_meta_data->>'role')::user_role_enum;
    RAISE NOTICE 'handle_new_user: Role extraído dos metadados: %', user_role;
  EXCEPTION 
    WHEN invalid_text_representation THEN
      -- Usar 'cliente' como padrão se a conversão falhar
      user_role := 'cliente'::user_role_enum;
      RAISE NOTICE 'handle_new_user: Erro ao converter role, usando padrão "cliente" para usuário %', new.email;
    WHEN OTHERS THEN
      -- Fallback para qualquer outro erro
      user_role := 'cliente'::user_role_enum;
      RAISE NOTICE 'handle_new_user: Erro inesperado ao processar role, usando padrão "cliente" para usuário %', new.email;
  END;

  -- Tentar inserir o perfil
  BEGIN
    INSERT INTO public.profiles (id, email, role, is_active, is_approved)
    VALUES (
      new.id,
      new.email,
      COALESCE(user_role, 'cliente'::user_role_enum),
      true,
      true
    );
    
    RAISE NOTICE 'handle_new_user: Perfil criado com sucesso para usuário % com role %', new.email, COALESCE(user_role, 'cliente'::user_role_enum);
    
  EXCEPTION
    WHEN unique_violation THEN
      RAISE NOTICE 'handle_new_user: Perfil já existe para usuário %', new.email;
    WHEN OTHERS THEN
      RAISE WARNING 'handle_new_user: Erro ao criar perfil para %: % (SQLSTATE: %)', new.email, SQLERRM, SQLSTATE;
      -- Não fazer RETURN NULL aqui para não bloquear o cadastro
  END;
  
  RETURN new;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.has_minimum_role(required_role user_role_enum)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  user_role user_role_enum;
  role_hierarchy jsonb := '{"admin": 3, "suporte": 2, "cliente": 1, "user": 0}';
BEGIN
  SELECT role INTO user_role FROM profiles WHERE id = auth.uid();
  
  -- If user not found or role doesn't exist in hierarchy
  IF user_role IS NULL OR role_hierarchy->>user_role::text IS NULL THEN
    RETURN false;
  END IF;
  
  RETURN (role_hierarchy->>user_role::text)::int >= (role_hierarchy->>required_role::text)::int;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.has_role(role_name user_role_enum)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = role_name
  );
$function$
;

CREATE OR REPLACE FUNCTION public.is_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT has_role('admin'::user_role_enum);
$function$
;

CREATE OR REPLACE FUNCTION public.is_afiliado()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT has_role('cliente'::user_role_enum);
$function$
;

CREATE OR REPLACE FUNCTION public.is_support_or_above()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT has_minimum_role('suporte'::user_role_enum);
$function$
;

CREATE OR REPLACE FUNCTION public.log_and_update_status()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public, auth'
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.log_asset_soft_delete()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
DECLARE
  asset_solution_id BIGINT;
  solution_name TEXT;
  status_antigo BIGINT;
  status_name TEXT;
BEGIN
  SET LOCAL search_path TO public;

  -- Só loga se o asset foi marcado como deletado (soft delete)
  IF OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL THEN
    -- Buscar dados do asset
    asset_solution_id := NEW.solution_id;
    status_antigo := NEW.status_id;

    -- Buscar nomes das tabelas relacionadas
    SELECT solution INTO solution_name FROM asset_solutions WHERE id = asset_solution_id;
    SELECT status INTO status_name FROM asset_status WHERE id = status_antigo;

    -- Inserir log de soft delete
    INSERT INTO asset_logs (
      assoc_id,
      date,
      event,
      details,
      status_before_id,
      status_after_id
    ) VALUES (
      NULL, -- Não há associação nesse contexto
      NOW(),
      'ASSET_SOFT_DELETE',
      jsonb_build_object(
        'user_id', COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'),
        'username', COALESCE(current_setting('request.jwt.claim.sub', true), 'system'),
        'asset_id', NEW.uuid,
        'line_number', NEW.line_number,
        'radio', NEW.radio,
        'solution_name', solution_name,
        'solution_id', asset_solution_id,
        'status_before_name', status_name,
        'status_before_id', status_antigo,
        'deleted_at', NEW.deleted_at,
        'event_description', 'Ativo removido (soft delete)'
      ),
      status_antigo,
      NULL -- Status depois é NULL (soft deleted)
    );
  END IF;

  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.log_client_changes()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  user_email TEXT;
  safe_user_id UUID;
BEGIN
  SET search_path TO public;

  -- Obter user_id com fallback seguro
  safe_user_id := COALESCE(auth.uid(), NULL);

  -- Obter o email do usuário atual (se disponível)
  IF safe_user_id IS NOT NULL THEN
    SELECT email INTO user_email FROM auth.users WHERE id = safe_user_id;
  END IF;

  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.client_logs (
      client_id,
      event_type,
      details,
      performed_by,
      performed_by_email,
      date,
      old_data,
      new_data
    ) VALUES (
      NEW.uuid,
      'CLIENTE_CRIADO',
      jsonb_build_object(
        'empresa', NEW.empresa,
        'responsavel', NEW.responsavel,
        'email', NEW.email,
        'cnpj', NEW.cnpj,
        'telefones', NEW.telefones,
        'operation', 'INSERT',
        'timestamp', NOW()
      ),
      safe_user_id,
      COALESCE(user_email, 'sistema'),
      NOW(),
      NULL,
      row_to_json(NEW)::jsonb
    );
    RETURN NEW;
    
  ELSIF TG_OP = 'UPDATE' THEN
    -- Registrar apenas se houve mudanças relevantes (ignorar updated_at)
    IF (OLD.empresa IS DISTINCT FROM NEW.empresa) OR
       (OLD.responsavel IS DISTINCT FROM NEW.responsavel) OR
       (OLD.email IS DISTINCT FROM NEW.email) OR
       (OLD.cnpj IS DISTINCT FROM NEW.cnpj) OR
       (OLD.telefones IS DISTINCT FROM NEW.telefones) OR
       (OLD.deleted_at IS DISTINCT FROM NEW.deleted_at) THEN
      
      INSERT INTO public.client_logs (
        client_id,
        event_type,
        details,
        performed_by,
        performed_by_email,
        date,
        old_data,
        new_data
      ) VALUES (
        NEW.uuid,
        CASE 
          WHEN OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL THEN 'CLIENTE_EXCLUIDO'
          ELSE 'CLIENTE_ATUALIZADO'
        END,
        jsonb_build_object(
          'empresa', NEW.empresa,
          'responsavel', NEW.responsavel,
          'email', NEW.email,
          'cnpj', NEW.cnpj,
          'telefones', NEW.telefones,
          'changes', jsonb_build_object(
            'empresa_changed', OLD.empresa IS DISTINCT FROM NEW.empresa,
            'responsavel_changed', OLD.responsavel IS DISTINCT FROM NEW.responsavel,
            'email_changed', OLD.email IS DISTINCT FROM NEW.email,
            'cnpj_changed', OLD.cnpj IS DISTINCT FROM NEW.cnpj,
            'telefones_changed', OLD.telefones IS DISTINCT FROM NEW.telefones,
            'soft_deleted', OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL
          ),
          'operation', 'UPDATE',
          'timestamp', NOW()
        ),
        safe_user_id,
        COALESCE(user_email, 'sistema'),
        NOW(),
        row_to_json(OLD)::jsonb,
        row_to_json(NEW)::jsonb
      );
    END IF;
    RETURN NEW;
    
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.client_logs (
      client_id,
      event_type,
      details,
      performed_by,
      performed_by_email,
      date,
      old_data,
      new_data
    ) VALUES (
      OLD.uuid,
      'CLIENTE_EXCLUIDO',
      jsonb_build_object(
        'empresa', OLD.empresa,
        'responsavel', OLD.responsavel,
        'email', OLD.email,
        'cnpj', OLD.cnpj,
        'telefones', OLD.telefones,
        'operation', 'DELETE',
        'timestamp', NOW()
      ),
      safe_user_id,
      COALESCE(user_email, 'sistema'),
      NOW(),
      row_to_json(OLD)::jsonb,
      NULL
    );
    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.log_profile_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    current_user_email TEXT;
    safe_user_id UUID;
BEGIN
    SET search_path TO public, auth;

    -- Obter user_id com fallback seguro
    safe_user_id := COALESCE(auth.uid(), NULL);

    -- Tentar obter o email do usuário atual com tratamento de erro
    IF safe_user_id IS NOT NULL THEN
        BEGIN
            -- Tentar acessar auth.users com tratamento de exceção
            SELECT email INTO current_user_email
            FROM auth.users
            WHERE id = safe_user_id;
        EXCEPTION
            WHEN OTHERS THEN
                -- Se falhar ao acessar auth.users, usar email do próprio registro (se disponível)
                current_user_email := CASE
                    WHEN TG_OP = 'INSERT' THEN NEW.email
                    WHEN TG_OP = 'UPDATE' THEN COALESCE(NEW.email, OLD.email)
                    WHEN TG_OP = 'DELETE' THEN OLD.email
                    ELSE 'sistema'
                END;
                RAISE NOTICE 'log_profile_change: Não foi possível acessar auth.users, usando email do registro: %', current_user_email;
        END;
    ELSE
        -- Se não há user_id, usar email do próprio registro
        current_user_email := CASE
            WHEN TG_OP = 'INSERT' THEN NEW.email
            WHEN TG_OP = 'UPDATE' THEN COALESCE(NEW.email, OLD.email)
            WHEN TG_OP = 'DELETE' THEN OLD.email
            ELSE 'sistema'
        END;
    END IF;

    -- Fallback final se ainda não temos email
    current_user_email := COALESCE(current_user_email, 'sistema');

    IF TG_OP = 'INSERT' THEN
        INSERT INTO public.profile_logs (
            user_id, email, operation, table_name, old_data, new_data
        ) VALUES (
            safe_user_id,
            current_user_email,
            'INSERT',
            TG_TABLE_NAME,
            NULL,
            row_to_json(NEW)
        );
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO public.profile_logs (
            user_id, email, operation, table_name, old_data, new_data
        ) VALUES (
            safe_user_id,
            current_user_email,
            'UPDATE',
            TG_TABLE_NAME,
            row_to_json(OLD),
            row_to_json(NEW)
        );
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO public.profile_logs (
            user_id, email, operation, table_name, old_data, new_data
        ) VALUES (
            safe_user_id,
            current_user_email,
            'DELETE',
            TG_TABLE_NAME,
            row_to_json(OLD),
            NULL
        );
        RETURN OLD;
    END IF;

    RETURN NULL;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.prevent_rented_association()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
  WHERE LOWER(status) = 'alocado' 
  LIMIT 1;

  -- Verificar se o asset já está alocado
  IF current_status_id = status_alocado_id THEN
    RAISE EXCEPTION 'Não é possível associar o asset %, pois ele já está alocado (status: %).', 
      NEW.asset_id, current_status_name;
  END IF;

  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.release_operation_lock(p_lock_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SET search_path TO 'public, auth'
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.set_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_all_rented_days()
 RETURNS jsonb
 LANGUAGE plpgsql
 SET search_path TO 'public, auth'
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.update_asset_rented_days(asset_uuid text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SET search_path TO 'public, auth'
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.update_profile_last_login()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Atualizar o last_login no profiles quando o last_sign_in_at for atualizado
  UPDATE public.profiles 
  SET 
    last_login = NEW.last_sign_in_at,
    updated_at = NOW()
  WHERE id = NEW.id;
  
  -- Log para debug (opcional)
  RAISE LOG 'Updated last_login for user % to %', NEW.id, NEW.last_sign_in_at;
  
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.user_has_profile(user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles WHERE id = user_id
  );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.validate_association_state(p_asset_id text, p_operation text, p_association_id bigint DEFAULT NULL::bigint)
 RETURNS jsonb
 LANGUAGE plpgsql
 SET search_path TO 'public, auth'
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.validate_rented_days_integrity()
 RETURNS TABLE(asset_id text, current_rented_days integer, calculated_days integer, is_consistent boolean, message text)
 LANGUAGE plpgsql
 SET search_path TO 'public, auth'
AS $function$
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
$function$
;

create policy "Allow profile_logs insertion by security definer functions"
on "public"."profile_logs"
as permissive
for insert
to public
with check (true);


create policy "Only admins can view profile logs"
on "public"."profile_logs"
as permissive
for select
to public
using ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::user_role_enum)))));


CREATE TRIGGER trigger_log_profile_changes AFTER INSERT OR DELETE OR UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION log_profile_change();


