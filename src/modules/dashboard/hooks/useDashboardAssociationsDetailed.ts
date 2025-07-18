
import { useQuery } from '@tanstack/react-query';
import * as dashboardQueries from '@modules/dashboard/services/dashboardQueries';
import { formatPhoneNumber } from '@/utils/formatters';

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
    queryKey: ['dashboard', 'associations-detailed-optimized'],
    queryFn: async () => {
      try {
        if (process.env.NODE_ENV === 'development') {
          if (import.meta.env.DEV) console.log('Fetching detailed associations data (optimized - single query)...');
        }
        
        const activeAssociationsResult = await dashboardQueries.fetchActiveAssociations();
        
        if (activeAssociationsResult.error) {
          throw activeAssociationsResult.error;
        }

        const associations = activeAssociationsResult.data || []
        
        // Separar por tipo de associação (1 = Locação, 2 = Assinatura)
        const rentalAssociations = associations.filter(a => a.association_type_id === 1);
        const subscriptionAssociations = associations.filter(a => a.association_type_id === 2);
        
        // Função otimizada para processar dados - SEM lookups adicionais
        const processAssociationsResponse = (assocs: dashboardQueries.AssociationsResponse[]) => {
          // Distribuição por tipo baseada no solution_id já disponível
          const distributionByType = {
            chips: assocs.filter(a => a.chip).length,
            speedys: assocs.filter(a => a.equipment && a.chip).length,
            equipment: assocs.filter(a => a.equipment && !a.chip).length
          };
          
          // Ativos recentes com dados já disponíveis - SEM lookups
          const recentAssets = assocs.slice(0, 5).map(a => ({
            name: a.equipment && a.chip ? `${a.equipment.radio} - ${formatPhoneNumber(a.chip?.line_number.toString()) } (${a.chip.manufacturer?.name})` : (a.equipment ? a.equipment?.radio : `${formatPhoneNumber(a.chip?.line_number.toString()) } (${a.chip.manufacturer?.name})`)  || 'Desconhecido',
            type: a.equipment && a.chip ? 'Speedy' : (a.equipment ? 'Equipamento' : 'CHIP'),
            clientName: a.clients.empresa || a.clients.responsavel || 'Desconhecido'
          }));
          
          return {
            totalActive: assocs.length,
            recentAssets,
            distributionByType
          };
        };
        
        if (process.env.NODE_ENV === 'development') {
          if (import.meta.env.DEV) console.log(`Processando ${associations.length} associações ativas sem queries adicionais`);
          if (import.meta.env.DEV) console.log(`Locações: ${rentalAssociations.length}, Assinaturas: ${subscriptionAssociations.length}`);
        }
        
        return {
          rental: processAssociationsResponse(rentalAssociations),
          subscription: processAssociationsResponse(subscriptionAssociations)
        };
      } catch (error) {
        if (import.meta.env.DEV) console.error('Error fetching detailed associations (optimized):', error);
        throw error;
      }
    },
    staleTime: 60000, // Cache por 1 minuto
    retry: 1,
    refetchOnWindowFocus: false
  });
}
