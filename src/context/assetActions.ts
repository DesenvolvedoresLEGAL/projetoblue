
import { v4 as uuidv4 } from "uuid";
import { Asset, AssetStatus, AssetType, ChipAsset, EquipamentAsset } from "@/types/asset";
import { toast } from "@/utils/toast";
import { isSameStatus } from "@/utils/assetUtils";

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
    const routerData = assetData as Omit<EquipamentAsset, "id" | "status">;
    newAsset = {
      ...routerData,
      id: uuidv4(),
      status: "DISPONÍVEL" as AssetStatus,
    } as EquipamentAsset;
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
      } else if (asset.type === "EQUIPMENT") {
        if (assetData.type && assetData.type !== "EQUIPMENT") {
          return asset; // Prevent changing the asset type
        }
        return { ...asset, ...assetData } as EquipamentAsset;
      }
      return asset;
    }
    return asset;
  });
};

export const validateAssetDeletion = (asset: Asset | undefined): { valid: boolean, message: string } => {
  if (!asset) {
    return { valid: false, message: "Ativo não encontrado" };
  }
  
  // Check if the asset is currently in use (alugado or assinatura)
  if (isSameStatus(asset.status, "ALUGADO") || isSameStatus(asset.status, "ASSINATURA")) {
    return { 
      valid: false, 
      message: "Não é possível excluir um ativo que está atualmente em uso (alugado ou em assinatura)." 
    };
  }
  
  // Check if the asset is associated with a client
  if (asset.clientId) {
    return { 
      valid: false, 
      message: "Não é possível excluir um ativo que está associado a um cliente. Remova a associação primeiro." 
    };
  }

  return { valid: true, message: "" };
};
