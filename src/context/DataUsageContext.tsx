import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAssets } from '@/context/AssetContext';
import { ChipAsset } from '@/types/asset';
import { ChipWithMetrics, SignalQuality } from '@/types/dataUsage';

// Definição do contexto
export interface DataUsageContextType {
  dataUsage: Record<string, { download: number; upload: number }>;
  updateDataUsage: (assetId: string, download: number, upload: number) => void;
  // Added missing methods
  getActiveChipsWithMetrics: () => ChipWithMetrics[];
  getAvailableCarriers: () => string[];
  getAvailableClients: () => string[];
  getAvailableRegions: () => string[];
}

export const DataUsageContext = createContext<DataUsageContextType | undefined>(undefined);

export const DataUsageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { assets } = useAssets();
  const [dataUsage, setDataUsage] = useState<Record<string, { download: number; upload: number }>>({});

  useEffect(() => {
    // Inicializar o estado de dataUsage com dados mockados ou de alguma fonte
    const initialDataUsage: Record<string, { download: number; upload: number }> = {};
    assets.forEach(asset => {
      initialDataUsage[asset.id] = { download: Math.random() * 100, upload: Math.random() * 50 };
    });
    setDataUsage(initialDataUsage);
  }, [assets]);

  const updateDataUsage = (assetId: string, download: number, upload: number) => {
    setDataUsage(prevDataUsage => ({
      ...prevDataUsage,
      [assetId]: { download, upload },
    }));
  };

  // Implement the missing methods
  const getActiveChipsWithMetrics = (): ChipWithMetrics[] => {
    return assets
      .filter(asset => asset.type === 'CHIP')
      .map(asset => {
        const chipAsset = asset as ChipAsset;
        const metrics = dataUsage[asset.id] || { download: 0, upload: 0 };
        
        // Generate mock quality data
        const signalStrength = Math.random() * 100;
        let quality: SignalQuality | undefined;
        
        if (signalStrength > 70) {
          quality = { status: 'GOOD', message: 'Sinal forte e estável' };
        } else if (signalStrength > 40) {
          quality = { status: 'UNSTABLE', message: 'Sinal instável' };
        } else {
          quality = { status: 'POOR', message: 'Sinal fraco' };
        }
        
        return {
          id: asset.id,
          phoneNumber: chipAsset.phoneNumber,
          carrier: chipAsset.carrier,
          clientId: asset.clientId,
          clientName: asset.clientId ? 'Cliente ' + asset.clientId.substring(0, 8) : undefined,
          iccid: chipAsset.iccid,
          region: Math.random() > 0.5 ? 'Sul' : Math.random() > 0.5 ? 'Sudeste' : 'Norte',
          isOnline: Math.random() > 0.2,
          metrics: {
            download: metrics.download,
            upload: metrics.upload,
            signalStrength,
            lastUpdated: new Date().toISOString()
          },
          download: metrics.download, // For direct access in charts
          upload: metrics.upload,     // For direct access in charts
          quality
        };
      });
  };

  const getAvailableCarriers = (): string[] => {
    const carriers = new Set<string>();
    assets.forEach(asset => {
      if (asset.type === 'CHIP') {
        carriers.add((asset as ChipAsset).carrier);
      }
    });
    return Array.from(carriers);
  };

  const getAvailableClients = (): string[] => {
    const clientNames = new Set<string>();
    assets.forEach(asset => {
      if (asset.clientId) {
        clientNames.add('Cliente ' + asset.clientId.substring(0, 8));
      }
    });
    return Array.from(clientNames);
  };

  const getAvailableRegions = (): string[] => {
    // Mock regions
    return ['Norte', 'Nordeste', 'Centro-Oeste', 'Sudeste', 'Sul'];
  };

  return (
    <DataUsageContext.Provider value={{ 
      dataUsage,
      updateDataUsage,
      getActiveChipsWithMetrics,
      getAvailableCarriers,
      getAvailableClients,
      getAvailableRegions
    }}>
      {children}
    </DataUsageContext.Provider>
  );
};

export const useDataUsage = () => {
  const context = useContext(DataUsageContext);
  if (!context) {
    throw new Error("useDataUsage must be used within a DataUsageProvider");
  }
  return context;
};
