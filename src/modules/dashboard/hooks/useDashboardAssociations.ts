
import { useQuery } from '@tanstack/react-query';
import * as dashboardQueries from '@modules/dashboard/services/dashboardQueries';

export interface DashboardAssociationsData {
  activeAssociations: {
    total: number;
    byType: { aluguel: number; assinatura: number; outros: number };
    byAssetType: { chips: number; speedys: number; equipment: number };
  };
  endingToday: number;
  topClients: { name: string; count: number }[];
  last30DaysHistory: {
    created: number;
    ended: number;
    active: number;
  }[];
}

interface ActiveAssociationRow {
  association_id: number
  assets: { solution_id: number } | null
  clients: { nome?: string; empresa?: string } | null
}

export function useDashboardAssociations() {
  return useQuery<DashboardAssociationsData, Error>({
    queryKey: ['dashboard', 'associations'],
    queryFn: async () => {
      try {
        if (process.env.NODE_ENV === 'development') {
          
        }
        
        const [
          activeAssociationsResult,
          endingTodayResult,
          topClientsResult,
          last30DaysResult
        ] = await Promise.all([
          dashboardQueries.fetchActiveAssociations(),
          dashboardQueries.fetchAssociationsEndingToday(),
          dashboardQueries.fetchTopClientsWithAssociations(),
          dashboardQueries.fetchAssociationsLast30Days()
        ]);

        if (activeAssociationsResult.error) throw activeAssociationsResult.error;
        if (endingTodayResult.error) throw endingTodayResult.error;
        if (topClientsResult.error) throw topClientsResult.error;
        if (last30DaysResult.error) throw last30DaysResult.error;

        // Process active associations
        const activeAssociations: ActiveAssociationRow[] = activeAssociationsResult.data || [];
        const byType = {
          aluguel: activeAssociations.filter(a => a.association_id === 1).length,
          assinatura: activeAssociations.filter(a => a.association_id === 2).length,
          outros: activeAssociations.filter(a => a.association_id !== 1 && a.association_id !== 2).length
        };

        const byAssetType = {
          chips: activeAssociations.filter(a => a.assets?.solution_id === 11).length,
          speedys: activeAssociations.filter(a => a.assets?.solution_id === 1).length,
          equipment: activeAssociations.filter(a => {
            const solution = a.assets?.solution_id;
            return solution !== 11 && solution !== 1;
          }).length
        };

        // Process top clients
        const clientCounts = new Map<string, number>();
        (topClientsResult.data || []).forEach(item => {
          const clientName = (item.clients as { nome?: string } | null)?.nome || 'Cliente Desconhecido';
          clientCounts.set(clientName, (clientCounts.get(clientName) || 0) + 1);
        });

        const topClients = Array.from(clientCounts.entries())
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 3);

        // Process history (simplified for now)
        const last30DaysHistory = [{
          created: (last30DaysResult.data || []).length,
          ended: (last30DaysResult.data || []).filter(a => a.exit_date).length,
          active: (last30DaysResult.data || []).filter(a => !a.exit_date).length
        }];

        return {
          activeAssociations: {
            total: activeAssociations.length,
            byType,
            byAssetType
          },
          endingToday: (endingTodayResult.data || []).length,
          topClients,
          last30DaysHistory
        };
      } catch (error) {
        
        throw error;
      }
    },
    staleTime: 60000, // 1 minute
    retry: 1,
    refetchOnWindowFocus: false
  });
}
