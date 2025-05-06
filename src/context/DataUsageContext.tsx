
import React, { createContext, useState, useContext, useEffect } from 'react';
import { DataUsageState, SignalQuality, DataUsageMetrics, ChipWithMetrics } from '@/types/dataUsage';
import { useAssets } from './useAssets';
import { toast } from '@/utils/toast';
import { ChipAsset } from '@/types/asset';

interface DataUsageContextType {
  dataUsage: DataUsageState;
  updateMetrics: (assetId: string, metrics: DataUsageMetrics) => void;
  getSignalQuality: (assetId: string) => SignalQuality | undefined;
  getActiveChipsWithMetrics: () => ChipWithMetrics[];
  getAvailableCarriers: () => string[];
  getAvailableClients: () => string[];
  getAvailableRegions: () => string[];
  addHistoricalDataPoint: (assetId: string, metrics: DataUsageMetrics) => void;
}

const DataUsageContext = createContext<DataUsageContextType | undefined>(undefined);

export const useDataUsage = () => {
  const context = useContext(DataUsageContext);
  if (!context) {
    throw new Error('useDataUsage must be used within a DataUsageProvider');
  }
  return context;
};

export const DataUsageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { assets, clients } = useAssets();
  const [dataUsage, setDataUsage] = useState<DataUsageState>(() => {
    const saved = localStorage.getItem('dataUsage');
    return saved ? JSON.parse(saved) : { metrics: {}, signalQuality: {} };
  });

  useEffect(() => {
    localStorage.setItem('dataUsage', JSON.stringify(dataUsage));
  }, [dataUsage]);

  const evaluateSignalQuality = (metrics: DataUsageMetrics): SignalQuality => {
    const { signalStrength, download, upload } = metrics;
    
    if (signalStrength >= 70 && download >= 1000 && upload >= 500) {
      return { status: 'GOOD', message: 'Sinal estável e performático' };
    } else if (signalStrength >= 50 && download >= 500 && upload >= 200) {
      return { status: 'UNSTABLE', message: 'Possível instabilidade detectada' };
    } else {
      return { status: 'POOR', message: 'Sinal fraco, necessita atenção' };
    }
  };

  const updateMetrics = (assetId: string, metrics: DataUsageMetrics) => {
    setDataUsage(prev => {
      const quality = evaluateSignalQuality(metrics);
      
      // Add this data point to history if it exists
      const existingMetrics = prev.metrics[assetId];
      let newMetrics = { ...metrics };
      
      if (existingMetrics?.history) {
        newMetrics.history = [...existingMetrics.history];
      }
      
      const newState = {
        metrics: { ...prev.metrics, [assetId]: newMetrics },
        signalQuality: { ...prev.signalQuality, [assetId]: quality }
      };

      if (quality.status !== 'GOOD') {
        const asset = assets.find(a => a.id === assetId);
        const client = asset?.clientId ? clients.find(c => c.id === asset.clientId) : undefined;
        
        if (client) {
          toast.error(`Instabilidade detectada no chip ${assetId} do cliente ${client.name}`);
        }
      }

      return newState;
    });
  };

  const addHistoricalDataPoint = (assetId: string, metrics: DataUsageMetrics) => {
    setDataUsage(prev => {
      const existingMetrics = prev.metrics[assetId];
      
      if (!existingMetrics) {
        // If no existing metrics, just set these as the new metrics
        return {
          ...prev,
          metrics: { 
            ...prev.metrics, 
            [assetId]: {
              ...metrics,
              history: [
                {
                  timestamp: metrics.lastUpdated,
                  download: metrics.download,
                  upload: metrics.upload,
                  signalStrength: metrics.signalStrength
                }
              ]
            } 
          }
        };
      }
      
      // Add to history
      const history = existingMetrics.history || [];
      const newHistory = [
        ...history,
        {
          timestamp: metrics.lastUpdated,
          download: metrics.download,
          upload: metrics.upload,
          signalStrength: metrics.signalStrength
        }
      ];
      
      // Limit history to last 1000 data points
      const trimmedHistory = newHistory.length > 1000 
        ? newHistory.slice(newHistory.length - 1000) 
        : newHistory;
      
      return {
        ...prev,
        metrics: { 
          ...prev.metrics, 
          [assetId]: {
            ...metrics,
            history: trimmedHistory
          } 
        }
      };
    });
  };

  const getSignalQuality = (assetId: string) => dataUsage.signalQuality[assetId];

  const getActiveChipsWithMetrics = () => {
    return assets
      .filter((asset): asset is ChipAsset => 
        asset.type === "CHIP" && 
        Boolean(asset.clientId) && 
        ["ALUGADO", "ASSINATURA"].includes(asset.status)
      )
      .map(chip => {
        const client = chip.clientId ? clients.find(c => c.id === chip.clientId) : undefined;
        
        return {
          id: chip.id,
          phoneNumber: chip.phoneNumber,
          carrier: chip.carrier,
          clientId: chip.clientId,
          clientName: client?.name,
          metrics: dataUsage.metrics[chip.id],
          quality: dataUsage.signalQuality[chip.id],
          iccid: chip.iccid,
          isOnline: chip.isOnline,
          region: client?.state // Using state as region for now
        };
      });
  };
  
  const getAvailableCarriers = () => {
    const uniqueCarriers = new Set<string>();
    
    getActiveChipsWithMetrics().forEach(chip => {
      if (chip.carrier) {
        uniqueCarriers.add(chip.carrier);
      }
    });
    
    return Array.from(uniqueCarriers).sort();
  };
  
  const getAvailableClients = () => {
    const uniqueClients = new Set<string>();
    
    getActiveChipsWithMetrics().forEach(chip => {
      if (chip.clientName) {
        uniqueClients.add(chip.clientName);
      }
    });
    
    return Array.from(uniqueClients).sort();
  };
  
  const getAvailableRegions = () => {
    const uniqueRegions = new Set<string>();
    
    getActiveChipsWithMetrics().forEach(chip => {
      if (chip.region) {
        uniqueRegions.add(chip.region);
      }
    });
    
    return Array.from(uniqueRegions).sort();
  };

  const value = {
    dataUsage,
    updateMetrics,
    getSignalQuality,
    getActiveChipsWithMetrics,
    getAvailableCarriers,
    getAvailableClients,
    getAvailableRegions,
    addHistoricalDataPoint
  };

  return (
    <DataUsageContext.Provider value={value}>
      {children}
    </DataUsageContext.Provider>
  );
};
