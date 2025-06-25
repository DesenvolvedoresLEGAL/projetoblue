import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/utils/toast';
import { Asset, AssetStatus, SolutionType } from '@/types/asset';
import { CreateAssetData, AssetUpdateParams } from '@modules/assets/services/asset/types';

export const useAssetManagement = () => {
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const createAssetMutation = useMutation({
    mutationFn: async (newAsset: CreateAssetData) => {
      setIsCreating(true);
      console.log('Criando novo asset:', newAsset);

      const { data, error } = await supabase
        .from('assets')
        .insert([newAsset])
        .select();

      if (error) {
        console.error('Erro ao criar asset:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      toast.success('Asset criado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    },
    onError: (error: any) => {
      console.error('Erro ao criar asset:', error);
      toast.error('Erro ao criar asset');
    },
    onSettled: () => {
      setIsCreating(false);
    },
  });

  const updateAssetMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: AssetUpdateParams }) => {
      setIsUpdating(true);
      console.log(`Atualizando asset com ID ${id} com os seguintes dados:`, updates);

      const { data, error } = await supabase
        .from('assets')
        .update(updates)
        .eq('uuid', id)
        .select();

      if (error) {
        console.error(`Erro ao atualizar asset com ID ${id}:`, error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      toast.success('Asset atualizado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    },
    onError: (error: any) => {
      console.error('Erro ao atualizar asset:', error);
      toast.error('Erro ao atualizar asset');
    },
    onSettled: () => {
      setIsUpdating(false);
    },
  });

  const deleteAssetMutation = useMutation({
    mutationFn: async (id: string) => {
      setIsDeleting(true);
      console.log(`Deletando asset com ID ${id}`);

      const { data, error } = await supabase
        .from('assets')
        .delete()
        .eq('uuid', id);

      if (error) {
        console.error(`Erro ao deletar asset com ID ${id}:`, error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      toast.success('Asset deletado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    },
    onError: (error: any) => {
      console.error('Erro ao deletar asset:', error);
      toast.error('Erro ao deletar asset');
    },
    onSettled: () => {
      setIsDeleting(false);
    },
  });

  const mapDatabaseAssetToAsset = (dbAsset: any): Asset => {
    const baseAsset = {
      id: dbAsset.uuid,
      uuid: dbAsset.uuid,
      registrationDate: dbAsset.created_at,
      status: dbAsset.status?.status || 'Desconhecido',
      statusId: dbAsset.status_id,
      notes: dbAsset.notes || '',
      solucao: dbAsset.solucao?.solution || 'Desconhecido',
      marca: dbAsset.manufacturer?.name || 'Desconhecido',
      modelo: dbAsset.model || '',
      serial_number: dbAsset.serial_number || '',
      radio: dbAsset.radio || '',
    };

    if (dbAsset.solution_id === 1) { // CHIP
      return {
        type: 'CHIP' as const,
        iccid: dbAsset.iccid || '',
        phoneNumber: dbAsset.line_number?.toString() || '',
        carrier: 'Operadora',
        ...baseAsset,
        solucao: dbAsset.solucao?.solution || 'CHIP' as any,
      };
    } else { // EQUIPMENT
      return {
        type: 'EQUIPMENT' as const,
        uniqueId: dbAsset.uuid,
        brand: dbAsset.manufacturer?.name || 'Desconhecido',
        model: dbAsset.model || '',
        ssid: dbAsset.ssid_atual || '',
        password: dbAsset.pass_atual || '',
        serialNumber: dbAsset.serial_number || '',
        adminUser: dbAsset.admin_user || '',
        adminPassword: dbAsset.admin_pass || '',
        ...baseAsset,
        solucao: dbAsset.solucao?.solution || 'EQUIPMENT' as any,
      };
    }
  };

  const handleCreateAsset = useCallback(
    async (newAsset: CreateAssetData) => {
      try {
        await createAssetMutation.mutateAsync(newAsset);
      } catch (error) {
        console.error('Erro ao criar asset:', error);
        toast.error('Erro ao criar asset');
      }
    },
    [createAssetMutation]
  );

  const handleUpdateAsset = useCallback(
    async (id: string, updates: AssetUpdateParams) => {
      try {
        await updateAssetMutation.mutateAsync({ id, updates });
      } catch (error) {
        console.error('Erro ao atualizar asset:', error);
        toast.error('Erro ao atualizar asset');
      }
    },
    [updateAssetMutation]
  );

  const handleDeleteAsset = useCallback(
    async (id: string) => {
      try {
        await deleteAssetMutation.mutateAsync(id);
      } catch (error) {
        console.error('Erro ao deletar asset:', error);
        toast.error('Erro ao deletar asset');
      }
    },
    [deleteAssetMutation]
  );

  return {
    createAsset: handleCreateAsset,
    updateAsset: handleUpdateAsset,
    deleteAsset: handleDeleteAsset,
    isCreatingAsset: isCreating,
    isUpdatingAsset: isUpdating,
    isDeletingAsset: isDeleting,
    mapDatabaseAssetToAsset
  };
};
