
-- Passo 1: Corrigir search_path da função log_profile_change
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

-- Passo 2: Habilitar RLS na tabela profile_logs se não estiver habilitado
ALTER TABLE public.profile_logs ENABLE ROW LEVEL SECURITY;

-- Passo 3: Criar política RLS para permitir inserção da função SECURITY DEFINER
-- Primeiro, remover política existente se houver
DROP POLICY IF EXISTS "Allow profile_logs insertion by security definer functions" ON public.profile_logs;

-- Criar nova política que permite inserção por funções SECURITY DEFINER
CREATE POLICY "Allow profile_logs insertion by security definer functions"
ON public.profile_logs
FOR INSERT
WITH CHECK (true);

-- Política para permitir leitura apenas por admins
DROP POLICY IF EXISTS "Only admins can view profile logs" ON public.profile_logs;
CREATE POLICY "Only admins can view profile logs"
ON public.profile_logs
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'::user_role_enum
  )
);

-- Verificar se o trigger existe e recriar se necessário
DROP TRIGGER IF EXISTS trigger_log_profile_changes ON public.profiles;
CREATE TRIGGER trigger_log_profile_changes
    AFTER INSERT OR UPDATE OR DELETE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.log_profile_change();
