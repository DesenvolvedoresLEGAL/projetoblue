
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { AssociationGroup } from '@/types/associations';

export const useGroupActions = () => {
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(false);
  const [operationProgress, setOperationProgress] = useState({ current: 0, total: 0 });

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
    onSuccess: (data) => {
      toast({
        title: "Grupo removido",
        description: `${data.deletedCount} associações foram removidas com sucesso.`,
      });
      queryClient.invalidateQueries({ queryKey: ['associations'] });
    },
    onError: (error) => {
      console.error('❌ Error soft deleting group:', error);
      toast({
        title: "Erro ao remover grupo",
        description: "Houve um erro ao remover o grupo de associações.",
        variant: "destructive",
      });
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
    onSuccess: (data) => {
      toast({
        title: "Grupo atualizado",
        description: `${data.updatedCount} associações foram atualizadas com sucesso.`,
      });
      queryClient.invalidateQueries({ queryKey: ['associations'] });
    },
    onError: (error) => {
      console.error('❌ Error bulk updating group:', error);
      toast({
        title: "Erro ao atualizar grupo",
        description: "Houve um erro ao atualizar o grupo de associações.",
        variant: "destructive",
      });
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
    onSuccess: (data) => {
      toast({
        title: "Tipo de associação alterado",
        description: `${data.updatedCount} associações tiveram o tipo alterado com sucesso.`,
      });
      queryClient.invalidateQueries({ queryKey: ['associations'] });
    },
    onError: (error) => {
      console.error('❌ Error changing association type:', error);
      toast({
        title: "Erro ao alterar tipo",
        description: "Houve um erro ao alterar o tipo de associação do grupo.",
        variant: "destructive",
      });
    }
  });

  return {
    softDeleteGroup,
    bulkUpdateGroup,
    changeGroupAssociationType,
    isProcessing,
    operationProgress,
  };
};
