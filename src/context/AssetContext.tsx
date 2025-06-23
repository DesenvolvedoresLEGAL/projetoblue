
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Asset, Client, StatusRecord } from '@/types/asset';
import { AssetHistoryEntry } from '@/types/assetHistory';
import { createAsset, updateAsset, deleteAsset } from '@/modules/assets/services/asset/mutations';
import { showFriendlyError } from '@/utils/errorTranslator';
import { useAuth } from '@/context/AuthContext';

interface AssetContextProps {
  assets: Asset[];
  clients: Client[];
  history: AssetHistoryEntry[];
  statusRecords: StatusRecord[];
  loading: boolean;
  error: string | null;
  createAsset: (assetData: any) => Promise<void>;
  updateAsset: (id: string, updates: any) => Promise<Asset>;
  deleteAsset: (id: string) => Promise<boolean>;
  getAssetById: (id: string) => Asset | undefined;
  getAssetsByStatus: (status: string) => Asset[];
  getAssetsByType: (type: string) => Asset[];
  getClientById: (id: string) => Client | undefined;
  associateAssetToClient: (assetId: string, clientId: string) => Promise<void>;
  removeAssetFromClient: (assetId: string, clientId: string) => Promise<void>;
  addHistoryEntry: (entry: Omit<AssetHistoryEntry, "id" | "timestamp">) => void;
  getAssetHistory: (assetId: string) => AssetHistoryEntry[];
  getClientHistory: (clientId: string) => AssetHistoryEntry[];
  getExpiredSubscriptions: () => Asset[];
  returnAssetsToStock: (assetIds: string[]) => void;
  extendSubscription: (assetId: string, newEndDate: string) => void;
}

export const AssetContext = createContext<AssetContextProps | undefined>(undefined);

const AssetProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { hasMinimumRole, isAuthenticated } = useAuth();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [history, setHistory] = useState<AssetHistoryEntry[]>([]);
  const [statusRecords, setStatusRecords] = useState<StatusRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Valida se o usuário tem permissão para executar operações de assets
   * Requer role 'suporte' ou superior para operações críticas
   */
  const validateAssetPermission = () => {
    if (!isAuthenticated) {
      throw new Error('Usuário não autenticado. Faça login para continuar.');
    }
    
    if (!hasMinimumRole('suporte')) {
      throw new Error('Permissão insuficiente. Esta operação requer nível de acesso de suporte ou superior.');
    }
  };

  const handleCreateAsset = async (assetData: any) => {
    try {
      // Validação de permissão antes de executar a operação crítica
      validateAssetPermission();
      
      setLoading(true);
      setError(null);
      const newAsset = await createAsset(assetData);
      if (newAsset) {
        setAssets(prevAssets => [...prevAssets, newAsset]);
      }
    } catch (error) {
      console.error('Erro ao criar asset:', error);
      const friendlyMessage = showFriendlyError(error, 'create');
      setError(friendlyMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAsset = async (id: string, updates: any): Promise<Asset> => {
    try {
      // Validação de permissão antes de executar a operação crítica
      validateAssetPermission();
      
      setLoading(true);
      setError(null);
      const updatedAsset = await updateAsset(id, updates);
      if (updatedAsset) {
        setAssets(prevAssets => 
          prevAssets.map(asset => asset.uuid === id ? updatedAsset : asset)
        );
        return updatedAsset;
      }
      throw new Error('Falha ao atualizar o ativo');
    } catch (error) {
      console.error('Erro ao atualizar asset:', error);
      const friendlyMessage = showFriendlyError(error, 'update');
      setError(friendlyMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAsset = async (id: string): Promise<boolean> => {
    try {
      // Validação de permissão antes de executar a operação crítica
      validateAssetPermission();
      
      setLoading(true);
      setError(null);
      const success = await deleteAsset(id);
      if (success) {
        setAssets(prevAssets => prevAssets.filter(asset => asset.uuid !== id));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erro ao deletar asset:', error);
      const friendlyMessage = showFriendlyError(error, 'delete');
      setError(friendlyMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getAssetById = (id: string) => {
    return assets.find(asset => asset.uuid === id);
  };

  const getAssetsByStatus = (status: string) => {
    return assets.filter(asset => asset.status === status);
  };

  const getAssetsByType = (type: string) => {
    return assets.filter(asset => asset.type === type);
  };

  const getClientById = (id: string) => {
    return clients.find(client => client.uuid === id);
  };

  const associateAssetToClient = async (assetId: string, clientId: string) => {
    // TODO: Implement asset-client association logic
    console.log('Associating asset', assetId, 'to client', clientId);
  };

  const removeAssetFromClient = async (assetId: string, clientId: string) => {
    // TODO: Implement asset-client disassociation logic
    console.log('Removing asset', assetId, 'from client', clientId);
  };

  const addHistoryEntry = (entry: Omit<AssetHistoryEntry, "id" | "timestamp">) => {
    const newEntry: AssetHistoryEntry = {
      ...entry,
      id: Date.now(), // Use number instead of string
      timestamp: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setHistory(prev => [newEntry, ...prev]);
  };

  const getAssetHistory = (assetId: string) => {
    return history.filter(entry => entry.assetIds?.includes(assetId));
  };

  const getClientHistory = (clientId: string) => {
    return history.filter(entry => entry.clientId === clientId);
  };

  const getExpiredSubscriptions = () => {
    // TODO: Implement logic to get expired subscriptions
    return [];
  };

  const returnAssetsToStock = (assetIds: string[]) => {
    // TODO: Implement logic to return assets to stock
    console.log('Returning assets to stock:', assetIds);
  };

  const extendSubscription = (assetId: string, newEndDate: string) => {
    // TODO: Implement logic to extend subscription
    console.log('Extending subscription for asset', assetId, 'to', newEndDate);
  };

  const value: AssetContextProps = {
    assets,
    clients,
    history,
    statusRecords,
    loading,
    error,
    createAsset: handleCreateAsset,
    updateAsset: handleUpdateAsset,
    deleteAsset: handleDeleteAsset,
    getAssetById,
    getAssetsByStatus,
    getAssetsByType,
    getClientById,
    associateAssetToClient,
    removeAssetFromClient,
    addHistoryEntry,
    getAssetHistory,
    getClientHistory,
    getExpiredSubscriptions,
    returnAssetsToStock,
    extendSubscription,
  };

  return (
    <AssetContext.Provider value={value}>
      {children}
    </AssetContext.Provider>
  );
};

const useAssets = () => {
  const context = useContext(AssetContext);
  if (!context) {
    throw new Error('useAssets must be used within an AssetProvider');
  }
  return context;
};

export { AssetProvider, useAssets };
