
import { supabase } from "@/integrations/supabase/client";
import { StatusRecord } from "@/types/asset";
import { toast } from "@/utils/toast";

// Reference data service (using Supabase directly as temporary solution)
export const referenceDataService = {
  // Get all status records
  async getStatusRecords(): Promise<StatusRecord[]> {
    try {
      const { data, error } = await supabase.from('asset_status').select('id, status');
      
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
  
  // Get all asset solutions
  async getAssetSolutions(): Promise<{ id: number, solution: string }[]> {
    try {
      const { data, error } = await supabase.from('asset_solutions').select('id, solution');
      
      if (error) {
        console.error("Error fetching asset solutions:", error);
        toast.error("Failed to fetch asset solutions");
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error("Error in getAssetSolutions:", error);
      toast.error("Failed to fetch asset solutions");
      return [];
    }
  }
};

export default referenceDataService;
