import { createContext, useContext } from 'react';
import type { ChipWithMetrics } from '@/types/dataUsage';

export interface DataUsageContextType {
  dataUsage: Record<string, { download: number; upload: number }>;
  updateDataUsage: (assetId: string, download: number, upload: number) => void;
  getActiveChipsWithMetrics: () => ChipWithMetrics[];
  getAvailableCarriers: () => string[];
  getAvailableClients: () => string[];
  getAvailableRegions: () => string[];
}

export const DataUsageContext = createContext<DataUsageContextType | undefined>(undefined);

export const useDataUsage = (): DataUsageContextType => {
  const context = useContext(DataUsageContext);
  if (!context) {
    throw new Error('useDataUsage must be used within a DataUsageProvider');
  }
  return context;
};
