
-- Corrigir a função log_profile_change para não falhar durante o signup
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
    SET search_path TO public;

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
$function$;
;
