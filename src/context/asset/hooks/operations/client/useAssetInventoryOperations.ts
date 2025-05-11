
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
    
    // We need to ensure we match the expected parameter order for removeAssetFromClient
    // Looking at the import, let's check what parameters it expects
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
    
    // Ensure we match the expected parameter order for returnAssetsToStock
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
