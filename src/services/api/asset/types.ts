
import { Asset, AssetStatus, AssetType } from "@/types/asset";

// Export Asset type from main types
export type { Asset };

// Types for asset API requests - corrigidos para alinhar com banco
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
  clientId?: string;
  searchTerm?: string;
  unassigned?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Interface corrigida para criação de assets
export interface AssetCreateParams {
  type: AssetType;
  solution_id: number; // Obrigatório no banco
  status_id?: number;
  manufacturer_id?: number;
  plan_id?: number;
  
  // Campos específicos para CHIP
  iccid?: string;
  line_number?: number; // Corrigido para number
  
  // Campos específicos para ROUTER
  serial_number?: string;
  model?: string;
  radio?: string;
  admin_user?: string;
  admin_pass?: string;
  
  // Campos comuns
  rented_days?: number;
  notes?: string;
  
  // Campos removidos que não existem no banco:
  // phoneNumber, carrier, uniqueId, brand, ssid, password
}

// Interface corrigida para atualização de assets
export interface AssetUpdateParams {
  status_id?: number;
  manufacturer_id?: number;
  plan_id?: number;
  
  // Campos específicos para CHIP
  iccid?: string;
  line_number?: number; // Corrigido para number
  
  // Campos específicos para ROUTER
  serial_number?: string;
  model?: string;
  radio?: string;
  admin_user?: string;
  admin_pass?: string;
  
  // Campos comuns
  rented_days?: number;
  notes?: string;
  
  // Campos removidos que não existem no banco:
  // status, phoneNumber, carrier, brand, ssid, password, serialNumber
}

// Type for status by asset type response
export interface AssetStatusByType {
  type: string;
  status: string;
  count: number;
}

// Interface corrigida para problem assets
export interface ProblemAsset {
  uuid: string;
  iccid?: string;
  radio?: string;
  line_number?: number;
  solution_id: number;
  status_id?: number;
  serial_number?: string;
  model?: string;
  admin_user?: string;
  admin_pass?: string;
  created_at?: string;
  
  // Campos para compatibilidade
  id?: string;
  type?: string;
  status?: string;
  identifier?: string;
  manufacturer?: string;
  solution?: string;
}
