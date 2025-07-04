
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
  
  getAssetsByStatus: async (statusId: number) => {
    const result = await optimizedAssetService.getAssets({ filterStatus: statusId.toString() });
    return result.assets;
  },
  
  statusByType: async () => {
    const stats = await optimizedAssetService.getAssetStats();
    return {
      CHIP: {
        available: Math.floor(stats.chips * (stats.available / stats.total)),
        rented: Math.floor(stats.chips * (stats.rented / stats.total))
      },
      EQUIPMENT: {
        available: Math.floor(stats.routers * (stats.available / stats.total)),
        rented: Math.floor(stats.routers * (stats.rented / stats.total))
      }
    };
  },
  
  listProblemAssets: async () => {
    // Return assets with problematic status (assuming status_id 4, 5, 6 are problematic)
    const result = await optimizedAssetService.getAssets();
    return result.assets.filter(asset => [4, 5, 6].includes(asset.status_id));
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
    if (import.meta.env.DEV) console.log('Cache cleared');
  },
  
  clearCacheByPattern: (pattern: string) => {
    // Placeholder para compatibilidade - o React Query gerencia o cache
    if (import.meta.env.DEV) console.log('Cache cleared by pattern:', pattern);
  }
};

export default assetService;
