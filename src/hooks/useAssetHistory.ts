/**
 * Hook to retrieve asset history logs.
 * When an assetId is provided, logs are filtered to that asset. If omitted, all
 * logs are returned. Data is fetched using `historyService.getAssetLogsWithRelations`.
 */
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { historyService, AssetLogWithRelations } from '@modules/assets/services/history/historyService';

export interface ProcessedHistoryLog {
  id: number;
  date: string;
  event: string;
  description: string;
  client_name: string | null;
  asset_name: string | null;
  old_status: string | null;
  new_status: string | null;
  user_email: string | null;
  details: any;
}

export const useAssetHistory = (assetId?: string) => {
  const { data: rawLogs = [], isLoading, error, refetch } = useQuery({
    queryKey: ['asset-history', assetId ?? 'all'],
    queryFn: historyService.getAssetLogsWithRelations,
    staleTime: 30000,
    refetchInterval: 60000,
  });

  const filteredLogs = assetId
    ? rawLogs.filter((log) => log.association?.asset?.uuid === assetId)
    : rawLogs;

  const historyLogs: ProcessedHistoryLog[] = filteredLogs.map((log: AssetLogWithRelations) => {
    const assetInfo = log.association?.asset;
    let assetName = 'N/A';

    if (assetInfo) {
      if (assetInfo.line_number) {
        assetName = assetInfo.line_number.toString();
      } else if (assetInfo.radio) {
        assetName = assetInfo.radio;
      } else if (assetInfo.serial_number) {
        assetName = assetInfo.serial_number;
      } else if (assetInfo.iccid) {
        assetName = assetInfo.iccid;
      }
    }

    const clientName = log.association?.client?.nome || null;
    const oldStatus = log.status_before?.status || null;
    const newStatus = log.status_after?.status || null;

    let userEmail = 'Sistema Automático';
    if (log.details && typeof log.details === 'object') {
      const details = log.details as any;
      if (details.user_email) {
        userEmail = details.user_email;
      } else if (details.username && details.username !== 'system') {
        userEmail = details.username;
      }
    }

    let description = historyService.formatLogDetails(log.details);

    if (log.event.includes('ASSOCIATION_CREATED')) {
      description = `Nova associação criada ${clientName ? `para ${clientName}` : ''}`;
    } else if (log.event.includes('ASSOCIATION_REMOVED')) {
      description = `Associação encerrada ${clientName ? `de ${clientName}` : ''}`;
    } else if (log.event.includes('STATUS_UPDATED')) {
      description = `Status alterado ${oldStatus && newStatus ? `de ${oldStatus} para ${newStatus}` : ''}`;
    } else if (log.event.includes('ASSET_CRIADO')) {
      description = 'Ativo cadastrado no sistema';
    }

    return {
      id: log.id,
      date: log.date,
      event: log.event,
      description,
      client_name: clientName,
      asset_name: assetName,
      old_status: oldStatus,
      new_status: newStatus,
      user_email: userEmail,
      details: log.details,
    };
  });

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return format(date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    } catch (err) {
      return dateString;
    }
  };

  const formatEventName = (event: string): string => {
    const eventTranslations: Record<string, string> = {
      INSERT: 'Ativo criado',
      UPDATE: 'Dados atualizados',
      DELETE: 'Ativo excluído',
      STATUS_UPDATED: 'Status alterado',
      ASSET_CRIADO: 'Ativo criado',
      SOFT_DELETE: 'Ativo removido',
      ASSOCIATION_CREATED: 'Nova associação',
      ASSOCIATION_REMOVED: 'Associação removida',
      DISASSOCIATION: 'Associação encerrada',
      ASSOCIATION_ENDED: 'Associação encerrada',
    };

    return eventTranslations[event] || event;
  };

  return {
    historyLogs,
    isLoading,
    error,
    refetch,
    formatDate,
    formatEventName,
  };
};
