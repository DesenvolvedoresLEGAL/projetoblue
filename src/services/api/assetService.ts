
import { supabase } from "@/integrations/supabase/client";
import { Asset, AssetStatus, AssetType, ChipAsset, RouterAsset } from "@/types/asset";
import { toast } from "@/utils/toast";
import { mapDatabaseAssetToFrontend } from "@/utils/databaseMappers";

// Types for asset API requests
export interface AssetListParams {
  type?: AssetType;
  status?: AssetStatus;
  search?: string;
  phoneSearch?: string;
  page?: number;
  limit?: number;
}

export interface AssetCreateParams {
  type: AssetType;
  // Common fields
  statusId?: number;
  notes?: string;
  
  // Chip specific fields
  iccid?: string;
  phoneNumber?: string;
  carrier?: string;
  
  // Router specific fields
  uniqueId?: string;
  brand?: string;
  model?: string;
  ssid?: string;
  password?: string;
  serialNumber?: string;
}

export interface AssetUpdateParams {
  // Fields that can be updated
  status?: AssetStatus;
  statusId?: number;
  notes?: string;
  
  // Chip fields
  iccid?: string;
  phoneNumber?: string;
  carrier?: string;
  
  // Router fields
  brand?: string;
  model?: string;
  ssid?: string;
  password?: string;
  serialNumber?: string;
}

// Asset API service (using Supabase directly as temporary solution)
export const assetService = {
  // Get all assets with filtering
  async getAssets(params?: AssetListParams): Promise<Asset[]> {
    try {
      let query = supabase.from('assets').select(`
        *,
        asset_types(type),
        asset_status(status),
        asset_solutions(solution),
        manufacturers(name)
      `);
      
      // Apply filters if provided
      if (params?.type) {
        const typeQuery = supabase.from('asset_types').select('id').eq('type', params.type.toLowerCase());
        const { data: typeData } = await typeQuery;
        if (typeData && typeData.length > 0) {
          query = query.eq('type_id', typeData[0].id);
        }
      }
      
      if (params?.status) {
        const statusQuery = supabase.from('asset_status').select('id').ilike('status', params.status.toLowerCase());
        const { data: statusData } = await statusQuery;
        if (statusData && statusData.length > 0) {
          query = query.eq('status_id', statusData[0].id);
        }
      }
      
      if (params?.search) {
        query = query.or(`serial_number.ilike.%${params.search}%,model.ilike.%${params.search}%`);
      }
      
      if (params?.phoneSearch) {
        // Fix: Convert phoneSearch string to a number or use as string depending on the column type
        // If line_number is a numeric column, we need to convert the string to a number
        const phoneNumber = params.phoneSearch.replace(/\D/g, ''); // Remove non-digit characters
        if (phoneNumber) {
          // Convert the cleaned phone number string to a number before passing to eq()
          const phoneNumberAsNumber = parseInt(phoneNumber, 10);
          query = query.eq('line_number', phoneNumberAsNumber);
        }
      }
      
      // Execute query
      const { data, error } = await query;
      
      if (error) {
        console.error("Error fetching assets:", error);
        toast.error("Failed to fetch assets");
        return [];
      }
      
      // Map database results to frontend Asset types
      return data.map(item => mapDatabaseAssetToFrontend(item)) || [];
    } catch (error) {
      console.error("Error in getAssets:", error);
      toast.error("Failed to fetch assets");
      return [];
    }
  },
  
  // Get a single asset by ID
  async getAssetById(id: string): Promise<Asset | null> {
    try {
      const { data, error } = await supabase.from('assets').select(`
        *,
        asset_types(type),
        asset_status(status),
        asset_solutions(solution),
        manufacturers(name)
      `).eq('uuid', id).single();
      
      if (error) {
        console.error(`Error fetching asset ${id}:`, error);
        toast.error("Failed to fetch asset details");
        return null;
      }
      
      return mapDatabaseAssetToFrontend(data) || null;
    } catch (error) {
      console.error(`Error in getAssetById ${id}:`, error);
      toast.error("Failed to fetch asset details");
      return null;
    }
  },
  
  // Create a new asset
  async createAsset(assetData: AssetCreateParams): Promise<Asset | null> {
    try {
      // Prepare data for insertion
      const insertData: any = {
        type_id: assetData.type === 'CHIP' ? 1 : 2, // Default type IDs
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
        console.error("Error creating asset:", error);
        toast.error("Failed to create asset");
        return null;
      }
      
      toast.success(assetData.type === "CHIP" ? "Chip cadastrado com sucesso" : "Roteador cadastrado com sucesso");
      
      // Fetch the complete asset data including relations
      return this.getAssetById(data.uuid);
    } catch (error) {
      console.error("Error in createAsset:", error);
      toast.error("Failed to create asset");
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
        const statusMap: Record<AssetStatus, number> = {
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
        console.error(`Error updating asset ${id}:`, error);
        toast.error("Failed to update asset");
        return null;
      }
      
      toast.success("Ativo atualizado com sucesso");
      
      // Fetch the updated asset
      return this.getAssetById(id);
    } catch (error) {
      console.error(`Error in updateAsset ${id}:`, error);
      toast.error("Failed to update asset");
      return null;
    }
  },
  
  // Delete an asset
  async deleteAsset(id: string): Promise<boolean> {
    try {
      const { error } = await supabase.from('assets').delete().eq('uuid', id);
      
      if (error) {
        console.error(`Error deleting asset ${id}:`, error);
        toast.error("Failed to delete asset");
        return false;
      }
      
      toast.success("Ativo excluído com sucesso");
      return true;
    } catch (error) {
      console.error(`Error in deleteAsset ${id}:`, error);
      toast.error("Failed to delete asset");
      return false;
    }
  },
  
  // Update asset status
  async updateAssetStatus(id: string, statusId: number): Promise<Asset | null> {
    try {
      const { error } = await supabase.from('assets').update({ status_id: statusId }).eq('uuid', id);
      
      if (error) {
        console.error(`Error updating asset ${id} status:`, error);
        toast.error("Failed to update asset status");
        return null;
      }
      
      toast.success("Status do ativo atualizado com sucesso");
      return this.getAssetById(id);
    } catch (error) {
      console.error(`Error in updateAssetStatus ${id}:`, error);
      toast.error("Failed to update asset status");
      return null;
    }
  },
  
  // Get assets by status
  async getAssetsByStatus(status: AssetStatus): Promise<Asset[]> {
    return this.getAssets({ status });
  },
  
  // Get assets by type
  async getAssetsByType(type: AssetType): Promise<Asset[]> {
    return this.getAssets({ type });
  }
};

export default assetService;
