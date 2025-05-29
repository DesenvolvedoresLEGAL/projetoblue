
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";
import { AssociationGroup } from '@/types/associations';

export const useAssociationActions = () => {
  // Função para encerrar associação
  const handleEndAssociation = async (associationId: number) => {
    try {
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

      toast.success('Associação encerrada com sucesso');
    } catch (error) {
      console.error('Erro ao encerrar associação:', error);
      toast.error('Erro ao encerrar associação');
    }
  };

  // Função para encerrar grupo de associações
  const handleEndGroup = async (groupKey: string, groupedAssociations: { [key: string]: AssociationGroup }) => {
    try {
      const group = groupedAssociations[groupKey];
      const associationIds = group.associations.map(a => a.id);
      
      const { error } = await supabase
        .from('asset_client_assoc')
        .update({ 
          exit_date: new Date().toISOString().split('T')[0],
          updated_at: new Date().toISOString()
        })
        .in('id', associationIds);

      if (error) {
        console.error('Erro ao encerrar grupo de associações:', error);
        toast.error('Erro ao encerrar grupo de associações');
        return;
      }

      toast.success(`Grupo de ${group.totalAssets} associações encerrado com sucesso`);
    } catch (error) {
      console.error('Erro ao encerrar grupo de associações:', error);
      toast.error('Erro ao encerrar grupo de associações');
    }
  };

  return {
    handleEndAssociation,
    handleEndGroup
  };
};
