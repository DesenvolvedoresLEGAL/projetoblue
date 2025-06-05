
import { supabase } from "@/integrations/supabase/client";
import { Asset } from "@/types/asset";
import { toast } from "@/utils/toast";
import { AssetCreateParams, AssetUpdateParams } from "./types";
import { handleAssetError } from "./utils";
import { getAssetById } from "./queries";

// Functions for mutating assets
export const assetMutations = {
  // Create a new asset
  async createAsset(assetData: AssetCreateParams): Promise<Asset | null> {
    try {
      // Determine solution_id based on asset type
      const solutionId = assetData.type === 'CHIP' ? 11 : 2; // Updated to match database
      
      // Prepare data for insertion
      const insertData: any = {
        solution_id: assetData.solution_id || solutionId,
        status_id: assetData.status_id || 1, // Default to 'Disponível'
        model: assetData.type === 'ROTEADOR' ? assetData.model : null,
        serial_number: assetData.type === 'ROTEADOR' ? assetData.serial_number : null,
        admin_pass: assetData.type === 'ROTEADOR' ? assetData.admin_pass : null,
        iccid: assetData.type === 'CHIP' ? assetData.iccid : null,
        line_number: assetData.type === 'CHIP' && assetData.line_number ? 
          assetData.line_number : null,
        manufacturer_id: assetData.manufacturer_id,
        plan_id: assetData.plan_id,
        radio: assetData.radio,
        admin_user: assetData.admin_user || 'admin',
        rented_days: assetData.rented_days || 0,
        // Incluir novos campos de configurações de rede
        ssid_fabrica: assetData.ssid_fabrica,
        pass_fabrica: assetData.pass_fabrica,
        admin_user_fabrica: assetData.admin_user_fabrica,
        admin_pass_fabrica: assetData.admin_pass_fabrica,
        ssid_atual: assetData.ssid_atual,
        pass_atual: assetData.pass_atual
      };
      
      // Insert the new asset
      const { data, error } = await supabase.from('assets').insert(insertData).select().single();
      
      if (error) {
        handleAssetError(error, "Failed to create asset");
        return null;
      }
      
      toast.success(assetData.type === "CHIP" ? "Chip cadastrado com sucesso" : "Roteador cadastrado com sucesso");
      
      // Fetch the complete asset data including relations
      return getAssetById(data.uuid);
    } catch (error) {
      handleAssetError(error, "Error in createAsset");
      return null;
    }
  },
  
  // Update an existing asset
  async updateAsset(id: string, assetData: AssetUpdateParams): Promise<Asset | null> {
    try {
      console.log('updateAsset received:', id, assetData);
      
      // Prepare update data with corrected field names
      const updateData: any = {};
      
      // Common fields
      if (assetData.status_id !== undefined) {
        console.log('Setting status_id to:', assetData.status_id);
        updateData.status_id = assetData.status_id;
      }
      
      // Manufacturer
      if (assetData.manufacturer_id !== undefined) {
        console.log('Setting manufacturer_id to:', assetData.manufacturer_id);
        updateData.manufacturer_id = assetData.manufacturer_id;
      }
      
      // CHIP specific fields
      if (assetData.iccid !== undefined) updateData.iccid = assetData.iccid;
      if (assetData.line_number !== undefined) updateData.line_number = assetData.line_number;
      if (assetData.plan_id !== undefined) updateData.plan_id = assetData.plan_id;
      
      // Router specific fields
      if (assetData.model !== undefined) updateData.model = assetData.model;
      if (assetData.serial_number !== undefined) updateData.serial_number = assetData.serial_number;
      
      // Radio field - only for non-CHIP assets
      if (assetData.radio !== undefined) updateData.radio = assetData.radio;
      
      // Other common fields
      if (assetData.rented_days !== undefined) updateData.rented_days = assetData.rented_days;
      if (assetData.admin_user !== undefined) updateData.admin_user = assetData.admin_user;
      if (assetData.admin_pass !== undefined) updateData.admin_pass = assetData.admin_pass;
      
      // Campos atuais de rede - apenas esses podem ser editados
      if (assetData.ssid_atual !== undefined) updateData.ssid_atual = assetData.ssid_atual;
      if (assetData.pass_atual !== undefined) updateData.pass_atual = assetData.pass_atual;
      
      // IMPORTANTE: Campos de fábrica NUNCA são incluídos no update
      
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
      return getAssetById(id);
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
      return getAssetById(id);
    } catch (error) {
      handleAssetError(error, `Error in updateAssetStatus ${id}`);
      return null;
    }
  }
};
