
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface CreateAssociationParams {
  clientId: string;
  assetId: string;
  associationType: string;
  startDate: string;
  notes?: string;
  ssid?: string;
  pass?: string;
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

      // Map association type to association_id
      let associationId = 1; // Default to ALUGUEL
      if (params.associationType === 'ASSINATURA') {
        associationId = 2;
      } else if (params.associationType === 'EMPRESTIMO') {
        associationId = 3;
      }

      // Criar associação
      const insertData: any = {
        asset_id: params.assetId,
        client_id: params.clientId,
        association_id: associationId,
        entry_date: params.startDate,
        notes: params.notes
      };

      // Adicionar SSID e senha apenas se fornecidos
      if (params.ssid) {
        insertData.ssid = params.ssid;
      }
      if (params.pass) {
        insertData.pass = params.pass;
      }

      const { data, error } = await supabase
        .from('asset_client_assoc')
        .insert(insertData)
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
