
import { supabase } from "@/integrations/supabase/client";
import { AssociationWithDetails, FilterOptions, SearchOptions, PaginationOptions } from "../types/associationsList";

export const associationsAdvancedService = {
  async getAssociationsWithDetails(
    filters: FilterOptions,
    search: SearchOptions,
    pagination: PaginationOptions
  ) {
    // Build dynamic query based on filters and search
    const queryBuilder = this.buildAdvancedQuery(filters, search);
    
    // Get total count
    const countQuery = this.buildCountQuery(filters, search);
    const { count } = await countQuery;

    // Apply pagination and get data
    const from = (pagination.page - 1) * pagination.limit;
    const to = from + pagination.limit - 1;
    
    const { data, error } = await queryBuilder
      .range(from, to)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Get equipment and chip details
    const [equipmentData, chipData] = await Promise.all([
      this.getEquipmentDetails(data || []),
      this.getChipDetails(data || [])
    ]);

    // Transform data
    const transformedData = this.transformAssociationData(data || [], equipmentData, chipData);

    return {
      data: transformedData,
      total: count || 0
    };
  },

  buildAdvancedQuery(filters: FilterOptions, search: SearchOptions) {
    let query = supabase
      .from('associations')
      .select(`
        uuid,
        client_id,
        equipment_id,
        chip_id,
        entry_date,
        exit_date,
        association_type_id,
        plan_id,
        plan_gb,
        equipment_ssid,
        equipment_pass,
        status,
        notes,
        created_at,
        updated_at,
        clients!associations_client_id_fkey (
          nome,
          contato,
          responsavel,
          empresa,
          email
        ),
        association_types!associations_association_type_id_fkey (
          type
        ),
        plans!associations_plan_id_fkey (
          nome,
          tamanho_gb
        )
      `)
      .is('deleted_at', null);

    // Apply basic filters
    query = this.applyBasicFilters(query, filters);

    // Apply search filters
    if (search.query.trim()) {
      query = this.applySearchFilters(query, search);
    }

    // Apply equipment solution filters (asset type)
    if (filters.assetType !== 'all') {
      query = this.applyAssetTypeFilter(query, filters.assetType);
    }

    // Apply manufacturer filter
    if (filters.manufacturer !== 'all') {
      query = this.applyManufacturerFilter(query, filters.manufacturer);
    }

    return query;
  },

  applyBasicFilters(query: any, filters: FilterOptions) {
    // Status filter
    if (filters.status === 'active') {
      query = query.eq('status', true);
    } else if (filters.status === 'inactive') {
      query = query.eq('status', false);
    }

    // Association type filter
    if (filters.associationType !== 'all') {
      query = query.eq('association_type_id', filters.associationType);
    }

    // Date range filter
    if (filters.dateRange.start) {
      query = query.gte('entry_date', filters.dateRange.start);
    }
    if (filters.dateRange.end) {
      query = query.lte('entry_date', filters.dateRange.end);
    }

    return query;
  },

  applySearchFilters(query: any, search: SearchOptions) {
    const searchTerm = `%${search.query.toLowerCase()}%`;

    if (search.searchType === 'client' || search.searchType === 'all') {
      // Note: For complex search across joined tables, we might need to use raw SQL or filter post-query
      // For now, we'll apply a basic client name search
    }

    // For equipment/chip searches, these will be handled in post-processing
    // since they require joining with assets table which is complex with current schema

    return query;
  },

  applyAssetTypeFilter(query: any, assetType: string) {
    // This filter needs to be applied post-query since it requires
    // checking equipment solution_id from assets table
    return query;
  },

  applyManufacturerFilter(query: any, manufacturerId: number) {
    // This filter needs to be applied post-query since it requires
    // checking chip manufacturer from assets table
    return query;
  },

  buildCountQuery(filters: FilterOptions, search: SearchOptions) {
    let countQuery = supabase
      .from('associations')
      .select('*', { count: 'exact', head: true })
      .is('deleted_at', null);

    countQuery = this.applyBasicFilters(countQuery, filters);
    
    if (search.query.trim()) {
      countQuery = this.applySearchFilters(countQuery, search);
    }

    return countQuery;
  },

  async getEquipmentDetails(associations: any[]) {
    const equipmentIds = associations
      .map(item => item.equipment_id)
      .filter(Boolean);

    if (equipmentIds.length === 0) return [];

    const { data, error } = await supabase
      .from('assets')
      .select(`
        uuid,
        radio,
        model,
        serial_number,
        solution_id,
        asset_solutions!assets_solution_id_fkey (
          solution
        )
      `)
      .in('uuid', equipmentIds)
      .is('deleted_at', null);

    if (error) throw error;

    return (data || []).map(item => ({
      uuid: item.uuid,
      radio: item.radio,
      model: item.model,
      serial_number: item.serial_number,
      solution_id: item.solution_id,
      solution_name: item.asset_solutions?.solution || null,
    }));
  },

  async getChipDetails(associations: any[]) {
    const chipIds = associations
      .map(item => item.chip_id)
      .filter(Boolean);

    if (chipIds.length === 0) return [];

    const { data, error } = await supabase
      .from('assets')
      .select(`
        uuid,
        iccid,
        line_number,
        manufacturer_id,
        manufacturers!assets_manufacturer_id_fkey (
          name,
          description
        )
      `)
      .in('uuid', chipIds)
      .is('deleted_at', null);

    if (error) throw error;

    return (data || []).map(item => ({
      uuid: item.uuid,
      iccid: item.iccid,
      line_number: item.line_number,
      manufacturer_id: item.manufacturer_id,
      manufacturer_name: item.manufacturers?.name || null,
      is_operator: item.manufacturers?.description === 'OPERADORA',
    }));
  },

  transformAssociationData(associations: any[], equipmentData: any[], chipData: any[]): AssociationWithDetails[] {
    return associations.map(item => {
      const equipment = equipmentData.find(eq => eq.uuid === item.equipment_id);
      const chip = chipData.find(ch => ch.uuid === item.chip_id);

      return {
        uuid: item.uuid,
        client_id: item.client_id,
        equipment_id: item.equipment_id,
        chip_id: item.chip_id,
        entry_date: item.entry_date,
        exit_date: item.exit_date,
        association_type_id: item.association_type_id,
        plan_id: item.plan_id,
        plan_gb: item.plan_gb || item.plans?.tamanho_gb || null,
        equipment_ssid: item.equipment_ssid,
        equipment_pass: item.equipment_pass,
        status: item.status,
        notes: item.notes,
        created_at: item.created_at,
        updated_at: item.updated_at,
        
        // Client data
        client_name: item.clients?.nome || '',
        client_contato: item.clients?.contato || 0,
        client_responsavel: item.clients?.responsavel || '',
        client_empresa: item.clients?.empresa || '',
        client_email: item.clients?.email || null,
        
        // Equipment data
        equipment_radio: equipment?.radio || null,
        equipment_model: equipment?.model || null,
        equipment_serial_number: equipment?.serial_number || null,
        equipment_solution_id: equipment?.solution_id || null,
        equipment_solution_name: equipment?.solution_name || null,
        
        // Chip data
        chip_iccid: chip?.iccid || null,
        chip_line_number: chip?.line_number || null,
        chip_manufacturer_id: chip?.manufacturer_id || null,
        chip_manufacturer_name: chip?.manufacturer_name || null,
        chip_is_operator: chip?.is_operator || false,
        
        // Association type
        association_type_name: item.association_types?.type || '',
        
        // Plan data
        plan_name: item.plans?.nome || null,
        plan_tamanho_gb: item.plans?.tamanho_gb || null,
      };
    });
  },

  async getFilterOptions() {
    const { data: associationTypes } = await supabase
      .from('association_types')
      .select('id, type')
      .is('deleted_at', null);

    const { data: operators } = await supabase
      .from('manufacturers')
      .select('id, name')
      .eq('description', 'OPERADORA')
      .is('deleted_at', null);

    return {
      associationTypes: associationTypes || [],
      operators: operators || []
    };
  },

  async finalizeAssociation(associationId: string) {
    const { data, error } = await supabase
      .from('associations')
      .update({
        exit_date: new Date().toISOString().split('T')[0],
        status: false,
        updated_at: new Date().toISOString()
      })
      .eq('uuid', associationId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};
