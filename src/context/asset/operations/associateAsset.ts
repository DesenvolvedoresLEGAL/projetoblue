
import { Asset, ChipAsset, RouterAsset, Client } from "@/types/asset";
import { AssetHistoryEntry } from "@/types/assetHistory";
import { toast } from "@/utils/toast";
import { getAssetById } from "../../assetActions";
import { getClientById } from "../../clientActions";

export const associateAssetToClient = (
  assets: Asset[],
  clients: Client[],
  assetId: string,
  clientId: string,
  updateAsset: (id: string, assetData: Partial<Asset>) => void,
  addHistoryEntry: (entry: Omit<AssetHistoryEntry, "id" | "timestamp">) => void
) => {
  const asset = getAssetById(assets, assetId);
  const client = getClientById(clients, clientId);
  
  if (!asset || !client) {
    toast.error("Erro ao associar ativo: Ativo ou cliente não encontrado");
    return;
  }
  
  if (asset.clientId) {
    toast.error("Este ativo já está associado a um cliente. Remova a associação primeiro.");
    return;
  }
  
  if (asset.status !== "DISPONÍVEL") {
    toast.error(`Erro ao associar ativo: O ativo precisa estar disponível (status atual: ${asset.status})`);
    return;
  }
  
  // Update the asset with the client ID
  updateAsset(assetId, { 
    clientId,
    status: "ALUGADO"
  });
  
  // Add asset ID to client's assets array
  const updatedClient = {
    ...client,
    assets: [...client.assets, assetId]
  };
  
  // Create asset history entry
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
    operationType: "ALUGUEL",
    event: "Associação de ativo",
    comments: `Ativo ${assetIdentifier} associado ao cliente ${client.name}`
  });
  
  toast.success("Ativo associado ao cliente com sucesso!");
};
