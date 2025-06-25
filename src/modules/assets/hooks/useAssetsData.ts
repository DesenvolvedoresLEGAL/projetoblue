
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Asset, ChipAsset, EquipamentAsset, AssetStatus } from '@/types/asset';
import { AssetWithRelations } from '@/types/assetWithRelations';

// Database structure interface  
interface DatabaseAsset {
  uuid: string;
  model: string;
  rented_days: number;
  serial_number: string;
  line_number: number;
  iccid: string;
  radio: string;
  created_at: string;
  updated_at: string;
  admin_user: string;
  admin_pass: string;
  notes: string;
  ssid_atual: string;
  pass_atual: string;
  ssid_fabrica: string;
  pass_fabrica: string;
  admin_user_fabrica: string;
  admin_pass_fabrica: string;
  plan_id: number;
  manufacturer_id: number;
  status_id: number;
  solution_id: number;
  solucao: {
    id: number;
    solution: string;
  };
  manufacturer: {
    id: number;
    name: string;
  };
  status: {
    id: number;
    status: string;
  };
}

// Transform database record to frontend Asset type
const transformDatabaseAsset = (dbAsset: DatabaseAsset): Asset => {
  // Determine type based on solution_id
  const isChip = dbAsset.solution_id === 11;

  if (isChip) {
    const chipAsset: ChipAsset = {
      id: dbAsset.uuid,
      uuid: dbAsset.uuid,
      type: 'CHIP' as const,
      registrationDate: dbAsset.created_at,
      status: (dbAsset.status?.status || 'DISPONÍVEL') as AssetStatus,
      statusId: dbAsset.status_id,
      notes: dbAsset.notes || '',
      solucao: dbAsset.solucao?.solution || '',
      marca: dbAsset.manufacturer?.name || '',
      modelo: dbAsset.model || '',
      serial_number: dbAsset.serial_number || '',
      iccid: dbAsset.iccid || '',
      phoneNumber: dbAsset.line_number?.toString() || '',
      carrier: 'Unknown', // Default for chips
    };
    return chipAsset;
  } else {
    const equipmentAsset: EquipamentAsset = {
      id: dbAsset.uuid,
      uuid: dbAsset.uuid,
      type: 'ROTEADOR' as const,  
      registrationDate: dbAsset.created_at,
      status: (dbAsset.status?.status || 'DISPONÍVEL') as AssetStatus,
      statusId: dbAsset.status_id,
      notes: dbAsset.notes || '',
      solucao: dbAsset.solucao?.solution || '',
      marca: dbAsset.manufacturer?.name || '',
      modelo: dbAsset.model || '',
      serial_number: dbAsset.serial_number || '',
      radio: dbAsset.radio || '',
      uniqueId: dbAsset.uuid,
      brand: dbAsset.manufacturer?.name || '',
      model: dbAsset.model || '',
      ssid: dbAsset.ssid_atual || '',
      password: dbAsset.pass_atual || '',
      serialNumber: dbAsset.serial_number || '',
      adminUser: dbAsset.admin_user || '',
      adminPassword: dbAsset.admin_pass || '',
    };
    return equipmentAsset;
  }
};

// Transform database record to AssetWithRelations
const transformToAssetWithRelations = (dbAsset: any): AssetWithRelations => {
  return {
    uuid: dbAsset.uuid,
    model: dbAsset.model,
    rented_days: dbAsset.rented_days,
    serial_number: dbAsset.serial_number,
    line_number: dbAsset.line_number,
    iccid: dbAsset.iccid,
    radio: dbAsset.radio,
    created_at: dbAsset.created_at,
    updated_at: dbAsset.updated_at,
    admin_user: dbAsset.admin_user,
    admin_pass: dbAsset.admin_pass,
    notes: dbAsset.notes,
    ssid_atual: dbAsset.ssid_atual,
    pass_atual: dbAsset.pass_atual,
    ssid_fabrica: dbAsset.ssid_fabrica,
    pass_fabrica: dbAsset.pass_fabrica,
    admin_user_fabrica: dbAsset.admin_user_fabrica,
    admin_pass_fabrica: dbAsset.admin_pass_fabrica,
    plan_id: dbAsset.plan_id,
    manufacturer_id: dbAsset.manufacturer_id,
    status_id: dbAsset.status_id,
    solution_id: dbAsset.solution_id,
    solucao: {
      id: dbAsset.solucao?.id || dbAsset.solution_id,
      name: dbAsset.solucao?.solution || 'Unknown'
    },
    manufacturer: {
      id: dbAsset.manufacturer?.id || dbAsset.manufacturer_id,
      name: dbAsset.manufacturer?.name || 'Unknown'
    },
    status: {
      id: dbAsset.status?.id || dbAsset.status_id,
      name: dbAsset.status?.status || 'DISPONÍVEL'
    }
  };
};

