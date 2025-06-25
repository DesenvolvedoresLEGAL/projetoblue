
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/utils/toast';
import { useIdempotentAssociation } from './useIdempotentAssociation';

interface CreateAssociationData {
  clientId: string;
  associationTypeId: number; // Mudado para number
  startDate: string; // Deve ser ISO string completa
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
    rentedDays: number; // Garantir que seja numérico
  };
}

interface CreateAssociationResult {
  success: boolean;
  message: string;
  details?: any;
  error_code?: string;
  error_detail?: string;
}

// Interface para o resultado do RPC
interface RPCResult {
  success: boolean;
  message: string;
  inserted_count?: number;
  failed_count?: number;
  total_processed?: number;
  inserted_ids?: number[];
  failed_assets?: any[];
  error_code?: string;
  error_detail?: string;
}

export const useCreateAssociation = () => {
  const queryClient = useQueryClient();
  const { executeWithIdempotency } = useIdempotentAssociation();

  return useMutation({
    mutationFn: async (data: CreateAssociationData): Promise<CreateAssociationResult> => {
      console.log('[useCreateAssociation] Iniciando criação de associação com dados:', data);

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
        console.error('[useCreateAssociation] Erro de validação:', errorMsg);
        console.error('[useCreateAssociation] Dados recebidos:', {
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
        formattedStartDate = dateObj.toISOString();
        console.log('[useCreateAssociation] Data formatada:', formattedStartDate);
      } catch (error) {
        console.error('[useCreateAssociation] Erro ao formatar data:', error);
        throw new Error('Formato de data inválido');
      }

      // Garantir que rentedDays seja numérico
      const rentedDays = Number(data.generalConfig?.rentedDays) || 0;
      console.log('[useCreateAssociation] RentedDays normalizado:', rentedDays);

      // Preparar dados para o RPC
      const rpcData = {
        p_client_id: data.clientId,
        p_association_id: data.associationTypeId, // Agora é number
        p_entry_date: formattedStartDate,
        p_asset_ids: data.selectedAssets.map(asset => asset.id),
        p_exit_date: data.endDate ? new Date(data.endDate).toISOString() : null,
        p_notes: data.generalConfig?.notes || null,
        p_ssid: data.generalConfig?.ssid || null,
        p_pass: data.generalConfig?.password || null,
        p_gb: data.generalConfig?.dataLimit || null
      };

      console.log('[useCreateAssociation] Dados preparados para RPC:', rpcData);

      // Executar com idempotência
      return executeWithIdempotency(
        `create_association_${data.clientId}_${data.associationTypeId}_${formattedStartDate}`,
        async () => {
          console.log('[useCreateAssociation] Chamando RPC add_assets_to_association...');
          
          const { data: result, error } = await supabase.rpc('add_assets_to_association', rpcData);

          if (error) {
            console.error('[useCreateAssociation] Erro do Supabase:', error);
            
            // Melhor tratamento de erro com detalhes específicos
            const errorMessage = error.message || 'Erro desconhecido ao criar associação';
            const errorDetails = {
              code: error.code || 'UNKNOWN_ERROR',
              hint: error.hint,
              details: error.details,
              supabase_error: error
            };

            console.error('[useCreateAssociation] Detalhes do erro:', errorDetails);
            
            throw new Error(`${errorMessage} (Código: ${errorDetails.code})`);
          }

          if (!result) {
            console.error('[useCreateAssociation] RPC retornou resultado vazio');
            throw new Error('Resposta vazia do servidor');
          }

          console.log('[useCreateAssociation] Resultado do RPC:', result);

          // Tratar result como RPCResult
          const rpcResult = result as RPCResult;

          // Verificar se houve sucesso
          if (!rpcResult.success) {
            const errorMsg = rpcResult.message || 'Erro ao criar associação';
            const errorCode = rpcResult.error_code || 'UNKNOWN_ERROR';
            
            console.error('[useCreateAssociation] RPC indicou falha:', {
              message: errorMsg,
              error_code: errorCode,
              details: rpcResult
            });

            // Criar erro com detalhes estruturados
            const detailedError = new Error(errorMsg);
            (detailedError as any).details = {
              error_code: errorCode,
              failed_assets: rpcResult.failed_assets || [],
              inserted_count: rpcResult.inserted_count || 0,
              failed_count: rpcResult.failed_count || 0,
              total_processed: rpcResult.total_processed || 0
            };
            
            throw detailedError;
          }

          return {
            success: true,
            message: rpcResult.message || 'Associação criada com sucesso',
            details: {
              inserted_count: rpcResult.inserted_count || 0,
              failed_count: rpcResult.failed_count || 0,
              total_processed: rpcResult.total_processed || 0,
              inserted_ids: rpcResult.inserted_ids || [],
              failed_assets: rpcResult.failed_assets || []
            }
          };
        }
      );
    },
    onSuccess: (result) => {
      console.log('[useCreateAssociation] Sucesso:', result);
      
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
    onError: (error: any) => {
      console.error('[useCreateAssociation] Erro capturado:', error);
      
      // Mostrar erro com detalhes técnicos quando disponível
      let errorMessage = 'Erro ao criar associação';
      
      if (error.message) {
        errorMessage = error.message;
      }
      
      if (error.details) {
        console.error('[useCreateAssociation] Detalhes técnicos do erro:', error.details);
        
        // Adicionar informações técnicas ao toast para debugging
        if (error.details.error_code) {
          errorMessage += ` (${error.details.error_code})`;
        }
        
        if (error.details.failed_assets?.length > 0) {
          errorMessage += ` - ${error.details.failed_assets.length} ativos falharam`;
        }
      }
      
      toast.error(errorMessage);
    }
  });
};
