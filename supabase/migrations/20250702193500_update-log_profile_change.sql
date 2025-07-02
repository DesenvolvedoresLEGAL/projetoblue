CREATE OR REPLACE FUNCTION public.log_profile_change()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
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
            SELECT email INTO current_user_email
            FROM auth.users
            WHERE id = safe_user_id;
        EXCEPTION
            WHEN OTHERS THEN
                current_user_email := CASE
                    WHEN TG_OP = 'INSERT' THEN to_jsonb(NEW)->>'email'
                    WHEN TG_OP = 'UPDATE' THEN COALESCE(to_jsonb(NEW)->>'email', to_jsonb(OLD)->>'email')
                    WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD)->>'email'
                    ELSE 'sistema'
                END;
                RAISE NOTICE 'log_profile_change: N\xC3\xA3o foi poss\xC3\xADvel acessar auth.users, usando email do registro: %', current_user_email;
        END;
    ELSE
        current_user_email := CASE
            WHEN TG_OP = 'INSERT' THEN to_jsonb(NEW)->>'email'
            WHEN TG_OP = 'UPDATE' THEN COALESCE(to_jsonb(NEW)->>'email', to_jsonb(OLD)->>'email')
            WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD)->>'email'
            ELSE 'sistema'
        END;
    END IF;

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

GRANT ALL ON FUNCTION public.log_profile_change() TO anon;
GRANT ALL ON FUNCTION public.log_profile_change() TO authenticated;
GRANT ALL ON FUNCTION public.log_profile_change() TO service_role;