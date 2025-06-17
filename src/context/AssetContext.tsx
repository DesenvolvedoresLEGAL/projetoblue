
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Asset } from '@/types/asset';
import { createAsset, updateAsset, deleteAsset } from '@/modules/assets/services/asset/mutations';
import { showFriendlyError } from '@/utils/errorTranslator';

interface AssetContextProps {
  assets: Asset[];
  loading: boolean;
  error: string | null;
  createAsset: (assetData: any) => Promise<void>;
  updateAsset: (id: string, updates: any) => Promise<void>;
  deleteAsset: (id: string) => Promise<void>;
}

const AssetContext = createContext<AssetContextProps | undefined>(undefined);

const AssetProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateAsset = async (assetData: any) => {
    try {
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

  const handleUpdateAsset = async (id: string, updates: any) => {
    try {
      setLoading(true);
      setError(null);
      const updatedAsset = await updateAsset(id, updates);
      if (updatedAsset) {
        setAssets(prevAssets => 
          prevAssets.map(asset => asset.uuid === id ? updatedAsset : asset)
        );
      }
    } catch (error) {
      console.error('Erro ao atualizar asset:', error);
      const friendlyMessage = showFriendlyError(error, 'update');
      setError(friendlyMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAsset = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const success = await deleteAsset(id);
      if (success) {
        setAssets(prevAssets => prevAssets.filter(asset => asset.uuid !== id));
      }
    } catch (error) {
      console.error('Erro ao deletar asset:', error);
      const friendlyMessage = showFriendlyError(error, 'delete');
      setError(friendlyMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value: AssetContextProps = {
    assets,
    loading,
    error,
    createAsset: handleCreateAsset,
    updateAsset: handleUpdateAsset,
    deleteAsset: handleDeleteAsset,
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
