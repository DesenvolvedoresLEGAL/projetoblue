// Atualizando para lidar com o erro de clients não existindo no tipo AssetContextType
import React, { createContext, useState, useContext, useEffect } from 'react';
import { ChipAsset } from '@/types/asset';
import { useAssets } from './useAssets';

// Definição do contexto
export interface DataUsageContextType {
  dataUsage: Record<string, { download: number; upload: number }>;
  updateDataUsage: (assetId: string, download: number, upload: number) => void;
}

export const DataUsageContext = createContext<DataUsageContextType | undefined>(undefined);

export const DataUsageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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

  return (
    <DataUsageContext.Provider value={{ 
      dataUsage,
      updateDataUsage,
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
