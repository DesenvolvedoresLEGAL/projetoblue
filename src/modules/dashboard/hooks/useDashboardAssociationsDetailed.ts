
import { useQuery } from '@tanstack/react-query';
import * as dashboardQueries from '@modules/dashboard/services/dashboardQueries';

export interface AssociationsDetailedData {
  rental: {
    totalActive: number;
    recentAssets: { name: string; type: string; clientName: string }[];
    distributionByType: { chips: number; speedys: number; equipment: number };
  };
  subscription: {
    totalActive: number;
    recentAssets: { name: string; type: string; clientName: string }[];
    distributionByType: { chips: number; speedys: number; equipment: number };
  };
}

export function useDashboardAssociationsDetailed() {
  return useQuery<AssociationsDetailedData, Error>({
    queryKey: ['dashboard', 'associations-detailed'],
    queryFn: async () => {
      try {
        console.log('Fetching detailed associations data...');
        
        const activeAssociationsResult = await dashboardQueries.fetchActiveAssociations();
        
        if (activeAssociationsResult.error) {
          throw activeAssociationsResult.error;
        }

        const associations = activeAssociationsResult.data || [];
        
        // Separar por tipo de associação
        const rentalAssociations = associations.filter(a => a.association_id === 1);
        const subscriptionAssociations = associations.filter(a => a.association_id === 2);
        
        // Função para processar dados de um tipo de associação
        const processAssociations = (assocs: any[]) => {
          const distributionByType = {
            chips: assocs.filter(a => (a.assets as any)?.solution_id === 11).length,
            speedys: assocs.filter(a => (a.assets as any)?.solution_id === 1).length,
            equipment: assocs.filter(a => {
              const solutionId = (a.assets as any)?.solution_id;
              return solutionId !== 11 && solutionId !== 1;
            }).length
          };
          
          const recentAssets = assocs
            .slice(0, 5)
            .map(a => {
              const asset = a.assets as any;
              const client = a.clients as any;
              const solutionId = asset?.solution_id;
              
              let type = 'EQUIPAMENTO';
              if (solutionId === 11) type = 'CHIP';
              else if (solutionId === 1) type = 'SPEEDY 5G';
              
              return {
                name: asset?.radio || asset?.line_number?.toString() || 'Asset',
                type,
                clientName: client?.nome || 'Cliente'
              };
            });
          
          return {
            totalActive: assocs.length,
            recentAssets,
            distributionByType
          };
        };
        
        return {
          rental: processAssociations(rentalAssociations),
          subscription: processAssociations(subscriptionAssociations)
        };
      } catch (error) {
        console.error('Error fetching detailed associations:', error);
        throw error;
      }
    },
    staleTime: 60000,
    retry: 1,
    refetchOnWindowFocus: false
  });
}
