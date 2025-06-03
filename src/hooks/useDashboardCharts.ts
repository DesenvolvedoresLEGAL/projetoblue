
import { useQuery } from '@tanstack/react-query';
import * as dashboardQueries from '@/api/dashboardQueries';

export interface ChartData {
  statusDistribution: {
    status: string;
    value: number;
    color: string;
  }[];
  associationsHistory: {
    date: string;
    created: number;
    ended: number;
    active: number;
  }[];
}

export function useDashboardCharts() {
  return useQuery<ChartData, Error>({
    queryKey: ['dashboard', 'charts'],
    queryFn: async () => {
      try {
        console.log('Fetching dashboard charts data...');
        
        const [
          statusSummaryResult,
          associationsHistoryResult
        ] = await Promise.all([
          dashboardQueries.fetchStatusSummary(),
          dashboardQueries.fetchAssociationsLast30Days()
        ]);

        if (statusSummaryResult.error) throw statusSummaryResult.error;
        if (associationsHistoryResult.error) throw associationsHistoryResult.error;

        // Process status distribution
        const statusCounts = new Map<string, number>();
        const colors = {
          'DISPONÍVEL': '#4D2BFB',
          'ALUGADO': '#03F9FF', 
          'ASSINATURA': '#020CBC',
          'SEM DADOS': '#ef4444',
          'BLOQUEADO': '#f97316',
          'MANUTENÇÃO': '#8b5cf6'
        };

        (statusSummaryResult.data || []).forEach(asset => {
          const status = (asset.asset_status as any)?.status?.toUpperCase() || 'DESCONHECIDO';
          statusCounts.set(status, (statusCounts.get(status) || 0) + 1);
        });

        const statusDistribution = Array.from(statusCounts.entries()).map(([status, value]) => ({
          status,
          value,
          color: colors[status as keyof typeof colors] || '#6b7280'
        }));

        // Process associations history (simplified)
        const associationsHistory = [{
          date: 'Últimos 30 dias',
          created: (associationsHistoryResult.data || []).length,
          ended: (associationsHistoryResult.data || []).filter(a => a.exit_date).length,
          active: (associationsHistoryResult.data || []).filter(a => !a.exit_date).length
        }];

        return {
          statusDistribution,
          associationsHistory
        };
      } catch (error) {
        console.error('Error fetching dashboard charts:', error);
        throw error;
      }
    },
    staleTime: 60000,
    retry: 1,
    refetchOnWindowFocus: false
  });
}
