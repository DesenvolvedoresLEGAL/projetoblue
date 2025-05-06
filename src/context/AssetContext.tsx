import React, { createContext, useState, useEffect } from 'react';
import { Asset, AssetType, ChipAsset, RouterAsset } from '@/types/asset';
import * as assetActions from './assetActions';
import { toast } from '@/utils/toast';
import { supabase } from '@/integrations/supabase/client';
import { AssetContextType } from './AssetContextTypes';
import { Client } from '@/types/asset';
import { AssetHistoryEntry } from '@/types/assetHistory';

// Definindo o valor padrão para o contexto
const defaultContextValue: AssetContextType = {
  assets: [],
  clients: [],
  history: [],
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

  // Carregar os ativos do Supabase durante a inicialização
  useEffect(() => {
    const loadAssets = async () => {
      setLoading(true);
      
      try {
        // Buscar chips
        const { data: chips, error: chipsError } = await supabase
          .from('chips')
          .select('*');
        
        if (chipsError) {
          console.error('Erro ao carregar chips:', chipsError);
          throw chipsError;
        }
        
        // Buscar roteadores
        const { data: roteadores, error: roteadoresError } = await supabase
          .from('roteadores')
          .select('*');
        
        if (roteadoresError) {
          console.error('Erro ao carregar roteadores:', roteadoresError);
          throw roteadoresError;
        }

        // Converter para o formato de Asset
        const chipsAssets: ChipAsset[] = chips?.map((chip) => ({
          id: chip.id,
          type: "CHIP" as const,
          registrationDate: chip.created_at,
          status: 'DISPONÍVEL',
          iccid: chip.iccid,
          phoneNumber: chip.numero,
          carrier: chip.operadora,
          notes: chip.observacoes || undefined
        })) || [];

        const roteadoresAssets: RouterAsset[] = roteadores?.map((roteador) => ({
          id: roteador.id,
          type: "ROTEADOR" as const,
          registrationDate: roteador.created_at,
          status: 'DISPONÍVEL',
          uniqueId: roteador.id_unico,
          brand: roteador.marca,
          model: roteador.modelo,
          ssid: roteador.ssid || '',
          password: roteador.senha_wifi || '',
          ipAddress: roteador.ip_gerencia,
          adminUser: roteador.usuario_admin,
          adminPassword: roteador.senha_admin,
          imei: roteador.imei,
          serialNumber: roteador.numero_serie,
          notes: roteador.observacoes || undefined
        })) || [];
        
        // Combinar os arrays em uma lista de ativos
        const allAssets = [...chipsAssets, ...roteadoresAssets];
        setAssets(allAssets);
      } catch (error) {
        console.error('Erro ao carregar ativos:', error);
        toast.error('Erro ao carregar ativos');
      } finally {
        setLoading(false);
      }
    };

    loadAssets();
  }, []);

  const addAsset = async (assetData: Omit<Asset, "id" | "status">): Promise<Asset | null> => {
    try {
      if (assetData.type === "CHIP") {
        const chipData = assetData as Omit<ChipAsset, "id" | "status">;
        
        // Inserir no banco de dados
        const { data, error } = await supabase
          .from('chips')
          .insert({
            iccid: chipData.iccid,
            numero: chipData.phoneNumber,
            operadora: chipData.carrier,
            observacoes: chipData.notes
          })
          .select()
          .single();
        
        if (error) {
          console.error('Erro ao inserir chip:', error);
          toast.error(`Erro ao cadastrar chip: ${error.message}`);
          return null;
        }
        
        // Criar o objeto de ativo com os dados retornados
        const newAsset: ChipAsset = {
          id: data.id,
          type: 'CHIP',
          registrationDate: data.created_at,
          status: 'DISPONÍVEL',
          iccid: data.iccid,
          phoneNumber: data.numero,
          carrier: data.operadora,
          notes: data.observacoes || undefined
        };
        
        // Atualizar o estado
        setAssets(prevAssets => [...prevAssets, newAsset]);
        toast.success('Chip cadastrado com sucesso');
        return newAsset;
      } else if (assetData.type === "ROTEADOR") {
        const routerData = assetData as Omit<RouterAsset, "id" | "status">;
        
        // Inserir no banco de dados
        const { data, error } = await supabase
          .from('roteadores')
          .insert({
            id_unico: routerData.uniqueId,
            marca: routerData.brand,
            modelo: routerData.model,
            ssid: routerData.ssid,
            senha_wifi: routerData.password,
            ip_gerencia: routerData.ipAddress,
            usuario_admin: routerData.adminUser,
            senha_admin: routerData.adminPassword,
            imei: routerData.imei,
            numero_serie: routerData.serialNumber,
            observacoes: routerData.notes
          })
          .select()
          .single();
        
        if (error) {
          console.error('Erro ao inserir roteador:', error);
          toast.error(`Erro ao cadastrar roteador: ${error.message}`);
          return null;
        }
        
        // Criar o objeto de ativo com os dados retornados
        const newAsset: RouterAsset = {
          id: data.id,
          type: 'ROTEADOR',
          registrationDate: data.created_at,
          status: 'DISPONÍVEL',
          uniqueId: data.id_unico,
          brand: data.marca,
          model: data.modelo,
          ssid: data.ssid || '',
          password: data.senha_wifi || '',
          ipAddress: data.ip_gerencia,
          adminUser: data.usuario_admin,
          adminPassword: data.senha_admin,
          imei: data.imei,
          serialNumber: data.numero_serie,
          notes: data.observacoes || undefined,
          hasWeakPassword: routerData.hasWeakPassword,
          needsPasswordChange: routerData.needsPasswordChange
        };
        
        // Atualizar o estado
        setAssets(prevAssets => [...prevAssets, newAsset]);
        toast.success('Roteador cadastrado com sucesso');
        return newAsset;
      }
      
      return null;
    } catch (error) {
      console.error('Erro ao adicionar ativo:', error);
      toast.error('Erro ao cadastrar ativo');
      return null;
    }
  };

  const updateAsset = async (id: string, assetData: Partial<Asset>): Promise<Asset | null> => {
    try {
      const existingAsset = assets.find(asset => asset.id === id);
      
      if (!existingAsset) {
        toast.error('Ativo não encontrado');
        return null;
      }
      
      if (existingAsset.type === 'CHIP') {
        const chipData = assetData as Partial<ChipAsset>;
        
        const { error } = await supabase
          .from('chips')
          .update({
            iccid: chipData.iccid,
            numero: chipData.phoneNumber,
            operadora: chipData.carrier,
            observacoes: chipData.notes,
            updated_at: new Date().toISOString()
          })
          .eq('id', id);
          
        if (error) {
          console.error('Erro ao atualizar chip:', error);
          toast.error(`Erro ao atualizar chip: ${error.message}`);
          return null;
        }
      } else if (existingAsset.type === 'ROTEADOR') {
        const routerData = assetData as Partial<RouterAsset>;
        
        const { error } = await supabase
          .from('roteadores')
          .update({
            id_unico: routerData.uniqueId,
            marca: routerData.brand,
            modelo: routerData.model,
            ssid: routerData.ssid,
            senha_wifi: routerData.password,
            ip_gerencia: routerData.ipAddress,
            usuario_admin: routerData.adminUser,
            senha_admin: routerData.adminPassword,
            imei: routerData.imei,
            numero_serie: routerData.serialNumber,
            observacoes: routerData.notes,
            updated_at: new Date().toISOString()
          })
          .eq('id', id);
          
        if (error) {
          console.error('Erro ao atualizar roteador:', error);
          toast.error(`Erro ao atualizar roteador: ${error.message}`);
          return null;
        }
      }
      
      // Atualizar o estado
      const updatedAssets = assetActions.updateAssetInList(assets, id, assetData);
      setAssets(updatedAssets);
      
      const updatedAsset = updatedAssets.find(asset => asset.id === id);
      toast.success('Ativo atualizado com sucesso');
      
      return updatedAsset || null;
    } catch (error) {
      console.error('Erro ao atualizar ativo:', error);
      toast.error('Erro ao atualizar ativo');
      return null;
    }
  };

  const deleteAsset = async (id: string): Promise<boolean> => {
    try {
      const asset = assets.find(a => a.id === id);
      
      if (!asset) {
        toast.error('Ativo não encontrado');
        return false;
      }
      
      if (asset.type === 'CHIP') {
        const { error } = await supabase
          .from('chips')
          .delete()
          .eq('id', id);
          
        if (error) {
          console.error('Erro ao excluir chip:', error);
          toast.error(`Erro ao excluir chip: ${error.message}`);
          return false;
        }
      } else if (asset.type === 'ROTEADOR') {
        const { error } = await supabase
          .from('roteadores')
          .delete()
          .eq('id', id);
          
        if (error) {
          console.error('Erro ao excluir roteador:', error);
          toast.error(`Erro ao excluir roteador: ${error.message}`);
          return false;
        }
      }
      
      // Atualizar o estado
      setAssets(assets.filter(a => a.id !== id));
      toast.success('Ativo excluído com sucesso');
      return true;
    } catch (error) {
      console.error('Erro ao excluir ativo:', error);
      toast.error('Erro ao excluir ativo');
      return false;
    }
  };

  const getAssetById = (id: string) => {
    return assetActions.getAssetById(assets, id);
  };

  const filterAssets = (criteria: any) => {
    let filteredAssets = [...assets];
    
    // Implementar lógica de filtragem se necessário
    // Exemplo: filtrar por tipo
    if (criteria.type) {
      filteredAssets = assetActions.getAssetsByType(filteredAssets, criteria.type);
    }
    
    // Exemplo: filtrar por status
    if (criteria.status) {
      filteredAssets = assetActions.getAssetsByStatus(filteredAssets, criteria.status);
    }
    
    return filteredAssets;
  };

  // Funções relacionadas aos clientes
  const getClientById = (id: string) => {
    return clients.find(client => client.id === id);
  };

  // Funções relacionadas ao histórico
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
        addAsset,
        updateAsset,
        deleteAsset,
        getAssetById,
        filterAssets,
        getAssetsByStatus: (status) => assets.filter(asset => asset.status === status),
        getAssetsByType: (type) => assets.filter(asset => asset.type === type),
        addClient: () => {}, // Implementar conforme necessário
        updateClient: () => {}, // Implementar conforme necessário
        deleteClient: () => {}, // Implementar conforme necessário
        getClientById,
        associateAssetToClient: () => {}, // Implementar conforme necessário
        removeAssetFromClient: () => {}, // Implementar conforme necessário
        getExpiredSubscriptions: () => [], // Implementar conforme necessário
        returnAssetsToStock: () => {}, // Implementar conforme necessário
        extendSubscription: () => {}, // Implementar conforme necessário
        addHistoryEntry,
        getAssetHistory,
        getClientHistory,
      }}
    >
      {children}
    </AssetContext.Provider>
  );
};
