
-- 2025-05-16  Fix enum mismatch (user_role → user_role_enum)
-- Corrige referências ao tipo user_role inexistente
BEGIN;

-- 1. Elimina função antiga, se existir
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- 2. Cria a função com enum correto
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, is_active, is_approved)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role_enum, 'analyst'::user_role_enum),
    TRUE,
    TRUE
  );
  RETURN NEW;
END;
$$;

-- 3. Garante o trigger (re-cria se precisar)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Verifica se o tipo user_role_enum existe e pode ser usado
DO $$
BEGIN
  PERFORM 'analyst'::user_role_enum;
  RAISE NOTICE 'Validation successful: user_role_enum type exists and contains the value "analyst"';
EXCEPTION
  WHEN undefined_object THEN
    RAISE EXCEPTION 'Validation failed: user_role_enum type does not exist';
  WHEN invalid_text_representation THEN
    RAISE EXCEPTION 'Validation failed: "analyst" is not a valid value for user_role_enum';
END $$;

COMMIT;
