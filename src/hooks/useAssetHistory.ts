
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
  details?: any;
  client_name?: string;
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
          let client_name = 'Cliente não identificado';
          let old_status = undefined;
          let new_status = undefined;
          let asset_id = undefined;
          
          // Safely parse details
          if (log.details && typeof log.details === 'object') {
            const details = log.details as Record<string, any>;
            
            if (details.description) {
              description = details.description;
            }
            
            // Extract client name from details
            if (details.client_name && details.client_name.trim() !== '') {
              client_name = details.client_name;
            }
            
            // Handle asset identification - CORRIGIDO
            if (details.solution_id || details.line_number || details.radio) {
              // Para CHIP (solution_id = 11), usar line_number
              if (details.solution_id === 11 && details.line_number) {
                // Converter notação científica para número normal
                const lineNumber = typeof details.line_number === 'string' 
                  ? parseFloat(details.line_number).toString()
                  : details.line_number.toString();
                asset_name = lineNumber;
              } 
              // Para outros tipos, usar radio
              else if (details.radio) {
                asset_name = details.radio;
              }
              // Fallback para line_number se radio não estiver disponível
              else if (details.line_number) {
                const lineNumber = typeof details.line_number === 'string' 
                  ? parseFloat(details.line_number).toString()
                  : details.line_number.toString();
                asset_name = lineNumber;
              }
            }
            
            old_status = details.old_status;
            new_status = details.new_status;
            asset_id = details.asset_id;
          }
          
          console.log('Processed log entry:', {
            id: log.id,
            event: log.event,
            asset_name,
            client_name,
            details: log.details
          });
          
          return {
            id: log.id,
            date: log.date,
            event: log.event,
            description,
            asset_name,
            client_name,
            old_status,
            new_status,
            asset_id,
            details: log.details
          };
        });
        
        console.log('Final processed asset history:', processedHistory);
        return processedHistory;
        
      } catch (error) {
        console.error('Error in useAssetHistory:', error);
        throw error;
      }
    },
    staleTime: 30000,
    retry: 1
  });

  // Helper functions - CORRIGIDAS
  const getAssetIdentifier = (log: any): string => {
    if (!log || !log.details) return 'N/A';
    
    const details = log.details;
    
    // Para CHIP (solution_id = 11), usar line_number
    if (details.solution_id === 11 && details.line_number) {
      const lineNumber = typeof details.line_number === 'string' 
        ? parseFloat(details.line_number).toString()
        : details.line_number.toString();
      return lineNumber;
    }
    
    // Para outros tipos, usar radio
    if (details.radio) {
      return details.radio;
    }
    
    // Fallback para line_number
    if (details.line_number) {
      const lineNumber = typeof details.line_number === 'string' 
        ? parseFloat(details.line_number).toString()
        : details.line_number.toString();
      return lineNumber;
    }
    
    return log.asset_name || 'N/A';
  };

  const getClientName = (log: any): string => {
    if (!log) return 'Cliente não identificado';
    
    // Primeiro, tentar pegar do campo processado
    if (log.client_name && log.client_name !== 'Cliente não identificado') {
      return log.client_name;
    }
    
    // Depois, tentar extrair dos details
    if (log.details && log.details.client_name && log.details.client_name.trim() !== '') {
      return log.details.client_name;
    }
    
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
