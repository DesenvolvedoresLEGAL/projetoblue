
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
      // Atualizar status do ativo para "EM USO"
      const { error: assetError } = await supabase
        .from('assets')
        .update({ status_id: 2 }) // 2 = EM USO
        .eq('uuid', params.assetId);

      if (assetError) throw assetError;

      // Criar associação
      const { data, error } = await supabase
        .from('asset_client_assoc')
        .insert({
          asset_id: params.assetId,
          client_id: params.clientId,
          association_type: params.associationType,
          entry_date: params.startDate,
          rented_days: params.rentedDays,
          notes: params.notes
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['associations'] });
      queryClient.invalidateQueries({ queryKey: ['available-assets'] });
    }
  });
};
