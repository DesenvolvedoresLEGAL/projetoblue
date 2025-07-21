
import { useQuery } from '@tanstack/react-query';
import * as dashboardQueries from '@modules/dashboard/services/dashboardQueries';

export interface SystemStatusData {
  isOnline: boolean;
  lastSync: string;
  isSyncing: boolean;
}

export function useDashboardSystemStatus() {
  return useQuery<SystemStatusData, Error>({
    queryKey: ['dashboard', 'system-status'],
    queryFn: async () => {
      try {
        
        // Buscar último evento para determinar última atividade
        const recentEventsResult = await dashboardQueries.fetchRecentEvents();
        
        if (recentEventsResult.error) {
          throw recentEventsResult.error;
        }

        const lastEvent = recentEventsResult.data?.[0];
        const lastSyncTime = lastEvent?.date || new Date().toISOString();
        
        // Calcular tempo desde última sync
        const lastSyncDate = new Date(lastSyncTime);
        const now = new Date();
        const diffMinutes = Math.floor((now.getTime() - lastSyncDate.getTime()) / (1000 * 60));
        
        let lastSyncText: string;
        if (diffMinutes < 1) {
          lastSyncText = 'Agora mesmo';
        } else if (diffMinutes < 60) {
          lastSyncText = `Há ${diffMinutes} minuto${diffMinutes > 1 ? 's' : ''}`;
        } else {
          const diffHours = Math.floor(diffMinutes / 60);
          lastSyncText = `Há ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
        }

        // Determinar status
        const isOnline = diffMinutes < 30; // Considera online se última atividade foi há menos de 30 min
        const isSyncing = diffMinutes < 2; // Considera sincronizando se última atividade foi há menos de 2 min

        return {
          isOnline,
          lastSync: lastSyncText,
          isSyncing
        };
      } catch (error) {
        
        // Em caso de erro, assume que está offline
        return {
          isOnline: false,
          lastSync: 'Indisponível',
          isSyncing: false
        };
      }
    },
    staleTime: 30000, // 30 segundos
    refetchInterval: 60000, // Refetch a cada minuto
    retry: 2,
    refetchOnWindowFocus: true
  });
}
