

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


CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";






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
    'equipment'
);


ALTER TYPE "public"."asset_type_enum" OWNER TO "postgres";


CREATE TYPE "public"."association_type_enum" AS ENUM (
    'aluguel',
    'assinatura'
);


ALTER TYPE "public"."association_type_enum" OWNER TO "postgres";


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


CREATE OR REPLACE FUNCTION "public"."association_end_logic"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
    association_status_ref bigint;
BEGIN 

    association_status_ref := (SELECT id FROM asset_status WHERE association = NEW.association_type_id);

    IF OLD.status IS DISTINCT FROM NEW.status THEN
        IF NEW.status = FALSE THEN
            IF NEW.equipment_id IS NOT NULL THEN
            PERFORM update_asset_status(NEW.equipment_id, 1);
            END IF;
            IF NEW.chip_id IS NOT NULL THEN
            PERFORM update_asset_status(NEW.chip_id, 1);
            END IF;
        ELSE
            IF NEW.equipment_id IS NOT NULL THEN
            PERFORM update_asset_status(NEW.equipment_id, association_status_ref);
            END IF;
            IF NEW.chip_id IS NOT NULL THEN
            PERFORM update_asset_status(NEW.chip_id, association_status_ref);
            END IF;
        END IF;
    END IF;
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."association_end_logic"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."association_insert_logic"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  is_equipment_free boolean;
  is_chip_free boolean;
BEGIN

IF NEW.equipment_id IS NOT NULL THEN
    is_equipment_free := EXISTS (SELECT 1 FROM assets WHERE uuid = NEW.equipment_id AND status_id = 1);
END IF;

IF NEW.chip_id IS NOT NULL THEN
    is_chip_free := EXISTS (SELECT 1 FROM assets WHERE uuid = NEW.chip_id AND status_id = 1);
END IF;

IF is_equipment_free = FALSE THEN
    IF is_chip_free = FALSE THEN
        RAISE EXCEPTION '[association_insert_logic] Ativos indisponíveis.';
    END IF;
    RAISE EXCEPTION '[association_insert_logic] Equipamento % indisponível.', (SELECT radio FROM assets WHERE uuid = NEW.equipment_id);
ELSIF is_chip_free = FALSE THEN
    RAISE EXCEPTION '[association_insert_logic] Chip % indisponível.', (SELECT iccid FROM assets WHERE uuid = NEW.chip_id);
END IF;

  PERFORM public.update_asset_status_by_association(NEW.equipment_id::text, NEW.association_type_id::bigint);
  PERFORM public.update_asset_status_by_association(NEW.chip_id::text, NEW.association_type_id::bigint);
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."association_insert_logic"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_asset_availability"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  SET search_path TO public;
  IF EXISTS (
    SELECT 1
    FROM public.associations a
    WHERE (
            (NEW.equipment_id IS NOT NULL AND a.equipment_id = NEW.equipment_id) OR
            (NEW.chip_id IS NOT NULL AND a.chip_id = NEW.chip_id)
          )
      AND a.uuid <> COALESCE(NEW.uuid, '00000000-0000-0000-0000-000000000000')
      AND NEW.entry_date < COALESCE(a.exit_date, 'infinity')
      AND COALESCE(NEW.exit_date, 'infinity') > a.entry_date
      AND a.status = TRUE
      AND a.deleted_at IS NULL
  ) THEN
    RAISE EXCEPTION 'O ativo % já está associado a outro cliente neste período.', COALESCE(NEW.equipment_id, NEW.chip_id);
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."check_asset_availability"() OWNER TO "postgres";


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


ALTER FUNCTION "public"."detect_association_inconsistencies"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
    username text;
    user_role user_role_enum;