// Hook to fetch all assets
export const useAssetsData = () => {
  return useQuery({
    queryKey: ['assets-data'],
    queryFn: async (): Promise<Asset[]> => {
      const { data, error } = await supabase
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
          status:asset_status!inner(id, status)
        `)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching assets data:', error);
        throw error;
      }

      return (data || []).map(transformDatabaseAsset);
    },
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to fetch assets with relations (for components that need full data)
export const useAssetsWithRelations = () => {
  return useQuery({
    queryKey: ['assets-with-relations'],
    queryFn: async (): Promise<AssetWithRelations[]> => {
      const { data, error } = await supabase
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
          status:asset_status!inner(id, status)
        `)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching assets with relations:', error);
        throw error;
      }

      return (data || []).map(transformToAssetWithRelations);
    },
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

// Hook to fetch single asset
export const useAssetData = (assetId: string) => {
  return useQuery({
    queryKey: ['asset-data', assetId],
    queryFn: async (): Promise<Asset | null> => {
      if (!assetId) return null;

      const { data, error } = await supabase
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
          status:asset_status!inner(id, status)
        `)
        .eq('uuid', assetId)
        .is('deleted_at', null)
        .single();

      if (error) {
        console.error(`Error fetching asset data for ${assetId}:`, error);
        throw error;
      }

      return data ? transformDatabaseAsset(data as unknown as DatabaseAsset) : null;
    },
    enabled: !!assetId,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

// Hook to fetch filtered assets
export const useFilteredAssetsData = (filters: {
  type?: 'CHIP' | 'ROTEADOR';
  status?: string;
  search?: string;
}) => {
  return useQuery({
    queryKey: ['filtered-assets-data', filters],
    queryFn: async (): Promise<Asset[]> => {
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
          status:asset_status!inner(id, status)
        `)
        .is('deleted_at', null);

      // Apply filters
      if (filters.type === 'CHIP') {
        query = query.eq('solution_id', 11);
      } else if (filters.type === 'ROTEADOR') {
        query = query.neq('solution_id', 11);
      }

      if (filters.search) {
        const searchTerm = `%${filters.search}%`;
        query = query.or(`iccid.ilike.${searchTerm},serial_number.ilike.${searchTerm},model.ilike.${searchTerm},radio.ilike.${searchTerm}`);
      }

      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching filtered assets data:', error);
        throw error;
      }

      return (data || []).map(transformDatabaseAsset);
    },
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

// Hook to fetch asset stats
export const useAssetsStats = () => {
  return useQuery({
    queryKey: ['assets-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('assets')
        .select('solution_id, status_id')
        .is('deleted_at', null);

      if (error) {
        console.error('Error fetching assets stats:', error);
        throw error;
      }

      const stats = {
        total: data?.length || 0,
        chips: data?.filter(a => a.solution_id === 11).length || 0,
        routers: data?.filter(a => a.solution_id !== 11).length || 0,
        available: data?.filter(a => a.status_id === 1).length || 0, // Assuming status_id 1 = available
        rented: data?.filter(a => a.status_id === 2).length || 0, // Assuming status_id 2 = rented
      };

      return stats;
    },
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000,
  });
};

// Export the AssetWithRelations type for other components
export type { AssetWithRelations };
