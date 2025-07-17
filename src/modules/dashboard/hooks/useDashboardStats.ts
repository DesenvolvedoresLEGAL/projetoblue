
import { useMemo } from 'react';
import { useDashboardCore } from './useDashboardCore';
import { useDashboardRecentData } from './useDashboardRecentData';
import { useDashboardChartData } from './useDashboardChartData';
import type { DashboardStatsResponse } from '../types/dashboard';

export interface DashboardStats extends DashboardStatsResponse {
  statusSummary?: {
    active: number;
    warning: number;
    critical: number;
  };
}

export function useDashboardStats() {
  const coreQuery = useDashboardCore();
  const recentDataQuery = useDashboardRecentData();
  const chartDataQuery = useDashboardChartData();

  // Compute loading and error states
  const isLoading = coreQuery.isLoading || recentDataQuery.isLoading || chartDataQuery.isLoading;
  const isError = coreQuery.isError || recentDataQuery.isError || chartDataQuery.isError;

  // Combine all errors
  const allErrors = [
    ...(coreQuery.data?.errors || []),
    ...(recentDataQuery.data?.errors || []),
    ...(chartDataQuery.error ? [chartDataQuery.error] : [])
  ];

  // Memoized combined data
  const data = useMemo((): DashboardStats | undefined => {
    if (isLoading || !coreQuery.data || !recentDataQuery.data || !chartDataQuery.data) {
      return undefined;
    }

    // Calculate status summary from chart data
    const statusSummary = {
      active: 0,
      warning: 0,
      critical: 0
    };

    chartDataQuery.data.statusSummary.forEach(item => {
      const status = item.status.toLowerCase();
      if (status.includes('disponível') || status.includes('disponivel')) {
        statusSummary.active += item.count;
      } else if (status.includes('manutenção') || status.includes('manutencao')) {
        statusSummary.warning += item.count;
      } else if (status.includes('bloqueado') || status.includes('crítico')) {
        statusSummary.critical += item.count;
      }
    });

    return {
      totalAssets: coreQuery.data.totalAssets,
      activeClients: coreQuery.data.activeClients,
      assetsWithIssues: coreQuery.data.assetsWithIssues,
      recentAssets: recentDataQuery.data.recentAssets,
      recentEvents: recentDataQuery.data.recentEvents,
      pieChartData: chartDataQuery.data.pieChartData,
      detailedStatusData: [], // Legacy field, keeping for compatibility
      statusSummary
    };
  }, [coreQuery.data, recentDataQuery.data, chartDataQuery.data, isLoading]);

  // Enhanced error information
  const error = isError ? {
    message: 'Dashboard stats loading failed',
    errors: allErrors,
    partialData: {
      core: !!coreQuery.data,
      recent: !!recentDataQuery.data,
      chart: !!chartDataQuery.data
    }
  } : null;

  return {
    data,
    isLoading,
    isError,
    error,
    refetch: () => {
      coreQuery.refetch();
      recentDataQuery.refetch();
      chartDataQuery.refetch();
    },
    // Individual query states for granular loading
    queries: {
      core: coreQuery,
      recent: recentDataQuery,
      chart: chartDataQuery
    }
  };
}
