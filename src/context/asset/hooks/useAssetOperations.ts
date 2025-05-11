
import { Asset, AssetStatus, AssetType, Client, SubscriptionInfo, StatusRecord } from '@/types/asset';
import { AssetHistoryEntry } from '@/types/assetHistory';
import { useAssetCore } from './operations/useAssetCore';
import { useAssetMutation } from './operations/useAssetMutation';
import { useAssetClient } from './operations/useAssetClient';

export const useAssetOperations = (
  assets: Asset[],
  setAssets: React.Dispatch<React.SetStateAction<Asset[]>>,
  statusRecords: StatusRecord[],
  mapStatusIdToAssetStatus: (statusId: number) => AssetStatus,
  mapAssetStatusToId: (status: AssetStatus) => number,
  clients?: Client[],
  addHistoryEntry?: (entry: Omit<AssetHistoryEntry, "id" | "timestamp">) => void
) => {
  // Core asset operations (loading, filtering, basic getters)
  const coreOperations = useAssetCore(
    assets,
    setAssets,
    statusRecords,
    mapStatusIdToAssetStatus,
    mapAssetStatusToId
  );

  // Mutation operations (add, update, delete)
  const mutationOperations = useAssetMutation(
    assets,
    setAssets,
    mapStatusIdToAssetStatus,
    mapAssetStatusToId,
    statusRecords
  );

  // Client-related operations
  const clientOperations = useAssetClient(
    assets,
    mutationOperations.updateAsset,
    clients,
    addHistoryEntry
  );

  // Return all operations combined
  return {
    ...coreOperations,
    ...mutationOperations,
    ...clientOperations
  };
};
