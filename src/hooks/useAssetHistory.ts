
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { getAssetIdentifier } from '@/utils/assetUtils';

export interface AssetHistoryEntry {
  id: number;
  date: string;
  event: string;
  description: string;
  asset_id?: string;
  asset_name?: string;
  old_status?: string;
  new_status?: string;
}

export function useAssetHistory() {
  const query = useQuery({
    queryKey: ['asset', 'history'],
    queryFn: async (): Promise<AssetHistoryEntry[]> => {
      try {
        console.log('Fetching asset history...');
        
        const { data, error } = await supabase
          .from('asset_logs')
          .select('id, event, date, details')
          .order('date', { ascending: false })
          .limit(20);
        
        if (error) {
          console.error('Error fetching asset history:', error);
          throw error;
        }
        
        console.log('Raw asset history data:', data);
        
        if (!data || data.length === 0) {
          console.log('No asset history found');
          return [];
        }
        
        const processedHistory = data.map(log => {
          let description = log.event || 'Event logged';
          let asset_name = 'N/A';
          let old_status = undefined;
          let new_status = undefined;
          let asset_id = undefined;
          
          // Safely parse details
          if (log.details && typeof log.details === 'object') {
            const details = log.details as Record<string, any>;
            
            if (details.description) {
              description = details.description;
            }
            
            // Handle asset identification
            if (details.solution_id || details.line_number || details.radio) {
              const mockAsset = {
                solution_id: details.solution_id,
                line_number: details.line_number,
                radio: details.radio,
                type: details.solution_id === 11 ? 'CHIP' : 'ROTEADOR'
              };
              asset_name = getAssetIdentifier(mockAsset);
            }
            
            old_status = details.old_status;
            new_status = details.new_status;
            asset_id = details.asset_id;
          }
          
          return {
            id: log.id,
            date: log.date,
            event: log.event,
            description,
            asset_name,
            old_status,
            new_status,
            asset_id
          };
        });
        
        console.log('Processed asset history:', processedHistory);
        return processedHistory;
        
      } catch (error) {
        console.error('Error in useAssetHistory:', error);
        throw error;
      }
    },
    staleTime: 30000,
    retry: 1
  });

  // Helper functions
  const getAssetIdentifier = (log: any): string => {
    if (!log) return 'N/A';
    return log.asset_name || log.asset_id || 'N/A';
  };

  const getClientName = (log: any): string => {
    return 'Cliente não identificado';
  };

  const formatDate = (date: string): string => {
    if (!date) return '';
    return new Date(date).toLocaleString('pt-BR');
  };

  const getStatusDisplay = (log: any) => {
    return {
      before: log.old_status,
      after: log.new_status
    };
  };

  const formatLogDetails = (details: any): string => {
    if (!details) return 'Nenhum detalhe disponível';
    
    try {
      if (typeof details === 'string') {
        return details;
      }
      
      if (typeof details === 'object') {
        const desc = details.event_description || details.description || 'Operação realizada';
        return desc;
      }
      
      return 'Detalhes do sistema';
    } catch {
      return 'Detalhes não disponíveis';
    }
  };

  const formatEventName = (event: string): string => {
    const eventTranslations: Record<string, string> = {
      'INSERT': 'Criação',
      'UPDATE': 'Atualização',
      'DELETE': 'Remoção',
      'STATUS_UPDATED': 'Status Atualizado',
      'ASSET_CRIADO': 'Ativo Criado',
      'SOFT_DELETE': 'Ativo Removido',
      'ASSOCIATION': 'Associação',
      'DISASSOCIATION': 'Desassociação'
    };
    
    return eventTranslations[event] || event;
  };

  return {
    historyLogs: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    getAssetIdentifier,
    getClientName,
    formatDate,
    getStatusDisplay,
    formatLogDetails,
    formatEventName
  };
}
