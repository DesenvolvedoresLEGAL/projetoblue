
-- Reverter log_profile_change para a versão anterior
CREATE OR REPLACE FUNCTION public.log_profile_change()
RETURNS trigger
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path TO 'public'
AS $$
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
$$;

-- Recriar todos os triggers conforme solicitado
DROP TRIGGER IF EXISTS asset_client_assoc_log_trigger ON public.asset_client_assoc;
CREATE TRIGGER asset_client_assoc_log_trigger 
    AFTER INSERT OR DELETE OR UPDATE ON public.asset_client_assoc 
    FOR EACH ROW EXECUTE FUNCTION public.log_profile_change();

DROP TRIGGER IF EXISTS asset_histories_log_trigger ON public.asset_logs;
CREATE TRIGGER asset_histories_log_trigger 
    AFTER INSERT OR UPDATE ON public.asset_logs 
    FOR EACH ROW EXECUTE FUNCTION public.log_profile_change();

DROP TRIGGER IF EXISTS assets_log_trigger ON public.assets;
CREATE TRIGGER assets_log_trigger 
    AFTER INSERT OR DELETE OR UPDATE ON public.assets 
    FOR EACH ROW EXECUTE FUNCTION public.log_profile_change();

DROP TRIGGER IF EXISTS clients_log_trigger ON public.clients;
CREATE TRIGGER clients_log_trigger 
    AFTER INSERT OR DELETE OR UPDATE ON public.clients 
    FOR EACH ROW EXECUTE FUNCTION public.log_profile_change();

DROP TRIGGER IF EXISTS plans_log_trigger ON public.plans;
CREATE TRIGGER plans_log_trigger 
    AFTER INSERT OR DELETE OR UPDATE ON public.plans 
    FOR EACH ROW EXECUTE FUNCTION public.log_profile_change();

DROP TRIGGER IF EXISTS profiles_log_trigger ON public.profiles;
CREATE TRIGGER profiles_log_trigger 
    AFTER INSERT OR DELETE OR UPDATE ON public.profiles 
    FOR EACH ROW EXECUTE FUNCTION public.log_profile_change();

-- Garantir permissões da função
GRANT ALL ON FUNCTION public.log_profile_change() TO anon;
GRANT ALL ON FUNCTION public.log_profile_change() TO authenticated;
GRANT ALL ON FUNCTION public.log_profile_change() TO service_role;
