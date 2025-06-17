import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from "sonner";
import { AssociationGroup } from '@/types/associations';
import { useState } from 'react';
import { showFriendlyError } from '@/utils/errorTranslator';

export const useAssociationActions = () => {
  const queryClient = useQueryClient();
  const [isEndingAssociation, setIsEndingAssociation] = useState(false);
  const [isEndingGroup, setIsEndingGroup] = useState(false);
  const [operationProgress, setOperationProgress] = useState({ current: 0, total: 0 });

  // Função para forçar refresh completo dos dados
  const forceRefreshAssociationsData = async () => {
    try {
      // Invalidar e refetch forçado
      await queryClient.refetchQueries({ 
        queryKey: ['associations-list-optimized'],
        type: 'active'
      });
      
      // Aguardar um pouco para garantir que os dados foram atualizados
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('[useAssociationActions] Dados refreshados com sucesso');
    } catch (error) {
      console.error('[useAssociationActions] Erro ao fazer refresh dos dados:', error);
    }
  };

  // Função para encerrar associação individual
  const handleEndAssociation = async (associationId: number) => {
    if (isEndingAssociation) return;
    
    setIsEndingAssociation(true);
    try {
      console.log('[handleEndAssociation] Encerrando associação ID:', associationId);
      
      const { error } = await supabase
        .from('asset_client_assoc')
        .update({ 
          exit_date: new Date().toISOString().split('T')[0],
          updated_at: new Date().toISOString()
        })
        .eq('id', associationId);

      if (error) {
        console.error('[handleEndAssociation] Erro ao encerrar associação:', error);
        const friendlyMessage = showFriendlyError(error, 'update');
        toast.error(friendlyMessage);
        return;
      }

      console.log('[handleEndAssociation] Associação encerrada com sucesso');
      toast.success('Associação encerrada com sucesso');
      
      await forceRefreshAssociationsData();
    } catch (error) {
      console.error('[handleEndAssociation] Erro ao encerrar associação:', error);
      const friendlyMessage = showFriendlyError(error, 'update');
      toast.error(friendlyMessage);
    } finally {
      setIsEndingAssociation(false);
    }
  };

  // Função para encerrar grupo de associações com melhor controle
  const handleEndGroup = async (groupKey: string, groupedAssociations: { [key: string]: AssociationGroup }) => {
    if (isEndingGroup) return;
    
    setIsEndingGroup(true);
    setOperationProgress({ current: 0, total: 0 });

    try {
      const group = groupedAssociations[groupKey];
      
      if (!group) {
        console.error('[handleEndGroup] Grupo não encontrado:', groupKey);
        toast.error('Grupo de associações não encontrado. Recarregue a página e tente novamente.');
        return;
      }

      const today = new Date().toISOString().split('T')[0];
      const associationsToEnd = group.associations.filter(a => 
        !a.exit_date || a.exit_date > today
      );

      if (associationsToEnd.length === 0) {
        toast.error('Não há associações ativas para encerrar neste grupo');
        return;
      }

      const associationIds = associationsToEnd.map(a => a.id);
      setOperationProgress({ current: 0, total: associationIds.length });
      
      console.log('[handleEndGroup] Encerrando grupo de associações:', {
        groupKey,
        totalAssociations: group.totalAssets,
        associationsToEnd: associationsToEnd.length,
        associationIds
      });

      const progressToastId = toast.loading(`Encerrando ${associationsToEnd.length} associações...`);
      
      const { error } = await supabase
        .from('asset_client_assoc')
        .update({ 
          exit_date: today,
          updated_at: new Date().toISOString()
        })
        .in('id', associationIds);

      toast.dismiss(progressToastId);

      if (error) {
        console.error('[handleEndGroup] Erro ao encerrar grupo de associações:', error);
        const friendlyMessage = showFriendlyError(error, 'update');
        toast.error(friendlyMessage);
        return;
      }

      console.log('[handleEndGroup] Grupo de associações encerrado com sucesso');
      toast.success(`Grupo de ${associationsToEnd.length} associações encerrado com sucesso`);
      
      let retryCount = 0;
      const maxRetries = 3;
      
      while (retryCount < maxRetries) {
        try {
          await forceRefreshAssociationsData();
          break;
        } catch (refreshError) {
          retryCount++;
          console.warn(`[handleEndGroup] Tentativa ${retryCount} de refresh falhou:`, refreshError);
          
          if (retryCount >= maxRetries) {
            console.error('[handleEndGroup] Falha ao fazer refresh após múltiplas tentativas');
            toast.warning('Os dados podem levar alguns segundos para atualizar. Recarregue a página se necessário.');
          } else {
            await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
          }
        }
      }

    } catch (error) {
      console.error('[handleEndGroup] Erro ao encerrar grupo de associações:', error);
      const friendlyMessage = showFriendlyError(error, 'update');
      toast.error(friendlyMessage);
    } finally {
      setIsEndingGroup(false);
      setOperationProgress({ current: 0, total: 0 });
    }
  };

  return {
    handleEndAssociation,
    handleEndGroup,
    isEndingAssociation,
    isEndingGroup,
    operationProgress
  };
};
