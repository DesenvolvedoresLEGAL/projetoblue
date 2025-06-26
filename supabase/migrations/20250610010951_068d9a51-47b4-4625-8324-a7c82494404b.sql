
-- Adicionar funções que estão faltando no banco de dados

-- Função para garantir que um perfil de usuário existe
CREATE OR REPLACE FUNCTION public.ensure_user_profile(user_id uuid, user_email text, user_role user_role_enum)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Tentar inserir o perfil se não existir
  INSERT INTO public.profiles (id, email, role, is_active, is_approved)
  VALUES (user_id, user_email, user_role, true, true)
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = NOW();
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Erro ao garantir perfil para %: %', user_email, SQLERRM;
    RETURN FALSE;
END;
$function$;

-- Função para listar usuários (admin)
CREATE OR REPLACE FUNCTION public.admin_list_users()
 RETURNS TABLE(
   id uuid,
   email text,
   role user_role_enum,
   is_active boolean,
   is_approved boolean,
   created_at text,
   last_login text
 )
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Verificar se o usuário atual é admin
  IF NOT (SELECT has_role('admin'::user_role_enum)) THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores podem listar usuários';
  END IF;

  RETURN QUERY
  SELECT 
    p.id,
    p.email,
    p.role,
    p.is_active,
    p.is_approved,
    p.created_at::text,
    p.last_login::text
  FROM profiles p
  WHERE p.deleted_at IS NULL
  ORDER BY p.created_at DESC;
END;
$function$;
;
