
import { supabase } from "@/integrations/supabase/client";
import { optimizedAssetService } from './optimizedAssetService';

export const assetService = {
  listProblemAssets: async () => {
    const { data, error } = await supabase
      .from('assets')
      .select('*')
      .neq('status_id', 1)
      .is('deleted_at', null);
    
    if (error) throw error;
    return data || [];
  },

  getAssetsByStatus: async (statusId: number) => {
    const { data, error } = await supabase
      .from('assets')
      .select('*')
      .eq('status_id', statusId)
      .is('deleted_at', null);
    
    if (error) throw error;
    return data || [];
  },

  statusByType: async () => {
    const { data, error } = await supabase
      .rpc('status_by_asset_type');
    
    if (error) throw error;
    return data || [];
  },

  // Delegate to optimized service for new methods
  getAssetsByMultipleStatus: optimizedAssetService.getAssetsByMultipleStatus.bind(optimizedAssetService),
  getStatusSummary: optimizedAssetService.getStatusSummary.bind(optimizedAssetService),
  getRecentAssetsOptimized: optimizedAssetService.getRecentAssetsOptimized.bind(optimizedAssetService),
  clearCache: optimizedAssetService.clearCache.bind(optimizedAssetService),
  clearCacheByPattern: optimizedAssetService.clearCacheByPattern.bind(optimizedAssetService),
};
