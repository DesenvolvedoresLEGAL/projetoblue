-- Este arquivo contém uma migração para corrigir a função que lida com a criação de novos usuários
-- O problema atual é que a função está tentando acessar um campo 'status' que não existe

-- Verificar se o trigger e a função existem antes de recriá-los
DROP FUNCTION IF EXISTS public.handle_new_user CASCADE;
-- Recriar a função corretamente sem tentar acessar o campo 'status'
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
    COALESCE((new.raw_user_meta_data->>'role')::user_role, 'analyst'::user_role), -- Valor padrão se role não for fornecido
    true, -- is_active sempre true por padrão
    true  -- is_approved sempre true por padrão para simplificar o processo
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
