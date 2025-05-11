
import { Asset, ChipAsset, RouterAsset } from '@/types/asset';
import { AssetHistoryEntry } from '@/types/assetHistory';
import { toast } from '@/utils/toast';

export const useAssetInventoryOperations = (
  assets: Asset[],
  updateAsset: (id: string, assetData: Partial<Asset>) => Promise<Asset | null>,
  clients?: Client[],
  addHistoryEntry?: (entry: Omit<AssetHistoryEntry, "id" | "timestamp">) => void
) => {
  // Skip operations if clients or addHistoryEntry are not provided
  if (!clients || !addHistoryEntry) {
    return {
      returnAssetsToStock: () => {},
    };
  }

  const getAssetById = (id: string) => {
    return assets.find(asset => asset.id === id);
  };

  const returnAssetsToStock = (assetIds: string[]) => {
    const assetActions = assetIds.map(id => {
      const asset = getAssetById(id);
      if (!asset) return null;
      
      if (asset.clientId) {
        const client = clients.find(c => c.id === asset.clientId);
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
            operationType: asset.status === "ASSINATURA" ? "ASSINATURA" : "ALUGUEL",
            event: "Retorno ao estoque",
            comments: `Ativo ${assetIdentifier} retornado ao estoque`
          });
          
          if (asset.type === "ROTEADOR") {
            toast.error(`⚠️ O roteador saiu do cliente ${client.name} e retornou ao estoque. Altere o SSID e a senha.`);
          }
        }
      }
      
      return updateAsset(id, {
        status: "DISPONÍVEL",
        statusId: 1,
        clientId: undefined,
        subscription: undefined,
        ...(asset.type === "ROTEADOR" ? { needsPasswordChange: true } : {})
      });
    });
    
    Promise.all(assetActions.filter(Boolean)).then(() => {
      toast.success("Ativos retornados ao estoque com sucesso!");
    });
  };

  return {
    returnAssetsToStock
  };
};

// Add missing Client type for typechecking
import { Client } from '@/types/asset';
