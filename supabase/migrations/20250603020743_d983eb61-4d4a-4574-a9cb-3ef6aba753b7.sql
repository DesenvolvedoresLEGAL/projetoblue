
-- Migração da estrutura da tabela clients (CORRIGIDA - SEM IF NOT EXISTS)
-- PASSO 1: Adicionar novos campos
ALTER TABLE public.clients 
ADD COLUMN IF NOT EXISTS empresa text,
ADD COLUMN IF NOT EXISTS responsavel text,
ADD COLUMN IF NOT EXISTS telefones jsonb DEFAULT '[]'::jsonb;

-- PASSO 2: Migrar dados existentes (nome -> empresa)
UPDATE public.clients 
SET empresa = nome
WHERE empresa IS NULL;

-- PASSO 3: Preencher responsavel com valor padrão baseado na empresa
UPDATE public.clients 
SET responsavel = COALESCE(responsavel, empresa, 'Responsável não informado')
WHERE responsavel IS NULL;

-- PASSO 4: Migrar dados de contato para array de telefones
UPDATE public.clients 
SET telefones = jsonb_build_array(contato::text)
WHERE telefones = '[]'::jsonb AND contato IS NOT NULL;

-- PASSO 5: Tornar novos campos obrigatórios APENAS após preencher valores
ALTER TABLE public.clients 
ALTER COLUMN empresa SET NOT NULL,
ALTER COLUMN responsavel SET NOT NULL;

-- PASSO 6: Adicionar constraint para validar telefones (sem IF NOT EXISTS)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'check_telefones_array' 
        AND table_name = 'clients'
    ) THEN
        ALTER TABLE public.clients 
        ADD CONSTRAINT check_telefones_array 
        CHECK (jsonb_typeof(telefones) = 'array');
    END IF;
END $$;

-- PASSO 7: Comentários para documentação
COMMENT ON COLUMN public.clients.empresa IS 'Nome/Razão social da empresa';
COMMENT ON COLUMN public.clients.responsavel IS 'Nome do responsável principal';
COMMENT ON COLUMN public.clients.telefones IS 'Array de telefones em formato JSONB';
;
