
import { Asset } from "@/types/asset";

export interface AssetListParams {
  type?: string;
  status?: string;
  search?: string;
  phoneSearch?: string;
}

export interface AssetCreateParams {
  type: string; // "CHIP" or "ROTEADOR"
  // Common fields
  statusId?: number;
  notes?: string;
  
  // Chip specific fields
  iccid?: string;
  phoneNumber?: string;
  carrier?: string;
  
  // Router specific fields
  uniqueId?: string;
  brand?: string;
  model?: string;
  ssid?: string;
  password?: string;
  serialNumber?: string;
}

export interface AssetUpdateParams {
  // Fields that can be updated
  status?: string;
  statusId?: number;
  notes?: string;
  
  // Chip fields
  iccid?: string;
  phoneNumber?: string;
  carrier?: string;
  
  // Router fields
  brand?: string;
  model?: string;
  ssid?: string;
  password?: string;
  serialNumber?: string;
}

export interface ProblemAsset {
  uuid: string;
  iccid: string;
  radio: string;
  asset_types: {
    type: string;
  };
}

export interface AssetStatusByType {
  type: string;
  status: string;
  count: number;
  total: number;
}
