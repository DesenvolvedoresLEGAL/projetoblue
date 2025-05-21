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
    asset_name: string;
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
            
          // 5 most recently created assets - remove nested select
          supabase
            .from('assets')
            .select(`
              uuid, serial_number, line_number, radio, solution_id, status_id
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
        
        // Fetch additional data needed for mapping
        const solutionsResult = await supabase
          .from('asset_solutions')
          .select('id, solution')
          .throwOnError();
          
        const statusResult = await supabase
          .from('asset_status')
          .select('id, status')
          .throwOnError();
        
        const solutions = solutionsResult.data || [];
        const statuses = statusResult.data || [];
        
        console.log('Dashboard data fetched:', {
          totalAssets: totalAssetsResult,
          activeClients: activeClientsResult,
          assetsWithIssues: assetsWithIssuesResult,
          recentAssets: recentAssetsResult,
          recentEvents: recentEventsResult,
          statusBreakdown: statusBreakdownResult
        });
        
        // Process recent assets data
        const recentAssets = (recentAssetsResult.data || []).map(asset => {
          const solution = solutions.find(s => s.id === asset.solution_id);
          const status = statuses.find(s => s.id === asset.status_id);
          
          return {
            id: asset.serial_number || String(asset.line_number || ''),
            name: asset.radio || asset.line_number?.toString() || asset.serial_number || '',
            type: solution?.solution || 'Unknown',
            status: status?.status || 'Unknown'
          };
        });
        
        // Process recent events data
        const recentEvents = (recentEventsResult.data || []).map(event => {
          const details = event.details as Record<string, any> | null;
          let description = event.event || 'Event logged';
          let asset_name = ''; // Initialize asset_name
          
          // Extract more meaningful description and asset_name from details if available
          if (details && details.asset_id) {
            asset_name = details.radio || details.asset_id.toString().substring(0, 8) || 'unknown';
            description = `${event.event} para ${asset_name}`;
          } else if (details && details.description) {
            description = details.description;
            asset_name = 'N/A';
          } else {
            asset_name = 'N/A';
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
            asset_name, // Add the asset_name to the return object
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
              active += item.count || 0;
            } else if (status.includes('warning') || status.includes('aviso')) {
              warning += item.count || 0;
            } else if (status.includes('critical') || status.includes('crítico')) {
              critical += item.count || 0;
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
