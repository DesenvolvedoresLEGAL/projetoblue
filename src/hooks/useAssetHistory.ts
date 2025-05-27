
import { useQuery } from '@tanstack/react-query';
import { getAssetLogsWithRelations } from '@/services/api/history/historyService';
import { formatPhoneNumber } from '@/utils/phoneFormatter';
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
  phone?: string;
}

export function useAssetHistory() {
  const query = useQuery({
    queryKey: ['asset', 'history', 'with-relations'],
    queryFn: async (): Promise<AssetHistoryEntry[]> => {
      try {
        console.log('Fetching asset history with relations...');
        
        const logsWithRelations = await getAssetLogsWithRelations();
        
        if (!logsWithRelations || logsWithRelations.length === 0) {
          console.log('No asset history found');
          return [];
        }
        
        const processedHistory = logsWithRelations.map(log => {
          let description = log.event || 'Event logged';
          let asset_name = 'N/A';
          let client_name = 'N/A';
          let phone = 'N/A';
          let old_status = log.status_before?.status;
          let new_status = log.status_after?.status;
          let asset_id = undefined;
          
          // Processar detalhes do log de forma segura
          if (log.details && typeof log.details === 'object') {
            const details = log.details as Record<string, any>;
            
            if (details.event_description) {
              description = details.event_description;
            }
            
            asset_id = details.asset_id;
          }
          
          // Extrair dados do asset da associação
          if (log.association?.asset) {
            const asset = log.association.asset;
            asset_name = getAssetIdentifier(asset);
            asset_id = asset.uuid;
          }
          
          // Extrair dados do cliente da associação
          if (log.association?.client) {
            const client = log.association.client;
            client_name = client.nome || 'Cliente não identificado';
            
            // Verificar se contato existe e formatar telefone corretamente
            if (client.contato) {
              // Converter notação científica para string normal se necessário
              const contactStr = typeof client.contato === 'number' 
                ? client.contato.toString() 
                : String(client.contato);
              
              phone = formatPhoneNumber(contactStr);
            }
          }
          
          return {
            id: log.id,
            date: log.date,
            event: log.event,
            description,
            asset_name,
            old_status,
            new_status,
            asset_id,
            details: log.details,
            client_name,
            phone
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

  // Helper functions atualizadas
  const getAssetIdentifier = (log: any): string => {
    if (!log) return 'N/A';
    return log.asset_name || log.asset_id || 'N/A';
  };

  const getClientName = (log: any): string => {
    return log.client_name || 'Cliente não identificado';
  };

  const getClientPhone = (log: any): string => {
    return log.phone || 'N/A';
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
    getClientPhone,
    formatDate,
    getStatusDisplay,
    formatLogDetails,
    formatEventName
  };
}
