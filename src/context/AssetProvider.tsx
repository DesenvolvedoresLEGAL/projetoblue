import React, { useContext, useState, useMemo, ReactNode } from 'react';
import { Asset, Client, StatusRecord } from '@/types/asset';
import { AssetHistoryEntry } from '@/types/assetHistory';
import { createAsset, updateAsset, deleteAsset } from '@/modules/assets/services/asset/mutations';
import type { AssetCreateParams, AssetUpdateParams } from '@/modules/assets/services/asset/types';
import { showFriendlyError } from '@/utils/errorTranslator';
import { useAuth } from '@/context/AuthContext';
import { AssetContext, AssetContextProps } from './AssetContext';

const AssetProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { hasMinimumRole, isAuthenticated } = useAuth();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [history, setHistory] = useState<AssetHistoryEntry[]>([]);
  const [statusRecords, setStatusRecords] = useState<StatusRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Memoized validation function to prevent re-renders
  const validateAssetPermission = useMemo(() => {
    return () => {
      if (!isAuthenticated) {
        throw new Error('Usuário não autenticado. Faça login para continuar.');
      }
      
      if (!hasMinimumRole('suporte')) {
        throw new Error('Permissão insuficiente. Esta operação requer nível de acesso de suporte ou superior.');
      }
    };
  }, [isAuthenticated, hasMinimumRole]);

  // Optimized asset operations with better error handling
  const handleCreateAsset = useMemo(() => {
    return async (assetData: AssetCreateParams) => {
      try {
        validateAssetPermission();
        setLoading(true);
        setError(null);
        
        const newAsset = await createAsset(assetData);
        if (newAsset) {
          setAssets(prevAssets => {
            // Prevent duplicates
            const filtered = prevAssets.filter(a => a.uuid !== newAsset.uuid);
            return [...filtered, newAsset];
          });
        }
      } catch (error) {
        
        const friendlyMessage = showFriendlyError(error, 'create');
        setError(friendlyMessage);
        throw error;
      } finally {
        setLoading(false);
      }
    };
  }, [validateAssetPermission]);

  const handleUpdateAsset = useMemo(() => {
    return async (id: string, updates: AssetUpdateParams): Promise<Asset> => {
      try {
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
        
        const friendlyMessage = showFriendlyError(error, 'update');
        setError(friendlyMessage);
        throw error;
      } finally {
        setLoading(false);
      }
    };
  }, [validateAssetPermission]);

  const handleDeleteAsset = useMemo(() => {
    return async (id: string): Promise<boolean> => {
      try {
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
        
        const friendlyMessage = showFriendlyError(error, 'delete');
        setError(friendlyMessage);
        throw error;
      } finally {
        setLoading(false);
      }
    };
  }, [validateAssetPermission]);

  // Memoized helper functions
  const getAssetById = useMemo(() => {
    return (id: string) => assets.find(asset => asset.uuid === id);
  }, [assets]);

  const getAssetsByStatus = useMemo(() => {
    return (status: string) => assets.filter(asset => asset.status === status);
  }, [assets]);

  const getAssetsByType = useMemo(() => {
    return (type: string) => assets.filter(asset => asset.type === type);
  }, [assets]);

  const getClientById = useMemo(() => {
    return (id: string) => clients.find(client => client.uuid === id);
  }, [clients]);

  // Optimized history operations
  const addHistoryEntry = useMemo(() => {
    return (entry: Omit<AssetHistoryEntry, "id" | "timestamp">) => {
      const newEntry: AssetHistoryEntry = {
        ...entry,
        id: Date.now(), // Keep as number to match interface
        timestamp: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setHistory(prev => [newEntry, ...prev.slice(0, 99)]); // Keep only last 100 entries
    };
  }, []);

  const getAssetHistory = useMemo(() => {
    return (assetId: string) => history.filter(entry => entry.assetIds?.includes(assetId));
  }, [history]);

  const getClientHistory = useMemo(() => {
    return (clientId: string) => history.filter(entry => entry.clientId === clientId);
  }, [history]);

  // Memoized context value to prevent unnecessary re-renders
  const value: AssetContextProps = useMemo(() => ({
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
    associateAssetToClient: async (assetId: string, clientId: string) => {
      
    },
    removeAssetFromClient: async (assetId: string, clientId: string) => {
      
    },
    addHistoryEntry,
    getAssetHistory,
    getClientHistory,
    getExpiredSubscriptions: () => [],
    returnAssetsToStock: (assetIds: string[]) => {
      
    },
    extendSubscription: (assetId: string, newEndDate: string) => {
      
    },
  }), [
    assets,
    clients,
    history,
    statusRecords,
    loading,
    error,
    handleCreateAsset,
    handleUpdateAsset,
    handleDeleteAsset,
    getAssetById,
    getAssetsByStatus,
    getAssetsByType,
    getClientById,
    addHistoryEntry,
    getAssetHistory,
    getClientHistory,
  ]);

  return (
    <AssetContext.Provider value={value}>
      {children}
    </AssetContext.Provider>
  );
};

export { AssetProvider };
