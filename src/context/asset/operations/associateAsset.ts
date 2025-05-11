
import { Asset, ChipAsset, RouterAsset, AssetStatus, Client, SubscriptionInfo } from "@/types/asset";
import { AssetHistoryEntry } from "@/types/assetHistory";
import { toast } from "@/utils/toast";
import { getAssetById } from "../../assetActions";
import { getClientById } from "../../clientActions";

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
    
    if (!client.assets.includes(assetId)) {
      updateClient(clientId, {
        assets: [...client.assets, assetId]
      });
    }
    
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
    
    toast.success("Ativo vinculado ao cliente com sucesso!");
  }
};
