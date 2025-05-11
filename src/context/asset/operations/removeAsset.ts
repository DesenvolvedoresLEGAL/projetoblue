
import { Asset, ChipAsset, RouterAsset, Client } from "@/types/asset";
import { AssetHistoryEntry } from "@/types/assetHistory";
import { toast } from "@/utils/toast";
import { getAssetById } from "../../assetActions";
import { getClientById } from "../../clientActions";

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
      toast.error(`⚠️ O roteador saiu do cliente ${client.name} e retornou ao estoque. Altere o SSID e a senha.`);
    }
    
    updateAsset(assetId, { 
      status: "DISPONÍVEL" as "DISPONÍVEL",
      clientId: undefined,
      subscription: undefined,
      ...(asset.type === "ROTEADOR" ? { needsPasswordChange } : {})
    });
    
    updateClient(clientId, {
      assets: client.assets.filter(id => id !== assetId)
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
    
    toast.success("Ativo desvinculado do cliente com sucesso!");
  }
};
