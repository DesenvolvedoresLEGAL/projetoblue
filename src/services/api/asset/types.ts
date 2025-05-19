import { Asset } from "@/types/asset";

export interface AssetListParams {
  type?: string;
  status?: string;
  search?: string;
  phoneSearch?: string;
}

export interface ProblemAsset {
  uuid: string;
  iccid: string;
  radio: string;
  asset_types: {
    type: string;
  };
}

// Update or add the AssetStatusByType interface
export interface AssetStatusByType {
  type: string;
  status: string;
  count: number;
  total: number; // Adding the missing 'total' property
}
