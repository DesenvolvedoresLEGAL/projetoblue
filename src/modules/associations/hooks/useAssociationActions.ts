
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from "sonner";
import { useState } from 'react';
import { showFriendlyError } from '@/utils/errorTranslator';

export const useAssociationActions = () => {
  const queryClient = useQueryClient();
  const [isEndingAssociation, setIsEndingAssociation] = useState(false);
  const [operationProgress, setOperationProgress] = useState({ current: 0, total: 0 });

  // Função para forçar refresh completo dos dados com chave padronizada
  const forceRefreshAssociationsData = async () => {
    try {
      // Invalidar e refetch forçado usando a chave padronizada
      await queryClient.refetchQueries({ 
        queryKey: ['associations-list-optimized'],
        type: 'active'
      });
      
      // Aguardar um pouco para garantir que os dados foram atualizados
      await new Promise(resolve => setTimeout(resolve, 300));
      
      console.log('[useAssociationActions] Dados refreshados com sucesso');
    } catch (error) {
      console.error('[useAssociationActions] Erro ao fazer refresh dos dados:', error);
    }
  };

  // Função para verificar e garantir contexto de autenticação
  const ensureAuthenticatedContext = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('Usuário não autenticado. Faça login novamente.');
    }
    return session;
  };

  // Função para encerrar associação individual
  const handleEndAssociation = async (associationId: number) => {
    if (isEndingAssociation) return;
    
    setIsEndingAssociation(true);
    try {
      console.log('[handleEndAssociation] Encerrando associação ID:', associationId);
      
      // Garantir contexto de autenticação
      await ensureAuthenticatedContext();
      
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

  return {
    handleEndAssociation,
    isEndingAssociation,
    operationProgress
  };
};
