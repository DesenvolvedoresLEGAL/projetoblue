
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from "sonner";
import { AssociationGroup } from '@/types/associations';
import { useState } from 'react';

export const useAssociationActions = () => {
  const queryClient = useQueryClient();
  const [isEndingAssociation, setIsEndingAssociation] = useState(false);
  const [isEndingGroup, setIsEndingGroup] = useState(false);

  // Função para invalidar queries relacionadas
  const invalidateAssociationsData = () => {
    queryClient.invalidateQueries({ queryKey: ['associations-list-optimized'] });
  };

  // Função para encerrar associação
  const handleEndAssociation = async (associationId: number) => {
    if (isEndingAssociation) return;
    
    setIsEndingAssociation(true);
    try {
      console.log('Encerrando associação ID:', associationId);
      
      const { error } = await supabase
        .from('asset_client_assoc')
        .update({ 
          exit_date: new Date().toISOString().split('T')[0],
          updated_at: new Date().toISOString()
        })
        .eq('id', associationId);

      if (error) {
        console.error('Erro ao encerrar associação:', error);
        toast.error('Erro ao encerrar associação');
        return;
      }

      console.log('Associação encerrada com sucesso');
      toast.success('Associação encerrada com sucesso');
      
      // Invalidar cache para atualizar a interface
      invalidateAssociationsData();
    } catch (error) {
      console.error('Erro ao encerrar associação:', error);
      toast.error('Erro ao encerrar associação');
    } finally {
      setIsEndingAssociation(false);
    }
  };

  // Função para encerrar grupo de associações
  const handleEndGroup = async (groupKey: string, groupedAssociations: { [key: string]: AssociationGroup }) => {
    if (isEndingGroup) return;
    
    setIsEndingGroup(true);
    try {
      const group = groupedAssociations[groupKey];
      
      if (!group) {
        console.error('Grupo não encontrado:', groupKey);
        toast.error('Grupo não encontrado');
        return;
      }

      // Filtrar apenas associações que podem ser encerradas (sem exit_date ou com exit_date futura)
      const today = new Date().toISOString().split('T')[0];
      const associationsToEnd = group.associations.filter(a => 
        !a.exit_date || a.exit_date > today
      );

      if (associationsToEnd.length === 0) {
        toast.error('Não há associações ativas para encerrar neste grupo');
        return;
      }

      const associationIds = associationsToEnd.map(a => a.id);
      
      console.log('Encerrando grupo de associações:', {
        groupKey,
        totalAssociations: group.totalAssets,
        associationsToEnd: associationsToEnd.length,
        associationIds
      });
      
      const { error } = await supabase
        .from('asset_client_assoc')
        .update({ 
          exit_date: today,
          updated_at: new Date().toISOString()
        })
        .in('id', associationIds);

      if (error) {
        console.error('Erro ao encerrar grupo de associações:', error);
        toast.error('Erro ao encerrar grupo de associações');
        return;
      }

      console.log('Grupo de associações encerrado com sucesso');
      toast.success(`Grupo de ${associationsToEnd.length} associações encerrado com sucesso`);
      
      // Invalidar cache para atualizar a interface
      invalidateAssociationsData();
    } catch (error) {
      console.error('Erro ao encerrar grupo de associações:', error);
      toast.error('Erro ao encerrar grupo de associações');
    } finally {
      setIsEndingGroup(false);
    }
  };

  return {
    handleEndAssociation,
    handleEndGroup,
    isEndingAssociation,
    isEndingGroup
  };
};
