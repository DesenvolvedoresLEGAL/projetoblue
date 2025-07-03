
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner'; // Corrigido: usar sonner consistentemente
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
      const { inserted_count, failed_count, message, failed_assets } = data;
      
      if (import.meta.env.DEV) console.log('Resultado da adição:', message);

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
        
        // Log detalhado dos erros para debug
        if (import.meta.env.DEV) console.log('Ativos que falharam:', failed_assets);
      } else if (inserted_count === 0 && failed_count > 0) {
        // Nenhum ativo foi adicionado - todos falharam
        const errorDetails = failed_assets?.map(asset => 
          `${asset.asset_id}: ${asset.message}`
        ).join('; ') || 'Erros desconhecidos';
        
        toast.error(
          `Nenhum ativo foi adicionado. ${failed_count} ativo${failed_count > 1 ? 's' : ''} falharam.`,
          {
            description: errorDetails.length > 100 ? 
              errorDetails.substring(0, 100) + '...' : 
              errorDetails,
            duration: 8000 // Toast mais longo para permitir leitura dos detalhes
          }
        );
        
        // Log completo dos erros para debug
        if (import.meta.env.DEV) console.error('Todos os ativos falharam:', failed_assets);
      } else if (inserted_count === 0 && failed_count === 0) {
        // Caso edge - nada processado
        toast.warning('Nenhum ativo foi processado.');
      }

      // Invalidar queries apenas se pelo menos um ativo foi inserido
      if (inserted_count > 0) {
        // Invalidar de forma mais robusta com delay para evitar race conditions
        setTimeout(() => {
          queryClient.invalidateQueries({
            queryKey: ['associations-list-optimized']
          });
          
          queryClient.invalidateQueries({
            queryKey: ['dashboard']
          });
        }, 100);
      }
    },
    onError: (error) => {
      if (import.meta.env.DEV) console.error('Erro ao adicionar ativos:', error);
      
      // Toast de erro mais específico
      const errorMessage = error.message || 'Erro desconhecido';
      toast.error('Erro ao adicionar ativos à associação', {
        description: errorMessage.length > 100 ? 
          errorMessage.substring(0, 100) + '...' : 
          errorMessage,
        duration: 6000
      });
    }
  });
};
