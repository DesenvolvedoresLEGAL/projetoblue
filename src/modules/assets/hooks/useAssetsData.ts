
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Asset, ChipAsset, EquipamentAsset, AssetStatus } from '@/types/asset';
import { AssetWithRelations } from '@/types/assetWithRelations';
import { mapSolutionToType, safeParseNumber, isValidFilterValue } from '@/utils/assetHelpers';

// Database structure interface  
interface DatabaseAsset {
  uuid: string;
  model: string;
  rented_days: number;
  serial_number: string;
  line_number: number;
  iccid: string;
  radio: string;
  created_at: string;
  updated_at: string;
  admin_user: string;
  admin_pass: string;
  ssid_atual: string;
  pass_atual: string;
  ssid_fabrica: string;
  pass_fabrica: string;
  admin_user_fabrica: string;
  admin_pass_fabrica: string;
  plan_id: number;
  manufacturer_id: number;
  status_id: number;
  solution_id: number;
  solucao: {
    id: number;
    solution: string;
  };
  manufacturer: {
    id: number;
    name: string;
  };
  status: {
    id: number;
    status: string;
  };
}

// Transform database record to frontend Asset type
const transformDatabaseAsset = (dbAsset: DatabaseAsset): Asset => {
  // Determine type based on solution_id
  const isChip = dbAsset.solution_id === 11;
  const status = dbAsset.status?.status as AssetStatus || 'DISPONÍVEL';
  const solucao = mapSolutionToType(dbAsset.solution_id, dbAsset.solucao?.solution);

  if (isChip) {
    const chipAsset: ChipAsset = {
      id: dbAsset.uuid,
      uuid: dbAsset.uuid,
      type: 'CHIP' as const,
      registrationDate: dbAsset.created_at,
      status,
      statusId: dbAsset.status_id,
      solucao,
      marca: dbAsset.manufacturer?.name || '',
      modelo: dbAsset.model || '',
      serial_number: dbAsset.serial_number || '',
      iccid: dbAsset.iccid || '',
      phoneNumber: dbAsset.line_number?.toString() || '',
      carrier: 'Unknown',
    };
    return chipAsset;
  } else {
    const equipmentAsset: EquipamentAsset = {
      id: dbAsset.uuid,
      uuid: dbAsset.uuid,
      type: 'EQUIPMENT' as const,  
      registrationDate: dbAsset.created_at,
      status,
      statusId: dbAsset.status_id,
      solucao,
      marca: dbAsset.manufacturer?.name || '',
      modelo: dbAsset.model || '',
      serial_number: dbAsset.serial_number || '',
      radio: dbAsset.radio || '',
      uniqueId: dbAsset.uuid,
      brand: dbAsset.manufacturer?.name || '',
      model: dbAsset.model || '',
      ssid: dbAsset.ssid_atual || '',
      password: dbAsset.pass_atual || '',
      serialNumber: dbAsset.serial_number || '',
      adminUser: dbAsset.admin_user || '',
      adminPassword: dbAsset.admin_pass || '',
    };
    return equipmentAsset;
  }
};

// Transform database record to AssetWithRelations
const transformToAssetWithRelations = (dbAsset: DatabaseAsset): AssetWithRelations => {
  return {
    uuid: dbAsset.uuid,
    model: dbAsset.model,
    rented_days: dbAsset.rented_days || 0,
    serial_number: dbAsset.serial_number,
    line_number: dbAsset.line_number,
    iccid: dbAsset.iccid,
    radio: dbAsset.radio,
    created_at: dbAsset.created_at,
    updated_at: dbAsset.updated_at,
    admin_user: dbAsset.admin_user,
    admin_pass: dbAsset.admin_pass,
    ssid_atual: dbAsset.ssid_atual,
    pass_atual: dbAsset.pass_atual,
    ssid_fabrica: dbAsset.ssid_fabrica,
    pass_fabrica: dbAsset.pass_fabrica,
    admin_user_fabrica: dbAsset.admin_user_fabrica,
    admin_pass_fabrica: dbAsset.admin_pass_fabrica,
    plan_id: dbAsset.plan_id,
    manufacturer_id: dbAsset.manufacturer_id,
    status_id: dbAsset.status_id,
    solution_id: dbAsset.solution_id,
    solucao: {
      id: dbAsset.solucao?.id || dbAsset.solution_id,
      name: dbAsset.solucao?.solution || 'Unknown'
    },
    manufacturer: {
      id: dbAsset.manufacturer?.id || dbAsset.manufacturer_id,
      name: dbAsset.manufacturer?.name || 'Unknown'
    },
    status: {
      id: dbAsset.status?.id || dbAsset.status_id,
      name: dbAsset.status?.status || 'DISPONÍVEL'
    },
    plan: undefined // Remove plan reference for now to fix build
  };
};

