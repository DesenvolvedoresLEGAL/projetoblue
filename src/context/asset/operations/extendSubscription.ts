
import { Asset, ChipAsset, RouterAsset, Client } from "@/types/asset";
import { AssetHistoryEntry } from "@/types/assetHistory";
import { toast } from "@/utils/toast";
import { getAssetById } from "../../assetActions";
import { getClientById } from "../../clientActions";

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
        : (asset as RouterAsset).uniqueId;
        
      addHistoryEntry({
        clientId: asset.clientId,
        clientName: client.name,
        assetIds: [asset.id],
        assets: [{
          id: asset.id,
          type: asset.type,
          identifier: assetIdentifier
        }],
        operationType: "ASSINATURA",
        event: "Extensão de assinatura",
        comments: `Assinatura do ativo ${assetIdentifier} estendida até ${new Date(newEndDate).toLocaleDateString('pt-BR')}`
      });
    }
    
    toast.success("Assinatura estendida com sucesso!");
  }
};
