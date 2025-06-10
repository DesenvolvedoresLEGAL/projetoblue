
-- FASE 1: Recriar o Trigger Automático para Criação de Perfis

-- Primeiro, verificar e remover o trigger existente se houver problemas
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Recriar a função handle_new_user com melhor tratamento de erros
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = 'public'
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

-- Recriar o trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Verificar se o trigger foi criado corretamente
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'on_auth_user_created'
    AND tgrelid = 'auth.users'::regclass
  ) THEN
    RAISE NOTICE 'Trigger on_auth_user_created criado com sucesso';
  ELSE
    RAISE WARNING 'Falha ao criar o trigger on_auth_user_created';
  END IF;
END $$;
