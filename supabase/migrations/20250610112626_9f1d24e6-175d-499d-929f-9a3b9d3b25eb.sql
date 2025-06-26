
-- Criar função para listar usuários (apenas para admins)
CREATE OR REPLACE FUNCTION public.admin_list_users()
RETURNS TABLE(
  id uuid,
  email text,
  role user_role_enum,
  is_active boolean,
  is_approved boolean,
  created_at timestamp with time zone,
  last_login timestamp with time zone
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
    p.created_at,
    p.last_login
  FROM profiles p
  WHERE p.deleted_at IS NULL
  ORDER BY p.created_at DESC;
END;
$function$;

-- Criar função para deletar usuário (apenas para admins)
CREATE OR REPLACE FUNCTION public.admin_delete_user(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  user_email text;
  current_user_id uuid;
BEGIN
  -- Verificar se o usuário atual é admin
  IF NOT (SELECT has_role('admin'::user_role_enum)) THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores podem deletar usuários';
  END IF;

  -- Obter ID do usuário atual
  current_user_id := auth.uid();
  
  -- Prevenir auto-deleção
  IF user_id = current_user_id THEN
    RAISE EXCEPTION 'Não é possível deletar seu próprio usuário';
  END IF;

  -- Obter email do usuário para logs
  SELECT email INTO user_email FROM profiles WHERE id = user_id;
  
  IF user_email IS NULL THEN
    RAISE EXCEPTION 'Usuário não encontrado';
  END IF;

  -- Marcar perfil como deletado (soft delete)
  UPDATE profiles 
  SET deleted_at = NOW(), 
      is_active = false
  WHERE id = user_id;

  -- Log da ação
  INSERT INTO profile_logs (
    user_id, email, operation, table_name, 
    old_data, new_data
  ) VALUES (
    current_user_id,
    (SELECT email FROM profiles WHERE id = current_user_id),
    'ADMIN_DELETE_USER',
    'profiles',
    jsonb_build_object('deleted_user_id', user_id, 'deleted_user_email', user_email),
    NULL
  );

  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Erro ao deletar usuário: %', SQLERRM;
END;
$function$;

-- Criar função para atualizar role do usuário (apenas para admins)
CREATE OR REPLACE FUNCTION public.admin_update_user_role(user_id uuid, new_role user_role_enum)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  old_role user_role_enum;
  user_email text;
  current_user_id uuid;
BEGIN
  -- Verificar se o usuário atual é admin
  IF NOT (SELECT has_role('admin'::user_role_enum)) THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores podem alterar roles';
  END IF;

  -- Obter dados atuais do usuário
  SELECT role, email INTO old_role, user_email 
  FROM profiles 
  WHERE id = user_id AND deleted_at IS NULL;
  
  IF user_email IS NULL THEN
    RAISE EXCEPTION 'Usuário não encontrado';
  END IF;

  -- Verificar se há mudança real
  IF old_role = new_role THEN
    RETURN TRUE; -- Nada a fazer
  END IF;

  -- Obter ID do usuário atual
  current_user_id := auth.uid();

  -- Atualizar role
  UPDATE profiles 
  SET role = new_role, updated_at = NOW()
  WHERE id = user_id;

  -- Log da ação
  INSERT INTO profile_logs (
    user_id, email, operation, table_name, 
    old_data, new_data
  ) VALUES (
    current_user_id,
    (SELECT email FROM profiles WHERE id = current_user_id),
    'ADMIN_UPDATE_ROLE',
    'profiles',
    jsonb_build_object(
      'target_user_id', user_id, 
      'target_user_email', user_email,
      'old_role', old_role
    ),
    jsonb_build_object(
      'target_user_id', user_id, 
      'target_user_email', user_email,
      'new_role', new_role
    )
  );

  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Erro ao atualizar role: %', SQLERRM;
END;
$function$;

-- Criar função para atualizar dados do perfil (apenas para admins)
CREATE OR REPLACE FUNCTION public.admin_update_user_profile(
  user_id uuid, 
  profile_updates jsonb
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  old_data jsonb;
  user_email text;
  current_user_id uuid;
  new_email text;
  new_is_active boolean;
  new_is_approved boolean;
BEGIN
  -- Verificar se o usuário atual é admin
  IF NOT (SELECT has_role('admin'::user_role_enum)) THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores podem atualizar perfis';
  END IF;

  -- Obter dados atuais do usuário
  SELECT row_to_json(profiles.*), email 
  INTO old_data, user_email
  FROM profiles 
  WHERE id = user_id AND deleted_at IS NULL;
  
  IF user_email IS NULL THEN
    RAISE EXCEPTION 'Usuário não encontrado';
  END IF;

  -- Obter ID do usuário atual
  current_user_id := auth.uid();

  -- Extrair campos permitidos do JSON
  new_email := profile_updates->>'email';
  new_is_active := (profile_updates->>'is_active')::boolean;
  new_is_approved := (profile_updates->>'is_approved')::boolean;

  -- Atualizar apenas campos permitidos
  UPDATE profiles 
  SET 
    email = COALESCE(new_email, email),
    is_active = COALESCE(new_is_active, is_active),
    is_approved = COALESCE(new_is_approved, is_approved),
    updated_at = NOW()
  WHERE id = user_id;

  -- Log da ação
  INSERT INTO profile_logs (
    user_id, email, operation, table_name, 
    old_data, new_data
  ) VALUES (
    current_user_id,
    (SELECT email FROM profiles WHERE id = current_user_id),
    'ADMIN_UPDATE_PROFILE',
    'profiles',
    jsonb_build_object(
      'target_user_id', user_id,
      'target_user_email', user_email,
      'old_data', old_data
    ),
    jsonb_build_object(
      'target_user_id', user_id,
      'updates', profile_updates
    )
  );

  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Erro ao atualizar perfil: %', SQLERRM;
END;
$function$;

-- Política RLS para garantir que apenas admins vejam logs administrativos
ALTER TABLE profile_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all profile logs" 
ON profile_logs 
FOR SELECT 
USING (has_role('admin'::user_role_enum));

CREATE POLICY "Admins can insert profile logs" 
ON profile_logs 
FOR INSERT 
WITH CHECK (has_role('admin'::user_role_enum));
;
