
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/utils/toast';

export type AssetWithRelations = {
  uuid: string;
  model?: string;
  rented_days?: number;
  serial_number?: string;
  line_number?: number;
  iccid?: string;
  radio?: string;
  created_at: string;
  updated_at: string;
  manufacturer: { name: string };
  plano: { name: string };
  status: { name: string };
  solucao: { id: number; name: string };
};

export interface UseAssetsDataParams {
  searchTerm?: string;
  filterType?: string;
  filterStatus?: string;
  currentPage?: number;
  pageSize?: number;
}

export const useAssetsData = ({
  searchTerm = '',
  filterType = 'all',
  filterStatus = 'all',
  currentPage = 1,
  pageSize = 10
}: UseAssetsDataParams = {}) => {
  return useQuery({
    queryKey: ['assets', 'inventory', filterType, filterStatus, searchTerm, currentPage],
    queryFn: async () => {
      try {
        let query = supabase
          .from('assets')
          .select(`
            uuid,
            model,
            rented_days,
            serial_number,
            line_number,
            iccid,
            radio,
            created_at,
            updated_at,
            manufacturer:manufacturers(id, name),
            plano:plans(id, name),
            status:asset_status(id, status),
            solucao:asset_solutions(id, solution)
          `)
          .order('created_at', { ascending: false });

        // Apply filters
        if (filterType !== 'all') {
          if (filterType === 'chip') {
            // For chips (solution_id = 11)
            query = query.eq('solution_id', 11);
          } else {
            // For other types (solution_id != 11)
            query = query.neq('solution_id', 11);
          }
        }

        if (filterStatus !== 'all') {
          // Join with asset_status to filter by status name
          const { data: statusData } = await supabase
            .from('asset_status')
            .select('id')
            .ilike('status', filterStatus)
            .single();

          if (statusData) {
            query = query.eq('status_id', statusData.id);
          }
        }

        if (searchTerm) {
          // Search in multiple fields
          query = query.or(
            `iccid.ilike.%${searchTerm}%,radio.ilike.%${searchTerm}%,serial_number.ilike.%${searchTerm}%,model.ilike.%${searchTerm}%`
          );
        }

        // Add pagination
        const startIndex = (currentPage - 1) * pageSize;
        query = query.range(startIndex, startIndex + pageSize - 1);

        const { data, error, count } = await query;

        if (error) {
          toast.error(`Erro ao carregar ativos: ${error.message}`);
          throw error;
        }

        // Map the response to provide consistent property names
        const mappedAssets = data?.map(asset => ({
          ...asset,
          solucao: {
            id: asset.solucao?.id || 0,
            name: asset.solucao?.solution || 'Desconhecido'
          },
          status: {
            name: asset.status?.status || 'Desconhecido'
          },
          manufacturer: {
            name: asset.manufacturer?.name || 'Desconhecido'
          },
          plano: {
            name: asset.plano?.name || 'Desconhecido'
          }
        })) || [];

        // Get total count for pagination
        const { count: totalCount } = await supabase
          .from('assets')
          .select('uuid', { count: 'exact', head: true });

        return {
          assets: mappedAssets,
          totalCount: totalCount || 0,
          totalPages: Math.ceil((totalCount || 0) / pageSize)
        };
      } catch (err) {
        console.error('Erro ao buscar ativos:', err);
        throw new Error('Falha ao buscar ativos. Por favor, tente novamente.');
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};

export default useAssetsData;
