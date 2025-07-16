CREATE OR REPLACE FUNCTION public.update_profile_last_login() RETURNS "trigger" LANGUAGE "plpgsql" SECURITY DEFINER
SET "search_path" TO 'public, auth' AS $$ BEGIN -- Atualizar o last_login no profiles quando o last_sign_in_at for atualizado
UPDATE public.profiles
SET last_login = NEW.last_sign_in_at
WHERE id = NEW.id;
RETURN NEW;
END;
$$;
CREATE OR REPLACE TRIGGER "profiles_update_last_login" AFTER UPDATE ON auth.users FOR EACH ROW EXECUTE FUNCTION public.update_profile_last_login();
