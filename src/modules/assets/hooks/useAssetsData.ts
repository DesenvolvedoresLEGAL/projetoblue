
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Asset, ChipAsset, EquipamentAsset } from '@/types/asset';

// Estrutura de dados para mapeamento de tipos
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

// Função auxiliar para transformar dados do banco em tipos Asset
const transformDatabaseAsset = (dbAsset: DatabaseAsset): Asset => {
  // Determinar o tipo baseado no solution_id
  const isChip = dbAsset.solution_id === 11;

  if (isChip) {
    const chipAsset: ChipAsset = {
      id: dbAsset.uuid,
      uuid: dbAsset.uuid,
      type: 'CHIP',
      registrationDate: dbAsset.created_at,
      status: (dbAsset.status?.status || 'DISPONÍVEL') as any,
      statusId: dbAsset.status_id,
      notes: dbAsset.notes || '',
      solucao: dbAsset.solucao?.solution || '',
      marca: dbAsset.manufacturer?.name || '',
      modelo: dbAsset.model || '',
      serial_number: dbAsset.serial_number || '',
      iccid: dbAsset.iccid || '',
      phoneNumber: dbAsset.line_number?.toString() || '',
      carrier: 'Unknown', // Campo padrão para chips
    };
    return chipAsset;
  } else {
    const equipmentAsset: EquipamentAsset = {
      id: dbAsset.uuid,
      uuid: dbAsset.uuid,
      type: 'ROTEADOR',  // Assumindo que não-chips são roteadores
      registrationDate: dbAsset.created_at,
      status: (dbAsset.status?.status || 'DISPONÍVEL') as any,
      statusId: dbAsset.status_id,
      notes: dbAsset.notes || '',
      solucao: dbAsset.solucao?.solution || '',
      marca: dbAsset.manufacturer?.name || '',
      modelo: dbAsset.model || '',
      serial_number: dbAsset.serial_number || '',
      radio: dbAsset.radio || '',
      uniqueId: dbAsset.uuid,
      brand: dbAsset.manufacturer?.name || '',
      model: dbAsset.model || '',  // Usando 'model' que existe no EquipamentAsset
      ssid: dbAsset.ssid_atual || '',
      password: dbAsset.pass_atual || '',
      serialNumber: dbAsset.serial_number || '',
      adminUser: dbAsset.admin_user || '',
      adminPassword: dbAsset.admin_pass || '',
    };
    return equipmentAsset;
  }
};

// Hook principal para buscar dados de ativos
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
    staleTime: 30 * 1000, // 30 segundos
    gcTime: 5 * 60 * 1000, // 5 minutos
  });
};

// Hook para buscar um ativo específico
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

      return data ? transformDatabaseAsset(data as DatabaseAsset) : null;
    },
    enabled: !!assetId,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

// Hook para buscar ativos com filtros específicos
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

      // Aplicar filtros
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

// Hook para buscar estatísticas de ativos
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
        available: data?.filter(a => a.status_id === 1).length || 0, // Assumindo que status_id 1 = disponível
        rented: data?.filter(a => a.status_id === 2).length || 0, // Assumindo que status_id 2 = alugado
      };

      return stats;
    },
    staleTime: 60 * 1000, // 1 minuto
    gcTime: 5 * 60 * 1000,
  });
};
