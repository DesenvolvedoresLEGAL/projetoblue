
import { supabase } from '@/integrations/supabase/client';
import { AssetWithRelations } from '@/types/assetWithRelations';

export interface AssetQueryResult {
  uuid: string;
  model?: string;
  serial_number?: string;
  line_number?: number;
  iccid?: string;
  radio?: string;
  created_at?: string;
  updated_at?: string;
  admin_user?: string;
  admin_pass?: string;
  ssid_atual?: string;
  pass_atual?: string;
  ssid_fabrica?: string;
  pass_fabrica?: string;
  admin_user_fabrica?: string;
  admin_pass_fabrica?: string;
  plan_id?: number;
  manufacturer_id?: number;
  status_id?: number;
  solution_id?: number;
  rented_days?: number;
  solucao?: { id: number; solution: string };
  status: { id: number; status: string };  
  manufacturer: { id: number; name: string };
  plan?: { id: number; nome: string };
}

interface OptimizedAssetFilters {
  searchTerm?: string;
  filterType?: string;
  filterStatus?: string;
  filterManufacturer?: string;
  currentPage?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  excludeSolutions?: number[];
  includeDeleted?: boolean;
}

interface PaginatedAssetResult {
  assets: AssetWithRelations[];
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

const isValidFilterValue = (value: string | undefined): boolean => {
  return value !== undefined && value !== null && value.trim() !== '' && value !== 'all';
};

const safeParseNumber = (value: string): number | null => {
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? null : parsed;
};

const buildAssetQuery = (filters: OptimizedAssetFilters) => {
  let query = supabase
    .from('assets')
    .select(`
      uuid,
      rented_days,
      solution_id,
      status_id,
      solucao:asset_solutions!inner(id, solution),
      status:asset_status!inner(id, status),
      manufacturer:manufacturers(id, name),
      plan:plans(id, nome)
    `, { count: 'exact' });

  // Deleted filter
  if (!filters.includeDeleted) {
    query = query.is('deleted_at', null);
  }

  // Exclude solutions filter
  if (filters.excludeSolutions?.length) {
    query = query.not('solution_id', 'in', `(${filters.excludeSolutions.join(',')})`);
  }

  // Type filter
  if (filters.filterType && isValidFilterValue(filters.filterType)) {
    const solutionId = safeParseNumber(filters.filterType);
    if (solutionId !== null) {
      query = query.eq('solution_id', solutionId);
    } else if (filters.filterType === 'CHIP') {
      query = query.eq('solution_id', 11);
    } else if (filters.filterType === 'ROTEADOR') {
      query = query.neq('solution_id', 11);
    }
  }

  // Status filter
  if (filters.filterStatus && isValidFilterValue(filters.filterStatus)) {
    const statusId = safeParseNumber(filters.filterStatus);
    if (statusId !== null) {
      query = query.eq('status_id', statusId);
    }
  }

  // Manufacturer filter
  if (filters.filterManufacturer && isValidFilterValue(filters.filterManufacturer)) {
    const manufacturerId = safeParseNumber(filters.filterManufacturer);
    if (manufacturerId !== null) {  
      query = query.eq('manufacturer_id', manufacturerId);
    }
  }

  return query;
};

export const fetchOptimizedAssets = async (
  filters: OptimizedAssetFilters = {}
): Promise<PaginatedAssetResult> => {
  try {
    const pageSize = filters.pageSize || 10;
    const currentPage = filters.currentPage || 1;
    const offset = (currentPage - 1) * pageSize;

    let query = buildAssetQuery(filters);

    // Search functionality - only fetch fields needed for search when searching
    if (filters.searchTerm?.trim()) {
      // For search, we need to select more fields and search in them
      query = supabase
        .from('assets')
        .select(`
          uuid,
          model,
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
          rented_days,
          solucao:asset_solutions!inner(id, solution),
          manufacturer:manufacturers(id, name),
          status:asset_status!inner(id, status),
          plan:plans(id, nome)
        `, { count: 'exact' });

      // Apply base filters
      if (!filters.includeDeleted) {
        query = query.is('deleted_at', null);
      }

      if (filters.excludeSolutions?.length) {
        query = query.not('solution_id', 'in', `(${filters.excludeSolutions.join(',')})`);
      }

      const searchTerm = `%${filters.searchTerm.trim()}%`;
      query = query.or(`iccid.ilike.${searchTerm},serial_number.ilike.${searchTerm},model.ilike.${searchTerm},radio.ilike.${searchTerm},line_number.eq.${safeParseNumber(filters.searchTerm) || 0}`);
    }

    // Sorting
    const sortBy = filters.sortBy || 'created_at';
    const sortOrder = filters.sortOrder || 'desc';
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Pagination
    const { data, error, count } = await query
      .range(offset, offset + pageSize - 1);

    if (error) {
      console.error('Error fetching optimized assets:', error);
      throw error;
    }

    // Transform to AssetWithRelations
    const assets: AssetWithRelations[] = (data || []).map((asset: Partial<AssetQueryResult>) => ({
      uuid: asset.uuid || '',
      model: asset.model || '',
      rented_days: asset.rented_days || 0,
      serial_number: asset.serial_number || '',
      line_number: asset.line_number || null,
      iccid: asset.iccid || '',
      radio: asset.radio || '',
      created_at: asset.created_at || '',
      updated_at: asset.updated_at || '',
      admin_user: asset.admin_user || '',
      admin_pass: asset.admin_pass || '',
      ssid_atual: asset.ssid_atual || '',
      pass_atual: asset.pass_atual || '',
      ssid_fabrica: asset.ssid_fabrica || '',
      pass_fabrica: asset.pass_fabrica || '',
      admin_user_fabrica: asset.admin_user_fabrica || '',
      admin_pass_fabrica: asset.admin_pass_fabrica || '',
      plan_id: asset.plan_id || null,
      manufacturer_id: asset.manufacturer_id || null,
      status_id: asset.status_id || null,
      solution_id: asset.solution_id || null,
      solucao: {
        id: asset.solucao?.id || asset.solution_id || 0,
        name: asset.solucao?.solution || 'Unknown'
      },
      manufacturer: {
        id: asset.manufacturer?.id || asset.manufacturer_id || 0,
        name: asset.manufacturer?.name || 'Unknown'
      },
      status: {
        id: asset.status?.id || asset.status_id || 0,
        name: asset.status?.status || 'DISPONÍVEL'
      },
      plan: asset.plan ? {
        id: asset.plan.id,
        nome: asset.plan.nome
      } : undefined
    }));

    const totalCount = count || 0;
    const totalPages = Math.ceil(totalCount / pageSize);
    const hasNextPage = currentPage < totalPages;
    const hasPrevPage = currentPage > 1;

    return {
      assets,
      totalCount,
      totalPages,
      hasNextPage,
      hasPrevPage
    };

  } catch (error) {
    console.error('Error in fetchOptimizedAssets:', error);
    throw error;
  }
};

// Optimized function for fetching basic asset stats
export const fetchAssetStats = async () => {
  const { data, error } = await supabase
    .from('assets')
    .select('solution_id, status_id')
    .is('deleted_at', null);

  if (error) {
    console.error('Error fetching asset stats:', error);
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
};

export type { OptimizedAssetFilters, PaginatedAssetResult };
