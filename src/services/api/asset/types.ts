
import { AssetType, AssetStatus } from "@/types/asset";

export interface CreateAssetData {
  type: AssetType;
  solution_id: number;
  status_id?: number;
  manufacturer_id?: number;
  plan_id?: number;
  // CHIP specific fields
  iccid?: string;
  line_number?: number;
  // Router specific fields
  serial_number?: string;
  model?: string;
  admin_pass?: string;
  // Common fields
  radio?: string;
  admin_user?: string;
  rented_days?: number;
  notes?: string;
}

export interface AssetUpdateParams {
  // Status fields
  status_id?: number;
  status?: AssetStatus;
  
  // Common fields
  manufacturer_id?: number;
  rented_days?: number;
  admin_user?: string;
  admin_pass?: string;
  radio?: string;
  
  // CHIP specific fields
  iccid?: string;
  line_number?: number;
  plan_id?: number;
  
  // Router specific fields
  model?: string;
  serial_number?: string;
  
  // Client association
  clientId?: string;
  subscription?: any;
}

export interface AssetCreateParams extends CreateAssetData {}
