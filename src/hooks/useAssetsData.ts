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
  manufacturer: { id?: number; name: string };
  plano: { id?: number; nome: string }; // Note: usando 'nome' em vez de 'name'
  status: { id?: number; name: string };
  solucao: { id: number; name: string };
  admin_user?: string;
  admin_pass?: string;
};

export interface UseAssetsDataParams {
  searchTerm?: string;
  filterType?: string;
  filterStatus?: string;
  currentPage?: number;
  pageSize?: number;
  enabled?: boolean;
}

export interface AssetsDataResponse {
  assets: AssetWithRelations[];
  totalCount: number;
  totalPages: number;
}

export const useAssetsData = ({
  searchTerm = '',
  filterType = 'all',
  filterStatus = 'all',
  currentPage = 1,
  pageSize = 10,
  enabled = true
}: UseAssetsDataParams = {}) => {
  return useQuery({
    queryKey: ['assets', 'inventory', filterType, filterStatus, searchTerm, currentPage],
    queryFn: async (): Promise<AssetsDataResponse> => {
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
            admin_user,
            admin_pass,
            manufacturer:manufacturers(id, name),
            plano:plans(id, nome),
            status:asset_status(id, status),
            solucao:asset_solutions(id, solution)
          `)
          .is('deleted_at', null)
          .order('created_at', { ascending: false });

        // Apply filters
        if (filterType !== 'all') {
          // Check if filterType is a number (solution_id) or string (solution name)
          if (!isNaN(Number(filterType))) {
            // Filter by solution_id
            query = query.eq('solution_id', Number(filterType));
          } else {
            // Filter by solution name - need to join with asset_solutions
            const { data: solutionData } = await supabase
              .from('asset_solutions')
              .select('id')
              .eq('solution', filterType)
              .single();
            
            if (solutionData) {
              query = query.eq('solution_id', solutionData.id);
            }
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
            id: asset.status?.id,
            name: asset.status?.status || 'Desconhecido'
          },
          manufacturer: {
            id: asset.manufacturer?.id,
            name: asset.manufacturer?.name || 'Desconhecido'
          },
          plano: {
            id: asset.plano?.id,
            nome: asset.plano?.nome || 'Desconhecido' // Note: using 'nome' instead of 'name'
          },
          admin_user: asset.admin_user,
          admin_pass: asset.admin_pass
        })) || [];

        // Get total count for pagination, excluding deleted items
        const { count: totalCount } = await supabase
          .from('assets')
          .select('uuid', { count: 'exact', head: true })
          .is('deleted_at', null);

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
    enabled: enabled, // Agora controlamos quando a query é executada
  });
};

export default useAssetsData;
