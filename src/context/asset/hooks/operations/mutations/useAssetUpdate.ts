
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
    try {
      // If status is being updated, map it to a status_id for the database
      let dbUpdateData: any = {};
      
      // Map status to status_id if provided
      if (assetData.status) {
        const statusRecord = statusRecords.find(s => s.nome === assetData.status);
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
      
      // Only update in database if we have fields to update
      if (Object.keys(dbUpdateData).length > 0) {
        const { error } = await supabase
          .from('assets')
          .update(dbUpdateData)
          .eq('uuid', id);
          
        if (error) {
          throw error;
        }
      }
      
      // Update local state
      const updatedAssets = updateAssetInList(assets, id, assetData);
      setAssets(updatedAssets);
      
      // Return the updated asset
      const updatedAsset = updatedAssets.find(a => a.id === id);
      return updatedAsset || null;
      
    } catch (error) {
      console.error('Error updating asset:', error);
      toast.error('Erro ao atualizar ativo');
      return null;
    }
  };

  return { updateAsset };
};