BEGIN
    -- Armazenando username em variável
    username := NEW.raw_user_meta_data ->> 'username';

    -- Log de início da função
    RAISE NOTICE 'handle_new_user: Iniciando criação de perfil para usuário % (email: %)', NEW.id, NEW.email;

    -- Tentar converter o role dos metadados do usuário
    BEGIN
        user_role := (NEW.raw_user_meta_data ->> 'role')::user_role_enum;
        RAISE NOTICE 'handle_new_user: Role extraído dos metadados: %', user_role;
    EXCEPTION
        WHEN invalid_text_representation THEN
            -- Usar 'cliente' como padrão se a conversão falhar
            user_role := 'cliente'::user_role_enum;
            RAISE NOTICE 'handle_new_user: Erro ao converter role, usando padrão "cliente" para usuário %', NEW.email;
        WHEN OTHERS THEN
            user_role := 'cliente'::user_role_enum;
            RAISE NOTICE 'handle_new_user: Erro inesperado ao processar role, usando padrão "cliente" para usuário %', NEW.email;
    END;

    -- Tentar inserir o perfil
    BEGIN
        INSERT INTO public.profiles (
            id,
            email,
            role,
            is_active,
            is_approved,
            username
        ) VALUES (
            NEW.id,
            NEW.email,
            COALESCE(user_role, 'cliente'::user_role_enum),
            true,
            true,
            username
        );
        RAISE NOTICE 'handle_new_user: Perfil criado com sucesso para usuário % com role %', NEW.email, COALESCE(user_role, 'cliente'::user_role_enum);
    EXCEPTION
        WHEN unique_violation THEN
            RAISE NOTICE 'handle_new_user: Perfil já existe para usuário %', NEW.email;
        WHEN OTHERS THEN
            RAISE WARNING 'handle_new_user: Erro ao criar perfil para %: % (SQLSTATE: %)', NEW.email, SQLERRM, SQLSTATE;
        -- Não fazer RETURN NULL aqui para não bloquear o cadastro
    END;

    RETURN NEW;
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


CREATE OR REPLACE FUNCTION "public"."log_asset_event"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
    v_user uuid := auth.uid();
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO asset_logs (user_id, asset_id, event, details)
        VALUES (
            v_user,
            NEW.uuid,
            TG_OP,
            jsonb_build_object(
                'user', (SELECT row_to_json(p) FROM profiles p WHERE id = v_user),
                'new_record', row_to_json(NEW)
            )
        );
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO asset_logs (user_id, asset_id, event, details)
        VALUES (
            v_user,
            NEW.uuid,
            TG_OP,
            jsonb_build_object(
                'user', (SELECT row_to_json(p) FROM profiles p WHERE id = v_user),
                'old_record', row_to_json(OLD),
                'new_record', row_to_json(NEW)
            )
        );
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO asset_logs (user_id, asset_id, event, details)
        VALUES (
            v_user,
            OLD.uuid,
            TG_OP,
            jsonb_build_object(
                'user', (SELECT row_to_json(p) FROM profiles p WHERE id = v_user),
                'old_record', row_to_json(OLD)
            )
        );
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$;


ALTER FUNCTION "public"."log_asset_event"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."log_association_event"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
    v_user uuid := COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000');
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO association_logs (user_id, association_uuid, event, details)
        VALUES (
            v_user,
            NEW.uuid,
            TG_OP,
            jsonb_build_object(
                'user', (SELECT row_to_json(p) FROM profiles p WHERE id = v_user),
                'new_record', row_to_json(NEW)
            )
        );
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO association_logs (user_id, association_uuid, event, details)
        VALUES (
            v_user,
            NEW.uuid,
            TG_OP,
            jsonb_build_object(
                'user', (SELECT row_to_json(p) FROM profiles p WHERE id = v_user),
                'old_record', row_to_json(OLD),
                'new_record', row_to_json(NEW)
            )
        );
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO association_logs (user_id, association_uuid, event, details)
        VALUES (
            v_user,
            OLD.uuid,
            TG_OP,
            jsonb_build_object(
                'user', (SELECT row_to_json(p) FROM profiles p WHERE id = v_user),
                'old_record', row_to_json(OLD)
            )
        );
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$;


