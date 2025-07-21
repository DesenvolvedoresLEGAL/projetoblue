
import { supabase } from '@/integrations/supabase/client';
import { AssetWithRelations } from '@/types/assetWithRelations';

interface FilterOptions {
  searchTerm?: string;
  filterType?: string;
  filterStatus?: string;
  filterManufacturer?: string;
  currentPage?: number;
  pageSize?: number;
}

interface PaginatedAssets {
  assets: AssetWithRelations[];
  totalCount: number;
  totalPages: number;
}

// Interface corrigida para alinhar com os dados reais da query
interface AssetQueryResult {
  uuid: string;
  model: string | null;
  rented_days: number | null;
  serial_number: string | null;
  line_number: number | null;
  iccid: string | null;
  radio: string | null;
  created_at: string;
  updated_at: string;
  admin_user: string;
  admin_pass: string;
  ssid_atual: string | null;
  pass_atual: string | null;
  ssid_fabrica: string | null;
  pass_fabrica: string | null;
  admin_user_fabrica: string | null;
  admin_pass_fabrica: string | null;
  plan_id: number | null;
  manufacturer_id: number | null;
  status_id: number;
  solution_id: number;
  solucao?: { id: number; solution?: string } | null;
  status?: { id: number; status?: string } | null;
  manufacturer?: { id: number; name?: string } | null;
  plan?: { id: number; nome?: string } | null;
}

// Interface simplificada para getAssetStats que retorna apenas os campos essenciais
interface AssetStatsQueryResult {
  uuid: string;
  rented_days: number | null;
  solution_id: number;
  status_id: number;
  solucao?: { id: number; solution?: string } | null;
  status?: { id: number; status?: string } | null;
  manufacturer?: { id: number; name?: string } | null;
  plan?: { id: number; nome?: string } | null;
}

export const optimizedAssetService = {
  async getAssets(options: FilterOptions = {}): Promise<PaginatedAssets> {
    const {
      searchTerm,
      filterType,
      filterStatus,
      filterManufacturer,
      currentPage = 1,
      pageSize = 10
    } = options;

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
        plan:plans(id, nome, tamanho_gb)
      `, { count: 'exact' })
      .is('deleted_at', null);

    // Apply filters
    if (filterType && filterType !== 'all') {
      const solutionId = parseInt(filterType, 10);
      if (!isNaN(solutionId)) {
        query = query.eq('solution_id', solutionId);
      } else if (filterType === 'CHIP') {
        query = query.eq('solution_id', 11);
      } else if (filterType === 'EQUIPMENT') {
        query = query.neq('solution_id', 11);
      }
    }

    if (filterStatus && filterStatus !== 'all') {
      const statusId = parseInt(filterStatus);
      if (!isNaN(statusId)) {
        query = query.eq('status_id', statusId);
      }
    }

    if (filterManufacturer && filterManufacturer !== 'all') {
      const manufacturerId = parseInt(filterManufacturer);
      if (!isNaN(manufacturerId)) {
        query = query.eq('manufacturer_id', manufacturerId);
      }
    }

    if (searchTerm && searchTerm.trim()) {
      const term = `%${searchTerm.trim()}%`;
      query = query.or(`
        iccid.ilike.${term},
        serial_number.ilike.${term},
        model.ilike.${term},
        radio.ilike.${term}
      `);
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(
        (currentPage - 1) * pageSize,
        currentPage * pageSize - 1
      );

    if (error) {
      
      throw error;
    }

    const transformedAssets: AssetWithRelations[] = (data || []).map((asset: AssetQueryResult) => ({
      uuid: asset.uuid,
      model: asset.model,
      rented_days: asset.rented_days || 0,
      serial_number: asset.serial_number,
      line_number: asset.line_number,
      iccid: asset.iccid,
      radio: asset.radio,
      created_at: asset.created_at,
      updated_at: asset.updated_at,
      admin_user: asset.admin_user,
      admin_pass: asset.admin_pass,
      ssid_atual: asset.ssid_atual,
      pass_atual: asset.pass_atual,
      ssid_fabrica: asset.ssid_fabrica,
      pass_fabrica: asset.pass_fabrica,
      admin_user_fabrica: asset.admin_user_fabrica,
      admin_pass_fabrica: asset.admin_pass_fabrica,
      plan_id: asset.plan_id,
      manufacturer_id: asset.manufacturer_id,
      status_id: asset.status_id,
      solution_id: asset.solution_id,
      solucao: {
        id: asset.solucao?.id || asset.solution_id,
        name: asset.solucao?.solution || 'Unknown'
      },
      status: {
        id: asset.status?.id || asset.status_id,
        name: asset.status?.status || 'DISPONÍVEL'
      },
      manufacturer: {
        id: asset.manufacturer?.id || asset.manufacturer_id,
        name: asset.manufacturer?.name || 'Unknown'
      },
      plan: asset.plan ? {
        id: asset.plan.id,
        nome: asset.plan.nome
      } : undefined
    }));

    return {
      assets: transformedAssets,
      totalCount: count || 0,
      totalPages: Math.ceil((count || 0) / pageSize)
    };
  },

  async getAssetStats() {
    const { data, error } = await supabase
      .from('assets')
      .select(`
        uuid,
        rented_days,
        solution_id,
        status_id,
        solucao:asset_solutions!inner(id, solution),
        status:asset_status!inner(id, status),
        manufacturer:manufacturers(id, name),
        plan:plans(id, nome, tamanho_gb)
      `)
      .is('deleted_at', null);

    if (error) {
      
      throw error;
    }

    const transformedAssets: AssetWithRelations[] = (data || []).map((asset: AssetStatsQueryResult) => ({
      uuid: asset.uuid,
      model: '',
      rented_days: asset.rented_days || 0,
      serial_number: '',
      line_number: null,
      iccid: '',
      radio: '',
      created_at: '',
      updated_at: '',
      admin_user: '',
      admin_pass: '',
      ssid_atual: '',
      pass_atual: '',
      ssid_fabrica: '',
      pass_fabrica: '',
      admin_user_fabrica: '',
      admin_pass_fabrica: '',
      plan_id: null,
      manufacturer_id: null,
      status_id: asset.status_id,
      solution_id: asset.solution_id,
      solucao: {
        id: asset.solucao?.id || asset.solution_id,
        name: asset.solucao?.solution || 'Unknown'
      },
      status: {
        id: asset.status?.id || asset.status_id,
        name: asset.status?.status || 'DISPONÍVEL'
      },
      manufacturer: {
        id: asset.manufacturer?.id || 0,
        name: asset.manufacturer?.name || 'Unknown'
      },
      plan: asset.plan ? {
        id: asset.plan.id,
        nome: asset.plan.nome
      } : undefined
    }));

    const stats = {
      total: transformedAssets.length,
      chips: transformedAssets.filter(a => a.solution_id === 11).length,
      routers: transformedAssets.filter(a => a.solution_id !== 11).length,
      available: transformedAssets.filter(a => a.status_id === 1).length,
      rented: transformedAssets.filter(a => a.status_id === 2).length,
    };

    return stats;
  }
};
