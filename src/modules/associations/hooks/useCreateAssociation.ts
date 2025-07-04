
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/utils/toast';
import { useIdempotentAssociation } from './useIdempotentAssociation';

interface CreateAssociationData {
  clientId: string;
  associationTypeId: number;
  startDate: string;
  endDate?: string;
  selectedAssets: Array<{
    id: string;
    type: string;
    identifier: string;
  }>;
  generalConfig: {
    notes?: string;
    ssid?: string;
    password?: string;
    dataLimit?: number;
    rentedDays: number;
  };
}

interface CreateAssociationResult {
  success: boolean;
  message: string;
  details?: {
    inserted_count: number;
    failed_count: number;
    total_processed: number;
    inserted_ids: number[];
    failed_assets: Array<{
      asset_id: string;
      error_code: string;
      message: string;
    }>;
  };
}

// Função para validar e extrair dados do resultado JSON
const parseRpcResult = (result: unknown): CreateAssociationResult => {
  // Se result é null ou undefined
  if (!result) {
    throw new Error('Resposta vazia do servidor');
  }

  // Se result é um objeto JSON
  if (typeof result === 'object') {
    return {
      success: result.success === true,
      message: result.message || 'Operação concluída',
      details: result.success ? {
        inserted_count: result.inserted_count || 0,
        failed_count: result.failed_count || 0,
        total_processed: result.total_processed || 0,
        inserted_ids: result.inserted_ids || [],
        failed_assets: result.failed_assets || []
      } : undefined
    };
  }

  // Se result é uma string, tentar parsear como JSON
  if (typeof result === 'string') {
    try {
      const parsedResult = JSON.parse(result);
      return parseRpcResult(parsedResult);
    } catch {
      throw new Error('Formato de resposta inválido do servidor');
    }
  }

  // Fallback para outros tipos
  throw new Error('Formato de resposta não reconhecido');
};

