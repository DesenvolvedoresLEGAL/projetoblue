
import apiClient, { ApiResponse, handleApiError } from "./apiClient";
import { StatusRecord } from "@/types/asset";
import { toast } from "@/utils/toast";

// Reference data service
export const referenceDataService = {
  // Get all status records
  async getStatusRecords(): Promise<StatusRecord[]> {
    try {
      const response = await apiClient.get<StatusRecord[]>("/status");
      
      if (!response.success) {
        handleApiError(response.error, "Failed to fetch status records");
        return [];
      }
      
      return response.data || [];
    } catch (error) {
      console.error("Error fetching status records:", error);
      toast.error("Failed to fetch status records");
      return [];
    }
  },
  
  // Get all asset types
  async getAssetTypes(): Promise<{ id: number, type: string }[]> {
    try {
      const response = await apiClient.get<{ id: number, type: string }[]>("/asset_types");
      
      if (!response.success) {
        handleApiError(response.error, "Failed to fetch asset types");
        return [];
      }
      
      return response.data || [];
    } catch (error) {
      console.error("Error fetching asset types:", error);
      toast.error("Failed to fetch asset types");
      return [];
    }
  },
  
  // Get all manufacturers
  async getManufacturers(): Promise<{ id: number, name: string }[]> {
    try {
      const response = await apiClient.get<{ id: number, name: string }[]>("/manufacturers");
      
      if (!response.success) {
        handleApiError(response.error, "Failed to fetch manufacturers");
        return [];
      }
      
      return response.data || [];
    } catch (error) {
      console.error("Error fetching manufacturers:", error);
      toast.error("Failed to fetch manufacturers");
      return [];
    }
  },
  
  // Get all asset solutions
  async getAssetSolutions(): Promise<{ id: number, solution: string }[]> {
    try {
      const response = await apiClient.get<{ id: number, solution: string }[]>("/asset_solutions");
      
      if (!response.success) {
        handleApiError(response.error, "Failed to fetch asset solutions");
        return [];
      }
      
      return response.data || [];
    } catch (error) {
      console.error("Error fetching asset solutions:", error);
      toast.error("Failed to fetch asset solutions");
      return [];
    }
  }
};

export default referenceDataService;
