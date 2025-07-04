
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

// Função auxiliar que apenas tipa o retorno da operação de insert
// mantendo compatibilidade com a antiga interface do RPC
const buildInsertResult = (ids: number[], total: number): CreateAssociationResult => {
  return {
    success: true,
    message: 'Associação criada com sucesso',
    details: {
      inserted_count: ids.length,
      failed_count: total - ids.length,
      total_processed: total,
      inserted_ids: ids,
      failed_assets: []
    }
  };
};

export const useCreateAssociation = () => {
  const queryClient = useQueryClient();
  const { executeWithIdempotency } = useIdempotentAssociation();

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

      // Preparar dados para inserção direta
      const insertPayload = data.selectedAssets.map(asset => ({
        asset_id: asset.id,
        client_id: data.clientId,
        association_id: data.associationTypeId,
        entry_date: formattedStartDate,
        exit_date: data.endDate ? new Date(data.endDate).toISOString().split('T')[0] : null,
        notes: data.generalConfig?.notes || null,
        ssid: data.generalConfig?.ssid || null,
        pass: data.generalConfig?.password || null,
        gb: data.generalConfig?.dataLimit || null
      }));

      if (import.meta.env.DEV) console.log('[useCreateAssociation] Payload de inserção:', insertPayload);

      // Executar com idempotência
      return executeWithIdempotency(
        `create_association_${data.clientId}_${data.associationTypeId}_${formattedStartDate}`,
        async () => {
          if (import.meta.env.DEV) console.log('[useCreateAssociation] Inserindo associações diretamente...');

          const { data: inserted, error } = await supabase
            .from('asset_client_assoc')
            .insert(insertPayload)
            .select('id');

          if (error) {
            if (import.meta.env.DEV) console.error('[useCreateAssociation] Erro do Supabase:', error);
            throw new Error(error.message || 'Erro desconhecido ao criar associação');
          }

          const insertedIds = inserted ? inserted.map(rec => rec.id as number) : [];

          const result = buildInsertResult(insertedIds, insertPayload.length);

          if (import.meta.env.DEV) console.log('[useCreateAssociation] Resultado da inserção:', result);

          return result;
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
    onError: (error: unknown) => {
      if (import.meta.env.DEV) console.error('[useCreateAssociation] Erro capturado:', error);

      // Mostrar erro com detalhes técnicos quando disponível
      let errorMessage = 'Erro ao criar associação';

      if (error instanceof Error && error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    }
  });
};
