import { supabase } from "@/integrations/supabase/client";
import { Asset } from "@/types/asset";
import { mapDatabaseAssetToFrontend } from "@/utils/databaseMappers";
import { toast } from "@/utils/toast";
import { AssetListParams, ProblemAsset, AssetStatusByType } from "./types";
import { PROBLEM_STATUS_IDS } from "./constants";
import { handleAssetError } from "./utils";

// Functions for querying assets
export const assetQueries = {
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
        const phoneNumber = params.phoneSearch.replace(/\D/g, ''); // Remove non-digit characters
        if (phoneNumber) {
          const phoneNumberAsNumber = parseInt(phoneNumber, 10);
          query = query.eq('line_number', phoneNumberAsNumber);
        }
      }
      
      // Execute query
      const { data, error } = await query;
      
      if (error) {
        handleAssetError(error, "Failed to fetch assets");
        return [];
      }
      
      // Map database results to frontend Asset types
      return data.map(item => mapDatabaseAssetToFrontend(item)) || [];
    } catch (error) {
      handleAssetError(error, "Error in getAssets");
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
        handleAssetError(error, `Failed to fetch asset ${id}`);
        return null;
      }
      
      return mapDatabaseAssetToFrontend(data) || null;
    } catch (error) {
      handleAssetError(error, `Error in getAssetById ${id}`);
      return null;
    }
  },
  
  // Get assets by status
  async getAssetsByStatus(status: string): Promise<Asset[]> {
    return this.getAssets({ status: status as any });
  },
  
  // Get assets by type
  async getAssetsByType(type: string): Promise<Asset[]> {
    return this.getAssets({ type: type as any });
  },
  
  // List assets with problem status
  async listProblemAssets(): Promise<ProblemAsset[]> {
    try {
      const { data, error } = await supabase
        .from('assets')
        .select(`
          uuid,
          iccid,
          radio,
          asset_types:type_id ( type )
        `)
        .in('status_id', PROBLEM_STATUS_IDS);
      
      if (error) {
        handleAssetError(error, "Failed to fetch problem assets");
        return [];
      }
      
      return data || [];
    } catch (error) {
      handleAssetError(error, "Error in listProblemAssets");
      return [];
    }
  },
  
  // Get asset status counts by type using the SQL function
  async statusByType(): Promise<AssetStatusByType[]> {
    try {
      const { data, error } = await supabase.rpc('status_by_asset_type');
      
      if (error) {
        handleAssetError(error, "Failed to fetch asset status statistics");
        return [];
      }
      
      return data || [];
    } catch (error) {
      handleAssetError(error, "Error in statusByType");
      return [];
    }
  }
};
