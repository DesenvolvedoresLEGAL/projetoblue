
import { useQuery } from '@tanstack/react-query';
import * as dashboardQueries from '@modules/dashboard/services/dashboardQueries';

export interface RecentActivity {
  id: number;
  type: 'asset_created' | 'association_created' | 'association_ended' | 'status_updated';
  description: string;
  assetName?: string;
  clientName?: string;
  timestamp: string;
  details?: Record<string, unknown>;
  performedBy?: string; // NEW: User who performed the action
}

export function useDashboardRecentActivities() {
  return useQuery<RecentActivity[], Error>({
    queryKey: ['dashboard', 'recent-activities'],
    queryFn: async () => {
      try {
        if (process.env.NODE_ENV === 'development') {
          if (import.meta.env.DEV) console.log('Fetching recent activities...');
        }
        
        const recentEventsResult = await dashboardQueries.fetchEnhancedRecentEvents();
        
        if (recentEventsResult.error) {
          throw recentEventsResult.error;
        }

        const assetEvents = recentEventsResult.data || [];
        
        const assetActivities: RecentActivity[] = assetEvents.map(event => {
          let type: RecentActivity['type'] = 'status_updated';
          let description = 'Atividade registrada';
          let assetName = 'Asset desconhecido';
          let clientName: string | undefined;

          const details = event.details as Record<string, unknown>;
          
          // Determine performed by user
          let performedBy = 'Sistema'; // Default fallback
          if ((event as { user_email?: string }).user_email) {
            performedBy = (event as { user_email?: string }).user_email as string;
          } else if (details?.username && details.username !== 'system') {
            performedBy = details.username;
          }
          
          // Extrair nome do ativo de forma mais robusta
          if (details?.radio) {
            assetName = details.radio;
          } else if (details?.line_number) {
            assetName = `Linha ${details.line_number}`;
          } else if (details?.asset_id) {
            assetName = details.asset_id.toString().substring(0, 8);
          } else if (details?.iccid) {
            assetName = details.iccid;
          } else if (details?.serial_number) {
            assetName = details.serial_number;
          }

          // Extrair nome do cliente
          if (details?.client_name) {
            clientName = details.client_name;
          }

          // Determinar tipo de ativo baseado na solução
          const getAssetType = (): string => {
            if (details?.solution_name || details?.solution) {
              const solution = (details.solution_name || details.solution).toLowerCase();
              if (solution.includes('chip') || solution.includes('simcard')) {
                return 'CHIP';
              } else if (solution.includes('speedy') || solution.includes('5g')) {
                return 'SPEEDY 5G';
              } else {
                return 'EQUIPAMENTO';
              }
            }
            return 'ATIVO';
          };

          const assetType = getAssetType();

          // Gerar mensagens mais descritivas baseadas no tipo de evento
          switch (event.event) {
            case 'ASSET_CRIADO':
              type = 'asset_created';
              description = `${assetType} ${assetName} cadastrado no sistema`;
              break;

            case 'ASSOCIATION_CREATED': {
              type = 'association_created';
              const clientInfo = clientName ? ` à empresa ${clientName}` : '';
              description = `${assetType} ${assetName} associado${clientInfo}`;
              break;
            }
              
            case 'ASSOCIATION_REMOVED':
              type = 'association_ended';
              description = `${assetType} ${assetName} desassociado`;
              break;
              
            case 'STATUS_UPDATED':
            case 'ASSOCIATION_STATUS_UPDATED': {
              type = 'status_updated';
              const oldStatus = details?.old_status_name || details?.old_status?.status || '';
              const newStatus = details?.new_status_name || details?.new_status?.status || '';

              if (oldStatus && newStatus) {
                description = `${assetType} ${assetName} alterado de ${oldStatus} para ${newStatus}`;
              } else if (newStatus) {
                description = `${assetType} ${assetName} com status atualizado para ${newStatus}`;
              } else {
                description = `${assetType} ${assetName} com status atualizado`;
              }
              break;
            }
              
            default:
              description = `${assetType} ${assetName} - ${event.event}`;
          }

          return {
            id: event.id,
            type,
            description,
            assetName,
            clientName,
            timestamp: event.date,
            details,
            performedBy // NEW: Include performed by information
          };
        });

        // Ordenar por data (mais recente primeiro)
        assetActivities.sort((a, b) => {
          const dateA = new Date(a.timestamp);
          const dateB = new Date(b.timestamp);
          return dateB.getTime() - dateA.getTime();
        });

        return assetActivities.slice(0, 10);
      } catch (error) {
        if (import.meta.env.DEV) console.error('Error fetching recent activities:', error);
        return [];
      }
    },
    staleTime: 30000,
    retry: 1,
    refetchOnWindowFocus: false
  });
}
