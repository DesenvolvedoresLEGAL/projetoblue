
import { Asset, Client, SubscriptionInfo } from '@/types/asset';
import { AssetHistoryEntry } from '@/types/assetHistory';
import { toast } from '@/utils/toast';
import { associateAssetToClient, removeAssetFromClient } from '@/context/asset/operations';

export const useAssetClientAssociation = (
  assets: Asset[],
  updateAsset: (id: string, assetData: Partial<Asset>) => Promise<Asset | null>,
  clients?: Client[],
  addHistoryEntry?: (entry: Omit<AssetHistoryEntry, "id" | "timestamp">) => void
) => {
  // Skip client-related operations if clients or addHistoryEntry are not provided
  if (!clients || !addHistoryEntry) {
    return {
      associateAssetToClient: () => {},
      removeAssetFromClient: () => {},
    };
  }

  const getAssetById = (id: string) => {
    return assets.find(asset => asset.id === id);
  };

  const handleAssociateAssetToClient = (assetId: string, clientId: string, subscription?: SubscriptionInfo) => {
    const asset = getAssetById(assetId);
    const client = clients.find(c => c.id === clientId);
    
    if (!asset || !client) return;
    
    let status;
    let statusId;
    
    if (subscription?.type === "ANUAL" || subscription?.type === "MENSAL") {
      status = "ASSINATURA";
      statusId = 3; // Assuming 'Assinatura' has id = 3
    } else if (subscription?.type === "ALUGUEL") {
      status = "ALUGADO";
      statusId = 2; // Assuming 'Alugado' has id = 2
    } else {
      status = "ALUGADO"; // Default fallback
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
      : (asset as RouterAsset).uniqueId;
      
    addHistoryEntry({
      clientId,
      clientName: client.name,
      assetIds: [assetId],
      assets: [{
        id: assetId,
        type: asset.type,
        identifier: assetIdentifier
      }],
      operationType: status === "ASSINATURA" ? "ASSINATURA" : "ALUGUEL",
      comments: `Ativo ${assetIdentifier} associado ao cliente ${client.name}`
    });
  };
  
  const handleRemoveAssetFromClient = (assetId: string, clientId: string) => {
    const asset = getAssetById(assetId);
    const client = clients.find(c => c.id === clientId);
    
    if (!asset || !client) return;
    
    let needsPasswordChange = false;
    
    if (asset.type === "ROTEADOR") {
      needsPasswordChange = true;
      toast.error(`⚠️ O roteador saiu do cliente ${client.name} e retornou ao estoque. Altere o SSID e a senha.`);
    }
    
    updateAsset(assetId, { 
      status: "DISPONÍVEL",
      statusId: 1, // Assuming 'Disponível' has id = 1
      clientId: undefined,
      subscription: undefined,
      ...(asset.type === "ROTEADOR" ? { needsPasswordChange } : {})
    });
    
    const assetIdentifier = asset.type === "CHIP" 
      ? (asset as ChipAsset).iccid 
      : (asset as RouterAsset).uniqueId;
      
    addHistoryEntry({
      clientId,
      clientName: client.name,
      assetIds: [assetId],
      assets: [{
        id: assetId,
        type: asset.type,
        identifier: assetIdentifier
      }],
      operationType: asset.status === "ASSINATURA" ? "ASSINATURA" : "ALUGUEL",
      event: "Retorno ao estoque",
      comments: `Ativo ${assetIdentifier} removido do cliente ${client.name}`
    });
  };

  return {
    associateAssetToClient: handleAssociateAssetToClient,
    removeAssetFromClient: handleRemoveAssetFromClient
  };
};

// Add missing ChipAsset and RouterAsset types for typechecking
import { ChipAsset, RouterAsset } from '@/types/asset';
