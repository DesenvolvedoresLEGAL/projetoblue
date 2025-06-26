
-- Criar função auxiliar para verificar se é role de suporte ou superior
CREATE OR REPLACE FUNCTION public.is_support_or_above()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT has_minimum_role('suporte'::user_role_enum);
$function$
;
