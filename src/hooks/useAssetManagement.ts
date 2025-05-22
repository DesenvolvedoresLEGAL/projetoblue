
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/utils/toast";
import { AssetFormValues } from "@/schemas/assetSchemas";
import { useNavigate } from "react-router-dom";

// Type for asset insert data
interface AssetInsertData {
  solution_id: number;
  status_id: number;
  manufacturer_id?: number;
  iccid?: string;
  line_number?: number;
  plan_id?: number;
  serial_number?: string;
  model?: string;
  radio?: string;
  admin_user?: string;
  admin_pass?: string;
  notes?: string;
}

// Types for queries and filtering
interface AssetFilters {
  status?: string;
  type?: string;
  search?: string;
  page?: number;
  limit?: number;
}

// Hook for creating a new asset
export const useCreateAsset = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const createAssetMutation = useMutation({
    mutationFn: async (formData: AssetFormValues) => {
      // Prepare the data for insertion based on solution type
      const data: AssetInsertData = {
        solution_id: formData.solution_id,
        status_id: formData.status_id || 1, // Default to Available (1)
        manufacturer_id: formData.manufacturer_id,
        notes: formData.notes
      };

      // Add fields specific to solution type
      if (formData.solution_id === 1) { // CHIP
        data.iccid = formData.iccid;
        data.line_number = formData.line_number 
          ? parseInt(formData.line_number.toString(), 10) 
          : undefined;
        data.plan_id = formData.plan_id;
      } else if (formData.solution_id === 2) { // ROUTER/EQUIPMENT
        data.serial_number = formData.serial_number;
        data.model = formData.model;
        data.radio = formData.radio;
        data.admin_user = formData.admin_user;
        data.admin_pass = formData.admin_pass;
      }

      // Insert the asset
      const { data: insertedData, error } = await supabase
        .from('assets')
        .insert(data)
        .select('*')
        .single();

      if (error) {
        console.error("Error creating asset:", error);
        throw new Error(`Failed to create asset: ${error.message}`);
      }

      return insertedData;
    },
    onSuccess: () => {
      // Invalidate assets queries to refetch the data
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      toast.success("Asset created successfully");
      navigate("/assets/inventory"); // Redirect to inventory
    },
    onError: (error: Error) => {
      console.error("Asset creation error:", error);
      toast.error(error.message);
    }
  });

  return createAssetMutation;
};

// Fix the deep type instantiation issue by using explicit string literals for query keys
export const useCheckAssetExists = (identifier: string, field: string) => {
  return useQuery({
    // Use explicitly defined array elements for queryKey
    queryKey: ['asset-exists', field, identifier],
    queryFn: async () => {
      if (!identifier || identifier.trim() === '') {
        return { exists: false, data: null };
      }

      const { data, error, count } = await supabase
        .from('assets')
        .select('*', { count: 'exact' })
        .eq(field, identifier)
        .is('deleted_at', null)
        .limit(1);

      if (error) {
        throw new Error(`Error checking if asset exists: ${error.message}`);
      }

      return { exists: (count || 0) > 0, data: data?.[0] || null };
    },
    enabled: !!identifier && identifier.trim() !== '',
  });
};

// Hook for fetching manufacturers
export const useManufacturers = () => {
  return useQuery({
    // Removed 'as const' to prevent deep type instantiation
    queryKey: ['manufacturers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('manufacturers')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Ensure all other hooks use simple array literals for query keys
export const useAssetSolutions = () => {
  return useQuery({
    queryKey: ['assetSolutions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('asset_solutions')
        .select('*')
        .order('solution', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useStatusRecords = () => {
  return useQuery({
    queryKey: ['statusRecords'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('asset_status')
        .select('*')
        .order('status', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const usePlans = () => {
  return useQuery({
    queryKey: ['plans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('plans')
        .select('id, nome')
        .order('nome', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });
};
