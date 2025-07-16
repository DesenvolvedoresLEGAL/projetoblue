
import { supabase } from "@/integrations/supabase/client";
import { AssociationWithDetails, FilterOptions, SearchOptions, PaginationOptions } from "../types/associationsList";

// Tipos específicos para cada query
interface AssociationCore {
  uuid: string;
  client_id: string;
  equipment_id: string | null;
  chip_id: string | null;
  entry_date: string;
  exit_date: string | null;
  association_type_id: number;
  plan_id: number | null;
  plan_gb: number | null;
  equipment_ssid: string | null;
  equipment_pass: string | null;
  status: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface ClientData {
  uuid: string;
  nome: string;
  contato: number;
  responsavel: string;
  empresa: string;
  email: string | null;
}

interface EquipmentData {
  uuid: string;
  radio: string | null;
  model: string | null;
  serial_number: string | null;
  solution_id: number | null;
  solution_name: string | null;
}

interface ChipData {
  uuid: string;
  iccid: string | null;
  line_number: number | null;
  manufacturer_id: number | null;
  manufacturer_name: string | null;
  is_operator: boolean;
}

interface AssociationTypeData {
  id: number;
  type: string;
}

interface PlanData {
  id: number;
  nome: string;
  tamanho_gb: number | null;
}

export const associationsOptimizedService = {
  async getAssociationsWithDetails(
    filters: FilterOptions,
    search: SearchOptions,
    pagination: PaginationOptions
  ) {
    // Query principal fragmentada - apenas dados essenciais
    const coreQuery = this.buildCoreQuery(filters, search);
    
    // Executar query principal com paginação
    const { data: coreAssociations, error: coreError } = await coreQuery
      .range((pagination.page - 1) * pagination.limit, pagination.page * pagination.limit - 1)
      .order('created_at', { ascending: false });

    if (coreError) throw coreError;
    if (!coreAssociations || coreAssociations.length === 0) {
      return { data: [], total: 0 };
    }

    // Obter contagem total
    const totalCount = await this.getFilteredCount(filters, search);

    // Extrair IDs únicos para queries paralelas
    const clientIds = [...new Set(coreAssociations.map(a => a.client_id))];
    const equipmentIds = [...new Set(coreAssociations.map(a => a.equipment_id).filter(Boolean))];
    const chipIds = [...new Set(coreAssociations.map(a => a.chip_id).filter(Boolean))];
    const associationTypeIds = [...new Set(coreAssociations.map(a => a.association_type_id))];
    const planIds = [...new Set(coreAssociations.map(a => a.plan_id).filter(Boolean))];

    // Executar queries paralelas usando Promise.all
    const [
      clientsData,
      equipmentData,
      chipData,
      associationTypesData,
      plansData
    ] = await Promise.all([
      this.getClientsData(clientIds),
      this.getEquipmentData(equipmentIds),
      this.getChipData(chipIds),
      this.getAssociationTypesData(associationTypeIds),
      this.getPlansData(planIds)
    ]);

    // Merge eficiente dos dados
    const mergedData = this.mergeAssociationData(
      coreAssociations,
      clientsData,
      equipmentData,
      chipData,
      associationTypesData,
      plansData
    );

    return {
      data: mergedData,
      total: totalCount
    };
  },

  buildCoreQuery(filters: FilterOptions, search: SearchOptions) {
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
        updated_at
      `)
      .is('deleted_at', null);

    // Aplicar filtros básicos no nível SQL
    query = this.applyBasicFilters(query, filters);
    query = this.applySearchFilters(query, search);

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
    if (!search.query.trim()) return query;

    const searchTerm = search.query.toLowerCase();

    // Para busca por cliente, aplicar filtro na query principal
    if (search.searchType === 'client' || search.searchType === 'all') {
      // Nota: Para otimização total, isso precisaria de uma subquery
      // Por enquanto, mantemos a busca de cliente no merge
    }

    return query;
  },

  async getFilteredCount(filters: FilterOptions, search: SearchOptions): Promise<number> {
    let countQuery = supabase
      .from('associations')
      .select('*', { count: 'exact', head: true })
      .is('deleted_at', null);

    countQuery = this.applyBasicFilters(countQuery, filters);
    
    const { count, error } = await countQuery;
    if (error) throw error;
    
    return count || 0;
  },

  // Queries paralelas otimizadas
  async getClientsData(clientIds: string[]): Promise<ClientData[]> {
    if (clientIds.length === 0) return [];

    const { data, error } = await supabase
      .from('clients')
      .select('uuid, nome, contato, responsavel, empresa, email')
      .in('uuid', clientIds)
      .is('deleted_at', null);

    if (error) throw error;
    return data || [];
  },

  async getEquipmentData(equipmentIds: string[]): Promise<EquipmentData[]> {
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

  async getChipData(chipIds: string[]): Promise<ChipData[]> {
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

  async getAssociationTypesData(typeIds: number[]): Promise<AssociationTypeData[]> {
    if (typeIds.length === 0) return [];

    const { data, error } = await supabase
      .from('association_types')
      .select('id, type')
      .in('id', typeIds)
      .is('deleted_at', null);

    if (error) throw error;
    return data || [];
  },

  async getPlansData(planIds: number[]): Promise<PlanData[]> {
    if (planIds.length === 0) return [];

    const { data, error } = await supabase
      .from('plans')
      .select('id, nome, tamanho_gb')
      .in('id', planIds)
      .is('deleted_at', null);

    if (error) throw error;
    return data || [];
  },

  // Função de merge eficiente com lookups O(1)
  mergeAssociationData(
    coreAssociations: AssociationCore[],
    clientsData: ClientData[],
    equipmentData: EquipmentData[],
    chipData: ChipData[],
    associationTypesData: AssociationTypeData[],
    plansData: PlanData[]
  ): AssociationWithDetails[] {
    // Criar maps para lookup O(1)
    const clientsMap = new Map(clientsData.map(c => [c.uuid, c]));
    const equipmentMap = new Map(equipmentData.map(e => [e.uuid, e]));
    const chipMap = new Map(chipData.map(c => [c.uuid, c]));
    const associationTypesMap = new Map(associationTypesData.map(t => [t.id, t]));
    const plansMap = new Map(plansData.map(p => [p.id, p]));

    return coreAssociations
      .map(association => {
        const client = clientsMap.get(association.client_id);
        const equipment = association.equipment_id ? equipmentMap.get(association.equipment_id) : null;
        const chip = association.chip_id ? chipMap.get(association.chip_id) : null;
        const associationType = associationTypesMap.get(association.association_type_id);
        const plan = association.plan_id ? plansMap.get(association.plan_id) : null;

        return {
          uuid: association.uuid,
          client_id: association.client_id,
          equipment_id: association.equipment_id,
          chip_id: association.chip_id,
          entry_date: association.entry_date,
          exit_date: association.exit_date,
          association_type_id: association.association_type_id,
          plan_id: association.plan_id,
          plan_gb: association.plan_gb || plan?.tamanho_gb || null,
          equipment_ssid: association.equipment_ssid,
          equipment_pass: association.equipment_pass,
          status: association.status,
          notes: association.notes,
          created_at: association.created_at,
          updated_at: association.updated_at,
          
          // Client data
          client_name: client?.nome || '',
          client_contato: client?.contato || 0,
          client_responsavel: client?.responsavel || '',
          client_empresa: client?.empresa || '',
          client_email: client?.email || null,
          
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
          association_type_name: associationType?.type || '',
          
          // Plan data
          plan_name: plan?.nome || null,
          plan_tamanho_gb: plan?.tamanho_gb || null,
        };
      })
      .filter(association => {
        // Aplicar filtros avançados que não puderam ser aplicados no SQL
        return this.applyAdvancedFilters(association, arguments[0], arguments[1]);
      });
  },

  applyAdvancedFilters(
    association: AssociationWithDetails, 
    filters: FilterOptions, 
    search: SearchOptions
  ): boolean {
    // Asset type filter
    if (filters.assetType === 'priority') {
      if (!association.equipment_solution_id || ![1, 2, 4].includes(association.equipment_solution_id)) {
        return false;
      }
    } else if (filters.assetType === 'others') {
      if (association.equipment_solution_id && [1, 2, 4].includes(association.equipment_solution_id)) {
        return false;
      }
    }

    // Manufacturer filter
    if (filters.manufacturer !== 'all') {
      if (association.chip_manufacturer_id !== filters.manufacturer) {
        return false;
      }
    }

    // Search filter
    if (search.query.trim()) {
      const searchTerm = search.query.toLowerCase();
      
      const matchesClient = search.searchType === 'all' || search.searchType === 'client' 
        ? association.client_name.toLowerCase().includes(searchTerm)
        : false;
        
      const matchesICCID = search.searchType === 'all' || search.searchType === 'iccid'
        ? association.chip_iccid?.toLowerCase().includes(searchTerm) || 
          association.chip_iccid?.slice(-6).includes(searchTerm)
        : false;
        
      const matchesRadio = search.searchType === 'all' || search.searchType === 'radio'
        ? association.equipment_radio?.toLowerCase().includes(searchTerm)
        : false;
        
      if (!(matchesClient || matchesICCID || matchesRadio)) {
        return false;
      }
    }

    return true;
  },

  async getFilterOptions() {
    // Cache estes dados pois são relativamente estáticos
    const [associationTypesResult, operatorsResult] = await Promise.all([
      supabase
        .from('association_types')
        .select('id, type')
        .is('deleted_at', null),
      supabase
        .from('manufacturers')
        .select('id, name')
        .eq('description', 'OPERADORA')
        .is('deleted_at', null)
    ]);

    return {
      associationTypes: associationTypesResult.data || [],
      operators: operatorsResult.data || []
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