ALTER FUNCTION "public"."log_association_event"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
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
    SET "search_path" TO 'public'
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
    RETURN jsonb_build_object('success', true,'total_processed', total_processed,'total_updated', total_updated,'total_errors', total_errors,'execution_timestamp', NOW());
END;
$$;


ALTER FUNCTION "public"."update_all_rented_days"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_asset_rented_days"("asset_uuid" "text") RETURNS "jsonb"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
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
        FROM public.associations
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


ALTER FUNCTION "public"."update_asset_rented_days"("asset_uuid" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_asset_status"("asset_id" "text", "new_status_id" bigint) RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$ 
BEGIN 
    IF asset_id IS NULL THEN 
        RAISE NOTICE 'asset_id nulo – pulando';
    END IF;
    UPDATE assets
    SET status_id = new_status_id
    WHERE uuid = asset_id;
END;
$$;


ALTER FUNCTION "public"."update_asset_status"("asset_id" "text", "new_status_id" bigint) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_asset_status_by_association"("asset_id" "text", "association_type_id" bigint) RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  IF asset_id IS NULL THEN
    RAISE NOTICE 'asset_id nulo – pulando';
  END IF;
  UPDATE assets
  SET status_id = (SELECT id FROM asset_status WHERE association = association_type_id),
      updated_at = now()
  WHERE uuid = asset_id;
END;
$$;


ALTER FUNCTION "public"."update_asset_status_by_association"("asset_id" "text", "association_type_id" bigint) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_profile_last_login"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public, auth'
    AS $$ BEGIN -- Atualizar o last_login no profiles quando o last_sign_in_at for atualizado
UPDATE public.profiles
SET last_login = NEW.last_sign_in_at
WHERE id = NEW.id;
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


CREATE OR REPLACE FUNCTION "public"."validate_rented_days_integrity"() RETURNS TABLE("asset_id" "text", "current_rented_days" integer, "calculated_days" integer, "is_consistent" boolean, "message" "text")
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
DECLARE
    asset_record RECORD;
    calculated_days integer;
BEGIN
    FOR asset_record IN SELECT uuid, rented_days FROM public.assets WHERE deleted_at IS NULL LOOP
        WITH periods AS (
            SELECT entry_date, exit_date
            FROM public.associations
            WHERE (equipment_id = asset_record.uuid OR chip_id = asset_record.uuid)
              AND exit_date IS NOT NULL
              AND deleted_at IS NULL
              AND entry_date IS NOT NULL
              AND exit_date >= entry_date
        ), merged AS (
            SELECT COALESCE(SUM(exit_date - entry_date + 1),0) AS total_days FROM periods
        )
        SELECT total_days INTO calculated_days FROM merged;
        asset_id := asset_record.uuid;
        current_rented_days := COALESCE(asset_record.rented_days,0);
        is_consistent := (current_rented_days >= calculated_days);
        message := CASE WHEN is_consistent THEN 'OK - Historical + Blue periods' ELSE 'INCONSISTENT - Current value less than calculated' END;
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



CREATE TABLE IF NOT EXISTS "public"."asset_logs_legacy" (
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


ALTER TABLE "public"."asset_logs_legacy" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."asset_history_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."asset_history_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."asset_history_id_seq" OWNED BY "public"."asset_logs_legacy"."id";



CREATE TABLE IF NOT EXISTS "public"."asset_logs" (
    "uuid" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "asset_id" "text" NOT NULL,
    "event" "text" NOT NULL,
    "details" "jsonb" NOT NULL,
    "status_before_id" bigint,
    "status_after_id" bigint,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone
);


ALTER TABLE "public"."asset_logs" OWNER TO "postgres";


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


CREATE TABLE IF NOT EXISTS "public"."association_logs" (
    "uuid" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "association_uuid" "text" NOT NULL,
    "event" "text" NOT NULL,
    "details" "jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone
);


ALTER TABLE "public"."association_logs" OWNER TO "postgres";


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



CREATE TABLE IF NOT EXISTS "public"."associations" (
    "uuid" "text" DEFAULT "gen_random_uuid"() NOT NULL,
    "client_id" "text" NOT NULL,
    "equipment_id" "text",
    "chip_id" "text",
    "entry_date" "date" NOT NULL,
    "exit_date" "date",
    "association_type_id" bigint NOT NULL,
    "plan_id" bigint,
    "plan_gb" bigint DEFAULT '0'::bigint,
    "equipment_ssid" "text",
    "equipment_pass" "text",
    "status" boolean DEFAULT true NOT NULL,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone
);


ALTER TABLE "public"."associations" OWNER TO "postgres";


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
 SELECT DISTINCT "associations"."client_id"
   FROM "public"."associations"
  WHERE (("associations"."status" = true) AND ("associations"."deleted_at" IS NULL));


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



ALTER TABLE ONLY "public"."asset_logs_legacy" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."asset_history_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."location_types" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."location_types_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."locations" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."locations_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."plans" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."pacotes_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."asset_client_assoc"
    ADD CONSTRAINT "asset_client_assoc_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."asset_logs_legacy"
    ADD CONSTRAINT "asset_history_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."asset_logs"
    ADD CONSTRAINT "asset_logs_pkey" PRIMARY KEY ("uuid");



ALTER TABLE ONLY "public"."assets"
    ADD CONSTRAINT "assets_iccid_key" UNIQUE ("iccid");



ALTER TABLE ONLY "public"."assets"
    ADD CONSTRAINT "assets_pkey" PRIMARY KEY ("uuid");



ALTER TABLE ONLY "public"."assets"
    ADD CONSTRAINT "assets_serial_number_key" UNIQUE ("serial_number");



ALTER TABLE ONLY "public"."association_logs"
    ADD CONSTRAINT "association_logs_pkey" PRIMARY KEY ("uuid");



ALTER TABLE ONLY "public"."association_types"
    ADD CONSTRAINT "association_types_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."association_types"
    ADD CONSTRAINT "association_types_type_key" UNIQUE ("type");



ALTER TABLE ONLY "public"."associations"
    ADD CONSTRAINT "associations_pkey" PRIMARY KEY ("uuid");



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



ALTER TABLE ONLY "public"."plans"
    ADD CONSTRAINT "pacotes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profile_logs"
    ADD CONSTRAINT "profile_logs_pkey" PRIMARY KEY ("id");



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



CREATE INDEX "asset_history_assoc_id_index" ON "public"."asset_logs_legacy" USING "btree" ("assoc_id");



CREATE INDEX "idx_asset_client_assoc_exit_date" ON "public"."asset_client_assoc" USING "btree" ("exit_date");



CREATE INDEX "idx_asset_logs_asset_id" ON "public"."asset_logs" USING "btree" ("asset_id");



CREATE INDEX "idx_asset_logs_deleted_at" ON "public"."asset_logs" USING "btree" ("deleted_at");



CREATE INDEX "idx_asset_logs_user_id" ON "public"."asset_logs" USING "btree" ("user_id");



CREATE UNIQUE INDEX "idx_assets_radio_unique_not_null" ON "public"."assets" USING "btree" ("radio") WHERE ("radio" IS NOT NULL);



CREATE INDEX "idx_association_logs_association_uuid" ON "public"."association_logs" USING "btree" ("association_uuid");



CREATE INDEX "idx_association_logs_deleted_at" ON "public"."association_logs" USING "btree" ("deleted_at");



CREATE INDEX "idx_association_logs_user_id" ON "public"."association_logs" USING "btree" ("user_id");



CREATE INDEX "idx_associations_chip_id" ON "public"."associations" USING "btree" ("chip_id") WHERE ("deleted_at" IS NULL);



CREATE INDEX "idx_associations_client_id" ON "public"."associations" USING "btree" ("client_id") WHERE ("deleted_at" IS NULL);



CREATE INDEX "idx_associations_entry_date" ON "public"."associations" USING "btree" ("entry_date") WHERE ("deleted_at" IS NULL);



CREATE INDEX "idx_associations_equipment_id" ON "public"."associations" USING "btree" ("equipment_id") WHERE ("deleted_at" IS NULL);



CREATE INDEX "idx_associations_exit_date" ON "public"."associations" USING "btree" ("exit_date") WHERE ("deleted_at" IS NULL);



CREATE INDEX "idx_associations_plan_id" ON "public"."associations" USING "btree" ("plan_id") WHERE ("deleted_at" IS NULL);



CREATE INDEX "idx_associations_status_active" ON "public"."associations" USING "btree" ("status") WHERE ("deleted_at" IS NULL);



CREATE INDEX "idx_client_logs_client_id" ON "public"."client_logs" USING "btree" ("client_id");



CREATE INDEX "idx_client_logs_date" ON "public"."client_logs" USING "btree" ("date" DESC);



CREATE INDEX "idx_client_logs_event_type" ON "public"."client_logs" USING "btree" ("event_type");



CREATE INDEX "profile_logs_email_idx" ON "public"."profile_logs" USING "btree" ("email");



CREATE INDEX "profile_logs_operation_idx" ON "public"."profile_logs" USING "btree" ("operation");



CREATE INDEX "profile_logs_user_id_idx" ON "public"."profile_logs" USING "btree" ("user_id");



CREATE INDEX "profiles_email_idx" ON "public"."profiles" USING "btree" ("email");



CREATE INDEX "profiles_role_active_idx" ON "public"."profiles" USING "btree" ("role", "is_active");



CREATE INDEX "profiles_role_idx" ON "public"."profiles" USING "btree" ("role");



CREATE OR REPLACE TRIGGER "assets_logging_trigger" AFTER INSERT OR DELETE OR UPDATE ON "public"."assets" FOR EACH ROW EXECUTE FUNCTION "public"."log_asset_event"();



CREATE OR REPLACE TRIGGER "association_end_logic_trigger" AFTER UPDATE ON "public"."associations" FOR EACH ROW EXECUTE FUNCTION "public"."association_end_logic"();



CREATE OR REPLACE TRIGGER "association_insert_logic" AFTER INSERT ON "public"."associations" FOR EACH ROW EXECUTE FUNCTION "public"."association_insert_logic"();



CREATE OR REPLACE TRIGGER "associations_logging_trigger" AFTER INSERT OR DELETE OR UPDATE ON "public"."associations" FOR EACH ROW EXECUTE FUNCTION "public"."log_association_event"();



CREATE OR REPLACE TRIGGER "check_availability_before_association" BEFORE INSERT OR UPDATE ON "public"."associations" FOR EACH ROW EXECUTE FUNCTION "public"."check_asset_availability"();



CREATE OR REPLACE TRIGGER "set_asset_logs_updated_at" BEFORE UPDATE ON "public"."asset_logs" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_asset_solutions_updated_at" BEFORE UPDATE ON "public"."asset_solutions" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_asset_status_updated_at" BEFORE UPDATE ON "public"."asset_status" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_assets_updated_at" BEFORE UPDATE ON "public"."assets" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_association_logs_updated_at" BEFORE UPDATE ON "public"."association_logs" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_association_types_updated_at" BEFORE UPDATE ON "public"."association_types" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_associations_updated_at" BEFORE UPDATE ON "public"."associations" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_clients_updated_at" BEFORE UPDATE ON "public"."clients" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_location_types_updated_at" BEFORE UPDATE ON "public"."location_types" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_locations_updated_at" BEFORE UPDATE ON "public"."locations" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_manufacturers_updated_at" BEFORE UPDATE ON "public"."manufacturers" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_plans_updated_at" BEFORE UPDATE ON "public"."plans" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_profile_logs_updated_at" BEFORE UPDATE ON "public"."profile_logs" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_profiles_updated_at" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



ALTER TABLE ONLY "public"."asset_client_assoc"
    ADD CONSTRAINT "asset_client_assoc_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "public"."assets"("uuid") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."asset_client_assoc"
    ADD CONSTRAINT "asset_client_assoc_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("uuid") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."asset_client_assoc"
    ADD CONSTRAINT "asset_client_assoc_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."asset_logs"
    ADD CONSTRAINT "asset_logs_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "public"."assets"("uuid");



ALTER TABLE ONLY "public"."asset_logs"
    ADD CONSTRAINT "asset_logs_status_after_id_fkey" FOREIGN KEY ("status_after_id") REFERENCES "public"."asset_status"("id");



ALTER TABLE ONLY "public"."asset_logs"
    ADD CONSTRAINT "asset_logs_status_before_id_fkey" FOREIGN KEY ("status_before_id") REFERENCES "public"."asset_status"("id");



ALTER TABLE ONLY "public"."asset_logs"
    ADD CONSTRAINT "asset_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."assets"
    ADD CONSTRAINT "assets_manufacturer_id_fkey" FOREIGN KEY ("manufacturer_id") REFERENCES "public"."manufacturers"("id") ON UPDATE CASCADE ON DELETE SET NULL;



ALTER TABLE ONLY "public"."assets"
    ADD CONSTRAINT "assets_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."association_logs"
    ADD CONSTRAINT "association_logs_association_uuid_fkey" FOREIGN KEY ("association_uuid") REFERENCES "public"."associations"("uuid");



ALTER TABLE ONLY "public"."association_logs"
    ADD CONSTRAINT "association_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."associations"
    ADD CONSTRAINT "association_type_id_fkey" FOREIGN KEY ("association_type_id") REFERENCES "public"."association_types"("id");



ALTER TABLE ONLY "public"."associations"
    ADD CONSTRAINT "chip_id_fkey" FOREIGN KEY ("chip_id") REFERENCES "public"."assets"("uuid");



ALTER TABLE ONLY "public"."associations"
    ADD CONSTRAINT "client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("uuid");



ALTER TABLE ONLY "public"."associations"
    ADD CONSTRAINT "equipment_id_fkey" FOREIGN KEY ("equipment_id") REFERENCES "public"."assets"("uuid");



ALTER TABLE ONLY "public"."asset_logs_legacy"
    ADD CONSTRAINT "fk_asset_history_status_after" FOREIGN KEY ("status_after_id") REFERENCES "public"."asset_status"("id");



ALTER TABLE ONLY "public"."asset_logs_legacy"
    ADD CONSTRAINT "fk_asset_history_status_before" FOREIGN KEY ("status_before_id") REFERENCES "public"."asset_status"("id");



ALTER TABLE ONLY "public"."asset_logs_legacy"
    ADD CONSTRAINT "fk_asset_logs_assoc_id" FOREIGN KEY ("assoc_id") REFERENCES "public"."asset_client_assoc"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."asset_logs_legacy"
    ADD CONSTRAINT "fk_asset_logs_status_after" FOREIGN KEY ("status_after_id") REFERENCES "public"."asset_status"("id");



ALTER TABLE ONLY "public"."asset_logs_legacy"
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



ALTER TABLE ONLY "public"."associations"
    ADD CONSTRAINT "plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id");



ALTER TABLE ONLY "public"."profile_logs"
    ADD CONSTRAINT "profile_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."asset_status"
    ADD CONSTRAINT "status_association_fkey" FOREIGN KEY ("association") REFERENCES "public"."association_types"("id") ON UPDATE CASCADE ON DELETE SET NULL;



CREATE POLICY "Admins can insert profile logs" ON "public"."profile_logs" FOR INSERT TO "authenticated" WITH CHECK ("public"."has_role"('admin'::"public"."user_role_enum"));



CREATE POLICY "Admins can view all profile logs" ON "public"."profile_logs" FOR SELECT TO "authenticated" USING ("public"."has_role"('admin'::"public"."user_role_enum"));



CREATE POLICY "Allow profile_logs insertion by security definer functions" ON "public"."profile_logs" FOR INSERT WITH CHECK (true);



CREATE POLICY "Auth users can insert" ON "public"."asset_client_assoc" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Auth users can insert" ON "public"."asset_logs" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Auth users can insert" ON "public"."asset_logs_legacy" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Auth users can insert" ON "public"."assets" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Auth users can insert" ON "public"."association_logs" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Auth users can insert" ON "public"."associations" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Auth users can insert" ON "public"."client_logs" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Auth users can insert" ON "public"."clients" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Auth users can update" ON "public"."asset_client_assoc" FOR UPDATE TO "authenticated" USING (true);



CREATE POLICY "Auth users can update" ON "public"."asset_logs" FOR UPDATE TO "authenticated" USING (true);



CREATE POLICY "Auth users can update" ON "public"."asset_logs_legacy" FOR UPDATE TO "authenticated" USING (true);



CREATE POLICY "Auth users can update" ON "public"."assets" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Auth users can update" ON "public"."association_logs" FOR UPDATE TO "authenticated" USING (true);



CREATE POLICY "Auth users can update" ON "public"."associations" FOR UPDATE TO "authenticated" USING (true);



CREATE POLICY "Auth users can update" ON "public"."client_logs" FOR UPDATE TO "authenticated" USING (true);



CREATE POLICY "Auth users can update" ON "public"."clients" FOR UPDATE TO "authenticated" USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."asset_client_assoc" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."asset_logs" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."asset_logs_legacy" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."asset_solutions" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."asset_status" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."assets" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."association_logs" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."association_types" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."associations" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."client_logs" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."clients" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."location_types" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."locations" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."manufacturers" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."plans" FOR SELECT USING (true);



CREATE POLICY "Enable read your data access for all users" ON "public"."profiles" FOR SELECT USING ("public"."is_user_self"("id"));



CREATE POLICY "Enable update for users based on email" ON "public"."profiles" USING (((( SELECT "auth"."jwt"() AS "jwt") ->> 'email'::"text") = "email")) WITH CHECK (((( SELECT "auth"."jwt"() AS "jwt") ->> 'email'::"text") = "email"));



CREATE POLICY "Only admins can view profile logs" ON "public"."profile_logs" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"public"."user_role_enum")))));



