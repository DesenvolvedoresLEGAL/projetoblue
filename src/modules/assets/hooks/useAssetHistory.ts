
import { useQuery } from '@tanstack/react-query';
import { historyService, AssetLogWithRelations } from '@modules/assets/services/history/historyService';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Interface processada para uso na UI
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

export const useAssetHistory = () => {
  const { data: rawLogs = [], isLoading, error, refetch } = useQuery({
    queryKey: ['asset-history'],
    queryFn: historyService.getAssetLogsWithRelations,
    staleTime: 30000, // 30 segundos
    refetchInterval: 60000, // 1 minuto
  });

  // Processar os dados para formato mais amigável à UI
  const historyLogs: ProcessedHistoryLog[] = rawLogs.map((log: AssetLogWithRelations) => {
    // Extrair informações do asset
    const assetInfo = log.association?.asset;
    let assetName = 'N/A';
    
    if (assetInfo) {
      // Para CHIPs, usar line_number, para outros usar radio ou serial
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

    // Extrair informações do cliente
    const clientName = log.association?.client?.nome || null;

    // Extrair informações de status
    const oldStatus = log.status_before?.status || null;
    const newStatus = log.status_after?.status || null;

    // Extrair email do usuário dos detalhes ou usar informação padrão
    let userEmail = 'Sistema Automático';
    if (log.details && typeof log.details === 'object') {
      const details = log.details as any;
      if (details.user_email) {
        userEmail = details.user_email;
      } else if (details.username && details.username !== 'system') {
        userEmail = details.username;
      }
    }

    // Gerar descrição mais amigável
    let description = historyService.formatLogDetails(log.details);
    
    // Melhorar descrição baseada no evento
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
      details: log.details
    };
  });

  // Função para formatar data
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return format(date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    } catch (error) {
      return dateString;
    }
  };

  // Função para formatar nome do evento
  const formatEventName = (event: string): string => {
    const eventTranslations: Record<string, string> = {
      'INSERT': 'Ativo criado',
      'UPDATE': 'Dados atualizados',
      'DELETE': 'Ativo excluído',
      'STATUS_UPDATED': 'Status alterado',
      'ASSET_CRIADO': 'Ativo criado',
      'SOFT_DELETE': 'Ativo removido',
      'ASSOCIATION_CREATED': 'Nova associação',
      'ASSOCIATION_REMOVED': 'Associação removida',
      'DISASSOCIATION': 'Associação encerrada',
      'ASSOCIATION_ENDED': 'Associação encerrada'
    };
    
    return eventTranslations[event] || event;
  };

  return {
    historyLogs,
    isLoading,
    error,
    refetch,
    formatDate,
    formatEventName
  };
};
