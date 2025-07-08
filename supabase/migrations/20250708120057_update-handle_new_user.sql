CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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