// Hook to fetch all assets
export const useAssetsData = (options?: {
  searchTerm?: string;
  filterType?: string;
  filterStatus?: string;
  filterManufacturer?: string;
  currentPage?: number;
  pageSize?: number;
  enabled?: boolean;
  excludeSolutions?: number[];
}) => {
  return useQuery({
    queryKey: ['assets-data', options],
    queryFn: async (): Promise<{
      assets: AssetWithRelations[];
      totalCount: number;
      totalPages: number;
    }> => {
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
          ssid_atual,
          pass_atual,
          ssid_fabrica,
          pass_fabrica,
          admin_user_fabrica,
          admin_pass_fabrica,
          plan_id,
          manufacturer_id,
          status_id,
          solution_id,
          solucao:asset_solutions!inner(id, solution),
          manufacturer:manufacturers(id, name),
          status:asset_status!inner(id, status),
          plan:plans(id, nome)
        `, { count: 'exact' })
        .is('deleted_at', null);

      // Apply filters if provided
      if (options?.excludeSolutions?.length) {
        query = query.not('solution_id', 'in', `(${options.excludeSolutions.join(',')})`);
      }

      if (options?.filterType && isValidFilterValue(options.filterType)) {
        const solutionId = safeParseNumber(options.filterType);
        if (solutionId !== null) {
          query = query.eq('solution_id', solutionId);
        } else if (options.filterType === 'CHIP') {
          query = query.eq('solution_id', 11);
        } else if (options.filterType === 'EQUIPMENTT') {
          query = query.neq('solution_id', 11);
        }
      }

      if (options?.filterStatus && isValidFilterValue(options.filterStatus)) {
        const statusId = safeParseNumber(options.filterStatus);
        if (statusId !== null) {
          query = query.eq('status_id', statusId);
        }
      }

      if (options?.filterManufacturer && isValidFilterValue(options.filterManufacturer)) {
        const manufacturerId = safeParseNumber(options.filterManufacturer);
        if (manufacturerId !== null) {
          query = query.eq('manufacturer_id', manufacturerId);
        }
      }

      if (options?.searchTerm && options.searchTerm.trim()) {
        const searchTerm = `%${options.searchTerm.trim()}%`;
        query = query.or(`iccid.ilike.${searchTerm},serial_number.ilike.${searchTerm},model.ilike.${searchTerm},radio.ilike.${searchTerm},line_number.eq.${safeParseNumber(options.searchTerm) || 0}`);
      }

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(
          options?.currentPage ? (options.currentPage - 1) * (options?.pageSize || 10) : 0,
          options?.currentPage ? options.currentPage * (options?.pageSize || 10) - 1 : (options?.pageSize || 10) - 1
        );

      if (error) {
        if (import.meta.env.DEV) console.error('Error fetching assets data:', error);
        throw error;
      }

      const assets = (data || []).map(transformToAssetWithRelations);
      const totalCount = count || assets.length;
      const totalPages = Math.ceil(totalCount / (options?.pageSize || 10));

      return {
        assets,
        totalCount,
        totalPages
      };
    },
    enabled: options?.enabled !== false,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

// Hook to fetch single asset
export const useAssetData = (assetId: string) => {
  return useQuery({
    queryKey: ['asset-data', assetId],
    queryFn: async (): Promise<Asset | null> => {
      if (!assetId) return null;

      const { data, error } = await supabase
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
          ssid_atual,
          pass_atual,
          ssid_fabrica,
          pass_fabrica,
          admin_user_fabrica,
          admin_pass_fabrica,
          plan_id,
          manufacturer_id,
          status_id,
          solution_id,
          solucao:asset_solutions!inner(id, solution),
          manufacturer:manufacturers(id, name),
          status:asset_status!inner(id, status)
        `)
        .eq('uuid', assetId)
        .is('deleted_at', null)
        .single();

      if (error) {
        if (import.meta.env.DEV) console.error(`Error fetching asset data for ${assetId}:`, error);
        throw error;
      }

      return data ? transformDatabaseAsset(data) : null;
    },
    enabled: !!assetId,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

// Hook to fetch asset stats
export const useAssetsStats = () => {
  return useQuery({
    queryKey: ['assets-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('assets')
        .select('solution_id, status_id')
        .is('deleted_at', null);

      if (error) {
        if (import.meta.env.DEV) console.error('Error fetching assets stats:', error);
        throw error;
      }

      const stats = {
        total: data?.length || 0,
        chips: data?.filter(a => a.solution_id === 11).length || 0,
        routers: data?.filter(a => a.solution_id !== 11).length || 0,
        available: data?.filter(a => a.status_id === 1).length || 0,
        rented: data?.filter(a => a.status_id === 2).length || 0,
      };

      return stats;
    },
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

export type { AssetWithRelations };
