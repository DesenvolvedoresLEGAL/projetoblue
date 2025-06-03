
import { useQuery } from '@tanstack/react-query';
import * as dashboardQueries from '@/api/dashboardQueries';

export interface RecentActivity {
  id: number;
  type: 'asset_created' | 'association_created' | 'association_ended' | 'status_updated';
  description: string;
  assetName: string;
  clientName?: string;
  timestamp: string;
}

export function useDashboardRecentActivities() {
  return useQuery<RecentActivity[], Error>({
    queryKey: ['dashboard', 'recent-activities'],
    queryFn: async () => {
      try {
        console.log('Fetching recent activities...');
        
        const recentEventsResult = await dashboardQueries.fetchEnhancedRecentEvents();
        
        if (recentEventsResult.error) {
          throw recentEventsResult.error;
        }

        const events = recentEventsResult.data || [];
        
        // Processar eventos para o formato esperado
        const activities: RecentActivity[] = events.map(event => {
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
            timestamp
          };
        });

        return activities;
      } catch (error) {
        console.error('Error fetching recent activities:', error);
        return [];
      }
    },
    staleTime: 60000, // 1 minuto
    retry: 1,
    refetchOnWindowFocus: false
  });
}
