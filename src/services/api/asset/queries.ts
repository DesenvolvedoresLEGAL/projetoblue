
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
      // Build basic query without nested selects
      let query = supabase.from('assets').select(`
        uuid, solution_id, status_id, iccid, serial_number, 
        manufacturer_id, model, line_number, admin_user,
        radio, ssid, rented_days, created_at, updated_at
      `);
      
      // Apply filters if provided
      if (params?.type) {
        // Filter by chip or router
        if (params.type === 'CHIP') {
          query = query.not('iccid', 'is', null);
        } else {
          query = query.not('serial_number', 'is', null);
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
      
      // Fetch necessary related data in separate queries for mapping
      const solutionsPromise = supabase.from('asset_solutions').select('id, solution');
      const statusPromise = supabase.from('asset_status').select('id, status');
      const manufacturersPromise = supabase.from('manufacturers').select('id, name');
      
      const [solutionsResult, statusResult, manufacturersResult] = await Promise.all([
        solutionsPromise, statusPromise, manufacturersPromise
      ]);
      
      const solutions = solutionsResult.data || [];
      const statuses = statusResult.data || [];
      const manufacturers = manufacturersResult.data || [];
      
      // Map database results to frontend Asset types with the fetched related data
      return data?.map(item => {
        // Check if item is an error object before accessing properties
        if ('error' in item) {
          console.error("Error in asset data:", item);
          return null;
        }
        
        const solution = solutions.find(s => s.id === item.solution_id);
        const status = statuses.find(s => s.id === item.status_id);
        const manufacturer = manufacturers.find(m => m.id === item.manufacturer_id);
        
        return mapDatabaseAssetToFrontend({
          ...item,
          asset_solutions: solution ? { solution: solution.solution } : { solution: 'Unknown' },
          asset_status: status ? { status: status.status } : { status: 'Unknown' },
          manufacturers: manufacturer ? { name: manufacturer.name } : { name: 'Unknown' }
        });
      }).filter(Boolean) as Asset[]; // Filter out any null values and cast to Asset[]
    } catch (error) {
      handleAssetError(error, "Error in getAssets");
      return [];
    }
  },
  
  // Get a single asset by ID
  async getAssetById(id: string): Promise<Asset | null> {
    try {
      const { data, error } = await supabase.from('assets').select(`
        uuid, solution_id, status_id, iccid, serial_number, 
        manufacturer_id, model, line_number, admin_user,
        radio, ssid, rented_days, created_at, updated_at
      `).eq('uuid', id).single();
      
      if (error) {
        handleAssetError(error, `Failed to fetch asset ${id}`);
        return null;
      }
      
      // Fetch necessary related data in separate queries for mapping
      const solutionsPromise = supabase.from('asset_solutions').select('id, solution');
      const statusPromise = supabase.from('asset_status').select('id, status');
      const manufacturersPromise = supabase.from('manufacturers').select('id, name');
      
      const [solutionsResult, statusResult, manufacturersResult] = await Promise.all([
        solutionsPromise, statusPromise, manufacturersPromise
      ]);
      
      const solutions = solutionsResult.data || [];
      const statuses = statusResult.data || [];
      const manufacturers = manufacturersResult.data || [];
      
      // Check if data is an error object
      if ('error' in data) {
        console.error("Error in asset data:", data);
        return null;
      }
      
      // Get the related data for this asset
      const solution = solutions.find(s => s.id === data.solution_id);
      const status = statuses.find(s => s.id === data.status_id);
      const manufacturer = manufacturers.find(m => m.id === data.manufacturer_id);
      
      // Map to frontend Asset type
      return mapDatabaseAssetToFrontend({
        ...data,
        asset_solutions: solution ? { solution: solution.solution } : { solution: 'Unknown' },
        asset_status: status ? { status: status.status } : { status: 'Unknown' },
        manufacturers: manufacturer ? { name: manufacturer.name } : { name: 'Unknown' }
      });
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
      // Get problem assets without nested selects
      const { data, error } = await supabase
        .from('assets')
        .select(`
          uuid,
          iccid,
          radio,
          solution_id
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
