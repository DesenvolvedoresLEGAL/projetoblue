
-- Criar função trigger para atualizar last_login automaticamente
CREATE OR REPLACE FUNCTION public.update_profile_last_login()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Atualizar o last_login no profiles quando o last_sign_in_at for atualizado
  UPDATE public.profiles 
  SET 
    last_login = NEW.last_sign_in_at,
    updated_at = NOW()
  WHERE id = NEW.id;
  
  -- Log para debug (opcional)
  RAISE LOG 'Updated last_login for user % to %', NEW.id, NEW.last_sign_in_at;
  
  RETURN NEW;
END;
$$;

-- Criar trigger que executa a função quando auth.users é atualizado
CREATE OR REPLACE TRIGGER trigger_update_profile_last_login
  AFTER UPDATE OF last_sign_in_at ON auth.users
  FOR EACH ROW
  WHEN (OLD.last_sign_in_at IS DISTINCT FROM NEW.last_sign_in_at)
  EXECUTE FUNCTION public.update_profile_last_login();

-- Também criar trigger para quando um usuário faz login pela primeira vez
CREATE OR REPLACE TRIGGER trigger_update_profile_first_login
  AFTER INSERT ON auth.users
  FOR EACH ROW
  WHEN (NEW.last_sign_in_at IS NOT NULL)
  EXECUTE FUNCTION public.update_profile_last_login();
;
