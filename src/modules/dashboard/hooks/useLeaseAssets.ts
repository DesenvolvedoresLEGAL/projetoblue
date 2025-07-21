
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface LeaseAssetsData {
  chips: number;
  speedys: number;
  equipments: number;
  total: number;
}

export const useLeaseAssets = () => {
  return useQuery<LeaseAssetsData, Error>({
    queryKey: ['dashboard', 'lease-assets'],
    queryFn: async () => {
      try {
        if (process.env.NODE_ENV === 'development') {
          
        }
        
        const today = new Date().toISOString().split('T')[0];
        
        // Query para buscar ativos atualmente em locação (association_type_id = 1)
        const { data: leaseAssociations, error } = await supabase
          .from('associations')
          .select(`
            uuid,
            equipment_id,
            chip_id,
            status,
            exit_date,
            equipment:assets!equipment_id_fkey(
              uuid,
              solution_id,
              asset_solutions!inner(solution)
            ),
            chip:assets!chip_id_fkey(
              uuid,
              solution_id,
              asset_solutions!inner(solution)
            )
          `)
          .eq('association_type_id', 1) // Locação
          .eq('status', true) // Associações ativas
          .is('deleted_at', null)
          .or(`exit_date.is.null,exit_date.gte.${today}`);

        if (error) {
          
          throw new Error(`Failed to fetch lease assets: ${error.message}`);
        }

        if (process.env.NODE_ENV === 'development') {
          
        }

        // Contar por tipo de solução
        const counts = {
          chips: 0,
          speedys: 0,
          equipments: 0,
          total: 0
        };

        leaseAssociations?.forEach((assoc) => {
          // Contar equipamentos (equipment_id preenchido)
          if (assoc.equipment_id && assoc.equipment) {
            const solutionName = assoc.equipment.asset_solutions?.solution?.toUpperCase();
            
            if (solutionName === 'SPEEDY 5G') {
              counts.speedys++;
            } else {
              counts.equipments++;
            }
            counts.total++;
          }
          
          // Contar chips (chip_id preenchido)
          if (assoc.chip_id && assoc.chip) {
            const solutionName = assoc.chip.asset_solutions?.solution?.toUpperCase();
            
            if (solutionName === 'CHIP') {
              counts.chips++;
            }
            counts.total++;
          }
        });

        if (process.env.NODE_ENV === 'development') {
          
        }
        return counts;
        
      } catch (error) {
        
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};
