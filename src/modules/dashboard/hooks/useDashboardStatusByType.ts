
import { useQuery } from '@tanstack/react-query';
import * as dashboardQueries from '@modules/dashboard/services/dashboardQueries';

export interface StatusByTypeData {
  chips: {
    status: string;
    value: number;
    color: string;
  }[];
  speedys: {
    status: string;
    value: number;
    color: string;
  }[];
  equipment: {
    status: string;
    value: number;
    color: string;
  }[];
}

export function useDashboardStatusByType() {
  return useQuery<StatusByTypeData, Error>({
    queryKey: ['dashboard', 'status-by-type'],
    queryFn: async () => {
      try {
        if (process.env.NODE_ENV === 'development') {
          if (import.meta.env.DEV) console.log('Fetching status by type data...');
        }
        
        // Use the detailed breakdown query that includes both asset_solutions and asset_status
        const detailedBreakdownResult = await dashboardQueries.fetchDetailedStatusBreakdown();
        
        if (detailedBreakdownResult.error) {
          throw detailedBreakdownResult.error;
        }

        const assets = detailedBreakdownResult.data || [];
        
        // Define cores para cada status
        const statusColors = {
          'DISPONÍVEL': '#4D2BFB',
          'ALUGADO': '#03F9FF', 
          'ASSINATURA': '#020CBC',
          'SEM DADOS': '#ef4444',
          'BLOQUEADO': '#f97316',
          'MANUTENÇÃO': '#8b5cf6',
          'ALOCADO': '#03F9FF'
        };

        // Processar dados por tipo de ativo
        const processTypeData = (solutionId: number) => {
          const typeAssets = assets.filter(asset => asset.solution_id === solutionId);
          const statusCounts = new Map<string, number>();
          
          typeAssets.forEach(asset => {
            const status = (asset.asset_status as { status?: string } | null)?.status?.toUpperCase() || 'DESCONHECIDO';
            statusCounts.set(status, (statusCounts.get(status) || 0) + 1);
          });
          
          return Array.from(statusCounts.entries()).map(([status, value]) => ({
            status,
            value,
            color: statusColors[status as keyof typeof statusColors] || '#6b7280'
          }));
        };

        return {
          chips: processTypeData(11), // CHIPs têm solution_id = 11
          speedys: processTypeData(1), // Speedys têm solution_id = 1
          equipment: assets
            .filter(asset => {
              const solutionId = asset.solution_id;
              return solutionId !== 11 && solutionId !== 1;
            })
            .reduce((acc, asset) => {
              const status = (asset.asset_status as { status?: string } | null)?.status?.toUpperCase() || 'DESCONHECIDO';
              const existing = acc.find(item => item.status === status);
              if (existing) {
                existing.value++;
              } else {
                acc.push({
                  status,
                  value: 1,
                  color: statusColors[status as keyof typeof statusColors] || '#6b7280'
                });
              }
              return acc;
            }, [] as { status: string; value: number; color: string }[])
        };
      } catch (error) {
        if (import.meta.env.DEV) console.error('Error fetching status by type:', error);
        throw error;
      }
    },
    staleTime: 60000,
    retry: 1,
    refetchOnWindowFocus: false
  });
}
