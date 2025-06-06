import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/utils/toast";
import { Asset, AssetStatus, AssetType } from "@/types/asset";
import { referenceDataService } from "@modules/assets/services/referenceDataService";

// Types for asset operations
interface CreateAssetData {
  type: AssetType;
  solution_id: number; // Obrigatório no banco
  status_id?: number;
  manufacturer_id?: number;
  plan_id?: number;
  notes?: string;
  
  // CHIP specific fields
  iccid?: string;
  line_number?: number; // Corrigido para number apenas
  
  // ROUTER specific fields
  serial_number?: string;
  model?: string;
  radio?: string;
  admin_user?: string;
  admin_pass?: string;
  
  // Common fields
  rented_days?: number;
  
  // Campos de configurações de rede - Fábrica (obrigatórios para equipamentos)
  ssid_fabrica?: string;
  pass_fabrica?: string;
  admin_user_fabrica?: string;
  admin_pass_fabrica?: string;
  
  // Campos de configurações de rede - Atuais (opcionais)
  ssid_atual?: string;
  pass_atual?: string;
}

interface UpdateAssetData {
  statusId?: number;
  notes?: string;
  
  // CHIP fields
  iccid?: string;
  line_number?: number; // Corrigido para number apenas
  
  // ROUTER fields
  serial_number?: string;
  model?: string;
  radio?: string;
  manufacturer_id?: number;
  plan_id?: number;
  admin_user?: string;
  admin_pass?: string;
  
  // Common fields
  rented_days?: number;
  
  // Campos removidos que não existem no banco:
  // phoneNumber, carrier, uniqueId, brand, ssid, password, serialNumber
}

interface AssetFilters {
  type?: AssetType;
  status?: AssetStatus;
  search?: string;
  statusId?: number;
  manufacturerId?: number;
}

/**
 * Modern asset management hook providing CRUD operations and data fetching
 * Uses React Query for efficient caching and state management
 */
