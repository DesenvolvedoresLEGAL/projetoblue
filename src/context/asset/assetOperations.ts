
import { ChipAsset, EquipamentAsset, Asset, AssetStatus, AssetType } from "@/types/asset";
import { AssetHistoryEntry } from "@/types/assetHistory";
import { v4 as uuidv4 } from "uuid";
import { toast } from "@/utils/toast";
import { Client } from "@/types/client"; // Use unified client type
import { SubscriptionInfo } from "@/types/asset";
import { getAssetById } from "../assetActions";
import { isSameStatus } from "@/utils/assetUtils";

// Client operations helper function
const getClientById = (clients: Client[], uuid: string) => {
  return clients.find(client => client.uuid === uuid);
};

// Asset operations

export const returnAssetsToStock = (
  assets: Asset[],
  clients: Client[],
  assetIds: string[],
  setAssets: (value: React.SetStateAction<Asset[]>) => void,
  setClients: (value: React.SetStateAction<Client[]>) => void,
  addHistoryEntry: (entry: Omit<AssetHistoryEntry, "id" | "timestamp">) => void
) => {
  let updated = false;
  
  const updatedAssets = assets.map(asset => {
    if (assetIds.includes(asset.id)) {
      updated = true;
      
      if (asset.clientId) {
        const client = getClientById(clients, asset.clientId);
        if (client) {
          const assetIdentifier = asset.type === "CHIP" 
            ? (asset as ChipAsset).iccid 
            : (asset as EquipamentAsset).uniqueId;
            
          addHistoryEntry({
            clientId: asset.clientId,
            clientName: client.empresa, // Use empresa instead of nome
            assetIds: [asset.id],
            assets: [{
              id: asset.id,
              type: asset.type,
              identifier: assetIdentifier
            }],
            operationType: isSameStatus(asset.status, "ASSINATURA") ? "ASSINATURA" : "ALUGUEL",
            event: "Retorno ao estoque",
            comments: `Ativo ${assetIdentifier} retornado ao estoque`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
          
          if (asset.type === "ROTEADOR") {
            toast.error(`⚠️ O roteador saiu do cliente ${client.empresa} e retornou ao estoque. Altere o SSID e a senha.`);
          }
        }
      }
      
      const baseUpdates = {
        status: "DISPONÍVEL" as AssetStatus,
        statusId: 1,
        clientId: undefined,
        subscription: undefined,
      };
      
      const routerUpdates = asset.type === "ROTEADOR" ? { needsPasswordChange: true } : {};
      
      return {
        ...asset,
        ...baseUpdates,
        ...routerUpdates
      };
    }
    return asset;
  });
  
  if (updated) {
    setAssets(updatedAssets);
    toast.success("Ativos retornados ao estoque com sucesso!");
  }
};

export const associateAssetToClient = (
  assets: Asset[],
  clients: Client[],
  assetId: string,
  clientId: string,
  subscription: SubscriptionInfo | undefined,
  updateAsset: (id: string, assetData: Partial<Asset>) => void,
  updateClient: (id: string, clientData: Partial<Client>) => void,
  addHistoryEntry: (entry: Omit<AssetHistoryEntry, "id" | "timestamp">) => void
) => {
  const asset = getAssetById(assets, assetId);
  const client = getClientById(clients, clientId);
  
  if (asset && client) {
    let status: AssetStatus;
    let statusId: number;
    
    if (subscription?.type === "ANUAL" || subscription?.type === "MENSAL") {
      status = "ASSINATURA";
      statusId = 3;
    } else if (subscription?.type === "ALUGUEL") {
      status = "ALUGADO";
      statusId = 2;
    } else {
      status = "ALUGADO";
      statusId = 2;
    }
    
    updateAsset(assetId, { 
      status,
      statusId,
      clientId,
      subscription: subscription ? {
        ...subscription,
        isExpired: false
      } : undefined
    });
    
    const assetIdentifier = asset.type === "CHIP" 
      ? (asset as ChipAsset).iccid 
      : (asset as EquipamentAsset).uniqueId;
      
    addHistoryEntry({
      clientId,
      clientName: client.empresa, // Use empresa instead of nome
      assetIds: [assetId],
      assets: [{
        id: assetId,
        type: asset.type,
        identifier: assetIdentifier
      }],
      operationType: isSameStatus(status, "ASSINATURA") ? "ASSINATURA" : "ALUGUEL",
      comments: `Ativo ${assetIdentifier} associado ao cliente ${client.empresa}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    
    toast.success("Ativo vinculado ao cliente com sucesso!");
  }
};

export const removeAssetFromClient = (
  assets: Asset[],
  clients: Client[],
  assetId: string,
  clientId: string,
  updateAsset: (id: string, assetData: Partial<Asset>) => void,
  updateClient: (id: string, clientData: Partial<Client>) => void,
  addHistoryEntry: (entry: Omit<AssetHistoryEntry, "id" | "timestamp">) => void
) => {
  const asset = getAssetById(assets, assetId);
  const client = getClientById(clients, clientId);
  
  if (asset && client) {
    let needsPasswordChange = false;
    
    if (asset.type === "ROTEADOR") {
      needsPasswordChange = true;
      toast.error(`⚠️ O roteador saiu do cliente ${client.empresa} e retornou ao estoque. Altere o SSID e a senha.`);
    }
    
    updateAsset(assetId, { 
      status: "DISPONÍVEL" as AssetStatus,
      clientId: undefined,
      subscription: undefined,
      ...(asset.type === "ROTEADOR" ? { needsPasswordChange } : {})
    });
    
    const assetIdentifier = asset.type === "CHIP" 
      ? (asset as ChipAsset).iccid 
      : (asset as EquipamentAsset).uniqueId;
      
    addHistoryEntry({
      clientId,
      clientName: client.empresa, // Use empresa instead of nome
      assetIds: [assetId],
      assets: [{
        id: assetId,
        type: asset.type,
        identifier: assetIdentifier
      }],
      operationType: isSameStatus(asset.status, "ASSINATURA") ? "ASSINATURA" : "ALUGUEL",
      event: "Retorno ao estoque",
      comments: `Ativo ${assetIdentifier} removido do cliente ${client.empresa}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    
    toast.success("Ativo desvinculado do cliente com sucesso!");
  }
};

export const extendSubscription = (
  assets: Asset[],
  clients: Client[],
  assetId: string,
  newEndDate: string,
  updateAsset: (id: string, assetData: Partial<Asset>) => void,
  addHistoryEntry: (entry: Omit<AssetHistoryEntry, "id" | "timestamp">) => void
) => {
  const asset = getAssetById(assets, assetId);
  if (asset && asset.subscription && asset.clientId) {
    const client = getClientById(clients, asset.clientId);
    
    updateAsset(assetId, {
      subscription: {
        ...asset.subscription,
        endDate: newEndDate,
        isExpired: false
      }
    });
    
    if (client) {
      const assetIdentifier = asset.type === "CHIP" 
        ? (asset as ChipAsset).iccid 
        : (asset as EquipamentAsset).uniqueId;
        
      addHistoryEntry({
        clientId: asset.clientId,
        clientName: client.empresa, // Use empresa instead of nome
        assetIds: [asset.id],
        assets: [{
          id: asset.id,
          type: asset.type,
          identifier: assetIdentifier
        }],
        operationType: "ASSINATURA",
        event: "Extensão de assinatura",
        comments: `Assinatura do ativo ${assetIdentifier} estendida até ${new Date(newEndDate).toLocaleDateString('pt-BR')}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }
    
    toast.success("Assinatura estendida com sucesso!");
  }
};
