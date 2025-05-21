
import { Asset, AssetStatus, AssetType } from "@/types/asset";

// Types for asset API requests
export interface AssetListParams {
  type?: AssetType;
  status?: AssetStatus;
  search?: string;
  phoneSearch?: string;
  page?: number;
  limit?: number;
  statusId?: number; // Added to match usage in queries.ts
  typeId?: number;   // Added to match usage in queries.ts
  offset?: number;   // Added to match usage in queries.ts
  solutionId?: number; // Added for dynamic solution filtering
}

export interface AssetCreateParams {
  type: AssetType;
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
  radio?: string;
  
  // Added fields for database compatibility
  manufacturer_id?: number;
  plan_id?: number;
  rented_days?: number;
  admin_user?: string;
  admin_pass?: string;
}

export interface AssetUpdateParams {
  // Fields that can be updated
  status?: AssetStatus;
  statusId?: number;
  notes?: string;
  
  // Chip fields
  iccid?: string;
  phoneNumber?: string;
  carrier?: string;
  line_number?: number;
  
  // Router fields
  brand?: string;
  model?: string;
  ssid?: string;
  password?: string;
  serialNumber?: string;
  serial_number?: string;
  radio?: string;
  
  // Added fields for database compatibility
  manufacturer_id?: number;
  plan_id?: number;
  rented_days?: number;
  admin_user?: string;
  admin_pass?: string;
}

// Type for status by asset type response
export interface AssetStatusByType {
  type: string;
  status: string;
  count: number;  // Changed from 'total' to 'count' to match the SQL function's return value
}

// Define a specific type for problem assets from the database
export interface ProblemAsset {
  uuid: string;
  iccid: string | null;
  radio: string | null;
  solution_id: number;
  // Adding missing fields required by the implementation
  id?: string;
  type?: string;
  status?: string;
  statusId?: number;
  identifier?: string;
  model?: string;
  manufacturer?: string;
  solution?: string;
  createdAt?: string;
}
