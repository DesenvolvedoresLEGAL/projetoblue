
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useIdempotentAssociation } from './useIdempotentAssociation';
import { toast } from '@/utils/toast';

interface CreateAssociationParams {
  clientId: string;
  assetId: string;
  associationType: string;
  startDate: string;
  rentedDays?: number;
  notes?: string;
}

export const useCreateAssociation = () => {
  const queryClient = useQueryClient();
  const { executeWithIdempotency } = useIdempotentAssociation();

  return useMutation({
    mutationFn: async (params: CreateAssociationParams) => {
      console.log('🔧 useCreateAssociation - Creating association with params:', params);
      
      // Executar com idempotência e validação automática
      const result = await executeWithIdempotency(
        params.assetId,
        'CREATE',
        async () => {
          // Mapear tipo de associação para association_id e status_id corretos
          let associationId: number;
          let statusId: number;
          
          switch (params.associationType) {
            case 'ASSINATURA':
              associationId = 2;
              statusId = 3; // Status "ASSINATURA"
              break;
            case 'ALUGUEL':
            default:
              associationId = 1;
              statusId = 2; // Status "ALUGADO"
              break;
          }

          console.log('📝 useCreateAssociation - Mapped association and status:', {
            input: params.associationType,
            mapped_association_id: associationId,
            mapped_status_id: statusId
          });

          // Usar transação para garantir atomicidade
          const { data, error } = await supabase.rpc('create_association_with_status', {
            p_asset_id: params.assetId,
            p_client_id: params.clientId,
            p_association_id: associationId,
            p_entry_date: params.startDate,
            p_notes: params.notes || null,
            p_new_status_id: statusId
          }).single();

          // Se a RPC não existe, fazer manualmente com transação
          if (error && error.code === '42883') { // função não encontrada
            console.log('RPC not found, using manual transaction');
            
            // Iniciar transação manual
            const { error: beginError } = await supabase.rpc('begin_transaction');
            if (beginError) throw beginError;

            try {
              // Atualizar status do ativo
              const { error: assetError } = await supabase
                .from('assets')
                .update({ status_id: statusId })
                .eq('uuid', params.assetId);

              if (assetError) throw assetError;

              // Criar associação
              const { data: assocData, error: assocError } = await supabase
                .from('asset_client_assoc')
                .insert({
                  asset_id: params.assetId,
                  client_id: params.clientId,
                  association_id: associationId,
                  entry_date: params.startDate,
                  notes: params.notes
                })
                .select()
                .single();

              if (assocError) throw assocError;

              // Commit da transação
              const { error: commitError } = await supabase.rpc('commit_transaction');
              if (commitError) throw commitError;

              return assocData;
            } catch (txError) {
              // Rollback em caso de erro
              await supabase.rpc('rollback_transaction');
              throw txError;
            }
          }

          if (error) {
            console.error('❌ Error creating association:', error);
            throw error;
          }

          return data;
        },
        undefined, // associationId não é necessário para CREATE
        'CREATE_ASSOCIATION'
      );

      if (result) {
        console.log('✅ Association created successfully:', result);
        toast.success('Associação criada com sucesso!');
      }

      return result;
    },
    onSuccess: () => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['associations'] });
      queryClient.invalidateQueries({ queryKey: ['available-assets'] });
      queryClient.invalidateQueries({ queryKey: ['associations-list-optimized'] });
    },
    onError: (error) => {
      console.error('Error in useCreateAssociation:', error);
      // O toast de erro já é mostrado pelo hook useIdempotentAssociation
    }
  });
};
