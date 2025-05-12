
import { Asset, AssetStatus, StatusRecord } from '@/types/asset';
import { supabase } from '@/integrations/supabase/client';
import { updateAssetInList } from '@/context/assetActions';
import { toast } from '@/utils/toast';

export const useAssetUpdate = (
  assets: Asset[],
  setAssets: React.Dispatch<React.SetStateAction<Asset[]>>,
  mapStatusIdToAssetStatus: (statusId: number) => AssetStatus,
  statusRecords: StatusRecord[]
) => {
  const updateAsset = async (id: string, assetData: Partial<Asset>): Promise<Asset | null> => {
    console.time('asset-update'); // Início da medição de tempo
    console.log('🔄 Iniciando atualização de ativo:', id, assetData);
    
    try {
      // If status is being updated, map it to a status_id for the database
      let dbUpdateData: any = {};
      
      // Map status to status_id if provided
      if (assetData.status) {
        const statusRecord = statusRecords.find(s => s.nome === assetData.status);
        console.log('📊 Mapeando status para ID:', assetData.status, statusRecord);
        if (statusRecord) {
          dbUpdateData.status_id = statusRecord.id;
        }
      }
      
      // Map other asset data to database columns
      if (assetData.type === "CHIP") {
        if ('iccid' in assetData) dbUpdateData.iccid = assetData.iccid;
        if ('phoneNumber' in assetData) dbUpdateData.line_number = assetData.phoneNumber;
      } else if (assetData.type === "ROTEADOR") {
        if ('uniqueId' in assetData) dbUpdateData.serial_number = assetData.uniqueId;
        if ('model' in assetData) dbUpdateData.model = assetData.model;
        if ('password' in assetData) dbUpdateData.password = assetData.password;
      }
      
      console.log('📤 Dados para atualização no Supabase:', dbUpdateData);
      
      // Only update in database if we have fields to update
      if (Object.keys(dbUpdateData).length > 0) {
        console.time('supabase-update'); // Medir o tempo da chamada ao Supabase
        
        const { error } = await supabase
          .from('assets')
          .update(dbUpdateData)
          .eq('uuid', id);
          
        console.timeEnd('supabase-update');
        
        if (error) {
          console.error('❌ Erro na atualização no Supabase:', error);
          throw error;
        }
        
        console.log('✅ Atualização no Supabase concluída com sucesso');
      } else {
        console.log('ℹ️ Nenhum dado para atualizar no banco');
      }
      
      // Update local state
      console.log('🔄 Atualizando estado local');
      const updatedAssets = updateAssetInList(assets, id, assetData);
      setAssets(updatedAssets);
      
      // Return the updated asset
      const updatedAsset = updatedAssets.find(a => a.id === id);
      console.log('✅ Atualização de ativo concluída:', id);
      console.timeEnd('asset-update'); // Fim da medição de tempo total
      
      return updatedAsset || null;
      
    } catch (error) {
      console.error('❌ Erro ao atualizar ativo:', error);
      console.timeEnd('asset-update');
      toast.error('Erro ao atualizar ativo');
      return null;
    }
  };

  return { updateAsset };
};
