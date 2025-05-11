
import { Asset, Client } from '@/types/asset';
import { AssetHistoryEntry } from '@/types/assetHistory';
import { removeAssetFromClient, returnAssetsToStock } from '../../../operations';

export const useAssetInventoryOperations = (
  assets: Asset[],
  updateAsset: (id: string, assetData: Partial<Asset>) => Promise<Asset | null>,
  clients?: Client[],
  updateClient?: (id: string, clientData: Partial<Client>) => void,
  addHistoryEntry?: (entry: Omit<AssetHistoryEntry, "id" | "timestamp">) => void
) => {
  // Remove an asset from a client
  const removeAssetFromClientWrapper = (assetId: string, clientId: string) => {
    if (!clients || !updateClient || !addHistoryEntry) return;
    
    removeAssetFromClient(
      assetId,
      clientId,
      assets,
      updateAsset,
      updateClient,
      addHistoryEntry
    );
  };

  // Return multiple assets to stock
  const returnAssetsToStockWrapper = (assetIds: string[]) => {
    if (!clients || !updateClient || !addHistoryEntry) return;
    
    returnAssetsToStock(
      assetIds,
      assets,
      clients,
      updateAsset,
      updateClient,
      addHistoryEntry
    );
  };

  return {
    removeAssetFromClient: removeAssetFromClientWrapper,
    returnAssetsToStock: returnAssetsToStockWrapper
  };
};
