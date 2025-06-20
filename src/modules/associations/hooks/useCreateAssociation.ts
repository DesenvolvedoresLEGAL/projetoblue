
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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

  return useMutation({
    mutationFn: async (params: CreateAssociationParams) => {
      console.log('🔧 useCreateAssociation - Creating association with params:', params);
      
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

      // Atualizar status do ativo com o status correto baseado no tipo de associação
      const { error: assetError } = await supabase
        .from('assets')
        .update({ status_id: statusId })
        .eq('uuid', params.assetId);

      if (assetError) {
        console.error('❌ Error updating asset status:', assetError);
        throw assetError;
      }

      // Criar associação
      const { data, error } = await supabase
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

      if (error) {
        console.error('❌ Error creating association:', error);
        throw error;
      }

      console.log('✅ Association created successfully:', data);
      return data;
    },
    onSuccess: () => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['associations'] });
      queryClient.invalidateQueries({ queryKey: ['available-assets'] });
      queryClient.invalidateQueries({ queryKey: ['associations-list-optimized'] });
    }
  });
};
