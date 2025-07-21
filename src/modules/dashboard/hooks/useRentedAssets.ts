
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface RentedAsset {
  uuid: string;
  rented_days: number;
  model?: string;
  radio?: string;
  line_number?: number;
  serial_number?: string;
  solution: {
    id: number;
    solution: string;
  };
  status: {
    status: string;
  };
}

export const useRentedAssets = () => {
  return useQuery({
    queryKey: ['rented-assets'],
    queryFn: async () => {
      if (process.env.NODE_ENV === 'development') {
        
      }
      
      const { data, error } = await supabase
        .from('assets')
        .select(`
          uuid,
          rented_days,
          model,
          radio,
          line_number,
          serial_number,
          solution:asset_solutions!inner(id, solution),
          status:asset_status!inner(status)
        `)
        .gt('rented_days', 0)
        .is('deleted_at', null)
        .order('rented_days', { ascending: false });

      if (error) {
        
        throw error;
      }

      if (process.env.NODE_ENV === 'development') {
        
      }
      return data as RentedAsset[] || [];
    },
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};
