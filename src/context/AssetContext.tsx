import React, { createContext, useState, useContext, useEffect } from 'react';
import { Asset } from '@/types/asset';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/utils/toast';

interface AssetContextProps {
  assets: Asset[];
  setAssets: React.Dispatch<React.SetStateAction<Asset[]>>;
  fetchAssets: () => Promise<void>;
  createAsset: (assetData: Omit<Asset, 'id'>) => Promise<Asset | null>;
  updateAsset: (id: string, assetData: Partial<Asset>) => Promise<Asset | null>;
  deleteAsset: (id: string) => Promise<boolean>;
}

const AssetContext = createContext<AssetContextProps | undefined>(undefined);

interface AssetProviderProps {
  children: React.ReactNode;
}

import { showFriendlyError } from '@/utils/errorTranslator';

export const AssetProvider: React.FC<AssetProviderProps> = ({ children }) => {
  const [assets, setAssets] = useState<Asset[]>([]);

  const fetchAssets = async () => {
    try {
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setAssets(data || []);
    } catch (error) {
      console.error('Erro ao buscar ativos:', error);
      toast.error('Erro ao buscar ativos.');
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const createAsset = async (assetData: Omit<Asset, 'id'>): Promise<Asset | null> => {
    try {
      const { data, error } = await supabase
        .from('assets')
        .insert([assetData])
        .select()
        .single();

      if (error) throw error;

      setAssets(prev => [...prev, data]);
      toast.success('Ativo criado com sucesso!');
      return data;
    } catch (error) {
      console.error('Erro ao criar ativo:', error);
      showFriendlyError(error);
      return null;
    }
  };

  const updateAsset = async (id: string, assetData: Partial<Asset>): Promise<Asset | null> => {
    try {
      const { data, error } = await supabase
        .from('assets')
        .update(assetData)
        .eq('uuid', id)
        .select()
        .single();

      if (error) throw error;

      setAssets(prev => prev.map(asset => 
        asset.id === id ? { ...asset, ...data } : asset
      ));

      toast.success('Ativo atualizado com sucesso!');
      return data;
    } catch (error) {
      console.error('Erro ao atualizar ativo:', error);
      showFriendlyError(error);
      return null;
    }
  };

  const deleteAsset = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('assets')
        .update({ deleted_at: new Date().toISOString() })
        .eq('uuid', id);

      if (error) throw error;

      setAssets(prev => prev.filter(asset => asset.id !== id));
      toast.success('Ativo removido com sucesso!');
      return true;
    } catch (error) {
      console.error('Erro ao remover ativo:', error);
      if (error?.message?.includes('foreign key constraint')) {
        showFriendlyError(null, 'Não foi possível excluir este ativo pois ele está vinculado a outros registros.');
      } else {
        showFriendlyError(error);
      }
      return false;
    }
  };

  const value: AssetContextProps = {
    assets,
    setAssets,
    fetchAssets,
    createAsset,
    updateAsset,
    deleteAsset,
  };

  return (
    <AssetContext.Provider value={value}>
      {children}
    </AssetContext.Provider>
  );
};

export const useAssets = (): AssetContextProps => {
  const context = useContext(AssetContext);
  if (!context) {
    throw new Error('useAssets must be used within an AssetProvider');
  }
  return context;
};
