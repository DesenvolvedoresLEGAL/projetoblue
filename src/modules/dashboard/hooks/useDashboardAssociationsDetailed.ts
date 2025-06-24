
import { useQuery } from '@tanstack/react-query';
import * as dashboardQueries from '@modules/dashboard/services/dashboardQueries';

// Tipo otimizado para associação com dados completos do ativo
interface OptimizedAssociationData {
  id: number;
  asset_id: string;
  client_id: string;
  association_id: number;
  entry_date: string;
  exit_date: string | null;
  clients: {
    empresa: string;
  };
  association_types: {
    type: string;
  };
  assets: {
    uuid: string;
    serial_number: string | null;
    radio: string | null;
    line_number: number | null;
    rented_days: number;
    status_id: number | null;
    solution_id: number | null;
    asset_solutions: {
      solution: string;
    };
    asset_status: {
      status: string;
    };
  };
}

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
        console.log('Fetching detailed associations data (optimized - single query)...');
        
        const activeAssociationsResult = await dashboardQueries.fetchActiveAssociations();
        
        if (activeAssociationsResult.error) {
          throw activeAssociationsResult.error;
        }

        const associations = activeAssociationsResult.data as OptimizedAssociationData[] || [];
        
        // Separar por tipo de associação (1 = Locação, 2 = Assinatura)
        const rentalAssociations = associations.filter(a => a.association_id === 1);
        const subscriptionAssociations = associations.filter(a => a.association_id === 2);
        
        // Função otimizada para processar dados - SEM lookups adicionais
        const processAssociationsOptimized = (assocs: OptimizedAssociationData[]) => {
          // Distribuição por tipo baseada no solution_id já disponível
          const distributionByType = {
            chips: assocs.filter(a => a.assets.solution_id === 11).length,
            speedys: assocs.filter(a => a.assets.solution_id === 1).length,
            equipment: assocs.filter(a => {
              const solutionId = a.assets.solution_id;
              return solutionId !== 11 && solutionId !== 1;
            }).length
          };
          
          // Ativos recentes com dados já disponíveis - SEM lookups
          const recentAssets = assocs
            .slice(0, 5)
            .map(a => {
              const asset = a.assets;
              const client = a.clients;
              const solutionId = asset.solution_id;
              
              // Determinar tipo baseado no solution_id
              let type = 'EQUIPAMENTO';
              if (solutionId === 11) type = 'CHIP';
              else if (solutionId === 1) type = 'SPEEDY 5G';
              
              // Usar identificador mais apropriado baseado no tipo
              let assetName = 'Asset';
              if (type === 'CHIP') {
                assetName = asset.line_number?.toString() || asset.radio || asset.serial_number || asset.uuid.substring(0, 8);
              } else {
                assetName = asset.radio || asset.serial_number || asset.uuid.substring(0, 8);
              }
              
              return {
                name: assetName,
                type,
                clientName: client.empresa || 'Cliente'
              };
            });
          
          return {
            totalActive: assocs.length,
            recentAssets,
            distributionByType
          };
        };
        
        console.log(`Processando ${associations.length} associações ativas sem queries adicionais`);
        console.log(`Locações: ${rentalAssociations.length}, Assinaturas: ${subscriptionAssociations.length}`);
        
        return {
          rental: processAssociationsOptimized(rentalAssociations),
          subscription: processAssociationsOptimized(subscriptionAssociations)
        };
      } catch (error) {
        console.error('Error fetching detailed associations (optimized):', error);
        throw error;
      }
    },
    staleTime: 60000, // Cache por 1 minuto
    retry: 1,
    refetchOnWindowFocus: false
  });
}
