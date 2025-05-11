import { Asset, Client } from '@/types/asset';
import { AssetHistoryEntry } from '@/types/assetHistory';
import { associateAssetToClient } from '../../../operations';

export const useAssetClientAssociation = (
  assets: Asset[],
  updateAsset: (id: string, assetData: Partial<Asset>) => Promise<Asset | null>,
  clients?: Client[],
  addHistoryEntry?: (entry: Omit<AssetHistoryEntry, "id" | "timestamp">) => void
) => {
  const associateAssetToClientWrapper = (assetId: string, clientId: string) => {
    if (!clients) return;
    
    associateAssetToClient(
      assets,
      clients,
      assetId,
      clientId,
      updateAsset,
      addHistoryEntry
    );
  };

  return {
    associateAssetToClient: associateAssetToClientWrapper
  };
};
