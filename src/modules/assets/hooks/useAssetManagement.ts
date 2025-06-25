import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/utils/toast';
import { Asset, AssetStatus, DatabaseAsset } from '@/types/asset';
import { mapDatabaseAssetToFrontend, mapAssetStatusToId } from '@/utils/databaseMappers';
import { AssetUpdateParams } from '../services/asset/types';

interface UpdateAssetStatusParams {
  id: string;
  status: AssetStatus;
}

export const useAssetManagement = () => {
  const queryClient = useQueryClient();

  const updateAssetStatusMutation = useMutation({
    mutationFn: async ({ id, status }: UpdateAssetStatusParams) => {
      const statusId = mapAssetStatusToId(status);
      const { data, error } = await supabase
        .from('assets')
        .update({ status_id: statusId })
        .eq('uuid', id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar status do asset:', error);
        throw new Error('Falha ao atualizar o status do ativo');
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      toast.success('Status do ativo atualizado com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const updateAssetMutation = useMutation({
    mutationFn: async ({ id, ...updates }: AssetUpdateParams) => {
      const dbUpdates = { ...updates };

      const { data, error } = await supabase
        .from('assets')
        .update(dbUpdates)
        .eq('uuid', id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar o asset:', error);
        throw new Error('Falha ao atualizar o ativo');
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      toast.success('Ativo atualizado com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const deleteAssetMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('assets')
        .update({ deleted_at: new Date().toISOString() })
        .eq('uuid', id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao deletar o asset:', error);
        throw new Error('Falha ao deletar o ativo');
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      toast.success('Ativo deletado com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const { data: assets = [], isLoading, error } = useQuery({
    queryKey: ['assets'],
    queryFn: async (): Promise<Asset[]> => {
      console.log('[useAssetManagement] Buscando assets...');
      
      const { data, error } = await supabase
        .from('assets')
        .select(`
          *,
          asset_status:status_id(
            id,
            status
          ),
          asset_solutions:solution_id(
            id, 
            solution
          ),
          manufacturers:manufacturer_id(
            id,
            name
          )
        `)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[useAssetManagement] Erro ao buscar assets:', error);
        throw error;
      }

      console.log('[useAssetManagement] Assets encontrados:', data?.length || 0);
      
      return data?.map(asset => {
        console.log('[useAssetManagement] Processando asset:', asset.uuid);
        
        try {
          // Verificar e converter tipos com validação
          const statusData = asset.asset_status as { id?: number; status?: string } | null;
          const solutionData = asset.asset_solutions as { id?: number; solution?: string } | null;
          const manufacturerData = asset.manufacturers as { id?: number; name?: string } | null;
          
          const processedAsset = {
            ...asset,
            asset_status: statusData,
            asset_solutions: solutionData,
            manufacturers: manufacturerData
          };
          
          return mapDatabaseAssetToFrontend(processedAsset);
        } catch (err) {
          console.error('[useAssetManagement] Erro ao processar asset:', asset.uuid, err);
          
          // Fallback com dados mínimos válidos
          const fallbackAsset: Asset = {
            id: asset.uuid || 'unknown',
            uuid: asset.uuid || 'unknown',
            type: asset.solution_id === 11 ? 'CHIP' : 'ROTEADOR',
            status: 'DISPONÍVEL',
            statusId: asset.status_id || 1,
            registrationDate: asset.created_at || new Date().toISOString(),
            solucao: (solutionData?.solution as any) || undefined,
            marca: (manufacturerData?.name as string) || '',
            modelo: asset.model || '',
            serial_number: asset.serial_number || '',
            radio: asset.radio || '',
            solution_id: asset.solution_id,
            manufacturer_id: asset.manufacturer_id,
            plan_id: asset.plan_id,
            rented_days: asset.rented_days || 0,
            admin_user: asset.admin_user || '',
            admin_pass: asset.admin_pass || '',
            ssid_fabrica: asset.ssid_fabrica || '',
            pass_fabrica: asset.pass_fabrica || '',
            admin_user_fabrica: asset.admin_user_fabrica || '',
            admin_pass_fabrica: asset.admin_pass_fabrica || '',
            ssid_atual: asset.ssid_atual || '',
            pass_atual: asset.pass_atual || '',
            created_at: asset.created_at,
            updated_at: asset.updated_at,
            deleted_at: asset.deleted_at
          } as Asset;
          
          // Adicionar campos específicos para CHIP
          if (fallbackAsset.type === 'CHIP') {
            (fallbackAsset as any).iccid = asset.iccid || '';
            (fallbackAsset as any).phoneNumber = asset.line_number?.toString() || '';
            (fallbackAsset as any).carrier = (manufacturerData?.name as string) || '';
            (fallbackAsset as any).line_number = asset.line_number;
          } else {
            // Campos específicos para ROTEADOR
            (fallbackAsset as any).uniqueId = asset.uuid;
            (fallbackAsset as any).brand = (manufacturerData?.name as string) || '';
            (fallbackAsset as any).model = asset.model || '';
            (fallbackAsset as any).ssid = asset.ssid_atual || '';
            (fallbackAsset as any).password = asset.pass_atual || '';
            (fallbackAsset as any).serialNumber = asset.serial_number || '';
            (fallbackAsset as any).adminUser = asset.admin_user || '';
            (fallbackAsset as any).adminPassword = asset.admin_pass || '';
          }
          
          return fallbackAsset;
        }
      }) || [];
    },
    retry: 2,
    staleTime: 5 * 60 * 1000,
  });

  return {
    assets,
    isLoading,
    error,
    updateAssetStatus: updateAssetStatusMutation.mutate,
    updateAsset: updateAssetMutation.mutate,
    deleteAsset: deleteAssetMutation.mutate,
    isUpdatingStatus: updateAssetStatusMutation.isPending,
    isUpdatingAsset: updateAssetMutation.isPending,
    isDeletingAsset: deleteAssetMutation.isPending,
  };
};
