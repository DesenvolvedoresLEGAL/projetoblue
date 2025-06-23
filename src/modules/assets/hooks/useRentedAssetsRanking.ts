
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/utils/toast';

export interface RankedAsset {
  uuid: string;
  model?: string;
  serial_number?: string;
  line_number?: number;
  radio?: string;
  rented_days: number;
  solution_id: number;
  status_id: number;
  created_at: string;
  solucao: {
    id: number;
    name: string;
  };
  status: {
    id: number;
    name: string;
  };
  manufacturer: {
    id: number;
    name: string;
  };
  ranking_position?: number;
}

export const useRentedAssetsRanking = () => {
  return useQuery({
    queryKey: ['assets', 'ranking', 'rented-days'],
    queryFn: async (): Promise<RankedAsset[]> => {
      try {
        console.log('Buscando ranking de ativos por dias locados...');
        
        const { data, error } = await supabase
          .from('assets')
          .select(`
            uuid,
            model,
            serial_number,
            line_number,
            radio,
            rented_days,
            solution_id,
            status_id,
            created_at,
            manufacturer:manufacturers(id, name),
            status:asset_status(id, status),
            solucao:asset_solutions(id, solution)
          `)
          .not('solution_id', 'eq', '11') // retirando chips da lista
          .is('deleted_at', null)
          .order('rented_days', { ascending: false })
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Erro na query de ranking:', error);
          toast.error(`Erro ao carregar ranking: ${error.message}`);
          throw error;
        }

        console.log(`Ranking carregado com ${data?.length || 0} ativos`);

        const mappedAssets = (data || []).map((asset, index) => ({
          ...asset,
          solucao: {
            id: asset.solucao?.id || 0,
            name: asset.solucao?.solution || 'Desconhecido'
          },
          status: {
            id: asset.status?.id || 0,
            name: asset.status?.status || 'Desconhecido'
          },
          manufacturer: {
            id: asset.manufacturer?.id || 0,
            name: asset.manufacturer?.name || 'Desconhecido'
          },
          ranking_position: index + 1
        }));

        return mappedAssets;
      } catch (err) {
        console.error('Erro detalhado ao buscar ranking:', err);
        
        if (err instanceof Error) {
          toast.error(`Erro ao buscar ranking: ${err.message}`);
        } else {
          toast.error('Erro desconhecido ao buscar ranking. Tente novamente.');
        }
        
        throw new Error('Falha ao buscar ranking de ativos.');
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutos de cache
    enabled: true,
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};
