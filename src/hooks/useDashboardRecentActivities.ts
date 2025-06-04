
import { useQuery } from '@tanstack/react-query';
import * as dashboardQueries from '@/api/dashboardQueries';

export interface RecentActivity {
  id: number;
  type: 'asset_created' | 'association_created' | 'association_ended' | 'status_updated' | 'client_created' | 'client_updated' | 'client_deleted';
  description: string;
  assetName?: string;
  clientName?: string;
  timestamp: string;
  details?: any;
}

export function useDashboardRecentActivities() {
  return useQuery<RecentActivity[], Error>({
    queryKey: ['dashboard', 'recent-activities'],
    queryFn: async () => {
      try {
        console.log('Fetching recent activities...');
        
        // Buscar eventos de assets
        const recentEventsResult = await dashboardQueries.fetchEnhancedRecentEvents();
        // Buscar logs de clientes
        const clientLogsResult = await dashboardQueries.fetchRecentClientLogs();
        
        if (recentEventsResult.error) {
          throw recentEventsResult.error;
        }
        if (clientLogsResult.error) {
          throw clientLogsResult.error;
        }

        const assetEvents = recentEventsResult.data || [];
        const clientLogs = clientLogsResult.data || [];
        
        // Processar eventos de assets
        const assetActivities: RecentActivity[] = assetEvents.map(event => {
          let type: RecentActivity['type'] = 'status_updated';
          let description = 'Atividade registrada';
          let assetName = 'Asset desconhecido';
          let clientName: string | undefined;

          // Extrair informações dos detalhes
          const details = event.details as any;
          
          // Determinar tipo de atividade
          switch (event.event) {
            case 'ASSET_CRIADO':
              type = 'asset_created';
              description = 'Novo ativo cadastrado';
              break;
            case 'ASSOCIATION_CREATED':
              type = 'association_created';
              description = 'Nova associação criada';
              break;
            case 'ASSOCIATION_REMOVED':
              type = 'association_ended';
              description = 'Associação encerrada';
              break;
            case 'STATUS_UPDATED':
              type = 'status_updated';
              description = 'Status do ativo atualizado';
              break;
            default:
              description = `Evento: ${event.event}`;
          }

          // Extrair nome do ativo
          if (details?.radio) {
            assetName = details.radio;
          } else if (details?.line_number) {
            assetName = `Linha ${details.line_number}`;
          } else if (details?.asset_id) {
            assetName = details.asset_id.toString().substring(0, 8);
          }

          // Extrair nome do cliente (se disponível)
          if (details?.client_name) {
            clientName = details.client_name;
          }

          // Formatar timestamp
          const eventDate = new Date(event.date);
          const now = new Date();
          const diffMinutes = Math.floor((now.getTime() - eventDate.getTime()) / (1000 * 60));
          
          let timestamp: string;
          if (diffMinutes < 1) {
            timestamp = 'Agora mesmo';
          } else if (diffMinutes < 60) {
            timestamp = `Há ${diffMinutes} minuto${diffMinutes > 1 ? 's' : ''}`;
          } else if (diffMinutes < 1440) { // 24 horas
            const diffHours = Math.floor(diffMinutes / 60);
            timestamp = `Há ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
          } else {
            const diffDays = Math.floor(diffMinutes / 1440);
            timestamp = `Há ${diffDays} dia${diffDays > 1 ? 's' : ''}`;
          }

          return {
            id: event.id,
            type,
            description,
            assetName,
            clientName,
            timestamp,
            details
          };
        });

        // Processar logs de clientes
        const clientActivities: RecentActivity[] = clientLogs.map(log => {
          let type: RecentActivity['type'] = 'client_updated';
          let description = 'Cliente modificado';
          
          const details = log.details as any;
          const empresa = details?.empresa || 'Empresa desconhecida';
          
          switch (log.event_type) {
            case 'CLIENTE_CRIADO':
              type = 'client_created';
              description = `Cliente criado: ${empresa}`;
              break;
            case 'CLIENTE_ATUALIZADO':
              type = 'client_updated';
              // Detectar que campo foi alterado
              const changes = details?.changes || {};
              if (changes.empresa_changed) {
                description = `Dados do cliente atualizados: Nome da empresa alterado`;
              } else if (changes.responsavel_changed) {
                description = `Dados do cliente atualizados: Responsável alterado`;
              } else if (changes.email_changed) {
                description = `Dados do cliente atualizados: E-mail alterado`;
              } else if (changes.cnpj_changed) {
                description = `Dados do cliente atualizados: CNPJ alterado`;
              } else if (changes.telefones_changed) {
                description = `Dados do cliente atualizados: Telefones alterados`;
              } else {
                description = `Dados do cliente atualizados: ${empresa}`;
              }
              break;
            case 'CLIENTE_EXCLUIDO':
              type = 'client_deleted';
              description = `Cliente removido: ${empresa}`;
              break;
            default:
              description = `Evento de cliente: ${log.event_type}`;
          }

          // Formatar timestamp
          const logDate = new Date(log.date);
          const now = new Date();
          const diffMinutes = Math.floor((now.getTime() - logDate.getTime()) / (1000 * 60));
          
          let timestamp: string;
          if (diffMinutes < 1) {
            timestamp = 'Agora mesmo';
          } else if (diffMinutes < 60) {
            timestamp = `Há ${diffMinutes} minuto${diffMinutes > 1 ? 's' : ''}`;
          } else if (diffMinutes < 1440) { // 24 horas
            const diffHours = Math.floor(diffMinutes / 60);
            timestamp = `Há ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
          } else {
            const diffDays = Math.floor(diffMinutes / 1440);
            timestamp = `Há ${diffDays} dia${diffDays > 1 ? 's' : ''}`;
          }

          return {
            id: log.id,
            type,
            description,
            clientName: empresa,
            timestamp,
            details: log.details
          };
        });

        // Combinar e ordenar atividades por data
        const allActivities = [...assetActivities, ...clientActivities];
        
        // Ordenar por timestamp (mais recente primeiro)
        allActivities.sort((a, b) => {
          const dateA = new Date(a.details?.timestamp || a.details?.date || new Date());
          const dateB = new Date(b.details?.timestamp || b.details?.date || new Date());
          return dateB.getTime() - dateA.getTime();
        });

        // Retornar apenas os 10 mais recentes
        return allActivities.slice(0, 10);
      } catch (error) {
        console.error('Error fetching recent activities:', error);
        return [];
      }
    },
    staleTime: 30000, // 30 segundos
    retry: 1,
    refetchOnWindowFocus: false
  });
}
