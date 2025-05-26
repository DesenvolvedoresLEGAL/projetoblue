
import { useQuery } from "@tanstack/react-query";
import { historyService, AssetLogWithRelations } from "@/services/api/history/historyService";

/**
 * Hook para gerenciar dados do histórico de assets
 * Utiliza React Query para cache e estado dos logs com relações
 */
export function useAssetHistory() {
  const {
    data: historyLogs,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['asset-history-logs'],
    queryFn: historyService.getAssetLogsWithRelations,
    staleTime: 30000, // 30 segundos de cache
    retry: 2,
  });

  /**
   * Obtém identificador do asset a partir dos dados do log
   */
  const getAssetIdentifier = (log: AssetLogWithRelations): string => {
    const asset = log.association?.asset;
    if (!asset) return 'Asset não identificado';
    
    // Prioriza serial_number, depois ICCID, depois rádio
    if (asset.serial_number) return asset.serial_number;
    if (asset.iccid) return asset.iccid;
    if (asset.radio) return asset.radio;
    if (asset.line_number) return `Linha ${asset.line_number}`;
    
    return asset.uuid?.substring(0, 8) || 'Asset não identificado';
  };

  /**
   * Obtém nome do cliente a partir dos dados do log
   */
  const getClientName = (log: AssetLogWithRelations): string => {
    return log.association?.client?.nome || 'Cliente não identificado';
  };

  /**
   * Formata data para exibição em português brasileiro
   */
  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.warn('Erro ao formatar data:', error);
      return 'Data inválida';
    }
  };

  /**
   * Obtém status formatado (anterior/posterior)
   */
  const getStatusDisplay = (log: AssetLogWithRelations): {
    before?: string;
    after?: string;
  } => {
    return {
      before: log.status_before?.status,
      after: log.status_after?.status
    };
  };

  return {
    // Dados principais
    historyLogs: historyLogs || [],
    isLoading,
    error,
    refetch,
    
    // Funções auxiliares para formatação
    getAssetIdentifier,
    getClientName,
    formatDate,
    getStatusDisplay,
    
    // Serviços de formatação
    formatLogDetails: historyService.formatLogDetails,
    formatEventName: historyService.formatEventName
  };
}
