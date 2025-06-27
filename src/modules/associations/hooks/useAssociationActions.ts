
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useIdempotentAssociation } from './useIdempotentAssociation';
import { toast } from '@/utils/toast';

export const useAssociationActions = () => {
  const queryClient = useQueryClient();
  const { executeWithIdempotency } = useIdempotentAssociation();

  const endAssociation = useMutation({
    mutationFn: async ({ associationId, assetId }: { associationId: number; assetId: string }) => {
      console.log('🔧 useAssociationActions - Ending association:', { associationId, assetId });

      // Executar com idempotência e validação automática
      const result = await executeWithIdempotency(
        `end_association_${assetId}_${associationId}`,
        async () => {
          // Buscar status "DISPONÍVEL" dinamicamente
          const { data: statusData, error: statusError } = await supabase
            .from('asset_status')
            .select('id')
            .ilike('status', 'disponível')
            .limit(1)
            .single();

          if (statusError || !statusData) {
            throw new Error('Status DISPONÍVEL não encontrado');
          }

          const availableStatusId = statusData.id;

          // Usar transação manual sem RPC functions
          // Encerrar associação (definir exit_date)
          const { data: assocData, error: assocError } = await supabase
            .from('asset_client_assoc')
            .update({
              exit_date: new Date().toISOString().split('T')[0] // Data atual
            })
            .eq('id', associationId)
            .eq('asset_id', assetId)
            .is('exit_date', null) // Só atualizar se ainda não tem exit_date
            .select()
            .single();

          if (assocError) throw assocError;

          // Verificar se a associação realmente foi atualizada
          if (!assocData) {
            throw new Error('Associação não encontrada ou já foi encerrada');
          }

          // Atualizar status do ativo para DISPONÍVEL
          const { error: assetError } = await supabase
            .from('assets')
            .update({ status_id: availableStatusId })
            .eq('uuid', assetId);

          if (assetError) throw assetError;

          return assocData;
        }
      );

      if (result) {
        console.log('✅ Association ended successfully:', result);
        toast.success('Associação encerrada com sucesso!');
      }

      return result;
    },
    onSuccess: () => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['associations'] });
      queryClient.invalidateQueries({ queryKey: ['associations-list-optimized'] });
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    },
    onError: (error) => {
      console.error('Error in endAssociation:', error);
      // O toast de erro já é mostrado pelo hook useIdempotentAssociation
    }
  });

  const bulkEndAssociations = useMutation({
    mutationFn: async (associations: Array<{ id: number; asset_id: string }>) => {
      console.log('🔧 useAssociationActions - Bulk ending associations:', associations);

      const results = [];
      const errors = [];

      // Processar associações uma por uma para manter idempotência individual
      for (const assoc of associations) {
        try {
          const result = await endAssociation.mutateAsync({
            associationId: assoc.id,
            assetId: assoc.asset_id
          });
          results.push(result);
        } catch (error) {
          console.error(`Error ending association ${assoc.id}:`, error);
          errors.push({ associationId: assoc.id, error });
        }
      }

      if (errors.length > 0) {
        console.warn(`${errors.length} associations failed to end:`, errors);
        toast.warning(`${results.length} associações encerradas, ${errors.length} falharam`);
      } else {
        toast.success(`Todas as ${results.length} associações foram encerradas com sucesso!`);
      }

      return { results, errors };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['associations'] });
      queryClient.invalidateQueries({ queryKey: ['associations-list-optimized'] });
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    }
  });

  // Função helper para compatibilidade com o código existente
  const handleEndAssociation = async (associationId: number, assetId: string) => {
    return endAssociation.mutateAsync({ associationId, assetId });
  };

  return {
    endAssociation,
    bulkEndAssociations,
    handleEndAssociation,
    isEndingAssociation: endAssociation.isPending,
    operationProgress: { current: 0, total: 0 } // Mock para compatibilidade
  };
};
