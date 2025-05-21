
import { supabase } from "@/integrations/supabase/client";
import { StatusRecord } from "@/types/asset";
import { toast } from "@/utils/toast";

// Reference data service (using Supabase directly as temporary solution)
export const referenceDataService = {
  // Get all status records
  async getStatusRecords(): Promise<StatusRecord[]> {
    try {
      const { data, error } = await supabase.from('asset_status').select('*');
      
      if (error) {
        console.error("Error fetching status records:", error);
        toast.error("Failed to fetch status records");
        return [];
      }
      
      return data.map(status => ({
        id: status.id,
        nome: status.status
      })) || [];
    } catch (error) {
      console.error("Error in getStatusRecords:", error);
      toast.error("Failed to fetch status records");
      return [];
    }
  },
  
  // Get all asset types from asset_categories table
  async getAssetTypes(): Promise<{ id: number, type: string }[]> {
    try {
      const { data, error } = await supabase.from('asset_categories').select('id, name');
      
      if (error) {
        console.error("Error fetching asset categories:", error);
        toast.error("Failed to fetch asset categories");
        return [];
      }
      
      // Transform the data to match the expected format
      return data.map(category => ({
        id: category.id,
        type: category.name
      })) || [];
    } catch (error) {
      console.error("Error in getAssetTypes:", error);
      toast.error("Failed to fetch asset types");
      return [];
    }
  },
  
  // Get all manufacturers
  async getManufacturers(): Promise<{ id: number, name: string }[]> {
    try {
      const { data, error } = await supabase.from('manufacturers').select('id, name');
      
      if (error) {
        console.error("Error fetching manufacturers:", error);
        toast.error("Failed to fetch manufacturers");
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error("Error in getManufacturers:", error);
      toast.error("Failed to fetch manufacturers");
      return [];
    }
  },
  
  // Get all asset solutions from asset_categories table
  async getAssetSolutions(): Promise<{ id: number, solution: string }[]> {
    try {
      // We'll use the same asset_categories table but map the data differently
      const { data, error } = await supabase.from('asset_categories').select('id, name');
      
      if (error) {
        console.error("Error fetching asset solutions:", error);
        toast.error("Failed to fetch asset solutions");
        return [];
      }
      
      // Transform the data to match the expected format
      return data.map(category => ({
        id: category.id,
        solution: category.name
      })) || [];
    } catch (error) {
      console.error("Error in getAssetSolutions:", error);
      toast.error("Failed to fetch asset solutions");
      return [];
    }
  }
};

export default referenceDataService;
