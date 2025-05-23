
import { Asset, AssetStatus, AssetType } from "@/types/asset";

// Export Asset type from main types
export type { Asset };

// Types for asset API requests
export interface AssetListParams {
  type?: AssetType;
  status?: AssetStatus;
  search?: string;
  phoneSearch?: string;
  page?: number;
  limit?: number;
  statusId?: number;
  typeId?: number;
  offset?: number;
  solutionId?: number;
  // Add missing properties
  clientId?: string;
  searchTerm?: string;
  unassigned?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
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
  count: number;
}

// Define a specific type for problem assets from the database
export interface ProblemAsset {
  uuid: string;
  iccid: string | null;
  radio: string | null;
  line_number: number;
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
  admin_user?: string;
  admin_pass?: string;
  serial_number?: string;
}
