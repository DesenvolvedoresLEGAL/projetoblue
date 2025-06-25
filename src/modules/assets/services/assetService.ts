
import { optimizedAssetService } from './optimizedAssetService';

// Re-export all methods from optimizedAssetService
export const assetService = {
  getAssets: optimizedAssetService.getAssets,
  getAssetStats: optimizedAssetService.getAssetStats,
  
  // Métodos adicionais para compatibilidade
  getAssetsByMultipleStatus: async (statusIds: number[]) => {
    const result = await optimizedAssetService.getAssets();
    return {
      ...result,
      assets: result.assets.filter(asset => statusIds.includes(asset.status_id))
    };
  },
  
  getStatusSummary: async () => {
    const stats = await optimizedAssetService.getAssetStats();
    return {
      available: stats.available,
      rented: stats.rented,
      total: stats.total
    };
  },
  
  getRecentAssetsOptimized: async (limit = 10) => {
    const result = await optimizedAssetService.getAssets({ pageSize: limit });
    return result.assets;
  },
  
  clearCache: () => {
    // Placeholder para compatibilidade - o React Query gerencia o cache
    console.log('Cache cleared');
  },
  
  clearCacheByPattern: (pattern: string) => {
    // Placeholder para compatibilidade - o React Query gerencia o cache
    console.log('Cache cleared by pattern:', pattern);
  }
};

export default assetService;
