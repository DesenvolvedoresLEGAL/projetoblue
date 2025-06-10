
-- Atualizar a função has_minimum_role com a nova hierarquia
-- admin: 5, gestor: 4, consultor: 3, suporte: 2, cliente: 1, user: 0
CREATE OR REPLACE FUNCTION public.has_minimum_role(required_role user_role_enum)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  user_role user_role_enum;
  role_hierarchy jsonb := '{"admin": 5, "gestor": 4, "consultor": 3, "suporte": 2, "cliente": 1, "user": 0}';
BEGIN
  SELECT role INTO user_role FROM profiles WHERE id = auth.uid();
  
  -- If user not found or role doesn't exist in hierarchy
  IF user_role IS NULL OR role_hierarchy->>user_role::text IS NULL THEN
    RETURN false;
  END IF;
  
  RETURN (role_hierarchy->>user_role::text)::int >= (role_hierarchy->>required_role::text)::int;
END;
$function$
