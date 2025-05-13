
import { Asset, AssetStatus, AssetType, ChipAsset, RouterAsset, StatusRecord } from "@/types/asset";
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/utils/toast';
import { convertAssetToDbRecord, convertToAssetObject } from '@/utils/assetMappers';
import { AssetRecord } from '@/types/assetDatabase';

export const assetService = {
  async fetchStatusRecords(): Promise<StatusRecord[]> {
    try {
      const { data, error } = await supabase.from('asset_status').select('*');
      if (error) {
        console.error('Error loading status records:', error);
        return [];
      }

      // Convert the data to match the StatusRecord interface
      const formattedData: StatusRecord[] = data.map((record: any) => ({
        id: record.id,
        nome: record.status
      }));
      
      return formattedData || [];
    } catch (error) {
      console.error('Error fetching status records:', error);
      return [];
    }
  },

  async fetchAssets(statusRecords: StatusRecord[]): Promise<Asset[]> {
    try {
      const { data: assetsData, error: assetsError } = await supabase
        .from('assets')
        .select('*');
      
      if (assetsError) {
        console.error('Erro ao carregar assets:', assetsError);
        throw assetsError;
      }
      
      // Convert the records to Asset objects
      const formattedAssets = assetsData?.map(record => 
        convertToAssetObject(record as AssetRecord, statusRecords)
      ) || [];
      
      return formattedAssets;
    } catch (error) {
      console.error('Erro ao carregar ativos:', error);
      toast.error('Erro ao carregar ativos');
      return [];
    }
  },

  async addAsset(assetData: Omit<Asset, "id" | "status">, statusRecords: StatusRecord[]): Promise<Asset | null> {
    try {
      // Default to 'Disponível' status (id = 1) if no status is provided
      const statusId = assetData.statusId || 1;
      
      // Prepare asset data for insert
      const insertData = {
        type_id: assetData.type === "CHIP" ? 1 : 2,
        status_id: statusId,
        observacoes: assetData.notes
      } as Partial<AssetRecord>;

      if (assetData.type === "CHIP") {
        const chipData = assetData as Omit<ChipAsset, "id" | "status">;
        insertData.iccid = chipData.iccid;
        insertData.line_number = chipData.phoneNumber ? parseInt(chipData.phoneNumber) : undefined;
        insertData.manufacturer_id = chipData.carrier ? parseInt(chipData.carrier) : undefined;
      } else if (assetData.type === "ROTEADOR") {
        const routerData = assetData as Omit<RouterAsset, "id" | "status">;
        insertData.manufacturer_id = routerData.brand ? parseInt(routerData.brand) : undefined;
        insertData.model = routerData.model;
        insertData.password = routerData.password;
        insertData.serial_number = routerData.serialNumber;
      }
      
      // Insert into the assets table
      const { data, error } = await supabase
        .from('assets')
        .insert(insertData)
        .select()
        .single();
      
      if (error) {
        console.error('Erro ao inserir ativo:', error);
        toast.error(`Erro ao cadastrar ativo: ${error.message}`);
        return null;
      }
      
      // Create asset object from the returned data
      const newAsset = convertToAssetObject(data as AssetRecord, statusRecords);
      
      toast.success(assetData.type === "CHIP" ? 'Chip cadastrado com sucesso' : 'Roteador cadastrado com sucesso');
      
      return newAsset;
      
    } catch (error) {
      console.error('Erro ao adicionar ativo:', error);
      toast.error('Erro ao cadastrar ativo');
      return null;
    }
  },

  async updateAsset(id: string, assetData: Partial<Asset>, statusRecords: StatusRecord[]): Promise<Asset | null> {
    try {
      // Convert status to status_id if status is being updated
      let statusId = assetData.statusId;
      if (assetData.status && !assetData.statusId) {
        statusId = assetData.status ? 
          statusRecords.find(s => s.nome.toLowerCase() === assetData.status?.toLowerCase())?.id : 
          undefined;
      }
      
      // Create update object for the asset
      const updateData: Partial<AssetRecord> = {
        ...(statusId && { status_id: statusId }),
        ...(assetData.notes && { observacoes: assetData.notes })
      };
      
      // Add type-specific fields
      if (assetData.type === 'CHIP') {
        const chipData = assetData as Partial<ChipAsset>;
        if (chipData.iccid !== undefined) updateData.iccid = chipData.iccid;
        if (chipData.phoneNumber !== undefined) updateData.line_number = parseInt(chipData.phoneNumber);
        if (chipData.carrier !== undefined) updateData.manufacturer_id = parseInt(chipData.carrier);
      } else if (assetData.type === 'ROTEADOR') {
        const routerData = assetData as Partial<RouterAsset>;
        if (routerData.brand !== undefined) updateData.manufacturer_id = parseInt(routerData.brand);
        if (routerData.model !== undefined) updateData.model = routerData.model;
        if (routerData.password !== undefined) updateData.password = routerData.password;
        if (routerData.serialNumber !== undefined) updateData.serial_number = routerData.serialNumber;
      }
      
      // Update the asset in the database
      const { data, error } = await supabase
        .from('assets')
        .update(updateData)
        .eq('uuid', id)
        .select()
        .single();
        
      if (error) {
        console.error('Erro ao atualizar ativo:', error);
        toast.error(`Erro ao atualizar ativo: ${error.message}`);
        return null;
      }
      
      // Convert the updated asset to the UI asset format
      const updatedAsset = convertToAssetObject(data as AssetRecord, statusRecords);
      toast.success('Ativo atualizado com sucesso');
      
      return updatedAsset;
    } catch (error) {
      console.error('Erro ao atualizar ativo:', error);
      toast.error('Erro ao atualizar ativo');
      return null;
    }
  },

  async deleteAsset(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('assets')
        .delete()
        .eq('uuid', id);
        
      if (error) {
        console.error('Erro ao excluir ativo:', error);
        toast.error(`Erro ao excluir ativo: ${error.message}`);
        return false;
      }
      
      toast.success('Ativo excluído com sucesso');
      return true;
    } catch (error) {
      console.error('Erro ao excluir ativo:', error);
      toast.error('Erro ao excluir ativo');
      return false;
    }
  }
};