export function useAssetManagement() {
  const queryClient = useQueryClient();

  // Core query key factory for consistent cache management
  const assetKeys = {
    all: ['assets'] as const,
    lists: () => [...assetKeys.all, 'list'] as const,
    list: (filters: AssetFilters) => [...assetKeys.lists(), { ...filters }] as const,
    details: () => [...assetKeys.all, 'detail'] as const,
    detail: (id: string) => [...assetKeys.details(), id] as const,
  };

  /**
   * Fetch all assets with optional filtering
   */
  const useAssets = (filters: AssetFilters = {}) => {
    return useQuery({
      queryKey: assetKeys.list(filters),
      queryFn: async () => {
        let query = supabase
          .from('assets')
          .select(`
            uuid, serial_number, model, iccid, solution_id, status_id, 
            line_number, radio, manufacturer_id, created_at, updated_at,
            manufacturers(id, name),
            asset_status(id, status),
            asset_solutions(id, solution)
          `)
          .is('deleted_at', null);

        // Apply filters
        if (filters.statusId) {
          query = query.eq('status_id', filters.statusId);
        }
        
        if (filters.manufacturerId) {
          query = query.eq('manufacturer_id', filters.manufacturerId);
        }

        if (filters.search) {
          const searchTerm = `%${filters.search}%`;
          query = query.or(`iccid.ilike.${searchTerm},serial_number.ilike.${searchTerm},model.ilike.${searchTerm}`);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching assets:', error);
          throw new Error(error.message);
        }

        // Transform database records to Asset type
        return (data || []).map(mapDbToAsset);
      },
    });
  };

  /**
   * Fetch single asset by ID
   */
  const useAsset = (id: string) => {
    return useQuery({
      queryKey: assetKeys.detail(id),
      queryFn: async () => {
        const { data, error } = await supabase
          .from('assets')
          .select(`
            uuid, serial_number, model, iccid, solution_id, status_id,
            line_number, radio, manufacturer_id, created_at, updated_at,
            manufacturers(id, name),
            asset_status(id, status),
            asset_solutions(id, solution)
          `)
          .eq('uuid', id)
          .is('deleted_at', null)
          .single();

        if (error) {
          console.error(`Error fetching asset ${id}:`, error);
          throw new Error(error.message);
        }

        return mapDbToAsset(data);
      },
      enabled: !!id,
    });
  };

  /**
   * Create new asset mutation
   */
  const createAsset = useMutation({
    mutationFn: async (assetData: CreateAssetData) => {
      const dbData = {
        solution_id: assetData.solution_id,
        status_id: assetData.status_id || 1,
        manufacturer_id: assetData.manufacturer_id,
        plan_id: assetData.plan_id,
        notes: assetData.notes,
        
        // CHIP fields
        iccid: assetData.iccid,
        line_number: assetData.line_number,
        
        // ROUTER fields
        serial_number: assetData.serial_number,
        model: assetData.model,
        radio: assetData.radio,
        admin_user: assetData.admin_user || 'admin',
        admin_pass: assetData.admin_pass || '',
        
        // Common fields
        rented_days: assetData.rented_days || 0,
        
        // Campos de configurações de rede - Fábrica
        ssid_fabrica: assetData.ssid_fabrica,
        pass_fabrica: assetData.pass_fabrica,
        admin_user_fabrica: assetData.admin_user_fabrica,
        admin_pass_fabrica: assetData.admin_pass_fabrica,
        
        // Campos de configurações de rede - Atuais
        ssid_atual: assetData.ssid_atual,
        pass_atual: assetData.pass_atual,
      };

      const { data, error } = await supabase
        .from('assets')
        .insert(dbData)
        .select('uuid')
        .single();

      if (error) {
        console.error('Error creating asset:', error);
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assetKeys.all });
      toast.success('Asset criado com sucesso');
    },
    onError: (error: Error) => {
      console.error('Asset creation failed:', error);
      toast.error(`Erro ao criar asset: ${error.message}`);
    },
  });

  /**
   * Update asset mutation
   */
  const updateAsset = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateAssetData }) => {
      const updateData: any = {};

      // Map frontend fields to database fields
      if (data.statusId !== undefined) updateData.status_id = data.statusId;
      if (data.iccid !== undefined) updateData.iccid = data.iccid;
      if (data.line_number !== undefined) updateData.line_number = data.line_number;
      if (data.model !== undefined) updateData.model = data.model;
      if (data.serial_number !== undefined) updateData.serial_number = data.serial_number;
      if (data.radio !== undefined) updateData.radio = data.radio;
      if (data.manufacturer_id !== undefined) updateData.manufacturer_id = data.manufacturer_id;
      if (data.plan_id !== undefined) updateData.plan_id = data.plan_id;
      if (data.admin_user !== undefined) updateData.admin_user = data.admin_user;
      if (data.admin_pass !== undefined) updateData.admin_pass = data.admin_pass;

      const { error } = await supabase
        .from('assets')
        .update(updateData)
        .eq('uuid', id);

      if (error) {
        console.error(`Error updating asset ${id}:`, error);
        throw new Error(error.message);
      }

      return { id };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: assetKeys.all });
      queryClient.invalidateQueries({ queryKey: assetKeys.detail(data.id) });
      toast.success('Asset atualizado com sucesso');
    },
    onError: (error: Error) => {
      console.error('Asset update failed:', error);
      toast.error(`Erro ao atualizar asset: ${error.message}`);
    },
  });

  /**
   * Delete asset mutation (soft delete)
   */
  const deleteAsset = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('assets')
        .update({ deleted_at: new Date().toISOString() })
        .eq('uuid', id);

      if (error) {
        console.error(`Error deleting asset ${id}:`, error);
        throw new Error(error.message);
      }

      return { id };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: assetKeys.all });
      queryClient.removeQueries({ queryKey: assetKeys.detail(data.id) });
      toast.success('Asset excluído com sucesso');
    },
    onError: (error: Error) => {
      console.error('Asset deletion failed:', error);
      toast.error(`Erro ao excluir asset: ${error.message}`);
    },
  });

  /**
   * Update asset status mutation
   */
  const updateAssetStatus = useMutation({
    mutationFn: async ({ id, statusId }: { id: string; statusId: number }) => {
      const { error } = await supabase
        .from('assets')
        .update({ status_id: statusId })
        .eq('uuid', id);

      if (error) {
        console.error(`Error updating asset status ${id}:`, error);
        throw new Error(error.message);
      }

      return { id, statusId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: assetKeys.all });
      queryClient.invalidateQueries({ queryKey: assetKeys.detail(data.id) });
      toast.success('Status atualizado com sucesso');
    },
    onError: (error: Error) => {
      console.error('Status update failed:', error);
      toast.error(`Erro ao atualizar status: ${error.message}`);
    },
  });

  return {
    // Query hooks
    useAssets,
    useAsset,
    
    // Mutation hooks
    createAsset,
    updateAsset,
    deleteAsset,
    updateAssetStatus,
    
    // Query keys for external cache management
    assetKeys,
  };
}

