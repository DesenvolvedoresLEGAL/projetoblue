
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Manufacturer {
  id: number;
  name: string;
}

export interface Solution {
  id: number;
  solution: string;
}

export interface Status {
  id: number;
  status: string;
}

export interface Plan {
  id: number;
  nome: string;
  tamanho_gb: number;
}

export interface AssetWithRelations {
  uuid: string;
  model: string;
  rented_days: number;
  serial_number: string;
  line_number: number;
  iccid: string;
  radio: string;
  admin_user: string;
  admin_pass: string;
  ssid_atual: string;
  pass_atual: string;
  created_at: string;
  updated_at: string;
  solution_id: number;
  status_id: number;
  manufacturer_id: number;
  plan_id: number;
  manufacturer: Manufacturer;
  plano: Plan;
  status: Status;
  solucao: Solution;
}

interface UseAssetsDataParams {
  searchTerm?: string;
  filterType?: string;
  filterStatus?: string;
  filterManufacturer?: string;
  currentPage?: number;
  pageSize?: number;
  enabled?: boolean;
  excludeSolutions?: number[];
}

export const useAssetsData = ({
  searchTerm = '',
  filterType = 'all',
  filterStatus = 'all',
  filterManufacturer = 'all',
  currentPage = 1,
  pageSize = 10,
  enabled = true,
  excludeSolutions = []
}: UseAssetsDataParams = {}) => {
  return useQuery({
    queryKey: ['assets-data', searchTerm, filterType, filterStatus, filterManufacturer, currentPage, pageSize, excludeSolutions],
    queryFn: async () => {
      console.log('🔍 Executando query de assets com parâmetros:', {
        searchTerm, filterType, filterStatus, filterManufacturer, currentPage, pageSize, excludeSolutions
      });

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
          admin_user,
          admin_pass,
          ssid_atual,
          pass_atual,
          created_at,
          updated_at,
          solution_id,
          status_id,
          manufacturer_id,
          plan_id,
          manufacturer:manufacturers(id, name),
          plano:plans(id, nome, tamanho_gb),
          status:asset_status(id, status),
          solucao:asset_solutions(id, solution)
        `)
        .is('deleted_at', null);

      if (searchTerm) {
        query = query.ilike('model', `%${searchTerm}%`);
      }

      if (filterType !== 'all') {
        // Subquery para filtrar pelo solution_id
        const solutionQuery = supabase
          .from('asset_solutions')
          .select('id')
          .ilike('solution', `%${filterType}%`);

        const { data: solutionData, error: solutionError } = await solutionQuery;

        if (solutionError) {
          console.error('Erro ao buscar solution_id:', solutionError);
          throw solutionError;
        }

        if (solutionData && solutionData.length > 0) {
          const solutionIds = solutionData.map(s => s.id);
          query = query.in('solution_id', solutionIds);
        } else {
          // Se não encontrar a solução, retorna um array vazio
          return {
            assets: [],
            totalCount: 0,
            totalPages: 0,
            currentPage: 1,
            pageSize: 10,
            hasNextPage: false,
            hasPreviousPage: false
          };
        }
      }

      if (filterStatus !== 'all') {
        // Subquery para filtrar pelo status_id
        const statusQuery = supabase
          .from('asset_status')
          .select('id')
          .ilike('status', `%${filterStatus}%`);

        const { data: statusData, error: statusError } = await statusQuery;

        if (statusError) {
          console.error('Erro ao buscar status_id:', statusError);
          throw statusError;
        }

        if (statusData && statusData.length > 0) {
          const statusIds = statusData.map(s => s.id);
          query = query.in('status_id', statusIds);
        } else {
          // Se não encontrar o status, retorna um array vazio
          return {
            assets: [],
            totalCount: 0,
            totalPages: 0,
            currentPage: 1,
            pageSize: 10,
            hasNextPage: false,
            hasPreviousPage: false
          };
        }
      }

      if (filterManufacturer !== 'all') {
        // Subquery para filtrar pelo manufacturer_id
        const manufacturerQuery = supabase
          .from('manufacturers')
          .select('id')
          .ilike('name', `%${filterManufacturer}%`);

        const { data: manufacturerData, error: manufacturerError } = await manufacturerQuery;

        if (manufacturerError) {
          console.error('Erro ao buscar manufacturer_id:', manufacturerError);
          throw manufacturerError;
        }

        if (manufacturerData && manufacturerData.length > 0) {
          const manufacturerIds = manufacturerData.map(m => m.id);
          query = query.in('manufacturer_id', manufacturerIds);
        } else {
          // Se não encontrar o fabricante, retorna um array vazio
          return {
            assets: [],
            totalCount: 0,
            totalPages: 0,
            currentPage: 1,
            pageSize: 10,
            hasNextPage: false,
            hasPreviousPage: false
          };
        }
      }
      
      if (excludeSolutions && excludeSolutions.length > 0) {
        query = query.not('solution_id', 'in', `(${excludeSolutions.join(',')})`);
      }

      query = query.range((currentPage - 1) * pageSize, currentPage * pageSize - 1);

      query = query.order('created_at', { ascending: false });

      const { data: assets, error, count } = await query;

      if (error) {
        console.error('❌ Erro ao buscar assets:', error);
        throw error;
      }

      console.log('📊 Assets retornados:', assets?.length || 0);

      const mappedAssets = (assets || []).map((dbAsset: any) => ({
        ...dbAsset,
        rented_days: dbAsset.rented_days || 0, // Garantir que rented_days existe
        admin_user: dbAsset.admin_user || 'admin',
        admin_pass: dbAsset.admin_pass || '',
        ssid_atual: dbAsset.ssid_atual || '',
        pass_atual: dbAsset.pass_atual || '',
        solucao: {
          id: dbAsset.solucao?.id || 0,
          name: dbAsset.solucao?.solution || 'Desconhecido'
        },
        status: {
          id: dbAsset.status?.id || 0,
          name: dbAsset.status?.status || 'Desconhecido'
        },
        manufacturer: {
          id: dbAsset.manufacturer?.id || 0,
          name: dbAsset.manufacturer?.name || 'Desconhecido'
        },
        plan: {
          id: dbAsset.plano?.id || 0,
          name: dbAsset.plano?.nome || 'Desconhecido',
          size_gb: dbAsset.plano?.tamanho_gb || 0
        }
      }));

      const totalPages = Math.ceil((count || 0) / pageSize);

      return {
        assets: mappedAssets,
        totalCount: count || 0,
        totalPages,
        currentPage,
        pageSize,
        hasNextPage: currentPage < totalPages,
        hasPreviousPage: currentPage > 1
      };
    },
    enabled,
    staleTime: 30000,
    gcTime: 300000,
  });
};
