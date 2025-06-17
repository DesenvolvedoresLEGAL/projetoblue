
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AssociationGroup } from '@/types/associations';

export const useGroupActions = () => {
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(false);
  const [operationProgress, setOperationProgress] = useState({ current: 0, total: 0 });

  // Função para invalidar cache de forma consistente
  const invalidateAssociationsCache = async () => {
    await queryClient.invalidateQueries({ queryKey: ['associations-list-optimized'] });
    // Aguardar um pouco para garantir que os dados foram atualizados
    await new Promise(resolve => setTimeout(resolve, 300));
  };

  const softDeleteGroup = useMutation({
    mutationFn: async (group: AssociationGroup) => {
      console.log('🗑️ Soft deleting group:', group.groupKey);
      const associationIds = group.associations.map(a => a.id);
      
      const { error } = await supabase
        .from('asset_client_assoc')
        .update({ 
          deleted_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .in('id', associationIds);

      if (error) throw error;
      return { deletedCount: associationIds.length };
    },
    onSuccess: async (data) => {
      toast.success(`${data.deletedCount} associações foram removidas com sucesso.`);
      await invalidateAssociationsCache();
    },
    onError: (error) => {
      console.error('❌ Error soft deleting group:', error);
      toast.error("Houve um erro ao remover o grupo de associações.");
    }
  });

  const bulkUpdateGroup = useMutation({
    mutationFn: async ({ group, updates }: { group: AssociationGroup; updates: Record<string, any> }) => {
      console.log('📝 Bulk updating group:', group.groupKey, 'with updates:', updates);
      const associationIds = group.associations.map(a => a.id);
      
      const { error } = await supabase
        .from('asset_client_assoc')
        .update({ 
          ...updates,
          updated_at: new Date().toISOString()
        })
        .in('id', associationIds);

      if (error) throw error;
      return { updatedCount: associationIds.length };
    },
    onSuccess: async (data) => {
      toast.success(`${data.updatedCount} associações foram atualizadas com sucesso.`);
      await invalidateAssociationsCache();
    },
    onError: (error) => {
      console.error('❌ Error bulk updating group:', error);
      toast.error("Houve um erro ao atualizar o grupo de associações.");
    }
  });

  const changeGroupAssociationType = useMutation({
    mutationFn: async ({ group, newType }: { group: AssociationGroup; newType: number }) => {
      console.log('🔄 Changing association type for group:', group.groupKey, 'to:', newType);
      const associationIds = group.associations.map(a => a.id);
      
      const { error } = await supabase
        .from('asset_client_assoc')
        .update({ 
          association_id: newType,
          updated_at: new Date().toISOString()
        })
        .in('id', associationIds);

      if (error) throw error;
      return { updatedCount: associationIds.length };
    },
    onSuccess: async (data) => {
      toast.success(`${data.updatedCount} associações tiveram o tipo alterado com sucesso.`);
      await invalidateAssociationsCache();
    },
    onError: (error) => {
      console.error('❌ Error changing association type:', error);
      toast.error("Houve um erro ao alterar o tipo de associação do grupo.");
    }
  });

  const endGroup = useMutation({
    mutationFn: async (group: AssociationGroup) => {
      console.log('⏹️ Ending group:', group.groupKey);
      const today = new Date().toISOString().split('T')[0];
      const associationsToEnd = group.associations.filter(a => 
        !a.exit_date || a.exit_date > today
      );

      if (associationsToEnd.length === 0) {
        throw new Error('Não há associações ativas para encerrar neste grupo');
      }

      const associationIds = associationsToEnd.map(a => a.id);
      
      const { error } = await supabase
        .from('asset_client_assoc')
        .update({ 
          exit_date: today,
          updated_at: new Date().toISOString()
        })
        .in('id', associationIds);

      if (error) throw error;
      return { endedCount: associationIds.length };
    },
    onMutate: () => {
      setIsProcessing(true);
    },
    onSuccess: async (data) => {
      toast.success(`${data.endedCount} associações foram encerradas com sucesso.`);
      await invalidateAssociationsCache();
    },
    onError: (error) => {
      console.error('❌ Error ending group:', error);
      toast.error(error.message || "Houve um erro ao encerrar o grupo de associações.");
    },
    onSettled: () => {
      setIsProcessing(false);
    }
  });

  return {
    softDeleteGroup,
    bulkUpdateGroup,
    changeGroupAssociationType,
    endGroup,
    isProcessing: isProcessing || softDeleteGroup.isPending || bulkUpdateGroup.isPending || changeGroupAssociationType.isPending || endGroup.isPending,
    operationProgress,
  };
};
