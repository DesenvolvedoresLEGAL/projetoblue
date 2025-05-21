
import { useQuery } from '@tanstack/react-query';
import * as dashboardQueries from '@/api/dashboardQueries';
import { 
  processRecentAssets, 
  processRecentEvents,
  calculateStatusSummary,
  formatRelativeTime
} from '@/utils/dashboardUtils';

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
          dashboardQueries.fetchTotalAssets(),
          dashboardQueries.fetchActiveClients(),
          dashboardQueries.fetchAssetsWithIssues(),
          dashboardQueries.fetchRecentAssets(),
          dashboardQueries.fetchRecentEvents(),
          dashboardQueries.fetchStatusBreakdown()
        ]);

        // Error handling for individual queries
        if (totalAssetsResult.error) throw new Error(`Total assets query error: ${totalAssetsResult.error.message}`);
        if (activeClientsResult.error) throw new Error(`Active clients query error: ${activeClientsResult.error.message}`);
        if (assetsWithIssuesResult.error) throw new Error(`Problem assets query error: ${assetsWithIssuesResult.error.message}`);
        if (recentAssetsResult.error) throw new Error(`Recent assets query error: ${recentAssetsResult.error.message}`);
        if (recentEventsResult.error) throw new Error(`Recent events query error: ${recentEventsResult.error.message}`);
        if (statusBreakdownResult.error) throw new Error(`Status breakdown query error: ${statusBreakdownResult.error.message}`);
        
        // Fetch additional data needed for mapping
        const solutionsResult = await dashboardQueries.fetchSolutions();
        const statusResult = await dashboardQueries.fetchStatuses();
        
        if (solutionsResult.error) throw new Error(`Solutions query error: ${solutionsResult.error.message}`);
        if (statusResult.error) throw new Error(`Status query error: ${statusResult.error.message}`);
        
        const solutions = solutionsResult.data || [];
        const statuses = statusResult.data || [];
        
        console.log('Dashboard data fetched successfully');
        
        // Process data using utility functions
        const recentAssets = processRecentAssets(recentAssetsResult.data, solutions, statuses);
        const recentEvents = processRecentEvents(recentEventsResult.data);
        const statusSummary = calculateStatusSummary(statusBreakdownResult.data);
        
        // Return data in the exact shape expected by Dashboard.tsx
        return {
          totalAssets: totalAssetsResult.count || 0,
          activeClients: activeClientsResult.count || 0,
          assetsWithIssues: assetsWithIssuesResult.count || 0,
          recentAssets,
          recentEvents,
          statusSummary
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

// Export formatRelativeTime for components that need it
export { formatRelativeTime };
