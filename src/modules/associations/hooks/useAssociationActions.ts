
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/utils/toast';

export const useAssociationActions = () => {
  const queryClient = useQueryClient();

  const endAssociation = useMutation({
    mutationFn: async ({ associationId, exitDate }: { associationId: number; exitDate: string }) => {
      console.log('Finalizando associação:', associationId, 'em', exitDate);
      
      const { data, error } = await supabase
        .from('asset_client_assoc')
        .update({ 
          exit_date: exitDate,
          updated_at: new Date().toISOString()
        })
        .eq('id', associationId)
        .select();

      if (error) {
        console.error('Erro ao finalizar associação:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      toast.success('Associação finalizada com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['associations'] });
    },
    onError: (error: any) => {
      console.error('Erro ao finalizar associação:', error);
      toast.error('Erro ao finalizar associação');
    }
  });

  return {
    endAssociation: endAssociation.mutate,
    isEndingAssociation: endAssociation.isPending
  };
};
