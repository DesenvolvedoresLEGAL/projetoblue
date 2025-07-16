
import { supabase } from "@/integrations/supabase/client";
import { AssociationWithDetails, FilterOptions, SearchOptions, PaginationOptions } from "../types/associationsList";

export const associationsListService = {
  async getAssociationsWithDetails(
    filters: FilterOptions,
    search: SearchOptions,
    pagination: PaginationOptions
  ) {
    // Build base query with all necessary joins
    let baseQuery = supabase
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
        clients!client_id_fkey (
          nome,
          contato,
          responsavel,
          empresa,
          email
        ),
        association_types!association_type_id_fkey (
          type
        ),
        plans!plan_id_fkey (
          nome,
          tamanho_gb
        )
      `)
      .is('deleted_at', null);

    // Apply filters at database level
    baseQuery = this.applyFilters(baseQuery, filters, search);

    // Get total count with same filters for pagination
    const countQuery = this.buildCountQuery(filters, search);
    const { count } = await countQuery;

    // Apply pagination and ordering
    const from = (pagination.page - 1) * pagination.limit;
    const to = from + pagination.limit - 1;
    
    const { data, error } = await baseQuery
      .range(from, to)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Get equipment and chip details for the associations in batch
    const [equipmentData, chipData] = await Promise.all([
      this.getEquipmentDetails(data || []),
      this.getChipDetails(data || [])
    ]);

    // Transform the data to match our interface
    const transformedData: AssociationWithDetails[] = (data || []).map(item => {
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
        
        // Plan data - prioritize plan_gb from association, fallback to plan's tamanho_gb
        plan_name: item.plans?.nome || null,
        plan_tamanho_gb: item.plans?.tamanho_gb || null,
      };
    });

    return {
      data: transformedData,
      total: count || 0
    };
  },

  applyFilters(query: any, filters: FilterOptions, search: SearchOptions) {
    // Apply status filter
    if (filters.status === 'active') {
      query = query.eq('status', true);
    } else if (filters.status === 'inactive') {
      query = query.eq('status', false);
    }

    // Apply association type filter
    if (filters.associationType !== 'all') {
      query = query.eq('association_type_id', filters.associationType);
    }

    // Apply date range filter
    if (filters.dateRange.start) {
      query = query.gte('entry_date', filters.dateRange.start);
    }
    if (filters.dateRange.end) {
      query = query.lte('entry_date', filters.dateRange.end);
    }

    // Apply search filtering at database level
    if (search.query.trim()) {
      const searchTerm = search.query.toLowerCase();
      
      if (search.searchType === 'client' || search.searchType === 'all') {
        // For client search, we'll need to use the joined clients table
        // This will be handled in the main query with ilike
      }
      
      // For equipment/chip searches, we'll handle these in the equipment/chip queries
    }

    return query;
  },

  buildCountQuery(filters: FilterOptions, search: SearchOptions) {
    let countQuery = supabase
      .from('associations')
      .select('*', { count: 'exact', head: true })
      .is('deleted_at', null);

    return this.applyFilters(countQuery, filters, search);
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

  async getFilterOptions() {
    // Get association types
    const { data: associationTypes } = await supabase
      .from('association_types')
      .select('id, type')
      .is('deleted_at', null);

    // Get manufacturers that are operators (for chips)
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
        exit_date: new Date().toISOString().split('T')[0], // Today's date
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
