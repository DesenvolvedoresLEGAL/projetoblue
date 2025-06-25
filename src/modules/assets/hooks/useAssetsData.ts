
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Asset, ChipAsset, EquipamentAsset } from '@/types/asset';
import { mapDatabaseAssetToFrontend } from '@/utils/databaseMappers';

interface UseAssetsDataOptions {
  searchTerm?: string;
  statusFilter?: string;
  typeFilter?: string;
  manufacturerFilter?: string;
  solutionFilter?: string;
  page?: number;
  pageSize?: number;
}

interface AssetsDataResponse {
  assets: Asset[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

export const useAssetsData = (options: UseAssetsDataOptions = {}) => {
  const {
    searchTerm = '',
    statusFilter = 'all',
    typeFilter = 'all',
    manufacturerFilter = 'all',
    solutionFilter = 'all',
    page = 1,
    pageSize = 50
  } = options;

  return useQuery({
    queryKey: ['assets-data', {
      searchTerm,
      statusFilter,
      typeFilter,
      manufacturerFilter,
      solutionFilter,
      page,
      pageSize
    }],
    queryFn: async (): Promise<AssetsDataResponse> => {
      console.log('[useAssetsData] Fetching assets with filters:', options);

      let query = supabase
        .from('assets')
        .select(`
          *,
          asset_status:status_id(id, status),
          asset_solutions:solution_id(id, solution),
          manufacturers:manufacturer_id(id, name)
        `, { count: 'exact' })
        .is('deleted_at', null);

      // Apply filters
      if (searchTerm) {
        const isNumeric = /^\d+$/.test(searchTerm);
        
        if (isNumeric) {
          // Search by line_number for CHIP assets
          query = query.or(`line_number.eq.${parseInt(searchTerm)}`);
        } else {
          // Search by text fields
          query = query.or([
            `iccid.ilike.%${searchTerm}%`,
            `serial_number.ilike.%${searchTerm}%`,
            `model.ilike.%${searchTerm}%`,
            `radio.ilike.%${searchTerm}%`
          ].join(','));
        }
      }

      if (statusFilter !== 'all') {
        const statusId = getStatusIdByName(statusFilter);
        if (statusId) {
          query = query.eq('status_id', statusId);
        }
      }

      if (manufacturerFilter !== 'all') {
        query = query.eq('manufacturer_id', parseInt(manufacturerFilter));
      }

      if (solutionFilter !== 'all') {
        query = query.eq('solution_id', getSolutionIdByName(solutionFilter));
      }

      // Apply pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      // Order by creation date
      query = query.order('created_at', { ascending: false });

      const { data, error, count } = await query;

      if (error) {
        console.error('[useAssetsData] Error fetching assets:', error);
        throw error;
      }

      console.log('[useAssetsData] Raw data received:', {
        count: data?.length || 0,
        totalCount: count || 0
      });

      const mappedAssets = data?.map(asset => {
        try {
          const statusData = asset.asset_status as { id?: number; status?: string } | null;
          const solutionData = asset.asset_solutions as { id?: number; solution?: string } | null;
          const manufacturerData = asset.manufacturers as { id?: number; name?: string } | null;
          
          const processedAsset = {
            ...asset,
            asset_status: statusData,
            asset_solutions: solutionData,
            manufacturers: manufacturerData
          };
          
          return mapDatabaseAssetToFrontend(processedAsset);
        } catch (err) {
          console.error('[useAssetsData] Error processing asset:', asset.uuid, err);
          
          // Return fallback asset
          const fallbackAsset: Asset = {
            id: asset.uuid || 'unknown',
            uuid: asset.uuid || 'unknown',
            type: asset.solution_id === 11 ? 'CHIP' : 'ROTEADOR',
            status: 'DISPONÍVEL',
            statusId: asset.status_id || 1,
            registrationDate: asset.created_at || new Date().toISOString(),
            solucao: undefined,
            marca: '',
            modelo: asset.model || '',
            model: asset.model || '',
            serial_number: asset.serial_number || '',
            radio: asset.radio || '',
            solution_id: asset.solution_id,
            manufacturer_id: asset.manufacturer_id,
            plan_id: asset.plan_id,
            rented_days: asset.rented_days || 0,
            admin_user: asset.admin_user || '',
            admin_pass: asset.admin_pass || '',
            ssid_fabrica: asset.ssid_fabrica || '',
            pass_fabrica: asset.pass_fabrica || '',
            admin_user_fabrica: asset.admin_user_fabrica || '',
            admin_pass_fabrica: asset.admin_pass_fabrica || '',
            ssid_atual: asset.ssid_atual || '',
            pass_atual: asset.pass_atual || '',
            created_at: asset.created_at,
            updated_at: asset.updated_at,
            deleted_at: asset.deleted_at
          } as Asset;
          
          // Type-specific fields
          if (fallbackAsset.type === 'CHIP') {
            const chipAsset = fallbackAsset as ChipAsset;
            chipAsset.iccid = asset.iccid || '';
            chipAsset.phoneNumber = asset.line_number?.toString() || '';
            chipAsset.carrier = (asset.manufacturers as any)?.name || '';
            chipAsset.line_number = asset.line_number;
          } else {
            const routerAsset = fallbackAsset as EquipamentAsset;
            routerAsset.uniqueId = asset.uuid;
            routerAsset.brand = (asset.manufacturers as any)?.name || '';
            routerAsset.model = asset.model || '';
            routerAsset.ssid = asset.ssid_atual || '';
            routerAsset.password = asset.pass_atual || '';
            routerAsset.serialNumber = asset.serial_number || '';
            routerAsset.adminUser = asset.admin_user || '';
            routerAsset.adminPassword = asset.admin_pass || '';
          }
          
          return fallbackAsset;
        }
      }) || [];

      const totalPages = Math.ceil((count || 0) / pageSize);

      return {
        assets: mappedAssets,
        totalCount: count || 0,
        totalPages,
        currentPage: page
      };
    },
    retry: 2,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Helper functions
function getStatusIdByName(statusName: string): number | null {
  const statusMap: Record<string, number> = {
    'DISPONÍVEL': 1,
    'EM LOCAÇÃO': 2,
    'EM ASSINATURA': 3,
    'SEM DADOS': 4,
    'BLOQUEADO': 5,
    'EM MANUTENÇÃO': 6
  };
  
  return statusMap[statusName.toUpperCase()] || null;
}

function getSolutionIdByName(solutionName: string): number | null {
  const solutionMap: Record<string, number> = {
    'CHIP': 11,
    'SPEEDY 5G': 1,
    '4BLACK': 2,
    '4LITE': 3,
    '4PLUS': 4,
    'AP BLUE': 5,
    'POWERBANK': 6,
    'SWITCH': 7,
    'HUB USB': 8,
    'ANTENA': 9,
    'LOAD BALANCE': 10
  };
  
  return solutionMap[solutionName.toUpperCase()] || null;
}
