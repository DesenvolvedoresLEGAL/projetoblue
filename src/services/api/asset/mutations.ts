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
          parseInt(assetData.phoneNumber, 10) || null : null,
        manufacturer_id: assetData.manufacturer_id,
        plan_id: assetData.plan_id,
        radio: assetData.radio,
        admin_user: assetData.admin_user || 'admin',
        admin_pass: assetData.admin_pass || ''
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
      console.log('updateAsset received:', id, assetData);
      
      // Prepare update data
      const updateData: any = {};
      
      // Common fields
      if (assetData.statusId !== undefined) {
        console.log('Setting status_id to:', assetData.statusId);
        updateData.status_id = assetData.statusId;
      } else if (assetData.status) {
        // Convert status string to ID
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
      
      // Manufacturer
      if (assetData.manufacturer_id !== undefined) {
        console.log('Setting manufacturer_id to:', assetData.manufacturer_id);
        updateData.manufacturer_id = assetData.manufacturer_id;
      }
      
      // CHIP specific fields
      if (assetData.iccid !== undefined) updateData.iccid = assetData.iccid;
      if (assetData.line_number !== undefined) updateData.line_number = assetData.line_number;
      if (assetData.phoneNumber !== undefined && assetData.line_number === undefined) {
        updateData.line_number = parseInt(assetData.phoneNumber, 10) || null;
      }
      if (assetData.plan_id !== undefined) updateData.plan_id = assetData.plan_id;
      
      // Router specific fields
      if (assetData.model !== undefined) updateData.model = assetData.model;
      if (assetData.serialNumber !== undefined) updateData.serial_number = assetData.serialNumber;
      if (assetData.serial_number !== undefined) updateData.serial_number = assetData.serial_number;
      
      // Radio field - only for non-CHIP assets
      if (assetData.radio !== undefined) updateData.radio = assetData.radio;
      
      // Other common fields
      if (assetData.rented_days !== undefined) updateData.rented_days = assetData.rented_days;
      if (assetData.admin_user !== undefined) updateData.admin_user = assetData.admin_user;
      if (assetData.admin_pass !== undefined) updateData.admin_pass = assetData.admin_pass;
      
      console.log('Final update data:', updateData);
      
      // Perform the update
      const { data, error } = await supabase.from('assets').update(updateData).eq('uuid', id).select();
      
      if (error) {
        console.error('Supabase update error:', error);
        handleAssetError(error, `Failed to update asset ${id}`);
        return null;
      }
      
      console.log('Update successful, returned data:', data);
      toast.success("Ativo atualizado com sucesso");
      
      // Fetch the updated asset
      return assetQueries.getAssetById(id);
    } catch (error) {
      console.error('Exception in updateAsset:', error);
      handleAssetError(error, `Error in updateAsset ${id}`);
      return null;
    }
  },
  
  // Delete an asset (soft delete)
  async deleteAsset(id: string): Promise<boolean> {
    try {
      // Use soft delete by setting deleted_at timestamp
      const { error } = await supabase
        .from('assets')
        .update({ deleted_at: new Date().toISOString() })
        .eq('uuid', id);
      
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
      console.log(`Updating asset ${id} status to ${statusId}`);
      const { error } = await supabase.from('assets').update({ status_id: statusId }).eq('uuid', id);
      
      if (error) {
        console.error('Status update error:', error);
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
