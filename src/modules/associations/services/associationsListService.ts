
import { supabase } from "@/integrations/supabase/client";
import { AssociationWithDetails, FilterOptions, SearchOptions, PaginationOptions } from "../types/associationsList";

export const associationsListService = {
  async getAssociationsWithDetails(
    filters: FilterOptions,
    search: SearchOptions,
    pagination: PaginationOptions
  ) {
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
        clients:client_id (
          nome,
          contato,
          responsavel,
          empresa,
          email
        ),
        equipment:equipment_id (
          radio,
          model,
          serial_number,
          solution_id,
          asset_solutions:solution_id (
            solution
          )
        ),
        chip:chip_id (
          iccid,
          line_number,
          manufacturer_id,
          manufacturers:manufacturer_id (
            name,
            notes
          )
        ),
        association_types:association_type_id (
          type
        ),
        plans:plan_id (
          nome,
          tamanho_gb
        )
      `)
      .eq('deleted_at', null);

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

    // Apply search
    if (search.query.trim()) {
      const searchTerm = search.query.trim();
      
      if (search.searchType === 'client' || search.searchType === 'all') {
        // Search by client name will be handled in the results filtering
      }
      
      if (search.searchType === 'iccid' || search.searchType === 'all') {
        // ICCID search will be handled in results filtering
      }
      
      if (search.searchType === 'radio' || search.searchType === 'all') {
        // Radio search will be handled in results filtering
      }
    }

    // Apply pagination
    const from = (pagination.page - 1) * pagination.limit;
    const to = from + pagination.limit - 1;
    
    query = query.range(from, to);

    // Order by client name, then by status (active first), then by created_at
    query = query.order('created_at', { ascending: false });

    const { data, error, count } = await query;

    if (error) throw error;

    // Transform the data to match our interface
    const transformedData: AssociationWithDetails[] = (data || []).map(item => ({
      uuid: item.uuid,
      client_id: item.client_id,
      equipment_id: item.equipment_id,
      chip_id: item.chip_id,
      entry_date: item.entry_date,
      exit_date: item.exit_date,
      association_type_id: item.association_type_id,
      plan_id: item.plan_id,
      plan_gb: item.plan_gb,
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
      equipment_radio: item.equipment?.radio || null,
      equipment_model: item.equipment?.model || null,
      equipment_serial_number: item.equipment?.serial_number || null,
      equipment_solution_id: item.equipment?.solution_id || null,
      equipment_solution_name: item.equipment?.asset_solutions?.solution || null,
      
      // Chip data
      chip_iccid: item.chip?.iccid || null,
      chip_line_number: item.chip?.line_number || null,
      chip_manufacturer_id: item.chip?.manufacturer_id || null,
      chip_manufacturer_name: item.chip?.manufacturers?.name || null,
      chip_is_operator: item.chip?.manufacturers?.notes === 'OPERADORA',
      
      // Association type
      association_type_name: item.association_types?.type || '',
      
      // Plan data
      plan_name: item.plans?.nome || null,
      plan_tamanho_gb: item.plans?.tamanho_gb || null,
    }));

    // Apply additional filters that couldn't be done in the query
    let filteredData = transformedData;

    // Filter by asset type (priority vs others)
    if (filters.assetType === 'priority') {
      filteredData = filteredData.filter(item => 
        item.equipment_solution_id && [1, 2, 4].includes(item.equipment_solution_id)
      );
    } else if (filters.assetType === 'others') {
      filteredData = filteredData.filter(item => 
        !item.equipment_solution_id || ![1, 2, 4].includes(item.equipment_solution_id)
      );
    }

    // Filter by manufacturer (for chips only)
    if (filters.manufacturer !== 'all') {
      filteredData = filteredData.filter(item => 
        item.chip_manufacturer_id === filters.manufacturer
      );
    }

    // Apply search filtering
    if (search.query.trim()) {
      const searchTerm = search.query.toLowerCase();
      
      filteredData = filteredData.filter(item => {
        const matchesClient = search.searchType === 'all' || search.searchType === 'client' 
          ? item.client_name.toLowerCase().includes(searchTerm)
          : false;
          
        const matchesICCID = search.searchType === 'all' || search.searchType === 'iccid'
          ? item.chip_iccid?.toLowerCase().includes(searchTerm) || 
            item.chip_iccid?.slice(-5).includes(searchTerm)
          : false;
          
        const matchesRadio = search.searchType === 'all' || search.searchType === 'radio'
          ? item.equipment_radio?.toLowerCase().includes(searchTerm)
          : false;
          
        return matchesClient || matchesICCID || matchesRadio;
      });
    }

    return {
      data: filteredData,
      total: count || 0
    };
  },

  async getFilterOptions() {
    // Get association types
    const { data: associationTypes } = await supabase
      .from('association_types')
      .select('id, type')
      .eq('deleted_at', null);

    // Get manufacturers that are operators (for chips)
    const { data: operators } = await supabase
      .from('manufacturers')
      .select('id, name')
      .eq('notes', 'OPERADORA')
      .eq('deleted_at', null);

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
