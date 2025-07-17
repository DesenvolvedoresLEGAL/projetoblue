
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { formatRelativeTime } from '@/utils/dashboardUtils';
import type { RecentAsset, RecentEvent, AssetQueryResult, EventQueryResult } from '../types/dashboard';

// Hook específico para dados recentes
export function useDashboardRecentData() {
  return useQuery({
    queryKey: ['dashboard', 'recent-data'],
    queryFn: async () => {
      const results = await Promise.allSettled([
        // Recent assets with JOINs
        supabase
          .from('assets')
          .select(`
            uuid,
            serial_number,
            iccid,
            line_number,
            radio,
            solution_id,
            status_id,
            model,
            asset_solutions!inner(id, solution),
            asset_status!inner(id, status)
          `)
          .is('deleted_at', null)
          .order('created_at', { ascending: false })
          .limit(5),

        // Recent events with user info
        supabase
          .from('asset_logs')
          .select(`
            uuid as id,
            event,
            created_at as date,
            details,
            status_before_id,
            status_after_id
          `)
          .order('created_at', { ascending: false })
          .limit(5),
      ]);

      const [recentAssetsResult, recentEventsResult] = results;

      // Process recent assets
      const recentAssets: RecentAsset[] = [];
      if (recentAssetsResult.status === 'fulfilled' && recentAssetsResult.value.data) {
        recentAssets.push(...recentAssetsResult.value.data.map((asset: AssetQueryResult) => {
          const assetName = asset.radio || 
                           (asset.line_number ? asset.line_number.toString() : '') || 
                           asset.serial_number || 
                           asset.iccid || 
                           'N/A';
          
          return {
            id: asset.uuid,
            name: assetName,
            type: asset.asset_solutions?.solution || 'Unknown',
            status: asset.asset_status?.status || 'Unknown',
            solution: asset.asset_solutions?.solution || 'Unknown'
          };
        }));
      }

      // Process recent events
      const recentEvents: RecentEvent[] = [];
      if (recentEventsResult.status === 'fulfilled' && recentEventsResult.value.data) {
        recentEvents.push(...recentEventsResult.value.data.map((event: EventQueryResult, index: number) => {
          const details = event.details || {};
          const description = (details.event_description as string) || event.event || 'Evento sem descrição';
          const asset_id = details.asset_id as string;
          const asset_name = (details.line_number as string) || (details.radio as string) || 'N/A';

          return {
            id: event.id || index,
            type: event.event || 'UNKNOWN',
            description,
            time: formatRelativeTime(event.date || new Date().toISOString()),
            asset_id,
            asset_name,
            user_email: event.user_email
          };
        }));
      }

      return {
        recentAssets,
        recentEvents,
        errors: results.filter(r => r.status === 'rejected').map(r => (r as PromiseRejectedResult).reason)
      };
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}
