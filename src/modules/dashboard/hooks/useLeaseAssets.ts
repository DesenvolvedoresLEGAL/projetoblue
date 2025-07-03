
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
          if (import.meta.env.DEV) console.log('🔍 Fetching lease assets data...');
        }
        
        // Query para buscar ativos atualmente em locação (association_id = 1)
        // Usando asset_client_assoc para identificar ativos associados
        const { data: leaseAssociations, error } = await supabase
          .from('asset_client_assoc')
          .select(`
            asset_id,
            association_id,
            exit_date,
            assets!inner(
              solution_id,
              asset_solutions!inner(solution)
            )
          `)
          .eq('association_id', 1) // Locação
          .or('exit_date.is.null,exit_date.gt.' + new Date().toISOString().split('T')[0])
          .is('deleted_at', null);

        if (error) {
          if (import.meta.env.DEV) console.error('❌ Error fetching lease assets:', error);
          throw new Error(`Failed to fetch lease assets: ${error.message}`);
        }

        if (process.env.NODE_ENV === 'development') {
          if (import.meta.env.DEV) console.log('📊 Raw lease associations data:', leaseAssociations);
        }

        // Contar por tipo de solução
        const counts = {
          chips: 0,
          speedys: 0,
          equipments: 0,
          total: 0
        };

        leaseAssociations?.forEach((assoc) => {
          const solutionName = assoc.assets?.asset_solutions?.solution?.toUpperCase();
          
          if (solutionName === 'CHIP') {
            counts.chips++;
          } else if (solutionName === 'SPEEDY 5G') {
            counts.speedys++;
          } else {
            counts.equipments++;
          }
          counts.total++;
        });

        if (process.env.NODE_ENV === 'development') {
          if (import.meta.env.DEV) console.log('📈 Lease assets summary:', counts);
        }
        return counts;
        
      } catch (error) {
        if (import.meta.env.DEV) console.error('💥 Error in useLeaseAssets:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};
