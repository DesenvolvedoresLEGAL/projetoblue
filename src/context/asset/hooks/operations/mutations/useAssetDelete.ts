
import { supabase } from '@/integrations/supabase/client';
import { Asset } from '@/types/asset';
import { toast } from '@/utils/toast';

export const useAssetDelete = (
  assets: Asset[],
  setAssets: React.Dispatch<React.SetStateAction<Asset[]>>
) => {
  const deleteAsset = async (id: string): Promise<boolean> => {
    try {
      const asset = assets.find(a => a.id === id);
      
      if (!asset) {
        toast.error('Ativo não encontrado');
        return false;
      }
      
      // Delete the asset from the database
      const { error } = await supabase
        .from('assets')
        .delete()
        .eq('uuid', id);
        
      if (error) {
        console.error('Erro ao excluir asset:', error);
        toast.error(`Erro ao excluir asset: ${error.message}`);
        return false;
      }
      
      // Update the state
      setAssets(assets.filter(a => a.id !== id));
      toast.success('Ativo excluído com sucesso');
      return true;
    } catch (error) {
      console.error('Erro ao excluir ativo:', error);
      toast.error('Erro ao excluir ativo');
      return false;
    }
  };

  return { deleteAsset };
};
