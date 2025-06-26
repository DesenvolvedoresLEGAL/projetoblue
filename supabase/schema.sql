

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."asset_status_enum" AS ENUM (
    'Disponível',
    'Alugado',
    'Assinatura',
    'Sem Dados',
    'Bloqueado',
    'Manutenção'
);


ALTER TYPE "public"."asset_status_enum" OWNER TO "postgres";


CREATE TYPE "public"."asset_type_enum" AS ENUM (
    'chip',
    'roteador'
);


ALTER TYPE "public"."asset_type_enum" OWNER TO "postgres";


CREATE TYPE "public"."association_type_enum" AS ENUM (
    'aluguel',
    'assinatura'
);


ALTER TYPE "public"."association_type_enum" OWNER TO "postgres";


CREATE TYPE "public"."bits_mission_status_enum" AS ENUM (
    'in_progress',
    'completed',
    'expired'
);


ALTER TYPE "public"."bits_mission_status_enum" OWNER TO "postgres";


CREATE TYPE "public"."bits_referral_status_enum" AS ENUM (
    'pendente',
    'em_negociacao',
    'fechado',
    'perdido'
);


ALTER TYPE "public"."bits_referral_status_enum" OWNER TO "postgres";


CREATE TYPE "public"."solution_type_enum" AS ENUM (
    'SPEEDY 5G',
    '4BLACK',
    '4LITE',
    '4PLUS',
    'AP BLUE',
    'POWERBANK',
    'SWITCH',
    'HUB USB',
    'ANTENA',
    'LOAD BALANCE',
    'LIVE'
);


ALTER TYPE "public"."solution_type_enum" OWNER TO "postgres";


CREATE TYPE "public"."user_role_enum" AS ENUM (
    'admin',
    'suporte',
    'cliente',
    'user'
);


ALTER TYPE "public"."user_role_enum" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."acquire_operation_lock"("p_operation_type" "text", "p_resource_id" "text", "p_operation_data" "jsonb" DEFAULT NULL::"jsonb", "p_timeout_minutes" integer DEFAULT 5) RETURNS "jsonb"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public, auth'
    AS $$
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
$$;


