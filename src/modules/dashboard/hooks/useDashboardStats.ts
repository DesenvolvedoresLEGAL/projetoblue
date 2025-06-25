
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
        if (process.env.NODE_ENV === 'development') {
          console.log('Fetching dashboard stats...');
        }
        
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
        if (process.env.NODE_ENV === 'development') {
          console.log('Total assets result:', totalAssetsResult);
          console.log('Active clients result:', activeClientsResult);
          console.log('Assets with issues result:', assetsWithIssuesResult);
          console.log('Recent assets result:', recentAssetsResult);
          console.log('Recent events result:', recentEventsResult);
          console.log('Status summary result:', statusSummaryResult);
          console.log('Detailed breakdown result:', detailedBreakdownResult);
        }

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
        
        if (process.env.NODE_ENV === 'development') {
          console.log('Solutions result:', solutionsResult);
          console.log('Status result:', statusResult);
        }
        
        if (solutionsResult.error) throw new Error(`Solutions query error: ${solutionsResult.error.message}`);
        if (statusResult.error) throw new Error(`Status query error: ${statusResult.error.message}`);
        
        const solutions = solutionsResult.data || [];
        const statuses = statusResult.data || [];
        
        // Process recent assets data - CORRIGIDO tratamento de dados
        const processedRecentAssets = recentAssetsResult.data?.map(asset => {
          const solution = solutions.find(s => s.id === asset.solution_id);
          const status = statuses.find(s => s.id === asset.status_id);
          
          // Melhor identificação do asset
          const assetName = asset.radio || 
                           (asset.line_number ? asset.line_number.toString() : '') || 
                           asset.serial_number || 
                           asset.iccid || 
                           'N/A';
          
          return {
            id: asset.uuid,
            name: assetName,
            type: solution?.solution || 'Unknown',
            status: status?.status || 'Unknown',
            solution: solution?.solution || 'Unknown'
          };
        }) || [];

        // Process recent events data - CORRIGIDO tratamento com type safety
        const processedRecentEvents = recentEventsResult.data?.map((event, index) => {
          // Safe type casting for details object
          const details = event.details && typeof event.details === 'object' && event.details !== null 
            ? event.details as Record<string, any> 
            : {};
          
          const description = details.event_description || event.event || 'Evento sem descrição';
          const asset_id = details.asset_id;
          const asset_name = details.line_number || details.radio || 'N/A';

          return {
            id: event.id || index,
            type: event.event || 'UNKNOWN',
            description,
            time: formatRelativeTime(event.date || new Date().toISOString()),
            asset_id,
            asset_name
          };
        }) || [];

        // Process status summary for pie chart - CORRIGIDO agregação
        const statusCounts: { [key: string]: number } = {};
        statusSummaryResult.data?.forEach(item => {
          const statusName = item.asset_status?.status || 'Unknown';
          statusCounts[statusName] = (statusCounts[statusName] || 0) + 1;
        });

        const pieChartData = Object.entries(statusCounts).map(([status, total]) => ({
          status,
          total
        }));

        // Process detailed breakdown - CORRIGIDO agregação
        const detailedCounts: { [key: string]: number } = {};
        detailedBreakdownResult.data?.forEach(item => {
          const type = item.asset_solutions?.solution || 'Unknown';
          const status = item.asset_status?.status || 'Unknown';
          const key = `${type}-${status}`;
          detailedCounts[key] = (detailedCounts[key] || 0) + 1;
        });

        const detailedStatusData = Object.entries(detailedCounts).map(([key, total]) => {
          const [type, status] = key.split('-');
          return { type, status, total };
        });

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
        console.error('💥 Error fetching dashboard stats:', error);
        throw error;
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 5 * 60 * 1000, // 5 minutos
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
