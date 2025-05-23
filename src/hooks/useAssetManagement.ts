
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/utils/toast";
import { Asset, AssetStatus, AssetType } from "@/types/asset";

// Types for asset operations
interface CreateAssetData {
  type: AssetType;
  statusId?: number;
  notes?: string;
  // CHIP specific fields
  iccid?: string;
  phoneNumber?: string;
  carrier?: string;
  // ROUTER specific fields
  uniqueId?: string;
  brand?: string;
  model?: string;
  ssid?: string;
  password?: string;
  serialNumber?: string;
  radio?: string;
  // Database fields
  manufacturer_id?: number;
  plan_id?: number;
  admin_user?: string;
  admin_pass?: string;
}

interface UpdateAssetData {
  statusId?: number;
  notes?: string;
  // Common updatable fields
  iccid?: string;
  phoneNumber?: string;
  brand?: string;
  model?: string;
  serialNumber?: string;
  radio?: string;
  manufacturer_id?: number;
  plan_id?: number;
  admin_user?: string;
  admin_pass?: string;
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
    list: (filters: AssetFilters) => [...assetKeys.lists(), filters] as const,
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
        solution_id: assetData.type === 'CHIP' ? 11 : 2,
        status_id: assetData.statusId || 1,
        model: assetData.model,
        serial_number: assetData.serialNumber,
        iccid: assetData.iccid,
        line_number: assetData.phoneNumber ? parseInt(assetData.phoneNumber, 10) : null,
        manufacturer_id: assetData.manufacturer_id,
        plan_id: assetData.plan_id,
        radio: assetData.radio,
        admin_user: assetData.admin_user || 'admin',
        admin_pass: assetData.admin_pass || '',
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
      if (data.phoneNumber !== undefined) updateData.line_number = parseInt(data.phoneNumber, 10);
      if (data.model !== undefined) updateData.model = data.model;
      if (data.serialNumber !== undefined) updateData.serial_number = data.serialNumber;
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
 * Transform database record to frontend Asset type
 */
function mapDbToAsset(dbAsset: any): Asset {
  const baseAsset = {
    id: dbAsset.uuid,
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
