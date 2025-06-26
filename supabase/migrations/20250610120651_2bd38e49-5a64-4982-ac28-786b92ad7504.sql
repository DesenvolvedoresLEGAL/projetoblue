
-- 1. Remover políticas RLS que dependem do enum user_role_enum
DROP POLICY IF EXISTS "Admins can do everything with referrals" ON bits_referrals;
DROP POLICY IF EXISTS "Gestores can manage all referrals" ON bits_referrals;
DROP POLICY IF EXISTS "Consultores can manage their own referrals" ON bits_referrals;
DROP POLICY IF EXISTS "Clientes can view their own referrals" ON bits_referrals;
DROP POLICY IF EXISTS "Clientes can create referrals" ON bits_referrals;
DROP POLICY IF EXISTS "Admins can view all profile logs" ON profile_logs;
DROP POLICY IF EXISTS "Admins can insert profile logs" ON profile_logs;

-- 2. Remover funções que dependem do enum
DROP FUNCTION IF EXISTS public.has_role(user_role_enum);
DROP FUNCTION IF EXISTS public.update_user_role(text, user_role_enum);
DROP FUNCTION IF EXISTS public.ensure_user_profile(uuid, text, user_role_enum);
DROP FUNCTION IF EXISTS public.admin_update_user_role(uuid, user_role_enum);

-- 3. Criar novo enum sem os roles removidos
CREATE TYPE user_role_enum_new AS ENUM ('admin', 'suporte', 'cliente', 'user');

-- 4. Alterar valor padrão da coluna role
ALTER TABLE public.profiles ALTER COLUMN role DROP DEFAULT;

-- 5. Converter a coluna para o novo enum
ALTER TABLE public.profiles 
ALTER COLUMN role TYPE user_role_enum_new 
USING role::text::user_role_enum_new;

-- 6. Restaurar o padrão com o novo enum
ALTER TABLE public.profiles ALTER COLUMN role SET DEFAULT 'cliente'::user_role_enum_new;

-- 7. Remover o enum antigo usando CASCADE
DROP TYPE user_role_enum CASCADE;

-- 8. Renomear o novo enum
ALTER TYPE user_role_enum_new RENAME TO user_role_enum;

-- 9. Recriar funções essenciais com a nova hierarquia
CREATE OR REPLACE FUNCTION public.has_role(role_name user_role_enum)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = role_name
  );
$function$;

CREATE OR REPLACE FUNCTION public.has_minimum_role(required_role user_role_enum)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  user_role user_role_enum;
  role_hierarchy jsonb := '{"admin": 3, "suporte": 2, "cliente": 1, "user": 0}';
BEGIN
  SELECT role INTO user_role FROM profiles WHERE id = auth.uid();
  
  -- If user not found or role doesn't exist in hierarchy
  IF user_role IS NULL OR role_hierarchy->>user_role::text IS NULL THEN
    RETURN false;
  END IF;
  
  RETURN (role_hierarchy->>user_role::text)::int >= (role_hierarchy->>required_role::text)::int;
END;
$function$;

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

-- 10. Recriar políticas RLS atualizadas (removendo referências a gestor/consultor)
CREATE POLICY "Admins can do everything with referrals" 
  ON bits_referrals 
  FOR ALL 
  TO authenticated 
  USING (has_role('admin'::user_role_enum));

CREATE POLICY "Suporte can manage all referrals" 
  ON bits_referrals 
  FOR ALL 
  TO authenticated 
  USING (has_role('suporte'::user_role_enum));

CREATE POLICY "Clientes can view their own referrals" 
  ON bits_referrals 
  FOR SELECT 
  TO authenticated 
  USING (referrer_user_id = auth.uid());

CREATE POLICY "Clientes can create referrals" 
  ON bits_referrals 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (referrer_user_id = auth.uid());

CREATE POLICY "Admins can view all profile logs" 
  ON profile_logs 
  FOR SELECT 
  TO authenticated 
  USING (has_role('admin'::user_role_enum));

CREATE POLICY "Admins can insert profile logs" 
  ON profile_logs 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (has_role('admin'::user_role_enum));
;
