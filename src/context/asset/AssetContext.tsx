
import React, { createContext, useState, useEffect } from 'react';
import { Asset, AssetStatus, ChipAsset, RouterAsset } from '@/types/asset';
import { toast } from '@/utils/toast';
import { supabase } from '@/integrations/supabase/client';
import { AssetContextType } from '../AssetContextTypes';
import { Client } from '@/types/asset';
import { AssetHistoryEntry } from '@/types/assetHistory';

// Import operations
import { 
  useAssetOperations, 
  useClientOperations, 
  useHistoryOperations, 
  useStatusMapping 
} from './hooks';

// Definindo o valor padrão para o contexto
const defaultContextValue: AssetContextType = {
  assets: [],
  clients: [],
  history: [],
  loading: false,
  statusRecords: [],
  addAsset: async () => null,
  updateAsset: async () => null,
  deleteAsset: async () => false,
  getAssetById: () => undefined,
  getAssetsByStatus: () => [],
  getAssetsByType: () => [],
  addClient: () => {},
  updateClient: () => {},
  deleteClient: () => {},
  getClientById: () => undefined,
  associateAssetToClient: () => {},
  removeAssetFromClient: () => {},
  getExpiredSubscriptions: () => [],
  returnAssetsToStock: () => {},
  extendSubscription: () => {},
  addHistoryEntry: () => {},
  getAssetHistory: () => [],
  getClientHistory: () => [],
};

export const AssetContext = createContext<AssetContextType>(defaultContextValue);

export const AssetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [history, setHistory] = useState<AssetHistoryEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusRecords, setStatusRecords] = useState<any[]>([]);

  // Hook for status mapping
  const { 
    loadStatusRecords, 
    mapStatusIdToAssetStatus, 
    mapAssetStatusToId 
  } = useStatusMapping(setStatusRecords);

  // Hook for asset operations
  const { 
    loadAssets, 
    addAsset, 
    updateAsset, 
    deleteAsset, 
    getAssetById, 
    filterAssets, 
    getAssetsByStatus, 
    getAssetsByType 
  } = useAssetOperations(assets, setAssets, statusRecords, mapStatusIdToAssetStatus, mapAssetStatusToId);

  // Hook for client operations
  const { 
    getClientById, 
    addClient, 
    updateClient, 
    deleteClient 
  } = useClientOperations(clients, setClients);

  // Hook for history operations
  const { 
    addHistoryEntry, 
    getAssetHistory, 
    getClientHistory 
  } = useHistoryOperations(history, setHistory);

  // Hook for asset-client association
  const { 
    associateAssetToClient, 
    removeAssetFromClient, 
    getExpiredSubscriptions, 
    returnAssetsToStock, 
    extendSubscription 
  } = useAssetOperations(
    assets, 
    setAssets, 
    statusRecords, 
    mapStatusIdToAssetStatus, 
    mapAssetStatusToId, 
    clients, 
    addHistoryEntry
  );

  // Load status records from the database
  useEffect(() => {
    loadStatusRecords();
  }, []);

  // Load assets after status records are loaded
  useEffect(() => {
    if (statusRecords.length > 0) {
      loadAssets();
    }
  }, [statusRecords]);

  return (
    <AssetContext.Provider
      value={{
        assets,
        clients,
        history,
        loading,
        statusRecords,
        addAsset,
        updateAsset,
        deleteAsset,
        getAssetById,
        filterAssets,
        getAssetsByStatus,
        getAssetsByType,
        addClient,
        updateClient,
        deleteClient,
        getClientById,
        associateAssetToClient,
        removeAssetFromClient,
        getExpiredSubscriptions,
        returnAssetsToStock,
        extendSubscription,
        addHistoryEntry,
        getAssetHistory,
        getClientHistory,
      }}
    >
      {children}
    </AssetContext.Provider>
  );
};
