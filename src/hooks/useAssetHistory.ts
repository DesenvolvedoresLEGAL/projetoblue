
import { useQuery } from "@tanstack/react-query";
import { historyService, AssetLogWithRelations } from "@/services/api/history/historyService";
import { toast } from "sonner";

/**
 * Hook para gerenciar dados do histórico de assets
 * Utiliza React Query para cache e estado dos logs com relações
 * Agora com melhor tratamento de erros após correção das foreign keys
 */
export function useAssetHistory() {
  const {
    data: historyLogs,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['asset-history-logs'],
    queryFn: async () => {
      console.log('useAssetHistory: Iniciando fetch dos logs...');
      try {
        const result = await historyService.getAssetLogsWithRelations();
        console.log('useAssetHistory: Fetch concluído:', result);
        return result;
      } catch (error) {
        console.error('useAssetHistory: Erro no fetch:', error);
        toast.error(`Erro ao carregar histórico: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        throw error;
      }
    },
    staleTime: 30000, // 30 segundos de cache
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
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

  const getClientName = (log: AssetLogWithRelations): string => {
    return log.association?.client?.nome || 'Cliente não identificado';
  };

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
