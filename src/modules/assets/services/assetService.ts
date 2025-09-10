import { optimizedAssetService } from './optimizedAssetService';

// Re-export from optimized service
export const assetService = {
  ...optimizedAssetService,
  // Additional compatibility methods
  getAssetsByStatus: async (statusId: number) => {
    const result = await optimizedAssetService.getAssets({ statusIds: [statusId] });
    return result.data;
  },
  listProblemAssets: async () => {
    const result = await optimizedAssetService.getAssets({ statusIds: [4, 5, 6] }); // Problem statuses
    return result.data;
  },
  getAssetLogs: async (options?: { limit?: number }) => {
    // Mock implementation - replace with actual asset logs service
    return [];
  },
  getStatus: async () => {
    // Mock implementation - replace with actual status service  
    return [];
  },
  statusByType: async () => {
    // Mock implementation - replace with actual status by type service
    return [];
  }
};

// Additional interface for update params
export interface AssetUpdateParams {
  status?: string;
  status_id?: number;
  wifiAnalysis?: any;
  // Add other fields as needed
}
