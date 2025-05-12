
import { supabase } from '@/integrations/supabase/client';
import { Asset } from '@/types/asset';
import { toast } from '@/utils/toast';

export const useAssetDelete = (
  assets: Asset[],
  setAssets: React.Dispatch<React.SetStateAction<Asset[]>>
) => {
  const deleteAsset = async (id: string): Promise<boolean> => {
    console.time('asset-delete'); // Início da medição de tempo
    console.log('🗑️ Iniciando exclusão de ativo:', id);
    
    try {
      const asset = assets.find(a => a.id === id);
      
      if (!asset) {
        console.error('❌ Ativo não encontrado:', id);
        toast.error('Ativo não encontrado');
        console.timeEnd('asset-delete');
        return false;
      }
      
      console.log('🔍 Ativo encontrado para exclusão:', asset.type, id);
      console.time('supabase-delete'); // Medir o tempo da chamada ao Supabase
      
      // Delete the asset from the database
      const { error } = await supabase
        .from('assets')
        .delete()
        .eq('uuid', id);
        
      console.timeEnd('supabase-delete');
      
      if (error) {
        console.error('❌ Erro ao excluir asset no Supabase:', error);
        toast.error(`Erro ao excluir asset: ${error.message}`);
        console.timeEnd('asset-delete');
        return false;
      }
      
      console.log('✅ Asset excluído no Supabase com sucesso');
      
      // Update the state
      console.log('🔄 Atualizando estado local após exclusão');
      setAssets(assets.filter(a => a.id !== id));
      toast.success('Ativo excluído com sucesso');
      
      console.log('✅ Processo de exclusão concluído com sucesso');
      console.timeEnd('asset-delete');
      return true;
    } catch (error) {
      console.error('❌ Erro ao excluir ativo:', error);
      console.timeEnd('asset-delete');
      toast.error('Erro ao excluir ativo');
      return false;
    }
  };

  return { deleteAsset };
};
