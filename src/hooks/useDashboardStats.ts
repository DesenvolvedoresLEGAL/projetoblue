
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface DashboardStats {
  totalAssets: number;
  activeClients: number;
  assetsWithIssues: number;
  recentAssets: {
    id: string;
    name: string;
    type: string;
    status: string;
  }[];
  recentEvents: {
    id: number;
    type: string;
    description: string;
    time: Date;
  }[];
  statusSummary: {
    active: number;
    warning: number;
    critical: number;
  };
}

export function useDashboardStats() {
  return useQuery<DashboardStats, Error>({
    queryKey: ['dashboard', 'stats'],
    queryFn: async () => {
      try {
        // Parallel queries for better performance
        const [
          totalAssetsResult,
          activeClientsResult,
          assetsWithIssuesResult,
          recentAssetsResult,
          recentEventsResult,
          statusBreakdownResult
        ] = await Promise.all([
          // Total assets count
          supabase
            .from('assets')
            .select('*', { head: true, count: 'exact' })
            .throwOnError(),
            
          // Active clients count
          supabase
            .from('v_active_clients')
            .select('*', { head: true, count: 'exact' })
            .throwOnError(),
            
          // Assets with issues count
          supabase
            .from('v_problem_assets')
            .select('*', { head: true, count: 'exact' })
            .throwOnError(),
            
          // 5 most recently created assets
          supabase
            .from('assets')
            .select(`
              serial_number,
              line_number,
              radio,
              asset_types!inner(type),
              asset_status!inner(status)
            `)
            .order('created_at', { ascending: false })
            .limit(5)
            .throwOnError(),
            
          // 5 most recent events
          supabase
            .from('asset_logs')
            .select('id, event, date, details')
            .order('date', { ascending: false })
            .limit(5)
            .throwOnError(),
            
          // Status breakdown for summary statistics
          supabase.rpc('status_by_asset_type')
            .throwOnError()
        ]);
        
        console.log('Dashboard data fetched:', {
          totalAssets: totalAssetsResult,
          activeClients: activeClientsResult,
          assetsWithIssues: assetsWithIssuesResult,
          recentAssets: recentAssetsResult,
          recentEvents: recentEventsResult,
          statusBreakdown: statusBreakdownResult
        });
        
        // Process recent assets data
        const recentAssets = (recentAssetsResult.data || []).map(asset => ({
          id: asset.uuid,
          name: asset.radio || asset.line_number,
          type: asset.asset_types?.type || 'Unknown',
          status: asset.asset_status?.status || 'Unknown'
        }));
        
        // Process recent events data
        const recentEvents = (recentEventsResult.data || []).map(event => {
          const details = event.details as Record<string, any> | null;
          let description = event.event || 'Event logged';
          
          // Extract more meaningful description from details if available
          if (details) {
            if (details.asset_id) {
              const assetId = typeof details.asset_id === 'string' 
                ? details.asset_id.substring(0, 8)
                : 'unknown';
              description = `${event.event} for asset ${assetId}`;
            } else if (details.description) {
              description = details.description;
            }
          }
          
          // Determine event type for color coding
          let type = 'status';
          if (event.event?.toLowerCase().includes('register')) {
            type = 'register';
          } else if (event.event?.toLowerCase().includes('link') || 
                     event.event?.toLowerCase().includes('assoc')) {
            type = 'link';
          }
          
          return {
            id: event.id,
            type,
            description,
            time: event.date ? new Date(event.date) : new Date()
          };
        });
        
        // Calculate status summary
        let active = 0;
        let warning = 0;
        let critical = 0;
        
        // Process status breakdown data if available
        if (statusBreakdownResult.data) {
          statusBreakdownResult.data.forEach((item: any) => {
            const status = item.status?.toLowerCase() || '';
            if (status.includes('active') || status.includes('disponível')) {
              active += item.total;
            } else if (status.includes('warning') || status.includes('aviso')) {
              warning += item.total;
            } else if (status.includes('critical') || status.includes('crítico')) {
              critical += item.total;
            }
          });
        }
        
        // Return data in the exact shape expected by Home.tsx
        return {
          totalAssets: totalAssetsResult.count || 0,
          activeClients: activeClientsResult.count || 0,
          assetsWithIssues: assetsWithIssuesResult.count || 0,
          recentAssets,
          recentEvents,
          statusSummary: {
            active,
            warning,
            critical
          }
        };
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        throw error;
      }
    },
    staleTime: 60000, // 1 minute
    gcTime: 300000,   // 5 minutes (renamed from cacheTime)
    retry: 1,
    refetchOnWindowFocus: false
  });
}

// Helper function to format relative time (to be used in the render)
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.round(diffMs / 60000);
  const diffHours = Math.round(diffMs / 3600000);
  const diffDays = Math.round(diffMs / 86400000);
  
  if (diffMins < 60) {
    return diffMins <= 1 ? '1 minute ago' : `${diffMins} minutes ago`;
  } else if (diffHours < 24) {
    return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
  } else {
    return diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;
  }
}
