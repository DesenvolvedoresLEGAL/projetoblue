import { supabase } from "@/integrations/supabase/client";
import { Asset } from "@/types/asset";

export interface FilterOptions {
  limit?: number;
  offset?: number;
  statusIds?: number[];
  solutionIds?: number[];
}

export interface PaginatedAssets {
  data: Asset[];
  total: number;
  hasMore: boolean;
}

export interface StatusSummary {
  status: string;
  count: number;
  statusId: number;
}

export const optimizedAssetService = {
  async getAssets(options?: FilterOptions): Promise<PaginatedAssets> {
    try {
      let query = supabase
        .from('assets')
        .select('*', { count: 'exact' })
        .is('deleted_at', null);

      if (options?.statusIds && options.statusIds.length > 0) {
        query = query.in('status_id', options.statusIds);
      }

      if (options?.solutionIds && options.solutionIds.length > 0) {
        query = query.in('solution_id', options.solutionIds);
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 50) - 1);
      }

      const { data, error, count } = await query;
      
      if (error) throw error;

      return {
        data: (data || []) as any, // Type assertion for compatibility
        total: count || 0,
        hasMore: (count || 0) > ((options?.offset || 0) + (options?.limit || 50))
      };
    } catch (error) {
      console.error('Error fetching assets:', error);
      return { data: [], total: 0, hasMore: false };
    }
  },

  async getAssetStats(): Promise<{
    total: number;
    chips: number;
    routers: number;
    available: number;
    rented: number;
  }> {
    try {
      const { data, error } = await supabase
        .from('assets')
        .select('solution_id, status_id')
        .is('deleted_at', null);

      if (error) throw error;

      const assets = data || [];
      const stats = {
        total: assets.length,
        chips: assets.filter(a => a.solution_id === 11).length,
        routers: assets.filter(a => a.solution_id !== 11).length,
        available: assets.filter(a => a.status_id === 1).length,
        rented: assets.filter(a => a.status_id === 2).length,
      };

      return stats;
    } catch (error) {
      console.error('Error fetching asset stats:', error);
      return { total: 0, chips: 0, routers: 0, available: 0, rented: 0 };
    }
  },

  async getStatusSummary(): Promise<StatusSummary[]> {
    try {
      const { data, error } = await supabase
        .from('assets')
        .select(`
          status_id,
          asset_status!inner(id, status)
        `)
        .is('deleted_at', null);

      if (error) throw error;

      const statusCounts: Record<string, { count: number; statusId: number }> = {};
      
      (data || []).forEach(item => {
        const status = (item.asset_status as any)?.status || 'Unknown';
        const statusId = (item.asset_status as any)?.id || 0;
        
        if (!statusCounts[status]) {
          statusCounts[status] = { count: 0, statusId };
        }
        statusCounts[status].count++;
      });

      return Object.entries(statusCounts).map(([status, { count, statusId }]) => ({
        status,
        count,
        statusId
      }));
    } catch (error) {
      console.error('Error fetching status summary:', error);
      return [];
    }
  },

  async getRecentAssetsOptimized(limit: number = 5): Promise<Asset[]> {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .gte('created_at', thirtyDaysAgo.toISOString())
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return (data || []) as any; // Type assertion for compatibility
    } catch (error) {
      console.error('Error fetching recent assets:', error);
      return [];
    }
  }
};