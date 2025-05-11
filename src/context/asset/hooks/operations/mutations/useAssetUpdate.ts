
import { supabase } from '@/integrations/supabase/client';
import { Asset, ChipAsset, RouterAsset, AssetStatus } from '@/types/asset';
import { toast } from '@/utils/toast';
import * as assetActions from '@/context/assetActions';

export const useAssetUpdate = (
  assets: Asset[],
  setAssets: React.Dispatch<React.SetStateAction<Asset[]>>,
  mapStatusIdToAssetStatus: (statusId: number) => AssetStatus,
  statusRecords: any[]
) => {
  const updateAsset = async (id: string, assetData: Partial<Asset>): Promise<Asset | null> => {
    try {
      const existingAsset = assets.find(asset => asset.id === id);
      
      if (!existingAsset) {
        toast.error('Ativo não encontrado');
        return null;
      }

      // Convert status to status_id if status is being updated
      let statusId = existingAsset.statusId;
      if (assetData.status) {
        statusId = assetData.statusId || existingAsset.statusId;
      } else if (assetData.statusId) {
        statusId = assetData.statusId;
        // Map the statusId back to a status name for the UI
        const statusRecord = statusRecords.find(s => s.id === statusId);
        if (statusRecord) {
          assetData.status = mapStatusIdToAssetStatus(statusId);
        }
      }
      
      // Create an update object with only the fields that need to be updated
      const updateData: any = {
        status_id: statusId
      };
      
      // Add type-specific fields
      if (existingAsset.type === "CHIP") {
        const chipData = assetData as Partial<ChipAsset>;
        if (chipData.iccid !== undefined) updateData.iccid = chipData.iccid;
        if (chipData.phoneNumber !== undefined) updateData.line_number = chipData.phoneNumber;
        if (chipData.carrier !== undefined) updateData.manufacturer_id = parseInt(chipData.carrier) || null;
        if (chipData.notes !== undefined) updateData.observacoes = chipData.notes;
      } else if (existingAsset.type === "ROTEADOR") {
        const routerData = assetData as Partial<RouterAsset>;
        if (routerData.brand !== undefined) updateData.manufacturer_id = parseInt(routerData.brand) || null;
        if (routerData.model !== undefined) updateData.model = routerData.model;
        if (routerData.password !== undefined) updateData.password = routerData.password;
        if (routerData.serialNumber !== undefined) updateData.serial_number = routerData.serialNumber;
        if (routerData.notes !== undefined) updateData.observacoes = routerData.notes;
      }
      
      // Update the asset in the database
      const { error } = await supabase
        .from('assets')
        .update(updateData)
        .eq('uuid', id);
        
      if (error) {
        console.error('Erro ao atualizar asset:', error);
        toast.error(`Erro ao atualizar asset: ${error.message}`);
        return null;
      }
      
      // Update with status derived from statusId if it was changed
      if (assetData.status) {
        assetData.statusId = statusId;
      } else if (assetData.statusId) {
        assetData.status = mapStatusIdToAssetStatus(statusId);
      }
      
      // Atualizar o estado
      const updatedAssets = assetActions.updateAssetInList(assets, id, assetData);
      setAssets(updatedAssets);
      
      const updatedAsset = updatedAssets.find(asset => asset.id === id);
      toast.success('Ativo atualizado com sucesso');
      
      return updatedAsset || null;
    } catch (error) {
      console.error('Erro ao atualizar ativo:', error);
      toast.error('Erro ao atualizar ativo');
      return null;
    }
  };

  return { updateAsset };
};
