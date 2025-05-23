
import { AssetType, AssetStatus } from "@/types/asset";

export interface CreateAssetData {
  type: AssetType;
  solution_id: number; // Obrigatório conforme schema do banco
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

// Adicionando os tipos que estavam faltando nos imports
export interface AssetListParams {
  page?: number;
  limit?: number;
  search?: string;
  typeId?: number;
  statusId?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface AssetStatusByType {
  type: string;
  status: string;
  count: number;
}

export interface ProblemAsset {
  uuid: string;
  iccid: string | null;
  radio: string | null;
  line_number: number;
  solution_id: number;
  id: string;
  type: string;
  status: string;
  statusId: number;
  identifier: string;
}
