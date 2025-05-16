
-- Este arquivo contém uma migração para corrigir a função que lida com a criação de novos usuários
-- ATENÇÃO: Esta versão está OBSOLETA e foi substituída por 20250516_fix_user_role_enum.sql
-- Verificar se o trigger e a função existem
DROP FUNCTION IF EXISTS public.handle_new_user CASCADE;

-- OBSOLETA: Esta função usava o tipo incorreto 'user_role' em vez de 'user_role_enum'
-- Foi corrigida na migração 20250516_fix_user_role_enum.sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, is_active, is_approved)
  VALUES (
    new.id,
    new.email,
    (new.raw_user_meta_data->>'role')::user_role, -- Explicitamente converter para o tipo user_role
    true,
    COALESCE((new.raw_user_meta_data->>'is_approved')::boolean, true) -- Alterado para true como padrão
  );
  RETURN new;
END;
$$;

-- Recriar o trigger se ele não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  END IF;
END
$$;
