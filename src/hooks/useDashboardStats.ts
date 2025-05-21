
import { useQuery } from '@tanstack/react-query';
import * as dashboardQueries from '@/api/dashboardQueries';
import { mapStatusIdToAssetStatus } from '@/utils/databaseMappers';
import { formatRelativeTime } from '@/utils/dashboardUtils';

export interface DashboardStats {
  totalAssets: number;
  activeClients: number;
  assetsWithIssues: number;
  recentAssets: {
    id: string;
    name: string;
    type: string;
    status: string;
    solution: string;
  }[];
  recentEvents: {
    id: number;
    type: string;
    description: string;
    time: string;
    asset_id?: string;
    asset_name?: string;
  }[];
  statusSummary?: {
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
        console.log('Fetching dashboard stats...');
        
        // Parallel queries for better performance
        const [
          totalAssetsResult,
          activeClientsResult,
          assetsWithIssuesResult,
          recentAssetsResult,
          recentEventsResult
        ] = await Promise.all([
          dashboardQueries.fetchTotalAssets(),
          dashboardQueries.fetchActiveClients(),
          dashboardQueries.fetchAssetsWithIssues(),
          dashboardQueries.fetchRecentAssets(),
          dashboardQueries.fetchRecentEvents()
        ]);

        // Log query results for debugging
        console.log('Total assets result:', totalAssetsResult);
        console.log('Active clients result:', activeClientsResult);
        console.log('Assets with issues result:', assetsWithIssuesResult);
        console.log('Recent assets result:', recentAssetsResult);
        console.log('Recent events result:', recentEventsResult);

        // Error handling for individual queries
        if (totalAssetsResult.error) throw new Error(`Total assets query error: ${totalAssetsResult.error.message}`);
        if (activeClientsResult.error) throw new Error(`Active clients query error: ${activeClientsResult.error.message}`);
        if (assetsWithIssuesResult.error) throw new Error(`Problem assets query error: ${assetsWithIssuesResult.error.message}`);
        if (recentAssetsResult.error) throw new Error(`Recent assets query error: ${recentAssetsResult.error.message}`);
        if (recentEventsResult.error) throw new Error(`Recent events query error: ${recentEventsResult.error.message}`);
        
        // Fetch additional data needed for mapping
        const solutionsResult = await dashboardQueries.fetchSolutions();
        const statusResult = await dashboardQueries.fetchStatuses();
        
        console.log('Solutions result:', solutionsResult);
        console.log('Status result:', statusResult);
        
        if (solutionsResult.error) throw new Error(`Solutions query error: ${solutionsResult.error.message}`);
        if (statusResult.error) throw new Error(`Status query error: ${statusResult.error.message}`);
        
        const solutions = solutionsResult.data || [];
        const statuses = statusResult.data || [];
        
        // Process recent assets data
        const processedRecentAssets = recentAssetsResult.data?.map(asset => {
          const solution = solutions.find(s => s.id === asset.solution_id);
          const status = statuses.find(s => s.id === asset.status_id);
          
          return {
            id: asset.uuid,
            name: asset.radio || asset.line_number?.toString() || asset.serial_number || 'N/A',
            type: solution?.solution || 'Unknown',
            status: status?.status || 'Unknown',
            solution: solution?.solution || 'Unknown'
          };
        }) || [];
        
        // Process recent events data
        const processedRecentEvents = recentEventsResult.data?.map(event => {
          let description = event.event || 'Event logged';
          let asset_name = 'N/A';
          
          // Extract more meaningful description from details if available
          if (event.details && typeof event.details === 'object') {
            // Ensure we're dealing with an object
            const details = event.details as Record<string, any>;
            
            if (details.description) {
              description = details.description;
            }
            
            if (details.asset_id) {
              asset_name = details.radio || details.asset_id.toString().substring(0, 8) || 'unknown';
            }
          }
          
          return {
            id: event.id,
            type: event.event?.toLowerCase().includes('register') ? 'register' : 
                  event.event?.toLowerCase().includes('link') || event.event?.toLowerCase().includes('assoc') ? 'link' : 
                  'status',
            description,
            asset_name,
            time: event.date,
            asset_id: (typeof event.details === 'object' && event.details) ? 
                      (event.details as any).asset_id : undefined
          };
        }) || [];
        
        console.log('Dashboard data fetched successfully');
        
        // Return data in the expected format
        return {
          totalAssets: totalAssetsResult.count || 0,
          activeClients: activeClientsResult.count || 0,
          assetsWithIssues: assetsWithIssuesResult.count || 0,
          recentAssets: processedRecentAssets,
          recentEvents: processedRecentEvents
        };
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        throw error;
      }
    },
    staleTime: 60000, // 1 minute
    gcTime: 300000,   // 5 minutes
    retry: 1,
    refetchOnWindowFocus: false
  });
}
