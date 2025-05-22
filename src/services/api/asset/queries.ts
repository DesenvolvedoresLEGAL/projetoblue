
import { supabase } from "@/integrations/supabase/client";
import { Asset } from "@/types/asset";
import { AssetListParams, AssetStatusByType, ProblemAsset } from "./types";
import { handleAssetError } from "./utils";
import { PROBLEM_STATUS_IDS } from "./constants";

// Functions for querying assets
export const assetQueries = {
  // Get a specific asset by ID
  async getAssetById(id: string): Promise<Asset | null> {
    try {
      const { data, error } = await supabase
        .from('assets')
        .select(`
          *,
          manufacturer:manufacturers(*),
          status:asset_status(*),
          solucao:asset_solutions(*)
        `)
        .eq('uuid', id)
        .is('deleted_at', null)
        .single();
      
      if (error) {
        handleAssetError(error, `Failed to fetch asset ${id}`);
        return null;
      }
      
      return data as unknown as Asset;
    } catch (error) {
      handleAssetError(error, `Error in getAssetById ${id}`);
      return null;
    }
  },
  
  // List assets with filtering options
  async getAssets(params?: AssetListParams): Promise<Asset[]> {
    try {
      let query = supabase
        .from('assets')
        .select(`
          *,
          manufacturer:manufacturers(*),
          status:asset_status(*),
          solucao:asset_solutions(*)
        `)
        .is('deleted_at', null);
      
      // Apply filters if provided
      if (params) {
        if (params.statusId !== undefined) {
          query = query.eq('status_id', params.statusId);
        } else if (params.status) {
          // Get status ID from status name
          const { data: statusData } = await supabase
            .from('asset_status')
            .select('id')
            .eq('status', params.status)
            .single();
            
          if (statusData) {
            query = query.eq('status_id', statusData.id);
          }
        }
        
        if (params.typeId !== undefined) {
          query = query.eq('solution_id', params.typeId);
        } else if (params.type) {
          // Get solution ID from type name
          const { data: solutionData } = await supabase
            .from('asset_solutions')
            .select('id')
            .eq('solution', params.type)
            .single();
            
          if (solutionData) {
            query = query.eq('solution_id', solutionData.id);
          }
        }
        
        if (params.search) {
          query = query.or(`iccid.ilike.%${params.search}%,serial_number.ilike.%${params.search}%,model.ilike.%${params.search}%,radio.ilike.%${params.search}%`);
        }
        
        if (params.limit) {
          query = query.limit(params.limit);
        }
        
        if (params.offset !== undefined) {
          query = query.range(params.offset, params.offset + (params.limit || 10) - 1);
        }
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) {
        handleAssetError(error, "Failed to fetch assets");
        return [];
      }
      
      return data as unknown as Asset[];
    } catch (error) {
      handleAssetError(error, "Error in getAssets");
      return [];
    }
  },
  
  // Get assets by status
  async getAssetsByStatus(statusId: number): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('assets')
        .select(`
          *,
          manufacturer:manufacturers(*),
          status:asset_status(*),
          solucao:asset_solutions(*)
        `)
        .eq('status_id', statusId)
        .is('deleted_at', null);
      
      if (error) {
        handleAssetError(error, `Failed to fetch assets with status ${statusId}`);
        return [];
      }
      
      return data;
    } catch (error) {
      handleAssetError(error, `Error in getAssetsByStatus ${statusId}`);
      return [];
    }
  },
  
  // Get assets by type
  async getAssetsByType(typeId: number): Promise<Asset[]> {
    try {
      const { data, error } = await supabase
        .from('assets')
        .select(`
          *,
          manufacturer:manufacturers(*),
          status:asset_status(*),
          solucao:asset_solutions(*)
        `)
        .eq('solution_id', typeId)
        .is('deleted_at', null);
      
      if (error) {
        handleAssetError(error, `Failed to fetch assets with type ${typeId}`);
        return [];
      }
      
      return data as unknown as Asset[];
    } catch (error) {
      handleAssetError(error, `Error in getAssetsByType ${typeId}`);
      return [];
    }
  },
  
  // List problem assets (those with statuses indicating an issue)
  async listProblemAssets(): Promise<ProblemAsset[]> {
    try {
      const { data, error } = await supabase
        .from('assets')
        .select(`
          uuid,
          solution_id,
          status_id,
          model,
          serial_number,
          iccid,
          radio,
          line_number,
          created_at,
          manufacturer:manufacturers(name),
          status:asset_status(status),
          solucao:asset_solutions(solution)
        `)
        .in('status_id', PROBLEM_STATUS_IDS)
        .is('deleted_at', null)
        .limit(10);
      
      if (error) {
        handleAssetError(error, "Failed to fetch problem assets");
        return [];
      }
      
      return data.map(item => ({
        uuid: item.uuid,
        iccid: item.iccid,
        radio: item.radio,
        line_number: item.line_number,
        solution_id: item.solution_id,
        id: item.uuid,
        type: item.solution_id === 11 ? 'CHIP' : 'ROUTER',
        status: item.status?.status || 'Unknown',
        statusId: item.status_id,
        identifier: item.solution_id === 11 ? item.iccid : item.serial_number,
        model: item.model,
        manufacturer: item.manufacturer?.name || 'Unknown',
        solution: item.solucao?.solution || 'Unknown',
        createdAt: item.created_at
      })) as ProblemAsset[];
    } catch (error) {
      handleAssetError(error, "Error in listProblemAssets");
      return [];
    }
  },
  
  // Get asset status counts by type
  async statusByType(): Promise<AssetStatusByType[]> {
    try {
      const { data, error } = await supabase
        .rpc('status_by_asset_type')
        .is('deleted_at', null);
      
      if (error) {
        handleAssetError(error, "Failed to fetch asset status by type");
        return [];
      }
      
      return data as AssetStatusByType[];
    } catch (error) {
      handleAssetError(error, "Error in statusByType");
      return [];
    }
  }
};
