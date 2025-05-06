
import { v4 as uuidv4 } from "uuid";
import { Asset, AssetStatus, AssetType, ChipAsset, RouterAsset } from "@/types/asset";
import { toast } from "@/utils/toast";

export const getAssetById = (assets: Asset[], id: string) => {
  return assets.find(asset => asset.id === id);
};

export const getAssetsByStatus = (assets: Asset[], status: AssetStatus) => {
  return assets.filter(asset => asset.status === status);
};

export const getAssetsByType = (assets: Asset[], type: AssetType) => {
  return assets.filter(asset => asset.type === type);
};

export const createAsset = (assetData: Omit<Asset, "id" | "status">) => {
  let newAsset: Asset;
  
  if (assetData.type === "CHIP") {
    const chipData = assetData as Omit<ChipAsset, "id" | "status">;
    newAsset = {
      ...chipData,
      id: uuidv4(),
      status: "DISPONÍVEL" as AssetStatus,
    } as ChipAsset;
  } else {
    const routerData = assetData as Omit<RouterAsset, "id" | "status">;
    newAsset = {
      ...routerData,
      id: uuidv4(),
      status: "DISPONÍVEL" as AssetStatus,
    } as RouterAsset;
  }
  
  return newAsset;
};

export const updateAssetInList = (assets: Asset[], id: string, assetData: Partial<Asset>): Asset[] => {
  return assets.map(asset => {
    if (asset.id === id) {
      if (asset.type === "CHIP") {
        if (assetData.type && assetData.type !== "CHIP") {
          return asset; // Prevent changing the asset type
        }
        return { ...asset, ...assetData } as ChipAsset;
      } else if (asset.type === "ROTEADOR") {
        if (assetData.type && assetData.type !== "ROTEADOR") {
          return asset; // Prevent changing the asset type
        }
        return { ...asset, ...assetData } as RouterAsset;
      }
      return asset;
    }
    return asset;
  });
};