ALTER FUNCTION "public"."acquire_operation_lock"("p_operation_type" "text", "p_resource_id" "text", "p_operation_data" "jsonb", "p_timeout_minutes" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."add_assets_to_association"("p_client_id" "text", "p_association_id" bigint, "p_entry_date" "date", "p_asset_ids" "text"[], "p_exit_date" "date" DEFAULT NULL::"date", "p_notes" "text" DEFAULT NULL::"text", "p_ssid" "text" DEFAULT NULL::"text", "p_pass" "text" DEFAULT NULL::"text", "p_gb" bigint DEFAULT NULL::bigint) RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
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
$$;


ALTER FUNCTION "public"."add_assets_to_association"("p_client_id" "text", "p_association_id" bigint, "p_entry_date" "date", "p_asset_ids" "text"[], "p_exit_date" "date", "p_notes" "text", "p_ssid" "text", "p_pass" "text", "p_gb" bigint) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."admin_delete_user"("user_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
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
$$;


ALTER FUNCTION "public"."admin_delete_user"("user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."admin_list_users"() RETURNS TABLE("id" "uuid", "email" "text", "role" "public"."user_role_enum", "is_active" boolean, "is_approved" boolean, "created_at" "text", "last_login" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
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
$$;


ALTER FUNCTION "public"."admin_list_users"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."admin_update_user_profile"("user_id" "uuid", "profile_updates" "jsonb") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
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
$$;


ALTER FUNCTION "public"."admin_update_user_profile"("user_id" "uuid", "profile_updates" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."admin_update_user_role"("user_id" "uuid", "new_role" "public"."user_role_enum") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
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
$$;


ALTER FUNCTION "public"."admin_update_user_role"("user_id" "uuid", "new_role" "public"."user_role_enum") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_asset_availability"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$BEGIN
  SET search_path TO public;
    IF EXISTS (
    SELECT 1
    FROM asset_client_assoc
    WHERE asset_id = NEW.asset_id
      AND id <> COALESCE(NEW.id, -1)  -- Ignora a própria linha (em updates)
      AND (
        NEW.entry_date < COALESCE(exit_date, 'infinity') AND
        COALESCE(NEW.exit_date, 'infinity') > entry_date
      )
) THEN
    RAISE EXCEPTION 'O ativo % já está associado a outro cliente neste período.', NEW.asset_id;
END IF;


    RETURN NEW;
END;$$;


ALTER FUNCTION "public"."check_asset_availability"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."cleanup_expired_locks"() RETURNS integer
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM operation_locks WHERE expires_at < NOW();
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$;


ALTER FUNCTION "public"."cleanup_expired_locks"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."detect_association_inconsistencies"() RETURNS TABLE("asset_id" "text", "current_status_id" bigint, "expected_status_id" bigint, "issue_description" "text", "corrected" boolean)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
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
$$;


ALTER FUNCTION "public"."detect_association_inconsistencies"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."ensure_user_profile"("user_id" "uuid", "user_email" "text", "user_role" "public"."user_role_enum") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
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
$$;


ALTER FUNCTION "public"."ensure_user_profile"("user_id" "uuid", "user_email" "text", "user_role" "public"."user_role_enum") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."fix_missing_profiles"() RETURNS TABLE("user_id" "uuid", "email" "text", "fixed" boolean)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
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
$$;


ALTER FUNCTION "public"."fix_missing_profiles"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."fix_missing_profiles"() IS 'Função para recuperar perfis de usuários que possam ter sido criados sem o perfil correspondente devido a problemas no trigger.';



CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
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
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."has_minimum_role"("required_role" "public"."user_role_enum") RETURNS boolean
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
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
$$;


ALTER FUNCTION "public"."has_minimum_role"("required_role" "public"."user_role_enum") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."has_role"("role_name" "public"."user_role_enum") RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = role_name
  );
$$;


ALTER FUNCTION "public"."has_role"("role_name" "public"."user_role_enum") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_admin"() RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT has_role('admin'::user_role_enum);
$$;


ALTER FUNCTION "public"."is_admin"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_afiliado"() RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT has_role('cliente'::user_role_enum);
$$;


ALTER FUNCTION "public"."is_afiliado"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_support_or_above"() RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT has_minimum_role('suporte'::user_role_enum);
$$;


ALTER FUNCTION "public"."is_support_or_above"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_user_self"("profile_id" "uuid") RETURNS boolean
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT profile_id = auth.uid()
$$;


ALTER FUNCTION "public"."is_user_self"("profile_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."log_and_update_status"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public, auth'
    AS $$
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
$$;


ALTER FUNCTION "public"."log_and_update_status"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."log_and_update_status"() IS 'Função principal refatorada para gerenciar status de ativos e logs de associação.
- Elimina duplicidade de triggers
- Usa mapeamento dinâmico de status (não hardcoded)
- Gera logs únicos e padronizados
- Implementa nova lógica: association_id 1 ou 2 = alocado, exit_date preenchido = disponível
- Versão: 1.0 - Refatoração PRD 28/05/2025';



CREATE OR REPLACE FUNCTION "public"."log_asset_insert"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$BEGIN
    INSERT INTO asset_logs (
        assoc_id,
        date,
        event,
        details,
        status_before_id,
        status_after_id
    ) VALUES (
        NULL, -- Associação não existe ainda
        NOW(),
        'ASSET_CRIADO',
        jsonb_build_object(
        'user_id', coalesce(auth.uid(), '00000000-0000-0000-0000-000000000000'),
        'username', coalesce(current_setting('request.jwt.claim.sub', true), 'system'),
        'line_number', (select line_number from assets where uuid = new.uuid),
        'radio', (select radio from assets where uuid = new.uuid),
        'solution', (select solution from asset_solutions where id = NEW.solution_id),
        'solution_id', NEW.solution_id,
        'old_status', null,
        'old_status_id', null,
        'new_status', (select status from asset_status where id = new.status_id),
        'new_status_id', new.status_id,
        'event_description', 'Ativo cadastrado'
        ),
        NULL,
        NEW.status_id
    );

    RETURN NEW;
END;$$;


ALTER FUNCTION "public"."log_asset_insert"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."log_asset_soft_delete"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
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
$$;


ALTER FUNCTION "public"."log_asset_soft_delete"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."log_asset_soft_delete"() IS 'Função corrigida para logging de soft delete de ativos.
- Remove variáveis inexistentes
- Usa dados corretos do asset
- Versão: 1.0 - Refatoração PRD 28/05/2025';



CREATE OR REPLACE FUNCTION "public"."log_asset_status_change"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$DECLARE
  last_assoc_id BIGINT;
  asset_solution_id BIGINT; -- <--- Adicione isso!
  old_status_id BIGINT;     -- <--- Se usar mais abaixo
  new_status_id BIGINT;     -- <--- Se usar mais abaixo
BEGIN
  SET LOCAL search_path TO public;

  RAISE NOTICE '[log_asset_status_change] Trigger disparada para asset uuid=%', NEW.uuid;


  -- Registra apenas se o status realmente mudou via UPDATE
  IF NEW.status_id IS DISTINCT FROM OLD.status_id AND TG_OP = 'UPDATE' THEN

    SELECT solution_id INTO asset_solution_id
    FROM assets
    WHERE uuid = NEW.uuid;

    -- Busca a última associação do asset (se houver)
    SELECT id INTO last_assoc_id
    FROM asset_client_assoc
    WHERE asset_id = NEW.uuid
    ORDER BY entry_date DESC, id DESC
    LIMIT 1;

    -- Registra o log no histórico
    INSERT INTO asset_logs (
      assoc_id,
      date,
      event,
      details,
      status_before_id,
      status_after_id
    )
    VALUES (
      last_assoc_id,
      NOW(),
      'STATUS_UPDATED',
      jsonb_build_object(
        'user_id', coalesce(auth.uid(), '00000000-0000-0000-0000-000000000000'),
        'username', coalesce(current_setting('request.jwt.claim.sub', true), 'system'),
        'line_number', (select line_number from assets where uuid = new.uuid),
        'radio', (select radio from assets where uuid = new.uuid),
        'solution', (select solution from asset_solutions where id = asset_solution_id),
        'solution_id', asset_solution_id,
        'old_status', (select status from asset_status where id = OLD.status_id),
        'old_status_id', OLD.status_id,
        'new_status', (select status from asset_status where id = NEW.status_id),
        'new_status_id', NEW.status_id,
        'event_description', 'Status do ativo atualizado'
      ),
      OLD.status_id,
      NEW.status_id
    );
  END IF;

  RETURN NEW;
END;$$;


ALTER FUNCTION "public"."log_asset_status_change"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."log_client_changes"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
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
$$;


ALTER FUNCTION "public"."log_client_changes"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."log_profile_change"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$DECLARE
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
END;$$;


ALTER FUNCTION "public"."log_profile_change"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."prevent_rented_association"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
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
  WHERE LOWER(status) = 'alocado' 
  LIMIT 1;

  -- Verificar se o asset já está alocado
  IF current_status_id = status_alocado_id THEN
    RAISE EXCEPTION 'Não é possível associar o asset %, pois ele já está alocado (status: %).', 
      NEW.asset_id, current_status_name;
  END IF;

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."prevent_rented_association"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."prevent_rented_association"() IS 'Função corrigida para prevenir associações em ativos já alocados.
- Usa consulta dinâmica de status (não strings hardcoded)
- Versão: 1.0 - Refatoração PRD 28/05/2025';



CREATE OR REPLACE FUNCTION "public"."release_operation_lock"("p_lock_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public, auth'
    AS $$
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
$$;


ALTER FUNCTION "public"."release_operation_lock"("p_lock_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."set_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."status_by_asset_type"() RETURNS TABLE("type" "text", "status" "text", "count" bigint)
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
  RETURN QUERY
  SELECT
    ac.solution AS type,     -- text
    ast.status AS status,    -- text
    COUNT(*) AS count        -- bigint
  FROM assets a
  JOIN asset_solutions ac ON ac.id = a.solution_id
  JOIN asset_status ast ON ast.id = a.status_id
  WHERE a.deleted_at IS NULL
  GROUP BY ac.solution, ast.status;
END;
$$;


ALTER FUNCTION "public"."status_by_asset_type"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_all_rented_days"() RETURNS "jsonb"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public, auth'
    AS $$
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
$$;


ALTER FUNCTION "public"."update_all_rented_days"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_asset_rented_days"("asset_uuid" "text") RETURNS "jsonb"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public, auth'
    AS $$
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
$$;


ALTER FUNCTION "public"."update_asset_rented_days"("asset_uuid" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_generic_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;$$;


ALTER FUNCTION "public"."update_generic_updated_at_column"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_profile_last_login"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
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
$$;


ALTER FUNCTION "public"."update_profile_last_login"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."user_has_profile"("user_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles WHERE id = user_id
  );
END;
$$;


ALTER FUNCTION "public"."user_has_profile"("user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_active_uuid"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$DECLARE
    asset_count INT;
BEGIN
    SET LOCAL search_path TO public;

    -- Verificar se o asset existe
    SELECT COUNT(*) INTO asset_count
    FROM assets
    WHERE uuid = NEW.asset_id;

    IF asset_count = 0 THEN
        RAISE EXCEPTION 'O asset_id % não existe na tabela assets.', NEW.asset_id
        USING HINT = 'Certifique-se de cadastrar o asset antes de associá-lo a um cliente';
    END IF;

    RETURN NEW;
END;$$;


ALTER FUNCTION "public"."validate_active_uuid"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_association_state"("p_asset_id" "text", "p_operation" "text", "p_association_id" bigint DEFAULT NULL::bigint) RETURNS "jsonb"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public, auth'
    AS $$
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
$$;


ALTER FUNCTION "public"."validate_association_state"("p_asset_id" "text", "p_operation" "text", "p_association_id" bigint) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_rented_days_integrity"() RETURNS TABLE("asset_id" "text", "current_rented_days" integer, "calculated_days" integer, "is_consistent" boolean, "message" "text")
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public, auth'
    AS $$
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
$$;


ALTER FUNCTION "public"."validate_rented_days_integrity"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."asset_client_assoc" (
    "id" bigint NOT NULL,
    "asset_id" "text" NOT NULL,
    "client_id" "text" NOT NULL,
    "entry_date" "date" NOT NULL,
    "exit_date" "date",
    "association_id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone,
    "plan_id" bigint,
    "gb" bigint DEFAULT '0'::bigint,
    "notes" "text",
    "ssid" "text",
    "pass" "text"
);


ALTER TABLE "public"."asset_client_assoc" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."asset_client_assoc_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."asset_client_assoc_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."asset_client_assoc_id_seq" OWNED BY "public"."asset_client_assoc"."id";



CREATE TABLE IF NOT EXISTS "public"."asset_logs" (
    "id" bigint NOT NULL,
    "assoc_id" bigint,
    "date" timestamp with time zone,
    "event" "text",
    "details" "jsonb",
    "status_before_id" bigint,
    "status_after_id" bigint,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone
);


ALTER TABLE "public"."asset_logs" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."asset_history_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."asset_history_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."asset_history_id_seq" OWNED BY "public"."asset_logs"."id";



CREATE TABLE IF NOT EXISTS "public"."asset_solutions" (
    "id" bigint NOT NULL,
    "solution" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone
);


ALTER TABLE "public"."asset_solutions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."asset_status" (
    "id" bigint NOT NULL,
    "status" "text" NOT NULL,
    "association" bigint,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone
);


ALTER TABLE "public"."asset_status" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."assets" (
    "uuid" "text" DEFAULT "gen_random_uuid"() NOT NULL,
    "serial_number" "text",
    "line_number" bigint,
    "iccid" "text",
    "model" "text",
    "rented_days" bigint DEFAULT '0'::bigint NOT NULL,
    "radio" "text",
    "manufacturer_id" bigint,
    "status_id" bigint,
    "solution_id" bigint,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone,
    "admin_user" "text" DEFAULT 'admin'::"text" NOT NULL,
    "admin_pass" "text" DEFAULT ''::"text" NOT NULL,
    "plan_id" bigint,
    "ssid_fabrica" "text",
    "pass_fabrica" "text",
    "admin_user_fabrica" "text",
    "admin_pass_fabrica" "text",
    "ssid_atual" "text",
    "pass_atual" "text",
    CONSTRAINT "assets_iccid_check" CHECK (("iccid" ~ '^\d{19,20}$'::"text")),
    CONSTRAINT "chk_assets_rented_days_positive" CHECK (("rented_days" >= 0))
);


ALTER TABLE "public"."assets" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."association_types" (
    "id" bigint NOT NULL,
    "type" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone
);


ALTER TABLE "public"."association_types" OWNER TO "postgres";


ALTER TABLE "public"."association_types" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."association_types_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."bits_badges_catalog" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "icon_url" "text",
    "criteria" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."bits_badges_catalog" OWNER TO "postgres";


COMMENT ON COLUMN "public"."bits_badges_catalog"."icon_url" IS 'URL or identifier for the badge icon';



COMMENT ON COLUMN "public"."bits_badges_catalog"."criteria" IS 'Describes how to earn the badge, e.g., {"type": "referrals_made", "count": 5}';



CREATE TABLE IF NOT EXISTS "public"."bits_campaigns" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "point_multiplier" numeric(5,2),
    "bonus_points" integer,
    "applicable_to" "jsonb",
    "start_date" timestamp with time zone NOT NULL,
    "end_date" timestamp with time zone NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."bits_campaigns" OWNER TO "postgres";


COMMENT ON COLUMN "public"."bits_campaigns"."point_multiplier" IS 'e.g., 1.50 for 1.5x points';



COMMENT ON COLUMN "public"."bits_campaigns"."applicable_to" IS 'Describes what the campaign applies to, e.g., {"type": "all_referrals"} or {"type": "specific_mission", "mission_id": "..."}';



CREATE TABLE IF NOT EXISTS "public"."bits_levels_catalog" (
    "level_number" integer NOT NULL,
    "name" "text" NOT NULL,
    "points_required" integer NOT NULL,
    "benefits" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."bits_levels_catalog" OWNER TO "postgres";


COMMENT ON COLUMN "public"."bits_levels_catalog"."benefits" IS 'Describes benefits of this level, e.g., {"point_multiplier": 1.1, "exclusive_rewards": true}';



CREATE TABLE IF NOT EXISTS "public"."bits_missions_catalog" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "points_reward" integer DEFAULT 0,
    "badge_reward_id" "uuid",
    "criteria" "jsonb",
    "start_date" timestamp with time zone,
    "end_date" timestamp with time zone,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."bits_missions_catalog" OWNER TO "postgres";


COMMENT ON COLUMN "public"."bits_missions_catalog"."criteria" IS 'Describes how to complete the mission, e.g., {"type": "refer_x_friends_in_y_days", "count": 3, "days": 30}';



CREATE TABLE IF NOT EXISTS "public"."bits_points_log" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "points" integer NOT NULL,
    "action_type" "text" NOT NULL,
    "related_referral_id" "uuid",
    "related_reward_id" "uuid",
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone
);


ALTER TABLE "public"."bits_points_log" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."bits_referrals" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "referrer_user_id" "uuid" NOT NULL,
    "referred_name" "text" NOT NULL,
    "referred_company" "text",
    "referred_email" "text" NOT NULL,
    "referred_phone" "text",
    "referral_link_used" "text",
    "status" "public"."bits_referral_status_enum" DEFAULT 'pendente'::"public"."bits_referral_status_enum",
    "points_earned" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "deleted_at" timestamp with time zone,
    "piperun_lead_id" "text",
    "piperun_deal_status" "text",
    "conversion_data" "jsonb"
);


ALTER TABLE "public"."bits_referrals" OWNER TO "postgres";


COMMENT ON COLUMN "public"."bits_referrals"."piperun_lead_id" IS 'Lead ID from Piperun CRM.';



COMMENT ON COLUMN "public"."bits_referrals"."piperun_deal_status" IS 'Deal status from Piperun CRM.';



COMMENT ON COLUMN "public"."bits_referrals"."conversion_data" IS 'Additional data from CRM upon conversion.';



CREATE TABLE IF NOT EXISTS "public"."bits_rewards_catalog" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "points_required" integer NOT NULL,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "deleted_at" timestamp with time zone
);


ALTER TABLE "public"."bits_rewards_catalog" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."bits_user_badges" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "badge_id" "uuid" NOT NULL,
    "earned_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."bits_user_badges" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."bits_user_missions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "mission_id" "uuid" NOT NULL,
    "status" "public"."bits_mission_status_enum" DEFAULT 'in_progress'::"public"."bits_mission_status_enum" NOT NULL,
    "progress" "jsonb",
    "completed_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."bits_user_missions" OWNER TO "postgres";


COMMENT ON COLUMN "public"."bits_user_missions"."progress" IS 'Tracks progress towards mission completion, e.g., {"referrals_made": 2}';



CREATE TABLE IF NOT EXISTS "public"."bits_user_profile_stats" (
    "user_id" "uuid" NOT NULL,
    "current_points_balance" integer DEFAULT 0 NOT NULL,
    "total_points_earned" integer DEFAULT 0 NOT NULL,
    "current_level_number" integer DEFAULT 1 NOT NULL,
    "last_points_activity_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."bits_user_profile_stats" OWNER TO "postgres";


COMMENT ON COLUMN "public"."bits_user_profile_stats"."last_points_activity_at" IS 'Timestamp of the last activity that affected points, useful for expiration logic.';



CREATE TABLE IF NOT EXISTS "public"."bits_user_rewards" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "reward_id" "uuid" NOT NULL,
    "redeemed_at" timestamp with time zone DEFAULT "now"(),
    "points_spent" integer NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone
);


ALTER TABLE "public"."bits_user_rewards" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."client_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "client_id" "text" NOT NULL,
    "event_type" "text" NOT NULL,
    "details" "jsonb",
    "performed_by" "uuid",
    "performed_by_email" "text",
    "date" timestamp with time zone DEFAULT "now"() NOT NULL,
    "old_data" "jsonb",
    "new_data" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."client_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."clients" (
    "uuid" "text" DEFAULT "gen_random_uuid"() NOT NULL,
    "nome" "text" NOT NULL,
    "cnpj" "text",
    "contato" bigint NOT NULL,
    "email" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone,
    "empresa" "text" NOT NULL,
    "responsavel" "text" NOT NULL,
    "telefones" "jsonb" DEFAULT '[]'::"jsonb",
    CONSTRAINT "check_telefones_array" CHECK (("jsonb_typeof"("telefones") = 'array'::"text")),
    CONSTRAINT "email_format_check" CHECK (("email" ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'::"text"))
);


ALTER TABLE "public"."clients" OWNER TO "postgres";


COMMENT ON COLUMN "public"."clients"."empresa" IS 'Nome/Razão social da empresa';



COMMENT ON COLUMN "public"."clients"."responsavel" IS 'Nome do responsável principal';



COMMENT ON COLUMN "public"."clients"."telefones" IS 'Array de telefones em formato JSONB';



CREATE TABLE IF NOT EXISTS "public"."location_types" (
    "id" integer NOT NULL,
    "name" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone
);


ALTER TABLE "public"."location_types" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."location_types_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."location_types_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."location_types_id_seq" OWNED BY "public"."location_types"."id";



CREATE TABLE IF NOT EXISTS "public"."locations" (
    "id" integer NOT NULL,
    "name" "text" NOT NULL,
    "client_id" "text",
    "latitude" numeric(9,6),
    "longitude" numeric(9,6),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "type_id" integer,
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "deleted_at" timestamp with time zone
);


ALTER TABLE "public"."locations" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."locations_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."locations_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."locations_id_seq" OWNED BY "public"."locations"."id";



CREATE TABLE IF NOT EXISTS "public"."manufacturers" (
    "name" "text" NOT NULL,
    "description" "text" DEFAULT ''::"text",
    "website" "text",
    "country" "text",
    "created_at" timestamp with time zone NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "id" bigint NOT NULL,
    "deleted_at" timestamp with time zone
);


ALTER TABLE "public"."manufacturers" OWNER TO "postgres";


ALTER TABLE "public"."manufacturers" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."manufacturers_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."operation_locks" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "operation_type" "text" NOT NULL,
    "resource_id" "text" NOT NULL,
    "user_id" "uuid",
    "acquired_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "expires_at" timestamp with time zone DEFAULT ("now"() + '00:05:00'::interval) NOT NULL,
    "operation_data" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."operation_locks" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."plans" (
    "id" bigint NOT NULL,
    "nome" "text" NOT NULL,
    "tamanho_gb" bigint,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone
);


ALTER TABLE "public"."plans" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."pacotes_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."pacotes_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."pacotes_id_seq" OWNED BY "public"."plans"."id";



CREATE TABLE IF NOT EXISTS "public"."profile_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "changed_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_id" "uuid",
    "email" "text",
    "operation" "text" NOT NULL,
    "table_name" "text" NOT NULL,
    "old_data" "jsonb",
    "new_data" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone,
    CONSTRAINT "profile_logs_operation_check" CHECK (("operation" = ANY (ARRAY['INSERT'::"text", 'UPDATE'::"text", 'DELETE'::"text"])))
);


ALTER TABLE "public"."profile_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "email" "text" NOT NULL,
    "role" "public"."user_role_enum" DEFAULT 'cliente'::"public"."user_role_enum" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "bits_referral_code" "text",
    "is_active" boolean DEFAULT true,
    "is_approved" boolean DEFAULT true,
    "last_login" timestamp with time zone,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone,
    "username" "text" NOT NULL
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


COMMENT ON COLUMN "public"."profiles"."username" IS 'Nome de usuário';



ALTER TABLE "public"."asset_solutions" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."solution_types_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



ALTER TABLE "public"."asset_status" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."status_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE OR REPLACE VIEW "public"."v_active_clients" WITH ("security_invoker"='on') AS
 SELECT DISTINCT "asset_client_assoc"."client_id"
   FROM "public"."asset_client_assoc"
  WHERE (("asset_client_assoc"."exit_date" IS NULL) OR ("asset_client_assoc"."exit_date" > "now"()));


ALTER TABLE "public"."v_active_clients" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."v_problem_assets" WITH ("security_invoker"='on') AS
 SELECT "a"."uuid",
    "a"."solution_id",
    "a"."line_number",
    "a"."radio",
    "s"."status" AS "status_name",
    "a"."status_id"
   FROM ("public"."assets" "a"
     JOIN "public"."asset_status" "s" ON (("a"."status_id" = "s"."id")))
  WHERE ("s"."id" > 3);


ALTER TABLE "public"."v_problem_assets" OWNER TO "postgres";


ALTER TABLE ONLY "public"."asset_client_assoc" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."asset_client_assoc_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."asset_logs" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."asset_history_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."location_types" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."location_types_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."locations" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."locations_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."plans" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."pacotes_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."asset_client_assoc"
    ADD CONSTRAINT "asset_client_assoc_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."asset_logs"
    ADD CONSTRAINT "asset_history_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."assets"
    ADD CONSTRAINT "assets_iccid_key" UNIQUE ("iccid");



ALTER TABLE ONLY "public"."assets"
    ADD CONSTRAINT "assets_pkey" PRIMARY KEY ("uuid");



ALTER TABLE ONLY "public"."assets"
    ADD CONSTRAINT "assets_serial_number_key" UNIQUE ("serial_number");



ALTER TABLE ONLY "public"."association_types"
    ADD CONSTRAINT "association_types_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."association_types"
    ADD CONSTRAINT "association_types_type_key" UNIQUE ("type");



ALTER TABLE ONLY "public"."bits_badges_catalog"
    ADD CONSTRAINT "bits_badges_catalog_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."bits_campaigns"
    ADD CONSTRAINT "bits_campaigns_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."bits_levels_catalog"
    ADD CONSTRAINT "bits_levels_catalog_pkey" PRIMARY KEY ("level_number");



ALTER TABLE ONLY "public"."bits_missions_catalog"
    ADD CONSTRAINT "bits_missions_catalog_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."bits_points_log"
    ADD CONSTRAINT "bits_points_log_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."bits_referrals"
    ADD CONSTRAINT "bits_referrals_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."bits_rewards_catalog"
    ADD CONSTRAINT "bits_rewards_catalog_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."bits_user_badges"
    ADD CONSTRAINT "bits_user_badges_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."bits_user_badges"
    ADD CONSTRAINT "bits_user_badges_user_id_badge_id_key" UNIQUE ("user_id", "badge_id");



ALTER TABLE ONLY "public"."bits_user_missions"
    ADD CONSTRAINT "bits_user_missions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."bits_user_missions"
    ADD CONSTRAINT "bits_user_missions_user_id_mission_id_key" UNIQUE ("user_id", "mission_id");



ALTER TABLE ONLY "public"."bits_user_profile_stats"
    ADD CONSTRAINT "bits_user_profile_stats_pkey" PRIMARY KEY ("user_id");



ALTER TABLE ONLY "public"."bits_user_rewards"
    ADD CONSTRAINT "bits_user_rewards_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."client_logs"
    ADD CONSTRAINT "client_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."clients"
    ADD CONSTRAINT "clients_contato_key" UNIQUE ("contato");



ALTER TABLE ONLY "public"."clients"
    ADD CONSTRAINT "clients_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."clients"
    ADD CONSTRAINT "clients_nome_key" UNIQUE ("nome");



ALTER TABLE ONLY "public"."clients"
    ADD CONSTRAINT "clients_pkey" PRIMARY KEY ("uuid");



ALTER TABLE ONLY "public"."location_types"
    ADD CONSTRAINT "location_types_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."location_types"
    ADD CONSTRAINT "location_types_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."locations"
    ADD CONSTRAINT "locations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."manufacturers"
    ADD CONSTRAINT "manufacturers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."operation_locks"
    ADD CONSTRAINT "operation_locks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."plans"
    ADD CONSTRAINT "pacotes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profile_logs"
    ADD CONSTRAINT "profile_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_bits_referral_code_key" UNIQUE ("bits_referral_code");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_username_key" UNIQUE ("username");



ALTER TABLE ONLY "public"."asset_solutions"
    ADD CONSTRAINT "solution_types_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."asset_solutions"
    ADD CONSTRAINT "solution_types_solution_key" UNIQUE ("solution");



ALTER TABLE ONLY "public"."asset_status"
    ADD CONSTRAINT "status_id_key" UNIQUE ("id");



ALTER TABLE ONLY "public"."asset_status"
    ADD CONSTRAINT "status_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."asset_status"
    ADD CONSTRAINT "status_status_key" UNIQUE ("status");



CREATE INDEX "asset_client_assoc_asset_id_idx" ON "public"."asset_client_assoc" USING "btree" ("asset_id");



CREATE INDEX "asset_client_assoc_client_id_idx" ON "public"."asset_client_assoc" USING "btree" ("client_id");



CREATE INDEX "asset_history_assoc_id_index" ON "public"."asset_logs" USING "btree" ("assoc_id");



CREATE INDEX "idx_asset_client_assoc_exit_date" ON "public"."asset_client_assoc" USING "btree" ("exit_date");



CREATE UNIQUE INDEX "idx_assets_radio_unique_not_null" ON "public"."assets" USING "btree" ("radio") WHERE ("radio" IS NOT NULL);



CREATE INDEX "idx_client_logs_client_id" ON "public"."client_logs" USING "btree" ("client_id");



CREATE INDEX "idx_client_logs_date" ON "public"."client_logs" USING "btree" ("date" DESC);



CREATE INDEX "idx_client_logs_event_type" ON "public"."client_logs" USING "btree" ("event_type");



CREATE INDEX "idx_operation_locks_expires" ON "public"."operation_locks" USING "btree" ("expires_at");



CREATE INDEX "idx_operation_locks_resource" ON "public"."operation_locks" USING "btree" ("resource_id", "operation_type");



CREATE INDEX "profile_logs_email_idx" ON "public"."profile_logs" USING "btree" ("email");



CREATE INDEX "profile_logs_operation_idx" ON "public"."profile_logs" USING "btree" ("operation");



CREATE INDEX "profile_logs_user_id_idx" ON "public"."profile_logs" USING "btree" ("user_id");



CREATE INDEX "profiles_email_idx" ON "public"."profiles" USING "btree" ("email");



CREATE INDEX "profiles_role_active_idx" ON "public"."profiles" USING "btree" ("role", "is_active");



CREATE INDEX "profiles_role_idx" ON "public"."profiles" USING "btree" ("role");



CREATE OR REPLACE TRIGGER "asset_client_assoc_log_trigger" AFTER INSERT OR DELETE OR UPDATE ON "public"."asset_client_assoc" FOR EACH ROW EXECUTE FUNCTION "public"."log_profile_change"();



CREATE OR REPLACE TRIGGER "asset_client_assoc_status_log_trigger" AFTER INSERT OR DELETE OR UPDATE ON "public"."asset_client_assoc" FOR EACH ROW EXECUTE FUNCTION "public"."log_and_update_status"();



CREATE OR REPLACE TRIGGER "asset_histories_log_trigger" AFTER INSERT OR UPDATE ON "public"."asset_logs" FOR EACH ROW EXECUTE FUNCTION "public"."log_profile_change"();



CREATE OR REPLACE TRIGGER "asset_histories_log_trigger_before_delete" BEFORE DELETE ON "public"."asset_logs" FOR EACH ROW EXECUTE FUNCTION "public"."log_profile_change"();



CREATE OR REPLACE TRIGGER "asset_status_update_history" AFTER UPDATE OF "status_id" ON "public"."assets" FOR EACH ROW EXECUTE FUNCTION "public"."log_asset_status_change"();



CREATE OR REPLACE TRIGGER "assets_after_insert" AFTER INSERT ON "public"."assets" FOR EACH ROW EXECUTE FUNCTION "public"."log_asset_insert"();



CREATE OR REPLACE TRIGGER "assets_log_trigger" AFTER INSERT OR DELETE OR UPDATE ON "public"."assets" FOR EACH ROW EXECUTE FUNCTION "public"."log_profile_change"();



CREATE OR REPLACE TRIGGER "check_availability_before_association" BEFORE INSERT OR UPDATE ON "public"."asset_client_assoc" FOR EACH ROW EXECUTE FUNCTION "public"."check_asset_availability"();



CREATE OR REPLACE TRIGGER "client_changes_trigger" AFTER INSERT OR DELETE OR UPDATE ON "public"."clients" FOR EACH ROW EXECUTE FUNCTION "public"."log_client_changes"();



CREATE OR REPLACE TRIGGER "client_logs_updated_at_trigger" BEFORE UPDATE ON "public"."client_logs" FOR EACH ROW EXECUTE FUNCTION "public"."update_generic_updated_at_column"();



CREATE OR REPLACE TRIGGER "clients_log_trigger" AFTER INSERT OR DELETE OR UPDATE ON "public"."clients" FOR EACH ROW EXECUTE FUNCTION "public"."log_profile_change"();



CREATE OR REPLACE TRIGGER "handle_bits_referrals_updated_at" BEFORE UPDATE ON "public"."bits_referrals" FOR EACH ROW EXECUTE FUNCTION "public"."update_generic_updated_at_column"();



CREATE OR REPLACE TRIGGER "handle_bits_rewards_catalog_updated_at" BEFORE UPDATE ON "public"."bits_rewards_catalog" FOR EACH ROW EXECUTE FUNCTION "public"."update_generic_updated_at_column"();



CREATE OR REPLACE TRIGGER "log_and_update_status_on_status_change" AFTER INSERT OR UPDATE ON "public"."asset_client_assoc" FOR EACH ROW EXECUTE FUNCTION "public"."log_and_update_status"();



CREATE OR REPLACE TRIGGER "plans_log_trigger" AFTER INSERT OR DELETE OR UPDATE ON "public"."plans" FOR EACH ROW EXECUTE FUNCTION "public"."log_profile_change"();



CREATE OR REPLACE TRIGGER "prevent_rented_association_before" BEFORE INSERT ON "public"."asset_client_assoc" FOR EACH ROW EXECUTE FUNCTION "public"."prevent_rented_association"();



CREATE OR REPLACE TRIGGER "profiles_log_trigger" AFTER INSERT OR DELETE OR UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."log_profile_change"();



CREATE OR REPLACE TRIGGER "set_asset_client_assoc_updated_at" BEFORE UPDATE ON "public"."asset_client_assoc" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_asset_logs_updated_at" BEFORE UPDATE ON "public"."asset_logs" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_asset_solutions_updated_at" BEFORE UPDATE ON "public"."asset_solutions" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_asset_status_updated_at" BEFORE UPDATE ON "public"."asset_status" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_assets_updated_at" BEFORE UPDATE ON "public"."assets" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_association_types_updated_at" BEFORE UPDATE ON "public"."association_types" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_bits_badges_catalog_updated_at" BEFORE UPDATE ON "public"."bits_badges_catalog" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_bits_campaigns_updated_at" BEFORE UPDATE ON "public"."bits_campaigns" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_bits_levels_catalog_updated_at" BEFORE UPDATE ON "public"."bits_levels_catalog" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_bits_missions_catalog_updated_at" BEFORE UPDATE ON "public"."bits_missions_catalog" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_bits_points_log_updated_at" BEFORE UPDATE ON "public"."bits_points_log" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_bits_referrals_updated_at" BEFORE UPDATE ON "public"."bits_referrals" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_bits_rewards_catalog_updated_at" BEFORE UPDATE ON "public"."bits_rewards_catalog" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_bits_user_badges_updated_at" BEFORE UPDATE ON "public"."bits_user_badges" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_bits_user_missions_updated_at" BEFORE UPDATE ON "public"."bits_user_missions" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_bits_user_profile_stats_updated_at" BEFORE UPDATE ON "public"."bits_user_profile_stats" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_bits_user_rewards_updated_at" BEFORE UPDATE ON "public"."bits_user_rewards" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_clients_updated_at" BEFORE UPDATE ON "public"."clients" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_location_types_updated_at" BEFORE UPDATE ON "public"."location_types" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_locations_updated_at" BEFORE UPDATE ON "public"."locations" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_manufacturers_updated_at" BEFORE UPDATE ON "public"."manufacturers" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_plans_updated_at" BEFORE UPDATE ON "public"."plans" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_profile_logs_updated_at" BEFORE UPDATE ON "public"."profile_logs" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_profiles_updated_at" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_log_asset_soft_delete" AFTER UPDATE ON "public"."assets" FOR EACH ROW WHEN ((("old"."deleted_at" IS NULL) AND ("new"."deleted_at" IS NOT NULL))) EXECUTE FUNCTION "public"."log_asset_soft_delete"();



CREATE OR REPLACE TRIGGER "update_locations_updated_at" BEFORE UPDATE ON "public"."locations" FOR EACH ROW EXECUTE FUNCTION "public"."update_generic_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_manufacturer_updated_at" BEFORE UPDATE ON "public"."manufacturers" FOR EACH ROW EXECUTE FUNCTION "public"."update_generic_updated_at_column"();



CREATE OR REPLACE TRIGGER "validate_active_uuid_on_change" BEFORE INSERT OR UPDATE ON "public"."asset_client_assoc" FOR EACH ROW EXECUTE FUNCTION "public"."validate_active_uuid"();



ALTER TABLE ONLY "public"."asset_client_assoc"
    ADD CONSTRAINT "asset_client_assoc_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "public"."assets"("uuid") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."asset_client_assoc"
    ADD CONSTRAINT "asset_client_assoc_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("uuid") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."asset_client_assoc"
    ADD CONSTRAINT "asset_client_assoc_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."assets"
    ADD CONSTRAINT "assets_manufacturer_id_fkey" FOREIGN KEY ("manufacturer_id") REFERENCES "public"."manufacturers"("id") ON UPDATE CASCADE ON DELETE SET NULL;



ALTER TABLE ONLY "public"."assets"
    ADD CONSTRAINT "assets_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."bits_missions_catalog"
    ADD CONSTRAINT "bits_missions_catalog_badge_reward_id_fkey" FOREIGN KEY ("badge_reward_id") REFERENCES "public"."bits_badges_catalog"("id");



ALTER TABLE ONLY "public"."bits_points_log"
    ADD CONSTRAINT "bits_points_log_related_referral_id_fkey" FOREIGN KEY ("related_referral_id") REFERENCES "public"."bits_referrals"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."bits_points_log"
    ADD CONSTRAINT "bits_points_log_related_reward_id_fkey" FOREIGN KEY ("related_reward_id") REFERENCES "public"."bits_rewards_catalog"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."bits_points_log"
    ADD CONSTRAINT "bits_points_log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."bits_referrals"
    ADD CONSTRAINT "bits_referrals_referrer_user_id_fkey" FOREIGN KEY ("referrer_user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."bits_user_badges"
    ADD CONSTRAINT "bits_user_badges_badge_id_fkey" FOREIGN KEY ("badge_id") REFERENCES "public"."bits_badges_catalog"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."bits_user_badges"
    ADD CONSTRAINT "bits_user_badges_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."bits_user_missions"
    ADD CONSTRAINT "bits_user_missions_mission_id_fkey" FOREIGN KEY ("mission_id") REFERENCES "public"."bits_missions_catalog"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."bits_user_missions"
    ADD CONSTRAINT "bits_user_missions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."bits_user_profile_stats"
    ADD CONSTRAINT "bits_user_profile_stats_current_level_number_fkey" FOREIGN KEY ("current_level_number") REFERENCES "public"."bits_levels_catalog"("level_number");



ALTER TABLE ONLY "public"."bits_user_profile_stats"
    ADD CONSTRAINT "bits_user_profile_stats_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."bits_user_rewards"
    ADD CONSTRAINT "bits_user_rewards_reward_id_fkey" FOREIGN KEY ("reward_id") REFERENCES "public"."bits_rewards_catalog"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."bits_user_rewards"
    ADD CONSTRAINT "bits_user_rewards_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."asset_logs"
    ADD CONSTRAINT "fk_asset_history_status_after" FOREIGN KEY ("status_after_id") REFERENCES "public"."asset_status"("id");



ALTER TABLE ONLY "public"."asset_logs"
    ADD CONSTRAINT "fk_asset_history_status_before" FOREIGN KEY ("status_before_id") REFERENCES "public"."asset_status"("id");



ALTER TABLE ONLY "public"."asset_logs"
    ADD CONSTRAINT "fk_asset_logs_assoc_id" FOREIGN KEY ("assoc_id") REFERENCES "public"."asset_client_assoc"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."asset_logs"
    ADD CONSTRAINT "fk_asset_logs_status_after" FOREIGN KEY ("status_after_id") REFERENCES "public"."asset_status"("id");



ALTER TABLE ONLY "public"."asset_logs"
    ADD CONSTRAINT "fk_asset_logs_status_before" FOREIGN KEY ("status_before_id") REFERENCES "public"."asset_status"("id");



ALTER TABLE ONLY "public"."assets"
    ADD CONSTRAINT "fk_assets_solutions" FOREIGN KEY ("solution_id") REFERENCES "public"."asset_solutions"("id");



ALTER TABLE ONLY "public"."assets"
    ADD CONSTRAINT "fk_assets_status" FOREIGN KEY ("status_id") REFERENCES "public"."asset_status"("id");



ALTER TABLE ONLY "public"."asset_client_assoc"
    ADD CONSTRAINT "fk_assoc_association_type" FOREIGN KEY ("association_id") REFERENCES "public"."association_types"("id");



ALTER TABLE ONLY "public"."locations"
    ADD CONSTRAINT "locations_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("uuid") ON UPDATE CASCADE ON DELETE SET NULL;



ALTER TABLE ONLY "public"."locations"
    ADD CONSTRAINT "locations_type_id_fkey" FOREIGN KEY ("type_id") REFERENCES "public"."location_types"("id");



ALTER TABLE ONLY "public"."operation_locks"
    ADD CONSTRAINT "operation_locks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."profile_logs"
    ADD CONSTRAINT "profile_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."asset_status"
    ADD CONSTRAINT "status_association_fkey" FOREIGN KEY ("association") REFERENCES "public"."association_types"("id") ON UPDATE CASCADE ON DELETE SET NULL;



CREATE POLICY "Admins can do everything with referrals" ON "public"."bits_referrals" TO "authenticated" USING ("public"."has_role"('admin'::"public"."user_role_enum"));



CREATE POLICY "Admins can insert profile logs" ON "public"."profile_logs" FOR INSERT TO "authenticated" WITH CHECK ("public"."has_role"('admin'::"public"."user_role_enum"));



CREATE POLICY "Admins can manage all points logs" ON "public"."bits_points_log" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admins can manage all referrals" ON "public"."bits_referrals" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admins can manage all user rewards" ON "public"."bits_user_rewards" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admins can manage rewards catalog" ON "public"."bits_rewards_catalog" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admins can view all profile logs" ON "public"."profile_logs" FOR SELECT TO "authenticated" USING ("public"."has_role"('admin'::"public"."user_role_enum"));



CREATE POLICY "Afiliados can manage their own redeemed rewards" ON "public"."bits_user_rewards" USING ((("user_id" = "auth"."uid"()) AND "public"."is_afiliado"())) WITH CHECK ((("user_id" = "auth"."uid"()) AND "public"."is_afiliado"()));



CREATE POLICY "Afiliados can manage their own referrals" ON "public"."bits_referrals" USING ((("referrer_user_id" = "auth"."uid"()) AND "public"."is_afiliado"())) WITH CHECK ((("referrer_user_id" = "auth"."uid"()) AND "public"."is_afiliado"()));



CREATE POLICY "Afiliados can view their own points log" ON "public"."bits_points_log" FOR SELECT USING ((("user_id" = "auth"."uid"()) AND "public"."is_afiliado"()));



CREATE POLICY "Auth users can insert" ON "public"."asset_client_assoc" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Auth users can insert" ON "public"."asset_logs" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Auth users can insert" ON "public"."assets" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Auth users can insert" ON "public"."client_logs" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Auth users can insert" ON "public"."clients" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Auth users can update" ON "public"."asset_client_assoc" FOR UPDATE TO "authenticated" USING (true);



CREATE POLICY "Auth users can update" ON "public"."asset_logs" FOR UPDATE TO "authenticated" USING (true);



CREATE POLICY "Auth users can update" ON "public"."assets" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Auth users can update" ON "public"."client_logs" FOR UPDATE TO "authenticated" USING (true);



CREATE POLICY "Auth users can update" ON "public"."clients" FOR UPDATE TO "authenticated" USING (true);



CREATE POLICY "Authenticated users can read active campaigns" ON "public"."bits_campaigns" FOR SELECT TO "authenticated" USING (("is_active" = true));



CREATE POLICY "Authenticated users can read badges catalog" ON "public"."bits_badges_catalog" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Authenticated users can read levels catalog" ON "public"."bits_levels_catalog" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Authenticated users can read missions catalog" ON "public"."bits_missions_catalog" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Authenticated users can view rewards catalog" ON "public"."bits_rewards_catalog" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Clientes can create referrals" ON "public"."bits_referrals" FOR INSERT TO "authenticated" WITH CHECK (("referrer_user_id" = "auth"."uid"()));



CREATE POLICY "Clientes can view their own referrals" ON "public"."bits_referrals" FOR SELECT TO "authenticated" USING (("referrer_user_id" = "auth"."uid"()));



CREATE POLICY "Enable read access for all users" ON "public"."asset_client_assoc" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."asset_logs" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."asset_solutions" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."asset_status" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."assets" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."association_types" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."client_logs" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."clients" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."location_types" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."locations" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."manufacturers" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."plans" FOR SELECT USING (true);



CREATE POLICY "Enable read your data access for all users" ON "public"."profiles" FOR SELECT USING ("public"."is_user_self"("id"));



CREATE POLICY "Suporte can manage all referrals" ON "public"."bits_referrals" TO "authenticated" USING ("public"."has_role"('suporte'::"public"."user_role_enum"));



CREATE POLICY "Users can create locks or admins can create any" ON "public"."operation_locks" FOR INSERT TO "authenticated" WITH CHECK ((("user_id" = "auth"."uid"()) OR "public"."has_minimum_role"('admin'::"public"."user_role_enum")));



CREATE POLICY "Users can delete their own locks or admins can delete any" ON "public"."operation_locks" FOR DELETE TO "authenticated" USING ((("user_id" = "auth"."uid"()) OR "public"."has_minimum_role"('admin'::"public"."user_role_enum")));



CREATE POLICY "Users can update their own locks or admins can update any" ON "public"."operation_locks" FOR UPDATE TO "authenticated" USING ((("user_id" = "auth"."uid"()) OR "public"."has_minimum_role"('admin'::"public"."user_role_enum"))) WITH CHECK ((("user_id" = "auth"."uid"()) OR "public"."has_minimum_role"('admin'::"public"."user_role_enum")));



CREATE POLICY "Users can update their own mission progress" ON "public"."bits_user_missions" FOR UPDATE USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own earned badges" ON "public"."bits_user_badges" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own locks or admins can view all" ON "public"."operation_locks" FOR SELECT TO "authenticated" USING ((("user_id" = "auth"."uid"()) OR "public"."has_minimum_role"('admin'::"public"."user_role_enum") OR ("user_id" IS NULL)));



CREATE POLICY "Users can view their own missions" ON "public"."bits_user_missions" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own profile stats" ON "public"."bits_user_profile_stats" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "admin_total_access" ON "public"."asset_client_assoc" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "admin_total_access" ON "public"."asset_logs" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "admin_total_access" ON "public"."asset_solutions" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "admin_total_access" ON "public"."asset_status" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "admin_total_access" ON "public"."assets" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "admin_total_access" ON "public"."association_types" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "admin_total_access" ON "public"."client_logs" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "admin_total_access" ON "public"."clients" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "admin_total_access" ON "public"."location_types" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "admin_total_access" ON "public"."locations" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "admin_total_access" ON "public"."manufacturers" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "admin_total_access" ON "public"."plans" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "admin_total_access" ON "public"."profile_logs" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "admin_total_access" ON "public"."profiles" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



ALTER TABLE "public"."asset_client_assoc" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."asset_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."asset_solutions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."asset_status" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."assets" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."association_types" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."bits_badges_catalog" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."bits_campaigns" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."bits_levels_catalog" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."bits_missions_catalog" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."bits_points_log" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."bits_referrals" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."bits_rewards_catalog" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."bits_user_badges" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."bits_user_missions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."bits_user_profile_stats" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."bits_user_rewards" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."client_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."clients" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."location_types" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."locations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."manufacturers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."operation_locks" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."plans" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profile_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";











































































































































































GRANT ALL ON FUNCTION "public"."acquire_operation_lock"("p_operation_type" "text", "p_resource_id" "text", "p_operation_data" "jsonb", "p_timeout_minutes" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."acquire_operation_lock"("p_operation_type" "text", "p_resource_id" "text", "p_operation_data" "jsonb", "p_timeout_minutes" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."acquire_operation_lock"("p_operation_type" "text", "p_resource_id" "text", "p_operation_data" "jsonb", "p_timeout_minutes" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."add_assets_to_association"("p_client_id" "text", "p_association_id" bigint, "p_entry_date" "date", "p_asset_ids" "text"[], "p_exit_date" "date", "p_notes" "text", "p_ssid" "text", "p_pass" "text", "p_gb" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."add_assets_to_association"("p_client_id" "text", "p_association_id" bigint, "p_entry_date" "date", "p_asset_ids" "text"[], "p_exit_date" "date", "p_notes" "text", "p_ssid" "text", "p_pass" "text", "p_gb" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."add_assets_to_association"("p_client_id" "text", "p_association_id" bigint, "p_entry_date" "date", "p_asset_ids" "text"[], "p_exit_date" "date", "p_notes" "text", "p_ssid" "text", "p_pass" "text", "p_gb" bigint) TO "service_role";



GRANT ALL ON FUNCTION "public"."admin_delete_user"("user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."admin_delete_user"("user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."admin_delete_user"("user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."admin_list_users"() TO "anon";
GRANT ALL ON FUNCTION "public"."admin_list_users"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."admin_list_users"() TO "service_role";



GRANT ALL ON FUNCTION "public"."admin_update_user_profile"("user_id" "uuid", "profile_updates" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."admin_update_user_profile"("user_id" "uuid", "profile_updates" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."admin_update_user_profile"("user_id" "uuid", "profile_updates" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."admin_update_user_role"("user_id" "uuid", "new_role" "public"."user_role_enum") TO "anon";
GRANT ALL ON FUNCTION "public"."admin_update_user_role"("user_id" "uuid", "new_role" "public"."user_role_enum") TO "authenticated";
GRANT ALL ON FUNCTION "public"."admin_update_user_role"("user_id" "uuid", "new_role" "public"."user_role_enum") TO "service_role";



GRANT ALL ON FUNCTION "public"."check_asset_availability"() TO "anon";
GRANT ALL ON FUNCTION "public"."check_asset_availability"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_asset_availability"() TO "service_role";



GRANT ALL ON FUNCTION "public"."cleanup_expired_locks"() TO "anon";
GRANT ALL ON FUNCTION "public"."cleanup_expired_locks"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."cleanup_expired_locks"() TO "service_role";



GRANT ALL ON FUNCTION "public"."detect_association_inconsistencies"() TO "anon";
GRANT ALL ON FUNCTION "public"."detect_association_inconsistencies"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."detect_association_inconsistencies"() TO "service_role";



GRANT ALL ON FUNCTION "public"."ensure_user_profile"("user_id" "uuid", "user_email" "text", "user_role" "public"."user_role_enum") TO "anon";
GRANT ALL ON FUNCTION "public"."ensure_user_profile"("user_id" "uuid", "user_email" "text", "user_role" "public"."user_role_enum") TO "authenticated";
GRANT ALL ON FUNCTION "public"."ensure_user_profile"("user_id" "uuid", "user_email" "text", "user_role" "public"."user_role_enum") TO "service_role";



GRANT ALL ON FUNCTION "public"."fix_missing_profiles"() TO "anon";
GRANT ALL ON FUNCTION "public"."fix_missing_profiles"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."fix_missing_profiles"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."has_minimum_role"("required_role" "public"."user_role_enum") TO "anon";
GRANT ALL ON FUNCTION "public"."has_minimum_role"("required_role" "public"."user_role_enum") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_minimum_role"("required_role" "public"."user_role_enum") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_role"("role_name" "public"."user_role_enum") TO "anon";
GRANT ALL ON FUNCTION "public"."has_role"("role_name" "public"."user_role_enum") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_role"("role_name" "public"."user_role_enum") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_admin"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_afiliado"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_afiliado"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_afiliado"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_support_or_above"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_support_or_above"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_support_or_above"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_user_self"("profile_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_user_self"("profile_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_user_self"("profile_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."log_and_update_status"() TO "anon";
GRANT ALL ON FUNCTION "public"."log_and_update_status"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."log_and_update_status"() TO "service_role";



GRANT ALL ON FUNCTION "public"."log_asset_insert"() TO "anon";
GRANT ALL ON FUNCTION "public"."log_asset_insert"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."log_asset_insert"() TO "service_role";



GRANT ALL ON FUNCTION "public"."log_asset_soft_delete"() TO "anon";
GRANT ALL ON FUNCTION "public"."log_asset_soft_delete"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."log_asset_soft_delete"() TO "service_role";



GRANT ALL ON FUNCTION "public"."log_asset_status_change"() TO "anon";
GRANT ALL ON FUNCTION "public"."log_asset_status_change"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."log_asset_status_change"() TO "service_role";



GRANT ALL ON FUNCTION "public"."log_client_changes"() TO "anon";
GRANT ALL ON FUNCTION "public"."log_client_changes"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."log_client_changes"() TO "service_role";



GRANT ALL ON FUNCTION "public"."log_profile_change"() TO "anon";
GRANT ALL ON FUNCTION "public"."log_profile_change"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."log_profile_change"() TO "service_role";



GRANT ALL ON FUNCTION "public"."prevent_rented_association"() TO "anon";
GRANT ALL ON FUNCTION "public"."prevent_rented_association"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."prevent_rented_association"() TO "service_role";



GRANT ALL ON FUNCTION "public"."release_operation_lock"("p_lock_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."release_operation_lock"("p_lock_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."release_operation_lock"("p_lock_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."status_by_asset_type"() TO "anon";
GRANT ALL ON FUNCTION "public"."status_by_asset_type"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."status_by_asset_type"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_all_rented_days"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_all_rented_days"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_all_rented_days"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_asset_rented_days"("asset_uuid" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."update_asset_rented_days"("asset_uuid" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_asset_rented_days"("asset_uuid" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_generic_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_generic_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_generic_updated_at_column"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_profile_last_login"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_profile_last_login"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_profile_last_login"() TO "service_role";



GRANT ALL ON FUNCTION "public"."user_has_profile"("user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."user_has_profile"("user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."user_has_profile"("user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_active_uuid"() TO "anon";
GRANT ALL ON FUNCTION "public"."validate_active_uuid"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_active_uuid"() TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_association_state"("p_asset_id" "text", "p_operation" "text", "p_association_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."validate_association_state"("p_asset_id" "text", "p_operation" "text", "p_association_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_association_state"("p_asset_id" "text", "p_operation" "text", "p_association_id" bigint) TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_rented_days_integrity"() TO "anon";
GRANT ALL ON FUNCTION "public"."validate_rented_days_integrity"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_rented_days_integrity"() TO "service_role";


















GRANT ALL ON TABLE "public"."asset_client_assoc" TO "anon";
GRANT ALL ON TABLE "public"."asset_client_assoc" TO "authenticated";
GRANT ALL ON TABLE "public"."asset_client_assoc" TO "service_role";



GRANT ALL ON SEQUENCE "public"."asset_client_assoc_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."asset_client_assoc_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."asset_client_assoc_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."asset_logs" TO "anon";
GRANT ALL ON TABLE "public"."asset_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."asset_logs" TO "service_role";



GRANT ALL ON SEQUENCE "public"."asset_history_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."asset_history_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."asset_history_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."asset_solutions" TO "anon";
GRANT ALL ON TABLE "public"."asset_solutions" TO "authenticated";
GRANT ALL ON TABLE "public"."asset_solutions" TO "service_role";



GRANT ALL ON TABLE "public"."asset_status" TO "anon";
GRANT ALL ON TABLE "public"."asset_status" TO "authenticated";
GRANT ALL ON TABLE "public"."asset_status" TO "service_role";



GRANT ALL ON TABLE "public"."assets" TO "anon";
GRANT ALL ON TABLE "public"."assets" TO "authenticated";
GRANT ALL ON TABLE "public"."assets" TO "service_role";



GRANT ALL ON TABLE "public"."association_types" TO "anon";
GRANT ALL ON TABLE "public"."association_types" TO "authenticated";
GRANT ALL ON TABLE "public"."association_types" TO "service_role";



GRANT ALL ON SEQUENCE "public"."association_types_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."association_types_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."association_types_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."bits_badges_catalog" TO "anon";
GRANT ALL ON TABLE "public"."bits_badges_catalog" TO "authenticated";
GRANT ALL ON TABLE "public"."bits_badges_catalog" TO "service_role";



GRANT ALL ON TABLE "public"."bits_campaigns" TO "anon";
GRANT ALL ON TABLE "public"."bits_campaigns" TO "authenticated";
GRANT ALL ON TABLE "public"."bits_campaigns" TO "service_role";



GRANT ALL ON TABLE "public"."bits_levels_catalog" TO "anon";
GRANT ALL ON TABLE "public"."bits_levels_catalog" TO "authenticated";
GRANT ALL ON TABLE "public"."bits_levels_catalog" TO "service_role";



GRANT ALL ON TABLE "public"."bits_missions_catalog" TO "anon";
GRANT ALL ON TABLE "public"."bits_missions_catalog" TO "authenticated";
GRANT ALL ON TABLE "public"."bits_missions_catalog" TO "service_role";



GRANT ALL ON TABLE "public"."bits_points_log" TO "anon";
GRANT ALL ON TABLE "public"."bits_points_log" TO "authenticated";
GRANT ALL ON TABLE "public"."bits_points_log" TO "service_role";



GRANT ALL ON TABLE "public"."bits_referrals" TO "anon";
GRANT ALL ON TABLE "public"."bits_referrals" TO "authenticated";
GRANT ALL ON TABLE "public"."bits_referrals" TO "service_role";



GRANT ALL ON TABLE "public"."bits_rewards_catalog" TO "anon";
GRANT ALL ON TABLE "public"."bits_rewards_catalog" TO "authenticated";
GRANT ALL ON TABLE "public"."bits_rewards_catalog" TO "service_role";



GRANT ALL ON TABLE "public"."bits_user_badges" TO "anon";
GRANT ALL ON TABLE "public"."bits_user_badges" TO "authenticated";
GRANT ALL ON TABLE "public"."bits_user_badges" TO "service_role";



GRANT ALL ON TABLE "public"."bits_user_missions" TO "anon";
GRANT ALL ON TABLE "public"."bits_user_missions" TO "authenticated";
GRANT ALL ON TABLE "public"."bits_user_missions" TO "service_role";



GRANT ALL ON TABLE "public"."bits_user_profile_stats" TO "anon";
GRANT ALL ON TABLE "public"."bits_user_profile_stats" TO "authenticated";
GRANT ALL ON TABLE "public"."bits_user_profile_stats" TO "service_role";



GRANT ALL ON TABLE "public"."bits_user_rewards" TO "anon";
GRANT ALL ON TABLE "public"."bits_user_rewards" TO "authenticated";
GRANT ALL ON TABLE "public"."bits_user_rewards" TO "service_role";



GRANT ALL ON TABLE "public"."client_logs" TO "anon";
GRANT ALL ON TABLE "public"."client_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."client_logs" TO "service_role";



GRANT ALL ON TABLE "public"."clients" TO "anon";
GRANT ALL ON TABLE "public"."clients" TO "authenticated";
GRANT ALL ON TABLE "public"."clients" TO "service_role";



GRANT ALL ON TABLE "public"."location_types" TO "anon";
GRANT ALL ON TABLE "public"."location_types" TO "authenticated";
GRANT ALL ON TABLE "public"."location_types" TO "service_role";



GRANT ALL ON SEQUENCE "public"."location_types_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."location_types_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."location_types_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."locations" TO "anon";
GRANT ALL ON TABLE "public"."locations" TO "authenticated";
GRANT ALL ON TABLE "public"."locations" TO "service_role";



GRANT ALL ON SEQUENCE "public"."locations_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."locations_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."locations_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."manufacturers" TO "anon";
GRANT ALL ON TABLE "public"."manufacturers" TO "authenticated";
GRANT ALL ON TABLE "public"."manufacturers" TO "service_role";



GRANT ALL ON SEQUENCE "public"."manufacturers_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."manufacturers_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."manufacturers_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."operation_locks" TO "anon";
GRANT ALL ON TABLE "public"."operation_locks" TO "authenticated";
GRANT ALL ON TABLE "public"."operation_locks" TO "service_role";



GRANT ALL ON TABLE "public"."plans" TO "anon";
GRANT ALL ON TABLE "public"."plans" TO "authenticated";
GRANT ALL ON TABLE "public"."plans" TO "service_role";



GRANT ALL ON SEQUENCE "public"."pacotes_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."pacotes_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."pacotes_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."profile_logs" TO "anon";
GRANT ALL ON TABLE "public"."profile_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."profile_logs" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON SEQUENCE "public"."solution_types_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."solution_types_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."solution_types_id_seq" TO "service_role";



GRANT ALL ON SEQUENCE "public"."status_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."status_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."status_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."v_active_clients" TO "anon";
GRANT ALL ON TABLE "public"."v_active_clients" TO "authenticated";
GRANT ALL ON TABLE "public"."v_active_clients" TO "service_role";



GRANT ALL ON TABLE "public"."v_problem_assets" TO "anon";
GRANT ALL ON TABLE "public"."v_problem_assets" TO "authenticated";
GRANT ALL ON TABLE "public"."v_problem_assets" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;
