
import React, { createContext, useState, useEffect } from 'react';
import { Asset, AssetType, ChipAsset, RouterAsset, AssetStatus, StatusRecord } from '@/types/asset';
import * as assetActions from './assetActions';
import { toast } from '@/utils/toast';
import { AssetContextType } from './AssetContextTypes';
import { Client } from '@/types/asset';
import { AssetHistoryEntry } from '@/types/assetHistory';
import { assetService } from '@/services/api/assetService';
import { referenceDataService } from '@/services/api/referenceDataService';
import authService from '@/services/api/authService';

// Default context value
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
  const [statusRecords, setStatusRecords] = useState<StatusRecord[]>([]);

  // Load status records from the API
  useEffect(() => {
    const fetchStatusRecords = async () => {
      try {
        const records = await referenceDataService.getStatusRecords();
        setStatusRecords(records || []);
      } catch (error) {
        console.error('Error loading status records:', error);
        toast.error('Failed to load status records');
      }
    };
    
    fetchStatusRecords();
  }, []);

  // Helper function to map status_id to AssetStatus
  const mapStatusIdToAssetStatus = (statusId: number): AssetStatus => {
    const found = statusRecords.find(s => s.id === statusId);
    if (found) {
      switch (found.nome.toLowerCase()) {
        case 'disponivel': return 'DISPONÍVEL';
        case 'alugado': return 'ALUGADO';
        case 'assinatura': return 'ASSINATURA';
        case 'sem dados': return 'SEM DADOS';
        case 'bloqueado': return 'BLOQUEADO';
        case 'em manutenção': return 'MANUTENÇÃO';
        default: return 'DISPONÍVEL';
      }
    }
    return 'DISPONÍVEL'; // Default fallback
  };

  // Helper function to map AssetStatus to status_id
  const mapAssetStatusToId = (status: AssetStatus): number => {
    const statusMap: Record<AssetStatus, string> = {
      'DISPONÍVEL': 'disponivel',
      'ALUGADO': 'alugado',
      'ASSINATURA': 'assinatura',
      'SEM DADOS': 'sem dados',
      'BLOQUEADO': 'bloqueado',
      'MANUTENÇÃO': 'em manutenção'
    };
    
    const found = statusRecords.find(s => s.nome.toLowerCase() === statusMap[status].toLowerCase());
    return found ? found.id : 1; // Default to 'Disponível' (id=1) if not found
  };

  // Load assets when status records are available
  useEffect(() => {
    const loadAssets = async () => {
      if (statusRecords.length === 0) return; // Wait for status records
      
      setLoading(true);
      
      try {
        // Fetch assets from the API
        const assetsData = await assetService.getAssets();
        setAssets(assetsData);
      } catch (error) {
        console.error('Error loading assets:', error);
        toast.error('Failed to load assets');
      } finally {
        setLoading(false);
      }
    };

    if (statusRecords.length > 0) {
      loadAssets();
    }
  }, [statusRecords]); 

  const addAsset = async (assetData: Omit<Asset, "id" | "status">): Promise<Asset | null> => {
    try {
      // Prepare create params
      const createParams = {
        type: assetData.type,
        statusId: assetData.statusId || 1// Default to 'Disponível'
      } as any;

      if (assetData.type === "CHIP") {
        const chipData = assetData as Omit<ChipAsset, "id" | "status">;
        createParams.iccid = chipData.iccid;
        createParams.phoneNumber = chipData.phoneNumber;
        createParams.carrier = chipData.carrier;
      } else if (assetData.type === "ROTEADOR") {
        const routerData = assetData as Omit<RouterAsset, "id" | "status">;
        createParams.brand = routerData.brand;
        createParams.model = routerData.model;
        createParams.password = routerData.password;
        createParams.serialNumber = routerData.serialNumber;
      }
      
      // Create the asset using the API service
      const newAsset = await assetService.createAsset(createParams);
      
      if (newAsset) {
        // Update state
        setAssets(prevAssets => [...prevAssets, newAsset]);
        return newAsset;
      }
      
      return null;
    } catch (error) {
      console.error('Error adding asset:', error);
      toast.error('Failed to add asset');
      return null;
    }
  };

  const updateAsset = async (id: string, assetData: Partial<Asset>): Promise<Asset | null> => {
    try {
      let statusId = assetData.statusId;
      
      // Convert status to status_id if status is being updated
      if (assetData.status && !statusId) {
        statusId = mapAssetStatusToId(assetData.status);
      } else if (statusId) {
        // Map the statusId back to a status name for the UI
        const statusRecord = statusRecords.find(s => s.id === statusId);
        if (statusRecord) {
          assetData.status = mapStatusIdToAssetStatus(statusId);
        }
      }
      
      // Prepare update params
      const updateParams = {
        ...assetData,
        statusId
      };
      
      // Update the asset using the API service
      const updatedAsset = await assetService.updateAsset(id, updateParams);
      
      if (updatedAsset) {
        // Update state
        const updatedAssets = assetActions.updateAssetInList(assets, id, updatedAsset);
        setAssets(updatedAssets);
        return updatedAsset;
      }
      
      return null;
    } catch (error) {
      console.error('Error updating asset:', error);
      toast.error('Failed to update asset');
      return null;
    }
  };

  const deleteAsset = async (id: string): Promise<boolean> => {
    try {
      const asset = assets.find(a => a.id === id);
      
      if (!asset) {
        toast.error('Asset not found');
        return false;
      }
      
      // Delete the asset using the API service
      const success = await assetService.deleteAsset(id);
      
      if (success) {
        // Update state
        setAssets(assets.filter(a => a.id !== id));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error deleting asset:', error);
      toast.error('Failed to delete asset');
      return false;
    }
  };

  const getAssetById = (id: string) => {
    return assetActions.getAssetById(assets, id);
  };

  const filterAssets = (criteria: any) => {
    let filteredAssets = [...assets];
    
    // Implement filtering logic if needed
    if (criteria.type) {
      filteredAssets = assetActions.getAssetsByType(filteredAssets, criteria.type);
    }
    
    if (criteria.status) {
      filteredAssets = assetActions.getAssetsByStatus(filteredAssets, criteria.status);
    }
    
    return filteredAssets;
  };

  // Client-related functions
  const getClientById = (id: string) => {
    return clients.find(client => client.id === id);
  };

  // History-related functions
  const addHistoryEntry = (entry: Omit<AssetHistoryEntry, "id" | "timestamp">) => {
    const newEntry: AssetHistoryEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      ...entry
    };
    setHistory(prev => [newEntry, ...prev]);
  };

  const getAssetHistory = (assetId: string): AssetHistoryEntry[] => {
    return history.filter(entry => entry.assetIds.includes(assetId))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };
  
  const getClientHistory = (clientId: string): AssetHistoryEntry[] => {
    return history.filter(entry => entry.clientId === clientId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

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
        getAssetsByStatus: (status) => assets.filter(asset => asset.status === status),
        getAssetsByType: (type) => assets.filter(asset => asset.type === type),
        addClient: () => {}, // Implement as needed
        updateClient: () => {}, // Implement as needed
        deleteClient: () => {}, // Implement as needed
        getClientById,
        associateAssetToClient: () => {}, // Implement as needed
        removeAssetFromClient: () => {}, // Implement as needed
        getExpiredSubscriptions: () => [], // Implement as needed
        returnAssetsToStock: () => {}, // Implement as needed
        extendSubscription: () => {}, // Implement as needed
        addHistoryEntry,
        getAssetHistory,
        getClientHistory,
      }}
    >
      {children}
    </AssetContext.Provider>
  );
};
