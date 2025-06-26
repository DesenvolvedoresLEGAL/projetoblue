
-- Criar tabela de logs específica para clientes
CREATE TABLE public.client_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  details JSONB,
  performed_by UUID,
  performed_by_email TEXT,
  date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  old_data JSONB,
  new_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar índices para performance
CREATE INDEX idx_client_logs_client_id ON public.client_logs(client_id);
CREATE INDEX idx_client_logs_date ON public.client_logs(date DESC);
CREATE INDEX idx_client_logs_event_type ON public.client_logs(event_type);

-- Criar função para registrar logs de clientes
CREATE OR REPLACE FUNCTION public.log_client_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_email TEXT;
  safe_user_id UUID;
BEGIN
  SET search_path TO public;

  -- Obter user_id com fallback seguro
  safe_user_id := COALESCE(auth.uid(), NULL);

  -- Obter o email do usuário atual (se disponível)
  IF safe_user_id IS NOT NULL THEN
    SELECT email INTO user_email FROM auth.users WHERE id = safe_user_id;
  END IF;

  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.client_logs (
      client_id,
      event_type,
      details,
      performed_by,
      performed_by_email,
      date,
      old_data,
      new_data
    ) VALUES (
      NEW.uuid,
      'CLIENTE_CRIADO',
      jsonb_build_object(
        'empresa', NEW.empresa,
        'responsavel', NEW.responsavel,
        'email', NEW.email,
        'cnpj', NEW.cnpj,
        'telefones', NEW.telefones,
        'operation', 'INSERT',
        'timestamp', NOW()
      ),
      safe_user_id,
      COALESCE(user_email, 'sistema'),
      NOW(),
      NULL,
      row_to_json(NEW)::jsonb
    );
    RETURN NEW;
    
  ELSIF TG_OP = 'UPDATE' THEN
    -- Registrar apenas se houve mudanças relevantes (ignorar updated_at)
    IF (OLD.empresa IS DISTINCT FROM NEW.empresa) OR
       (OLD.responsavel IS DISTINCT FROM NEW.responsavel) OR
       (OLD.email IS DISTINCT FROM NEW.email) OR
       (OLD.cnpj IS DISTINCT FROM NEW.cnpj) OR
       (OLD.telefones IS DISTINCT FROM NEW.telefones) OR
       (OLD.deleted_at IS DISTINCT FROM NEW.deleted_at) THEN
      
      INSERT INTO public.client_logs (
        client_id,
        event_type,
        details,
        performed_by,
        performed_by_email,
        date,
        old_data,
        new_data
      ) VALUES (
        NEW.uuid,
        CASE 
          WHEN OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL THEN 'CLIENTE_EXCLUIDO'
          ELSE 'CLIENTE_ATUALIZADO'
        END,
        jsonb_build_object(
          'empresa', NEW.empresa,
          'responsavel', NEW.responsavel,
          'email', NEW.email,
          'cnpj', NEW.cnpj,
          'telefones', NEW.telefones,
          'changes', jsonb_build_object(
            'empresa_changed', OLD.empresa IS DISTINCT FROM NEW.empresa,
            'responsavel_changed', OLD.responsavel IS DISTINCT FROM NEW.responsavel,
            'email_changed', OLD.email IS DISTINCT FROM NEW.email,
            'cnpj_changed', OLD.cnpj IS DISTINCT FROM NEW.cnpj,
            'telefones_changed', OLD.telefones IS DISTINCT FROM NEW.telefones,
            'soft_deleted', OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL
          ),
          'operation', 'UPDATE',
          'timestamp', NOW()
        ),
        safe_user_id,
        COALESCE(user_email, 'sistema'),
        NOW(),
        row_to_json(OLD)::jsonb,
        row_to_json(NEW)::jsonb
      );
    END IF;
    RETURN NEW;
    
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.client_logs (
      client_id,
      event_type,
      details,
      performed_by,
      performed_by_email,
      date,
      old_data,
      new_data
    ) VALUES (
      OLD.uuid,
      'CLIENTE_EXCLUIDO',
      jsonb_build_object(
        'empresa', OLD.empresa,
        'responsavel', OLD.responsavel,
        'email', OLD.email,
        'cnpj', OLD.cnpj,
        'telefones', OLD.telefones,
        'operation', 'DELETE',
        'timestamp', NOW()
      ),
      safe_user_id,
      COALESCE(user_email, 'sistema'),
      NOW(),
      row_to_json(OLD)::jsonb,
      NULL
    );
    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$;

-- Criar triggers na tabela clients
DROP TRIGGER IF EXISTS client_changes_trigger ON public.clients;
CREATE TRIGGER client_changes_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.log_client_changes();

-- Adicionar trigger para updated_at na tabela client_logs
DROP TRIGGER IF EXISTS client_logs_updated_at_trigger ON public.client_logs;
CREATE TRIGGER client_logs_updated_at_trigger
  BEFORE UPDATE ON public.client_logs
  FOR EACH ROW EXECUTE FUNCTION public.update_generic_updated_at_column();
;
