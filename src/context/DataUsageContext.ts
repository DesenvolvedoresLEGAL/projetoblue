import { createContext } from 'react';
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
