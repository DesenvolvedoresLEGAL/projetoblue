
import { supabase } from "@/integrations/supabase/client";

interface AssetQueryResult {
  uuid: string;
  model: string;
  rented_days: number;
  serial_number: string;
  line_number: number;
  iccid: string;
  radio: string;
  created_at: string;
  updated_at: string;
  solution_id: number;
  status_id: number;
  manufacturer_id: number;
  plan_id: number;
  admin_user: string;
  admin_pass: string;
  ssid_atual: string;
  pass_atual: string;
  solucao: {
    id: number;
    solution: string;
  };
  status: {
    id: number;
    status: string;
  };
  manufacturer: {
    id: number;
    name: string;
  };
  plan: {
    id: number;
    nome: string;
    tamanho_gb: number;
  };
}

export const optimizedAssetService = {
  async getAssetsPaginated(
    page: number,
    limit: number,
    filters: any,
    search: string
  ) {
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
        solution_id,
        status_id,
        manufacturer_id,
        plan_id,
        admin_user,
        admin_pass,
        ssid_atual,
        pass_atual,
        asset_solutions!assets_solution_id_fkey (
          id,
          solution
        ),
        asset_status!assets_status_id_fkey (
          id,
          status
        ),
        manufacturers!assets_manufacturer_id_fkey (
          id,
          name
        ),
        plans!assets_plan_id_fkey (
          id,
          nome,
          tamanho_gb
        )
      `)
      .is('deleted_at', null);

    // Apply filters
    if (filters.solutionId && filters.solutionId !== 'all') {
      query = query.eq('solution_id', filters.solutionId);
    }

    if (filters.statusId && filters.statusId !== 'all') {
      query = query.eq('status_id', filters.statusId);
    }

    if (filters.manufacturerId && filters.manufacturerId !== 'all') {
      query = query.eq('manufacturer_id', filters.manufacturerId);
    }

    // Apply search
    if (search && search.trim()) {
      query = query.or(`
        radio.ilike.%${search}%,
        iccid.ilike.%${search}%,
        serial_number.ilike.%${search}%,
        model.ilike.%${search}%
      `);
    }

    // Get total count
    const { count } = await query
      .select('*', { count: 'exact', head: true });

    // Apply pagination and get data
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error } = await query
      .range(from, to)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const transformedData = (data || []).map((asset: any) => ({
      uuid: asset.uuid,
      model: asset.model || '',
      rented_days: asset.rented_days,
      serial_number: asset.serial_number || '',
      line_number: asset.line_number || null,
      iccid: asset.iccid || '',
      radio: asset.radio || '',
      created_at: asset.created_at,
      updated_at: asset.updated_at,
      solution_id: asset.solution_id,
      status_id: asset.status_id,
      manufacturer_id: asset.manufacturer_id,
      plan_id: asset.plan_id,
      admin_user: asset.admin_user || '',
      admin_pass: asset.admin_pass || '',
      ssid_atual: asset.ssid_atual || '',
      pass_atual: asset.pass_atual || '',
      solucao: asset.asset_solutions || { id: 0, solution: '' },
      status: asset.asset_status || { id: 0, status: '' },
      manufacturer: asset.manufacturers || { id: 0, name: '' },
      plan: asset.plans || { id: 0, nome: '', tamanho_gb: 0 }
    }));

    return {
      data: transformedData,
      total: count || 0
    };
  },

  async getFilterOptions() {
    const [solutionsResult, statusResult, manufacturersResult] = await Promise.all([
      supabase
        .from('asset_solutions')
        .select('id, solution')
        .is('deleted_at', null),
      supabase
        .from('asset_status')
        .select('id, status')
        .is('deleted_at', null),
      supabase
        .from('manufacturers')
        .select('id, name')
        .is('deleted_at', null)
    ]);

    return {
      solutions: solutionsResult.data || [],
      statuses: statusResult.data || [],
      manufacturers: manufacturersResult.data || []
    };
  }
};
