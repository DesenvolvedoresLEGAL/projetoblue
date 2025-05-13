import React, { createContext, useState, useEffect } from 'react';
import { Asset, AssetType, ChipAsset, RouterAsset, AssetStatus, StatusRecord } from '@/types/asset';
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

  // Load status records from the database
  useEffect(() => {
    const fetchStatusRecords = async () => {
      const { data, error } = await supabase.from('asset_status').select('*');
      if (error) {
        console.error('Error loading status records:', error);
      } else {
        // Convert the data to match the StatusRecord interface
        const formattedData: StatusRecord[] = data.map((record: any) => ({
          id: record.id,
          nome: record.status
        }));
        setStatusRecords(formattedData || []);
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

  // Carregar os ativos do Supabase durante a inicialização
  useEffect(() => {
    const loadAssets = async () => {
      setLoading(true);
      
      try {
        // Buscar assets da tabela assets
        const { data: assetsData, error: assetsError } = await supabase
          .from('assets')
          .select('*');
        
        if (assetsError) {
          console.error('Erro ao carregar assets:', assetsError);
          throw assetsError;
        }
        
        // Verificar quais assets são chips e quais são roteadores com base no type_id
        // Por exemplo, vamos supor que type_id 1 = CHIP e type_id 2 = ROTEADOR
        
        const convertToAssetObject = (asset: any): Asset => {
          const baseAsset = {
            id: asset.uuid,
            registrationDate: asset.created_at || new Date().toISOString(),
            status: mapStatusIdToAssetStatus(asset.status_id),
            statusId: asset.status_id,
            notes: asset.observacoes || undefined
          };
          
          if (asset.type_id === 1) {
            // É um chip
            return {
              ...baseAsset,
              type: "CHIP" as const,
              iccid: asset.iccid || '',
              phoneNumber: asset.line_number?.toString() || '',
              carrier: asset.manufacturer_id?.toString() || ''
            } as ChipAsset;
          } else {
            // É um roteador
            return {
              ...baseAsset,
              type: "ROTEADOR" as const,
              uniqueId: asset.uuid,
              brand: asset.manufacturer_id?.toString() || '',
              model: asset.model || '',
              ssid: '', // Não temos esses dados no schema atual
              password: asset.password || '',
              ipAddress: '', // Não temos esses dados no schema atual
              adminUser: '', // Não temos esses dados no schema atual
              adminPassword: '', // Não temos esses dados no schema atual
              imei: '', // Não temos esses dados no schema atual
              serialNumber: asset.serial_number || ''
            } as RouterAsset;
          }
        };
        
        // Converter os assets para o formato necessário
        const formattedAssets = assetsData?.map(convertToAssetObject) || [];
        setAssets(formattedAssets);
      } catch (error) {
        console.error('Erro ao carregar ativos:', error);
        toast.error('Erro ao carregar ativos');
      } finally {
        setLoading(false);
      }
    };

    loadAssets();
  }, [statusRecords]); // Dependency on statusRecords ensures assets load after status mapping is available

  const addAsset = async (assetData: Omit<Asset, "id" | "status">): Promise<Asset | null> => {
    try {
      // Default to 'Disponível' status (id = 1) if no status is provided
      const statusId = assetData.statusId || 1;
      
      // Prepare asset data for insert
      const insertData: any = {
        type_id: assetData.type === "CHIP" ? 1 : 2,
        status_id: statusId,
        observacoes: assetData.notes
      };

      if (assetData.type === "CHIP") {
        const chipData = assetData as Omit<ChipAsset, "id" | "status">;
        insertData.iccid = chipData.iccid;
        insertData.line_number = chipData.phoneNumber;
        insertData.manufacturer_id = chipData.carrier ? parseInt(chipData.carrier) : null;
      } else if (assetData.type === "ROTEADOR") {
        const routerData = assetData as Omit<RouterAsset, "id" | "status">;
        insertData.manufacturer_id = routerData.brand ? parseInt(routerData.brand) : null;
        insertData.model = routerData.model;
        insertData.password = routerData.password;
        insertData.serial_number = routerData.serialNumber;
      }
      
      // Insert into the assets table
      const { data, error } = await supabase
        .from('assets')
        .insert(insertData)
        .select()
        .single();
      
      if (error) {
        console.error('Erro ao inserir ativo:', error);
        toast.error(`Erro ao cadastrar ativo: ${error.message}`);
        return null;
      }
      
      // Create asset object from the returned data
      const newAsset = convertToAssetObject(data);
      
      // Update state
      setAssets(prevAssets => [...prevAssets, newAsset]);
      toast.success(assetData.type === "CHIP" ? 'Chip cadastrado com sucesso' : 'Roteador cadastrado com sucesso');
      
      return newAsset;
      
    } catch (error) {
      console.error('Erro ao adicionar ativo:', error);
      toast.error('Erro ao cadastrar ativo');
      return null;
    }
  };

  // Helper function to convert DB data to Asset object (moved from the effect to be reused)
  const convertToAssetObject = (asset: any): Asset => {
    const baseAsset = {
      id: asset.uuid,
      registrationDate: asset.created_at || new Date().toISOString(),
      status: mapStatusIdToAssetStatus(asset.status_id),
      statusId: asset.status_id,
      notes: asset.observacoes || undefined
    };
    
    if (asset.type_id === 1) {
      // É um chip
      return {
        ...baseAsset,
        type: "CHIP" as const,
        iccid: asset.iccid || '',
        phoneNumber: asset.line_number?.toString() || '',
        carrier: asset.manufacturer_id?.toString() || ''
      } as ChipAsset;
    } else {
      // É um roteador
      return {
        ...baseAsset,
        type: "ROTEADOR" as const,
        uniqueId: asset.uuid,
        brand: asset.manufacturer_id?.toString() || '',
        model: asset.model || '',
        ssid: '', // Não temos esses dados no schema atual
        password: asset.password || '',
        ipAddress: '', // Não temos esses dados no schema atual
        adminUser: '', // Não temos esses dados no schema atual
        adminPassword: '', // Não temos esses dados no schema atual
        imei: '', // Não temos esses dados no schema atual
        serialNumber: asset.serial_number || ''
      } as RouterAsset;
    }
  };

  const updateAsset = async (id: string, assetData: Partial<Asset>): Promise<Asset | null> => {
    try {
      const existingAsset = assets.find(asset => asset.id === id);
      
      if (!existingAsset) {
        toast.error('Ativo não encontrado');
        return null;
      }

      // Convert status to status_id if status is being updated
      let statusId = existingAsset.statusId;
      if (assetData.status) {
        statusId = mapAssetStatusToId(assetData.status);
      } else if (assetData.statusId) {
        statusId = assetData.statusId;
        // Map the statusId back to a status name for the UI
        const statusRecord = statusRecords.find(s => s.id === statusId);
        if (statusRecord) {
          assetData.status = mapStatusIdToAssetStatus(statusId);
        }
      }
      
      // Create update object for the asset
      const updateData: any = {
        status_id: statusId
      };
      
      // Add type-specific fields
      if (existingAsset.type === 'CHIP') {
        const chipData = assetData as Partial<ChipAsset>;
        if (chipData.iccid !== undefined) updateData.iccid = chipData.iccid;
        if (chipData.phoneNumber !== undefined) updateData.line_number = chipData.phoneNumber;
        if (chipData.carrier !== undefined) updateData.manufacturer_id = chipData.carrier;
        if (chipData.notes !== undefined) updateData.observacoes = chipData.notes;
      } else if (existingAsset.type === 'ROTEADOR') {
        const routerData = assetData as Partial<RouterAsset>;
        if (routerData.brand !== undefined) updateData.manufacturer_id = routerData.brand;
        if (routerData.model !== undefined) updateData.model = routerData.model;
        if (routerData.password !== undefined) updateData.password = routerData.password;
        if (routerData.serialNumber !== undefined) updateData.serial_number = routerData.serialNumber;
        if (routerData.notes !== undefined) updateData.observacoes = routerData.notes;
      }
      
      // Update the asset in the database
      const { error } = await supabase
        .from('assets')
        .update(updateData)
        .eq('uuid', id);
        
      if (error) {
        console.error('Erro ao atualizar ativo:', error);
        toast.error(`Erro ao atualizar ativo: ${error.message}`);
        return null;
      }
      
      // Update status derived from statusId if it was changed
      if (assetData.status) {
        assetData.statusId = statusId;
      } else if (assetData.statusId) {
        assetData.status = mapStatusIdToAssetStatus(statusId);
      }
      
      // Update the state
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
      
      // Delete the asset from the database
      const { error } = await supabase
        .from('assets')
        .delete()
        .eq('uuid', id);
        
      if (error) {
        console.error('Erro ao excluir ativo:', error);
        toast.error(`Erro ao excluir ativo: ${error.message}`);
        return false;
      }
      
      // Update the state
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
        statusRecords,
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
