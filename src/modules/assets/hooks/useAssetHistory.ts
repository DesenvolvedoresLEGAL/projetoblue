
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ProcessedHistoryLog {
  id: number;
  date: string;
  event: string;
  description: string;
  client_name: string;
  asset_name: string;
  old_status: string;
  new_status: string;
  user_email: string;
  details: Record<string, unknown>;
}

export const useAssetHistory = () => {
  return useQuery({
    queryKey: ['asset-history'],
    queryFn: async (): Promise<ProcessedHistoryLog[]> => {
      console.log('[useAssetHistory] Buscando histórico de assets...');
      
      const { data, error } = await supabase
        .from('asset_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1000);

      if (error) {
        console.error('[useAssetHistory] Erro ao buscar histórico:', error);
        throw error;
      }

      console.log('[useAssetHistory] Dados brutos:', data);

      return data.map(log => ({
        id: log.id,
        date: log.date || log.created_at,
        event: log.event || 'Evento desconhecido',
        description: log.event || 'Sem descrição',
        client_name: 'Cliente não identificado',
        asset_name: 'Asset não identificado', 
        old_status: 'Status anterior',
        new_status: 'Status atual',
        user_email: 'Usuário não identificado',
        details: (log.details as Record<string, unknown>) || {}
      }));
    },
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

export const useAssetHistoryByAsset = (assetId: string) => {
  return useQuery({
    queryKey: ['asset-history', assetId],
    queryFn: async (): Promise<ProcessedHistoryLog[]> => {
      console.log('[useAssetHistoryByAsset] Buscando histórico para asset:', assetId);
      
      // Buscar logs que contenham o asset_id nos detalhes
      const { data, error } = await supabase
        .from('asset_logs')
        .select('*')
        .contains('details', { asset_id: assetId })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[useAssetHistoryByAsset] Erro ao buscar histórico:', error);
        throw error;
      }

      return data.map(log => {
        const logDetails = (log.details as Record<string, unknown>) || {};
        
        return {
          id: log.id,
          date: log.date || log.created_at,
          event: log.event || 'Evento desconhecido',
          description: log.event || 'Sem descrição',
          client_name: (logDetails.client_name as string) || 'Cliente não identificado',
          asset_name: (logDetails.asset_id as string) || 'Asset não identificado',
          old_status: (logDetails.old_status_name as string) || 'Status anterior',
          new_status: (logDetails.new_status_name as string) || 'Status atual',
          user_email: (logDetails.username as string) || 'Usuário não identificado',
          details: logDetails
        };
      });
    },
    enabled: !!assetId,
    retry: 2,
    staleTime: 5 * 60 * 1000,
  });
};
