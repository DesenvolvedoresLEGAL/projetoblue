
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Asset } from '@/types/asset';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/utils/toast';
import { showFriendlyError } from '@/utils/errorTranslator';

export const useAssetManagement = () => {
  const queryClient = useQueryClient();

  const updateAssetMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Asset> }) => {
      console.log('Atualizando asset:', id, data);
      
      const { data: updatedAsset, error } = await supabase
        .from('assets')
        .update(data)
        .eq('uuid', id)
        .select()
        .single();

      if (error) throw error;
      return updatedAsset;
    },
    onSuccess: (updatedAsset) => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      toast.success('Ativo atualizado com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao atualizar ativo:', error);
      showFriendlyError(error);
    },
  });

  const deleteAssetMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log('Deletando asset:', id);
      
      const { error } = await supabase
        .from('assets')
        .update({ deleted_at: new Date().toISOString() })
        .eq('uuid', id);

      if (error) throw error;
      return id;
    },
    onSuccess: (deletedId) => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      toast.success('Ativo removido com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao deletar ativo:', error);
      if (error?.message?.includes('foreign key constraint')) {
        showFriendlyError(null, 'Não foi possível excluir este ativo pois ele está vinculado a outros registros.');
      } else {
        showFriendlyError(error);
      }
    },
  });

  return {
    updateAssetMutation,
    deleteAssetMutation,
  };
};

// Add missing exports
export const useManufacturers = () => {
  return useQuery({
    queryKey: ['manufacturers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('manufacturers')
        .select('*')
        .is('deleted_at', null);
      
      if (error) throw error;
      return data || [];
    }
  });
};

export const useAssetSolutions = () => {
  return useQuery({
    queryKey: ['asset-solutions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('asset_solutions')
        .select('*')
        .is('deleted_at', null);
      
      if (error) throw error;
      return data || [];
    }
  });
};

export const useStatusRecords = () => {
  return useQuery({
    queryKey: ['status-records'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('asset_status')
        .select('*')
        .is('deleted_at', null);
      
      if (error) throw error;
      return data || [];
    }
  });
};

export const useCreateAsset = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (assetData: any) => {
      const { data, error } = await supabase
        .from('assets')
        .insert([assetData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      toast.success('Ativo criado com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao criar ativo:', error);
      showFriendlyError(error);
    },
  });
};
