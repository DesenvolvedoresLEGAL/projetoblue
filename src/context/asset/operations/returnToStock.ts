
import { Asset, ChipAsset, RouterAsset, AssetStatus, Client } from "@/types/asset";
import { AssetHistoryEntry } from "@/types/assetHistory";
import { toast } from "@/utils/toast";
import { getAssetById } from "../../assetActions";
import { getClientById } from "../../clientActions";

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
          setClients(prevClients => 
            prevClients.map(c => {
              if (c.id === asset.clientId) {
                return {
                  ...c,
                  assets: c.assets.filter(id => id !== asset.id)
                };
              }
              return c;
            })
          );
          
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
            operationType: asset.status === "ASSINATURA" ? "ASSINATURA" : "ALUGUEL",
            event: "Retorno ao estoque",
            comments: `Ativo ${assetIdentifier} retornado ao estoque`
          });
          
          if (asset.type === "ROTEADOR") {
            toast.error(`⚠️ O roteador saiu do cliente ${client.name} e retornou ao estoque. Altere o SSID e a senha.`);
          }
        }
      }
      
      const baseUpdates = {
        status: "DISPONÍVEL" as AssetStatus,
        statusId: 1, // Added to match database status_id (1 = Disponível)
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
