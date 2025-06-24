
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
      
      if (inserted_count > 0) {
        toast.success(
          `${inserted_count} ativo${inserted_count > 1 ? 's' : ''} adicionado${inserted_count > 1 ? 's' : ''} com sucesso!`
        );
      }
      
      if (failed_count > 0) {
        toast.warning(
          `${failed_count} ativo${failed_count > 1 ? 's' : ''} não puderam ser adicionados. Verifique os detalhes.`
        );
      }

      console.log('Resultado da adição:', message);

      // Invalidar caches relacionados às associações
      queryClient.invalidateQueries({
        queryKey: ['associations-list-optimized']
      });
      
      // Invalidar também queries de dashboard que podem usar dados de associações
      queryClient.invalidateQueries({
        queryKey: ['dashboard']
      });
    },
    onError: (error) => {
      console.error('Erro ao adicionar ativos:', error);
      toast.error('Erro ao adicionar ativos à associação');
    }
  });
};
