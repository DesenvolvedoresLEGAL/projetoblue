
-- Habilitar RLS na tabela operation_locks
ALTER TABLE public.operation_locks ENABLE ROW LEVEL SECURITY;

-- Política SELECT: Usuários podem ver seus próprios locks ou admins podem ver todos
CREATE POLICY "Users can view their own locks or admins can view all"
ON public.operation_locks
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() 
  OR has_minimum_role('admin'::user_role_enum)
  OR user_id IS NULL  -- Permitir acesso a locks do sistema
);

-- Política INSERT: Usuários podem criar locks ou admins podem criar qualquer um
CREATE POLICY "Users can create locks or admins can create any"
ON public.operation_locks
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid() 
  OR has_minimum_role('admin'::user_role_enum)
);

-- Política UPDATE: Usuários podem atualizar seus próprios locks ou admins podem atualizar qualquer um
CREATE POLICY "Users can update their own locks or admins can update any"
ON public.operation_locks
FOR UPDATE
TO authenticated
USING (
  user_id = auth.uid() 
  OR has_minimum_role('admin'::user_role_enum)
)
WITH CHECK (
  user_id = auth.uid() 
  OR has_minimum_role('admin'::user_role_enum)
);

-- Política DELETE: Usuários podem deletar seus próprios locks ou admins podem deletar qualquer um
CREATE POLICY "Users can delete their own locks or admins can delete any"
ON public.operation_locks
FOR DELETE
TO authenticated
USING (
  user_id = auth.uid() 
  OR has_minimum_role('admin'::user_role_enum)
);

-- Atualizar a função cleanup_expired_locks para usar SECURITY DEFINER
-- para que funcione mesmo com RLS habilitado
CREATE OR REPLACE FUNCTION public.cleanup_expired_locks()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM operation_locks WHERE expires_at < NOW();
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$function$;
