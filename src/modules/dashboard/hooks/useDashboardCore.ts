
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { QueryErrorResult } from '../types/dashboard';

// Hook específico para dados básicos do dashboard
export function useDashboardCore() {
  return useQuery({
    queryKey: ['dashboard', 'core-stats'],
    queryFn: async () => {
      const results = await Promise.allSettled([
        // Total assets
        supabase
          .from('assets')
          .select('*', { count: 'exact', head: true })
          .is('deleted_at', null),
        
        // Active clients
        supabase
          .from('v_active_clients')
          .select('*', { count: 'exact', head: true }),
        
        // Assets with issues
        supabase
          .from('v_problem_assets')
          .select('*', { count: 'exact', head: true }),
      ]);

      const [totalAssetsResult, activeClientsResult, assetsWithIssuesResult] = results;

      return {
        totalAssets: totalAssetsResult.status === 'fulfilled' ? (totalAssetsResult.value.count || 0) : 0,
        activeClients: activeClientsResult.status === 'fulfilled' ? (activeClientsResult.value.count || 0) : 0,
        assetsWithIssues: assetsWithIssuesResult.status === 'fulfilled' ? (assetsWithIssuesResult.value.count || 0) : 0,
        errors: results.filter(r => r.status === 'rejected').map(r => (r as PromiseRejectedResult).reason)
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });
}
