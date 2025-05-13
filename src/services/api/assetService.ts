
import apiClient, { ApiResponse, handleApiError } from "./apiClient";
import { Asset, AssetStatus, AssetType, ChipAsset, RouterAsset } from "@/types/asset";
import { toast } from "@/utils/toast";

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

// Asset API service
export const assetService = {
  // Get all assets with filtering
  async getAssets(params?: AssetListParams): Promise<Asset[]> {
    try {
      const response = await apiClient.get<Asset[]>("/assets", { params: params as Record<string, string> });
      
      if (!response.success) {
        handleApiError(response.error, "Failed to fetch assets");
        return [];
      }
      
      return response.data || [];
    } catch (error) {
      console.error("Error fetching assets:", error);
      toast.error("Failed to fetch assets");
      return [];
    }
  },
  
  // Get a single asset by ID
  async getAssetById(id: string): Promise<Asset | null> {
    try {
      const response = await apiClient.get<Asset>(`/assets/${id}`);
      
      if (!response.success) {
        handleApiError(response.error, "Failed to fetch asset details");
        return null;
      }
      
      return response.data || null;
    } catch (error) {
      console.error(`Error fetching asset ${id}:`, error);
      toast.error("Failed to fetch asset details");
      return null;
    }
  },
  
  // Create a new asset
  async createAsset(assetData: AssetCreateParams): Promise<Asset | null> {
    try {
      const response = await apiClient.post<Asset>("/assets", assetData);
      
      if (!response.success) {
        handleApiError(response.error, "Failed to create asset");
        return null;
      }
      
      toast.success(assetData.type === "CHIP" ? "Chip cadastrado com sucesso" : "Roteador cadastrado com sucesso");
      return response.data || null;
    } catch (error) {
      console.error("Error creating asset:", error);
      toast.error("Failed to create asset");
      return null;
    }
  },
  
  // Update an existing asset
  async updateAsset(id: string, assetData: AssetUpdateParams): Promise<Asset | null> {
    try {
      const response = await apiClient.patch<Asset>(`/assets/${id}`, assetData);
      
      if (!response.success) {
        handleApiError(response.error, "Failed to update asset");
        return null;
      }
      
      toast.success("Ativo atualizado com sucesso");
      return response.data || null;
    } catch (error) {
      console.error(`Error updating asset ${id}:`, error);
      toast.error("Failed to update asset");
      return null;
    }
  },
  
  // Delete an asset
  async deleteAsset(id: string): Promise<boolean> {
    try {
      const response = await apiClient.delete<{ success: boolean }>(`/assets/${id}`);
      
      if (!response.success) {
        handleApiError(response.error, "Failed to delete asset");
        return false;
      }
      
      toast.success("Ativo excluído com sucesso");
      return true;
    } catch (error) {
      console.error(`Error deleting asset ${id}:`, error);
      toast.error("Failed to delete asset");
      return false;
    }
  },
  
  // Update asset status
  async updateAssetStatus(id: string, statusId: number): Promise<Asset | null> {
    try {
      const response = await apiClient.patch<Asset>(`/assets/${id}/status`, { statusId });
      
      if (!response.success) {
        handleApiError(response.error, "Failed to update asset status");
        return null;
      }
      
      toast.success("Status do ativo atualizado com sucesso");
      return response.data || null;
    } catch (error) {
      console.error(`Error updating asset ${id} status:`, error);
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
