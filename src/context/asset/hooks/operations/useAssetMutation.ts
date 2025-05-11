
import { supabase } from '@/integrations/supabase/client';
import { Asset, ChipAsset, RouterAsset, AssetStatus } from '@/types/asset';
import { toast } from '@/utils/toast';
import * as assetActions from '../../../assetActions';

export const useAssetMutation = (
  assets: Asset[],
  setAssets: React.Dispatch<React.SetStateAction<Asset[]>>,
  mapStatusIdToAssetStatus: (statusId: number) => AssetStatus,
  mapAssetStatusToId: (status: AssetStatus) => number,
  statusRecords: any[]
) => {
  const addAsset = async (assetData: Omit<Asset, "id" | "status">): Promise<Asset | null> => {
    try {
      // Default to 'Disponível' status (id = 1) if no status is provided
      const statusId = assetData.statusId || 1;
      
      // Prepare the base data for insertion
      const baseAssetData = {
        type_id: assetData.type === "CHIP" ? 1 : 2,
        status_id: statusId,
        model: assetData.type === "ROTEADOR" ? (assetData as any).model : undefined,
        serial_number: assetData.type === "ROTEADOR" ? (assetData as any).serialNumber : undefined,
        password: assetData.type === "ROTEADOR" ? (assetData as any).password : undefined,
        iccid: assetData.type === "CHIP" ? (assetData as any).iccid : undefined,
        line_number: assetData.type === "CHIP" ? (assetData as any).phoneNumber : undefined,
        manufacturer_id: assetData.type === "CHIP" ? 
          parseInt((assetData as any).carrier) || null : 
          parseInt((assetData as any).brand) || null
      };
      
      // Insert into the assets table
      const { data, error } = await supabase
        .from('assets')
        .insert(baseAssetData)
        .select()
        .single();
      
      if (error) {
        console.error('Erro ao inserir asset:', error);
        toast.error(`Erro ao cadastrar asset: ${error.message}`);
        return null;
      }
      
      // Create the asset object with the data returned
      let newAsset: Asset;
      
      if (assetData.type === "CHIP") {
        newAsset = {
          id: data.uuid,
          type: 'CHIP',
          registrationDate: new Date().toISOString(),
          status: mapStatusIdToAssetStatus(data.status_id),
          statusId: data.status_id,
          iccid: data.iccid || '',
          phoneNumber: data.line_number?.toString() || '',
          carrier: data.manufacturer_id?.toString() || '',
          notes: "" // Notes/observations not available
        } as ChipAsset;
      } else {
        newAsset = {
          id: data.uuid,
          type: 'ROTEADOR',
          registrationDate: new Date().toISOString(),
          status: mapStatusIdToAssetStatus(data.status_id),
          statusId: data.status_id,
          uniqueId: data.uuid || '',
          brand: data.manufacturer_id?.toString() || '',
          model: data.model || '',
          ssid: '',
          password: data.password || '',
          ipAddress: '',
          adminUser: '',
          adminPassword: '',
          imei: '',
          serialNumber: data.serial_number || '',
          notes: "", 
          hasWeakPassword: (assetData as any).hasWeakPassword,
          needsPasswordChange: (assetData as any).needsPasswordChange
        } as RouterAsset;
      }
      
      // Update the state
      setAssets(prevAssets => [...prevAssets, newAsset]);
      toast.success(`${assetData.type === "CHIP" ? "Chip" : "Roteador"} cadastrado com sucesso`);
      return newAsset;
      
    } catch (error) {
      console.error('Erro ao adicionar ativo:', error);
      toast.error('Erro ao cadastrar ativo');
      return null;
    }
  };

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
        statusId = mapAssetStatusToId(assetData.status);
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

  return {
    addAsset,
    updateAsset,
    deleteAsset
  };
};
