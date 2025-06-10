
import { useQuery } from '@tanstack/react-query';

// Basic dashboard data hook to satisfy the import requirement
export const useDashboardData = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard-data'],
    queryFn: async () => {
      // Basic dashboard data structure
      return {
        revenue: 'R$ 12.456,00',
        activeClients: 67,
        totalClients: 120,
        connectedAssets: 245,
        criticalAlerts: 3
      };
    }
  });

  return {
    data,
    isLoading,
    error
  };
};
