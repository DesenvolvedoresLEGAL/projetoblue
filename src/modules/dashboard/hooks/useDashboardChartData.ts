
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { PieChartDataPoint, StatusSummaryItem } from '../types/dashboard';

// Hook específico para dados de gráficos
export function useDashboardChartData() {
  return useQuery({
    queryKey: ['dashboard', 'chart-data'],
    queryFn: async () => {
      // Single optimized query with aggregation
      const { data: statusData, error } = await supabase
        .rpc('status_by_asset_type');

      if (error) {
        throw new Error(`Chart data query error: ${error.message}`);
      }

      // Process data for pie chart
      const statusCounts: { [key: string]: number } = {};
      const statusSummary: StatusSummaryItem[] = [];

      if (statusData) {
        statusData.forEach((item: any) => {
          const statusName = item.status || 'Unknown';
          statusCounts[statusName] = (statusCounts[statusName] || 0) + (item.count || 0);
        });

        // Create status summary for enhanced components
        Object.entries(statusCounts).forEach(([status, count]) => {
          statusSummary.push({
            status,
            count,
            statusId: 0 // Will be populated if needed
          });
        });
      }

      const pieChartData: PieChartDataPoint[] = Object.entries(statusCounts).map(([status, total]) => ({
        status,
        total
      }));

      return {
        pieChartData,
        statusSummary,
        rawStatusData: statusData || []
      };
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - chart data changes less frequently
    gcTime: 15 * 60 * 1000, // 15 minutes
    retry: 2,
  });
}