/**
 * Hook for creating assets with convenience wrapper around useMutation
 */
export function useCreateAsset() {
  const { createAsset } = useAssetManagement();
  return createAsset;
}

/**
 * Hook to fetch all available manufacturers
 */
export function useManufacturers() {
  return useQuery({
    queryKey: ['manufacturers'],
    queryFn: async () => {
      return await referenceDataService.getManufacturers();
    }
  });
}

/**
 * Hook to fetch all available asset solutions (types)
 */
export function useAssetSolutions() {
  return useQuery({
    queryKey: ['assetSolutions'],
    queryFn: async () => {
      return await referenceDataService.getAssetSolutions();
    }
  });
}

/**
 * Hook to fetch all available asset status options
 */
export function useStatusRecords() {
  return useQuery({
    queryKey: ['statusRecords'],
    queryFn: async () => {
      return await referenceDataService.getStatusRecords();
    }
  });
}

/**
 * Hook to fetch all available data plans
 */
export function usePlans() {
  return useQuery({
    queryKey: ['plans'],
    queryFn: async () => {
      const { data, error } = await supabase.from('plans').select('*').is('deleted_at', null);
      
      if (error) {
        console.error("Error fetching plans:", error);
        toast.error("Failed to fetch plans");
        return [];
      }
      
      return data || [];
    }
  });
}

/**
 * Transform database record to frontend Asset type
 */
function mapDbToAsset(dbAsset: any): Asset {
  const baseAsset = {
    id: dbAsset.uuid,
    uuid: dbAsset.uuid,
    registrationDate: dbAsset.created_at,
    status: dbAsset.asset_status?.status || "DISPONÍVEL" as const,
    statusId: dbAsset.status_id,
    notes: dbAsset.notes,
    solucao: dbAsset.asset_solutions?.solution,
    marca: dbAsset.manufacturers?.name,
    modelo: dbAsset.model,
    serial_number: dbAsset.serial_number,
    radio: dbAsset.radio,
  };

  if (dbAsset.solution_id === 11) {
    // CHIP asset
    return {
      ...baseAsset,
      type: "CHIP",
      iccid: dbAsset.iccid || '',
      phoneNumber: dbAsset.line_number?.toString() || '',
      carrier: "Unknown",
    };
  } else {
    // ROUTER asset
    return {
      ...baseAsset,
      type: "ROTEADOR",
      uniqueId: dbAsset.uuid,
      brand: dbAsset.manufacturers?.name || '',
      model: dbAsset.model || '',
      ssid: '',
      password: '',
      serialNumber: dbAsset.serial_number || '',
      adminUser: dbAsset.admin_user,
      adminPassword: dbAsset.admin_pass,
    };
  }
}

// Export the main hook and utility hooks
export default useAssetManagement;
