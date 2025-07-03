
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface SubscriptionAssetsData {
  chips: number;
  speedys: number;
  equipments: number;
  total: number;
}

export const useSubscriptionAssets = () => {
  return useQuery<SubscriptionAssetsData, Error>({
    queryKey: ['dashboard', 'subscription-assets'],
    queryFn: async () => {
      try {
        if (process.env.NODE_ENV === 'development') {
          if (import.meta.env.DEV) console.log('🔍 Fetching subscription assets data...');
        }
        
        // Query para buscar ativos atualmente em assinatura (association_id = 2)
        // Usando asset_client_assoc para identificar ativos associados
        const { data: subscriptionAssociations, error } = await supabase
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
          .eq('association_id', 2) // Assinatura
          .or('exit_date.is.null,exit_date.gt.' + new Date().toISOString().split('T')[0])
          .is('deleted_at', null);

        if (error) {
          if (import.meta.env.DEV) console.error('❌ Error fetching subscription assets:', error);
          throw new Error(`Failed to fetch subscription assets: ${error.message}`);
        }

        if (process.env.NODE_ENV === 'development') {
          if (import.meta.env.DEV) console.log('📊 Raw subscription associations data:', subscriptionAssociations);
        }

        // Contar por tipo de solução
        const counts = {
          chips: 0,
          speedys: 0,
          equipments: 0,
          total: 0
        };

        subscriptionAssociations?.forEach((assoc) => {
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
          if (import.meta.env.DEV) console.log('📈 Subscription assets summary:', counts);
        }
        return counts;
        
      } catch (error) {
        if (import.meta.env.DEV) console.error('💥 Error in useSubscriptionAssets:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};
