
import { supabase } from "@/integrations/supabase/client";
import { Asset } from "@/types/asset";
import { toast } from "@/utils/toast";
import { AssetCreateParams, AssetUpdateParams } from "./types";
import { handleAssetError } from "./utils";
import { assetQueries } from "./queries";

// Functions for mutating assets
export const assetMutations = {
  // Create a new asset
  async createAsset(assetData: AssetCreateParams): Promise<Asset | null> {
    try {
      // Determine solution_id based on asset type
      const solutionId = assetData.type === 'CHIP' ? 1 : 2; // Assuming 1=CHIP, 2=ROUTER
      
      // Prepare data for insertion
      const insertData: any = {
        solution_id: solutionId,
        status_id: assetData.statusId || 1, // Default to 'Disponível'
        model: assetData.type === 'ROTEADOR' ? assetData.model : null,
        serial_number: assetData.type === 'ROTEADOR' ? assetData.serialNumber : null,
        password: assetData.type === 'ROTEADOR' ? assetData.password : null,
        iccid: assetData.type === 'CHIP' ? assetData.iccid : null,
        line_number: assetData.type === 'CHIP' && assetData.phoneNumber ? 
          parseInt(assetData.phoneNumber, 10) || null : null
      };
      
      // Insert the new asset
      const { data, error } = await supabase.from('assets').insert(insertData).select().single();
      
      if (error) {
        handleAssetError(error, "Failed to create asset");
        return null;
      }
      
      toast.success(assetData.type === "CHIP" ? "Chip cadastrado com sucesso" : "Roteador cadastrado com sucesso");
      
      // Fetch the complete asset data including relations
      return assetQueries.getAssetById(data.uuid);
    } catch (error) {
      handleAssetError(error, "Error in createAsset");
      return null;
    }
  },
  
  // Update an existing asset
  async updateAsset(id: string, assetData: AssetUpdateParams): Promise<Asset | null> {
    try {
      // Prepare update data
      const updateData: any = {};
      
      if (assetData.statusId) {
        updateData.status_id = assetData.statusId;
      } else if (assetData.status) {
        // Convert status string to ID (this is simplified, you'd need to fetch the actual mapping)
        const statusMap: Record<string, number> = {
          'DISPONÍVEL': 1,
          'ALUGADO': 2,
          'ASSINATURA': 3,
          'SEM DADOS': 4,
          'BLOQUEADO': 5,
          'MANUTENÇÃO': 6
        };
        updateData.status_id = statusMap[assetData.status] || 1;
      }
      
      // Update common fields
      if (assetData.model) updateData.model = assetData.model;
      if (assetData.serialNumber) updateData.serial_number = assetData.serialNumber;
      if (assetData.password) updateData.password = assetData.password;
      if (assetData.iccid) updateData.iccid = assetData.iccid;
      if (assetData.phoneNumber) updateData.line_number = parseInt(assetData.phoneNumber, 10) || null;
      
      // Perform the update
      const { error } = await supabase.from('assets').update(updateData).eq('uuid', id);
      
      if (error) {
        handleAssetError(error, `Failed to update asset ${id}`);
        return null;
      }
      
      toast.success("Ativo atualizado com sucesso");
      
      // Fetch the updated asset
      return assetQueries.getAssetById(id);
    } catch (error) {
      handleAssetError(error, `Error in updateAsset ${id}`);
      return null;
    }
  },
  
  // Delete an asset
  async deleteAsset(id: string): Promise<boolean> {
    try {
      const { error } = await supabase.from('assets').delete().eq('uuid', id);
      
      if (error) {
        handleAssetError(error, `Failed to delete asset ${id}`);
        return false;
      }
      
      toast.success("Ativo excluído com sucesso");
      return true;
    } catch (error) {
      handleAssetError(error, `Error in deleteAsset ${id}`);
      return false;
    }
  },
  
  // Update asset status
  async updateAssetStatus(id: string, statusId: number): Promise<Asset | null> {
    try {
      const { error } = await supabase.from('assets').update({ status_id: statusId }).eq('uuid', id);
      
      if (error) {
        handleAssetError(error, `Failed to update asset ${id} status`);
        return null;
      }
      
      toast.success("Status do ativo atualizado com sucesso");
      return assetQueries.getAssetById(id);
    } catch (error) {
      handleAssetError(error, `Error in updateAssetStatus ${id}`);
      return null;
    }
  }
};