CREATE POLICY "admin_total_access" ON "public"."asset_client_assoc" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "admin_total_access" ON "public"."asset_logs" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "admin_total_access" ON "public"."asset_logs_legacy" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "admin_total_access" ON "public"."asset_solutions" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "admin_total_access" ON "public"."asset_status" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "admin_total_access" ON "public"."assets" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "admin_total_access" ON "public"."association_logs" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "admin_total_access" ON "public"."association_types" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "admin_total_access" ON "public"."associations" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



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


ALTER TABLE "public"."asset_logs_legacy" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."asset_solutions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."asset_status" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."assets" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."association_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."association_types" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."associations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."client_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."clients" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."location_types" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."locations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."manufacturers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."plans" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profile_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";





GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

















































































































































































GRANT ALL ON FUNCTION "public"."admin_delete_user"("user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."admin_delete_user"("user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."admin_delete_user"("user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."association_end_logic"() TO "anon";
GRANT ALL ON FUNCTION "public"."association_end_logic"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."association_end_logic"() TO "service_role";



GRANT ALL ON FUNCTION "public"."association_insert_logic"() TO "anon";
GRANT ALL ON FUNCTION "public"."association_insert_logic"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."association_insert_logic"() TO "service_role";



GRANT ALL ON FUNCTION "public"."check_asset_availability"() TO "anon";
GRANT ALL ON FUNCTION "public"."check_asset_availability"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_asset_availability"() TO "service_role";



GRANT ALL ON FUNCTION "public"."detect_association_inconsistencies"() TO "anon";
GRANT ALL ON FUNCTION "public"."detect_association_inconsistencies"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."detect_association_inconsistencies"() TO "service_role";



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



GRANT ALL ON FUNCTION "public"."log_asset_event"() TO "anon";
GRANT ALL ON FUNCTION "public"."log_asset_event"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."log_asset_event"() TO "service_role";



GRANT ALL ON FUNCTION "public"."log_association_event"() TO "anon";
GRANT ALL ON FUNCTION "public"."log_association_event"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."log_association_event"() TO "service_role";



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



GRANT ALL ON FUNCTION "public"."update_asset_status"("asset_id" "text", "new_status_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."update_asset_status"("asset_id" "text", "new_status_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_asset_status"("asset_id" "text", "new_status_id" bigint) TO "service_role";



GRANT ALL ON FUNCTION "public"."update_asset_status_by_association"("asset_id" "text", "association_type_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."update_asset_status_by_association"("asset_id" "text", "association_type_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_asset_status_by_association"("asset_id" "text", "association_type_id" bigint) TO "service_role";



GRANT ALL ON FUNCTION "public"."update_profile_last_login"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_profile_last_login"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_profile_last_login"() TO "service_role";



GRANT ALL ON FUNCTION "public"."user_has_profile"("user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."user_has_profile"("user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."user_has_profile"("user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_rented_days_integrity"() TO "anon";
GRANT ALL ON FUNCTION "public"."validate_rented_days_integrity"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_rented_days_integrity"() TO "service_role";


















GRANT ALL ON TABLE "public"."asset_client_assoc" TO "anon";
GRANT ALL ON TABLE "public"."asset_client_assoc" TO "authenticated";
GRANT ALL ON TABLE "public"."asset_client_assoc" TO "service_role";



GRANT ALL ON SEQUENCE "public"."asset_client_assoc_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."asset_client_assoc_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."asset_client_assoc_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."asset_logs_legacy" TO "anon";
GRANT ALL ON TABLE "public"."asset_logs_legacy" TO "authenticated";
GRANT ALL ON TABLE "public"."asset_logs_legacy" TO "service_role";



GRANT ALL ON SEQUENCE "public"."asset_history_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."asset_history_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."asset_history_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."asset_logs" TO "anon";
GRANT ALL ON TABLE "public"."asset_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."asset_logs" TO "service_role";



GRANT ALL ON TABLE "public"."asset_solutions" TO "anon";
GRANT ALL ON TABLE "public"."asset_solutions" TO "authenticated";
GRANT ALL ON TABLE "public"."asset_solutions" TO "service_role";



GRANT ALL ON TABLE "public"."asset_status" TO "anon";
GRANT ALL ON TABLE "public"."asset_status" TO "authenticated";
GRANT ALL ON TABLE "public"."asset_status" TO "service_role";



GRANT ALL ON TABLE "public"."assets" TO "anon";
GRANT ALL ON TABLE "public"."assets" TO "authenticated";
GRANT ALL ON TABLE "public"."assets" TO "service_role";



GRANT ALL ON TABLE "public"."association_logs" TO "anon";
GRANT ALL ON TABLE "public"."association_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."association_logs" TO "service_role";



GRANT ALL ON TABLE "public"."association_types" TO "anon";
GRANT ALL ON TABLE "public"."association_types" TO "authenticated";
GRANT ALL ON TABLE "public"."association_types" TO "service_role";



GRANT ALL ON SEQUENCE "public"."association_types_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."association_types_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."association_types_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."associations" TO "anon";
GRANT ALL ON TABLE "public"."associations" TO "authenticated";
GRANT ALL ON TABLE "public"."associations" TO "service_role";



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