export const useCreateAssociation = () => {
  const queryClient = useQueryClient();
  const { executeWithIdempotency, clearOperationCache } = useIdempotentAssociation();

  return useMutation({
    mutationFn: async (data: CreateAssociationData): Promise<CreateAssociationResult> => {
      if (import.meta.env.DEV) console.log('[useCreateAssociation] Iniciando criação de associação com dados:', data);

      // Validação de entrada mais rigorosa com logs detalhados
      const validationErrors: string[] = [];
      
      if (!data.clientId) {
        validationErrors.push('clientId não fornecido');
      }
      
      if (!data.associationTypeId || typeof data.associationTypeId !== 'number') {
        validationErrors.push(`associationTypeId inválido: ${data.associationTypeId} (tipo: ${typeof data.associationTypeId})`);
      }
      
      if (!data.startDate) {
        validationErrors.push('startDate não fornecida');
      }
      
      if (!data.selectedAssets?.length) {
        validationErrors.push('selectedAssets vazio ou não fornecido');
      }

      if (validationErrors.length > 0) {
        const errorMsg = `Dados obrigatórios não fornecidos: ${validationErrors.join(', ')}`;
        if (import.meta.env.DEV) console.error('[useCreateAssociation] Erro de validação:', errorMsg);
        if (import.meta.env.DEV) console.error('[useCreateAssociation] Dados recebidos:', {
          clientId: data.clientId,
          associationTypeId: data.associationTypeId,
          startDate: data.startDate,
          selectedAssetsLength: data.selectedAssets?.length,
          selectedAssets: data.selectedAssets
        });
        throw new Error(errorMsg);
      }

      // Garantir que startDate está no formato ISO completo
      let formattedStartDate: string;
      try {
        const dateObj = new Date(data.startDate);
        if (isNaN(dateObj.getTime())) {
          throw new Error('Data de início inválida');
        }
        formattedStartDate = dateObj.toISOString().split('T')[0]; // Formato YYYY-MM-DD
        if (import.meta.env.DEV) console.log('[useCreateAssociation] Data formatada:', formattedStartDate);
      } catch (error) {
        if (import.meta.env.DEV) console.error('[useCreateAssociation] Erro ao formatar data:', error);
        throw new Error('Formato de data inválido');
      }

      // Garantir que rentedDays seja numérico
      const rentedDays = Number(data.generalConfig?.rentedDays) || 0;
      if (import.meta.env.DEV) console.log('[useCreateAssociation] RentedDays normalizado:', rentedDays);

      // Preparar dados para o RPC
      const rpcData = {
        p_client_id: data.clientId,
        p_association_id: data.associationTypeId,
        p_entry_date: formattedStartDate,
        p_asset_ids: data.selectedAssets.map(asset => asset.id),
        p_exit_date: data.endDate ? new Date(data.endDate).toISOString().split('T')[0] : null,
        p_notes: data.generalConfig?.notes || null,
        p_ssid: data.generalConfig?.ssid || null,
        p_pass: data.generalConfig?.password || null,
        p_gb: data.generalConfig?.dataLimit || null
      };

      if (import.meta.env.DEV) console.log('[useCreateAssociation] Dados preparados para RPC:', rpcData);

      // Executar com idempotência
      return executeWithIdempotency(
        `create_association_${data.clientId}_${data.associationTypeId}_${formattedStartDate}`,
        async () => {
          if (import.meta.env.DEV) console.log('[useCreateAssociation] Chamando RPC add_assets_to_association...');
          
          const { data: result, error } = await supabase.rpc('add_assets_to_association', rpcData);

          if (error) {
            if (import.meta.env.DEV) console.error('[useCreateAssociation] Erro do Supabase:', error);
            
            // Melhor tratamento de erro com detalhes específicos
            const errorMessage = error.message || 'Erro desconhecido ao criar associação';
            const errorDetails = {
              code: error.code || 'UNKNOWN_ERROR',
              hint: error.hint,
              details: error.details,
              supabase_error: error
            };

            if (import.meta.env.DEV) console.error('[useCreateAssociation] Detalhes do erro:', errorDetails);
            
            throw new Error(`${errorMessage} (Código: ${errorDetails.code})`);
          }

          if (import.meta.env.DEV) console.log('[useCreateAssociation] Resultado bruto do RPC:', result);

          // Processar resultado usando função helper
          const processedResult = parseRpcResult(result);
          
          if (import.meta.env.DEV) console.log('[useCreateAssociation] Resultado processado:', processedResult);

          // Verificar se houve sucesso
          if (!processedResult.success) {
            const errorMsg = processedResult.message || 'Erro ao criar associação';
            
            if (import.meta.env.DEV) console.error('[useCreateAssociation] RPC indicou falha:', {
              message: errorMsg,
              details: processedResult.details
            });

            throw new Error(errorMsg);
          }

          return processedResult;
        }
      );
    },
    onSuccess: (result) => {
      if (import.meta.env.DEV) console.log('[useCreateAssociation] Sucesso:', result);
      
      // Mostrar mensagem de sucesso detalhada
      const successMessage = result.details 
        ? `${result.message} (${result.details.inserted_count} ativos associados)`
        : result.message;
      
      toast.success(successMessage);
      
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['associations'] });
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
    onError: (error: unknown, variables) => {
      if (import.meta.env.DEV) console.error('[useCreateAssociation] Erro capturado:', error);

      // Limpar possível cache da operação para permitir nova tentativa
      try {
        const startDateKey = new Date(variables.startDate).toISOString().split('T')[0];
        const operationKey = `create_association_${variables.clientId}_${variables.associationTypeId}_${startDateKey}`;
        clearOperationCache(operationKey);
      } catch (e) {
        if (import.meta.env.DEV) console.error('[useCreateAssociation] Falha ao limpar cache da operação:', e);
      }

      // Mostrar erro com detalhes técnicos quando disponível
      let errorMessage = 'Erro ao criar associação';

      if (error instanceof Error && error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    }
  });
};
