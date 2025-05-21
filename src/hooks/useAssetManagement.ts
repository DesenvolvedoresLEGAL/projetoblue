
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/utils/toast";
import { z } from "zod";
import { AssetFormValues, ChipFormValues, EquipmentFormValues } from "@/schemas/assetSchemas";

// Reusable query keys
export const assetQueryKeys = {
  all: ['assets'] as const,
  list: () => [...assetQueryKeys.all, 'list'] as const,
  detail: (id: string) => [...assetQueryKeys.all, 'detail', id] as const,
  statuses: ['asset-statuses'] as const,
  manufacturers: ['manufacturers'] as const,
  solutions: ['asset-solutions'] as const,
  plans: ['plans'] as const,
};

// Hook for fetching asset statuses
export const useAssetStatuses = () => {
  return useQuery({
    queryKey: assetQueryKeys.statuses,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('asset_status')
        .select('id, status')
        .order('id', { ascending: true });
        
      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook for fetching manufacturers/operators
export const useManufacturers = () => {
  return useQuery({
    queryKey: assetQueryKeys.manufacturers,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('manufacturers')
        .select('id, name')
        .order('name', { ascending: true });
        
      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook for fetching asset solutions (types)
export const useAssetSolutions = () => {
  return useQuery({
    queryKey: assetQueryKeys.solutions,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('asset_solutions')
        .select('id, solution')
        .order('solution', { ascending: true });
        
      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook for fetching plans (for chips)
export const usePlans = () => {
  return useQuery({
    queryKey: assetQueryKeys.plans,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('plans')
        .select('id, nome')
        .order('nome', { ascending: true });
        
      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook for checking if an asset exists (ICCID or Serial Number)
export const useCheckAssetExists = (field: string, value: string) => {
  return useQuery({
    queryKey: ['assets', 'exists', field, value] as const,
    queryFn: async () => {
      if (!value) return { exists: false };
      
      const { data, error } = await supabase
        .from('assets')
        .select('uuid')
        .eq(field, value)
        .maybeSingle();
        
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      return { exists: !!data, existingId: data?.uuid };
    },
    enabled: !!value && value.length > 3,
    staleTime: 0, // Always revalidate this query
  });
};

// Hook for creating an asset
export const useCreateAsset = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: AssetFormValues) => {
      // Determine if this is a chip based on solution_id
      const isChip = data.solution_id === 1 || data.solution_id === 11;
      
      // Common fields for both asset types
      const insertData: Record<string, any> = {
        solution_id: data.solution_id,
        status_id: data.status_id || 1, // Default to 'Disponível'
        manufacturer_id: data.manufacturer_id,
        notes: data.notes
      };
      
      // Add type-specific fields
      if (isChip) {
        // Type assertion to access chip-specific fields
        const chipData = data as ChipFormValues;
        insertData.iccid = chipData.iccid;
        insertData.line_number = chipData.line_number;
        insertData.plan_id = chipData.plan_id;
      } else {
        // Type assertion to access equipment-specific fields
        const equipmentData = data as EquipmentFormValues;
        insertData.serial_number = equipmentData.serial_number;
        insertData.model = equipmentData.model;
        insertData.radio = equipmentData.radio;
        
        // Optional fields for equipment
        insertData.admin_user = equipmentData.admin_user || 'admin';
        insertData.admin_pass = equipmentData.admin_pass || '';
        insertData.password = equipmentData.password; // WiFi password
        insertData.ssid = equipmentData.ssid;
      }
      
      // Insert the asset
      const { data: newAsset, error } = await supabase
        .from('assets')
        .insert(insertData)
        .select()
        .single();
        
      if (error) {
        throw new Error(`Erro ao cadastrar ativo: ${error.message}`);
      }
      
      return newAsset;
    },
    onSuccess: () => {
      // Invalidate assets queries to refresh the data
      queryClient.invalidateQueries({ queryKey: assetQueryKeys.list() });
      toast.success("Ativo cadastrado com sucesso!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });
};

// Hook for listing assets with filters
export const useAssetsList = (filters?: {
  searchTerm?: string;
  filterType?: string | number;
  filterStatus?: string | number;
  page?: number;
  pageSize?: number;
}) => {
  const { searchTerm = '', filterType, filterStatus, page = 1, pageSize = 10 } = filters || {};
  
  return useQuery({
    queryKey: [...assetQueryKeys.list(), { searchTerm, filterType, filterStatus, page, pageSize }],
    queryFn: async () => {
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
          notes,
          password,
          ssid,
          manufacturer:manufacturers(id, name),
          plano:plans(id, nome),
          status:asset_status(id, status),
          solucao:asset_solutions(id, solution)
        `)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filterType) {
        if (typeof filterType === 'number') {
          query = query.eq('solution_id', filterType);
        } else {
          // Find solution ID by name
          const { data: solutionData } = await supabase
            .from('asset_solutions')
            .select('id')
            .eq('solution', filterType)
            .single();
            
          if (solutionData) {
            query = query.eq('solution_id', solutionData.id);
          }
        }
      }

      if (filterStatus) {
        if (typeof filterStatus === 'number') {
          query = query.eq('status_id', filterStatus);
        } else {
          // Find status ID by name
          const { data: statusData } = await supabase
            .from('asset_status')
            .select('id')
            .eq('status', filterStatus)
            .single();
            
          if (statusData) {
            query = query.eq('status_id', statusData.id);
          }
        }
      }

      if (searchTerm) {
        // Search in multiple fields
        query = query.or(
          `iccid.ilike.%${searchTerm}%,radio.ilike.%${searchTerm}%,serial_number.ilike.%${searchTerm}%,model.ilike.%${searchTerm}%`
        );
      }

      // Add pagination
      const startIndex = (page - 1) * pageSize;
      query = query.range(startIndex, startIndex + pageSize - 1);

      const { data, error, count } = await query;

      if (error) {
        throw new Error(`Erro ao carregar ativos: ${error.message}`);
      }

      // Get total count for pagination
      const { count: totalCount } = await supabase
        .from('assets')
        .select('uuid', { count: 'exact', head: true })
        .is('deleted_at', null);

      return {
        assets: data || [],
        totalCount: totalCount || 0,
        totalPages: Math.ceil((totalCount || 0) / pageSize)
      };
    },
    staleTime: 60 * 1000 // 1 minute
  });
};
