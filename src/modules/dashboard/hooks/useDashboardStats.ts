
import { useQuery } from '@tanstack/react-query';
import * as dashboardQueries from '@modules/dashboard/services/dashboardQueries';
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
  // NEW: Dados para o PieChart refatorado
  pieChartData: {
    status: string;
    total: number;
  }[];
  detailedStatusData: {
    type: string;
    status: string;
    total: number;
  }[];
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
          recentEventsResult,
          statusSummaryResult,
          detailedBreakdownResult
        ] = await Promise.all([
          dashboardQueries.fetchTotalAssets(),
          dashboardQueries.fetchActiveClients(),
          dashboardQueries.fetchAssetsWithIssues(),
          dashboardQueries.fetchRecentAssets(),
          dashboardQueries.fetchRecentEvents(),
          dashboardQueries.fetchStatusSummary(),
          dashboardQueries.fetchDetailedStatusBreakdown()
        ]);

        // Log query results for debugging
        console.log('Total assets result:', totalAssetsResult);
        console.log('Active clients result:', activeClientsResult);
        console.log('Assets with issues result:', assetsWithIssuesResult);
        console.log('Recent assets result:', recentAssetsResult);
        console.log('Recent events result:', recentEventsResult);
        console.log('Status summary result:', statusSummaryResult);
        console.log('Detailed breakdown result:', detailedBreakdownResult);

        // Error handling for individual queries
        if (totalAssetsResult.error) throw new Error(`Total assets query error: ${totalAssetsResult.error.message}`);
        if (activeClientsResult.error) throw new Error(`Active clients query error: ${activeClientsResult.error.message}`);
        if (assetsWithIssuesResult.error) throw new Error(`Problem assets query error: ${assetsWithIssuesResult.error.message}`);
        if (recentAssetsResult.error) throw new Error(`Recent assets query error: ${recentAssetsResult.error.message}`);
        if (recentEventsResult.error) throw new Error(`Recent events query error: ${recentEventsResult.error.message}`);
        if (statusSummaryResult.error) throw new Error(`Status summary query error: ${statusSummaryResult.error.message}`);
        if (detailedBreakdownResult.error) throw new Error(`Detailed breakdown query error: ${detailedBreakdownResult.error.message}`);
        
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

        // NEW: Process data for PieChart (aggregated by status only)
        const statusCounts = new Map<string, number>();
        statusSummaryResult.data?.forEach(asset => {
          const status = asset.asset_status?.status || 'Desconhecido';
          statusCounts.set(status, (statusCounts.get(status) || 0) + 1);
        });

        const pieChartData = Array.from(statusCounts.entries()).map(([status, total]) => ({
          status: status.charAt(0).toUpperCase() + status.slice(1).toLowerCase(),
          total
        }));

        // NEW: Process detailed data for tooltip (type + status)
        const detailedCounts = new Map<string, number>();
        detailedBreakdownResult.data?.forEach(asset => {
          const type = asset.asset_solutions?.solution || 'Desconhecido';
          const status = asset.asset_status?.status || 'Desconhecido';
          const key = `${type}|${status}`;
          detailedCounts.set(key, (detailedCounts.get(key) || 0) + 1);
        });

        const detailedStatusData = Array.from(detailedCounts.entries()).map(([key, total]) => {
          const [type, status] = key.split('|');
          return {
            type: type.charAt(0).toUpperCase() + type.slice(1).toLowerCase(),
            status: status.charAt(0).toUpperCase() + status.slice(1).toLowerCase(),
            total
          };
        });
        
        console.log('Dashboard data fetched successfully');
        console.log('PieChart data:', pieChartData);
        console.log('Detailed status data:', detailedStatusData);
        
        // Return data in the expected format
        return {
          totalAssets: totalAssetsResult.count || 0,
          activeClients: activeClientsResult.count || 0,
          assetsWithIssues: assetsWithIssuesResult.count || 0,
          recentAssets: processedRecentAssets,
          recentEvents: processedRecentEvents,
          pieChartData,
          detailedStatusData
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
