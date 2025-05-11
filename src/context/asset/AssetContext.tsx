
import React, { createContext, useState, useEffect } from 'react';
import { Asset, AssetStatus, StatusRecord, Client } from '@/types/asset';
import { AssetHistoryEntry } from '@/types/assetHistory';
import { AssetContextType } from '../AssetContextTypes';
import { 
  useAssetOperations, 
  useClientOperations, 
  useHistoryOperations, 
  useStatusMapping 
} from './hooks';

// Define the default context value
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
  // State management
  const [assets, setAssets] = useState<Asset[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [history, setHistory] = useState<AssetHistoryEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusRecords, setStatusRecords] = useState<StatusRecord[]>([]);

  // Use our custom hooks
  const { 
    loadStatusRecords, 
    mapStatusIdToAssetStatus, 
    mapAssetStatusToId 
  } = useStatusMapping(setStatusRecords);

  // Hook for history operations
  const { 
    addHistoryEntry, 
    getAssetHistory, 
    getClientHistory 
  } = useHistoryOperations(history, setHistory);

  // Hook for client operations
  const { 
    getClientById, 
    addClient, 
    updateClient, 
    deleteClient 
  } = useClientOperations(clients, setClients);

  // Function to wrap mapStatusIdToAssetStatus to match the expected signature
  const mapStatusIdWrapper = (statusId: number): AssetStatus => {
    return mapStatusIdToAssetStatus(statusId, statusRecords);
  };

  // Function to wrap mapAssetStatusToId to match the expected signature
  const mapStatusToIdWrapper = (status: AssetStatus): number => {
    return mapAssetStatusToId(status, statusRecords);
  };

  // Hook for asset operations (combining core, mutation, and client operations)
  const {
    loadAssets,
    addAsset,
    updateAsset,
    deleteAsset,
    getAssetById,
    filterAssets,
    getAssetsByStatus,
    getAssetsByType,
    associateAssetToClient,
    removeAssetFromClient,
    returnAssetsToStock,
    getExpiredSubscriptions,
    extendSubscription
  } = useAssetOperations(
    assets,
    setAssets,
    statusRecords,
    mapStatusIdWrapper,
    mapStatusToIdWrapper,
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
      setLoading(false);
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
