
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/utils/toast';
import { 
  addAssetsToAssociation, 
  AddAssetsToAssociationParams, 
  AddAssetsToAssociationResult 
} from '../services/addAssetsService';

export const useAddAssetsToAssociation = () => {
  const queryClient = useQueryClient();

  return useMutation<AddAssetsToAssociationResult, Error, AddAssetsToAssociationParams>({
    mutationFn: addAssetsToAssociation,
    onSuccess: (data) => {
      const { inserted_count, failed_count, message } = data;
      
      console.log('Resultado da adição:', message);

      // Lógica de toasts baseada nos resultados
      if (inserted_count > 0 && failed_count === 0) {
        // Todos os ativos foram adicionados com sucesso
        toast.success(
          `${inserted_count} ativo${inserted_count > 1 ? 's' : ''} adicionado${inserted_count > 1 ? 's' : ''} com sucesso!`
        );
      } else if (inserted_count > 0 && failed_count > 0) {
        // Alguns ativos foram adicionados, outros falharam
        toast.warning(
          `${inserted_count} ativo${inserted_count > 1 ? 's' : ''} adicionado${inserted_count > 1 ? 's' : ''}, mas ${failed_count} falharam. Verifique os detalhes.`
        );
      } else if (inserted_count === 0 && failed_count > 0) {
        // Nenhum ativo foi adicionado - todos falharam
        toast.error(
          `Nenhum ativo foi adicionado. ${failed_count} ativo${failed_count > 1 ? 's' : ''} falharam. Verifique se os ativos estão disponíveis.`
        );
      } else if (inserted_count === 0 && failed_count === 0) {
        // Caso edge - nada processado
        toast.warning('Nenhum ativo foi processado.');
      }

      // Apenas invalidar queries se pelo menos um ativo foi inserido
      if (inserted_count > 0) {
        queryClient.invalidateQueries({
          queryKey: ['associations-list-optimized']
        });
        
        queryClient.invalidateQueries({
          queryKey: ['dashboard']
        });
      }
    },
    onError: (error) => {
      console.error('Erro ao adicionar ativos:', error);
      toast.error('Erro ao adicionar ativos à associação');
    }
  });
};
