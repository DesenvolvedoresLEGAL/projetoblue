import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Asset } from '@/types/asset';
import { assetReducer, AssetState, AssetAction } from './assetReducer';
import { createAsset, updateAsset, deleteAsset } from './assetActions';
import { showFriendlyError } from '@/utils/errorTranslator';

interface AssetContextProps {
  state: AssetState;
  createAsset: (assetData: any) => Promise<void>;
  updateAsset: (id: string, updates: any) => Promise<void>;
  deleteAsset: (id: string) => Promise<void>;
}

const AssetContext = createContext<AssetContextProps | undefined>(undefined);

const initialState: AssetState = {
  assets: [],
  loading: false,
  error: null,
};

const AssetProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(assetReducer, initialState);

  const handleCreateAsset = async (assetData: any) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const newAsset = await createAsset(assetData);
      if (newAsset) {
        dispatch({ type: 'ADD_ASSET', payload: newAsset });
      }
    } catch (error) {
      console.error('Erro ao criar asset:', error);
      const friendlyMessage = showFriendlyError(error, 'create');
      dispatch({ type: 'SET_ERROR', payload: friendlyMessage });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const handleUpdateAsset = async (id: string, updates: any) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const updatedAsset = await updateAsset(id, updates);
      if (updatedAsset) {
        dispatch({ type: 'UPDATE_ASSET', payload: updatedAsset });
      }
    } catch (error) {
      console.error('Erro ao atualizar asset:', error);
      const friendlyMessage = showFriendlyError(error, 'update');
      dispatch({ type: 'SET_ERROR', payload: friendlyMessage });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const handleDeleteAsset = async (id: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const success = await deleteAsset(id);
      if (success) {
        dispatch({ type: 'DELETE_ASSET', payload: id });
      }
    } catch (error) {
      console.error('Erro ao deletar asset:', error);
      const friendlyMessage = showFriendlyError(error, 'delete');
      dispatch({ type: 'SET_ERROR', payload: friendlyMessage });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const value: AssetContextProps = {
    state,
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
