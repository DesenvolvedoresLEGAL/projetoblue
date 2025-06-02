import { AssetType, AssetStatus } from "@/types/asset";

export interface CreateAssetData {
  type: AssetType;
  solution_id: number;
  status_id?: number;
  manufacturer_id?: number;
  plan_id?: number;
  iccid?: string;
  line_number?: number;
  serial_number?: string;
  model?: string;
  admin_pass?: string;
  radio?: string;
  admin_user?: string;
  rented_days?: number;
  notes?: string;
  // Novos campos de configurações de rede - Fábrica
  ssid_fabrica?: string;
  pass_fabrica?: string;
  admin_user_fabrica?: string;
  admin_pass_fabrica?: string;
  // Novos campos de configurações de rede - Atuais
  ssid_atual?: string;
  pass_atual?: string;
}

export interface AssetUpdateParams {
  status_id?: number;
  status?: AssetStatus;
  manufacturer_id?: number;
  rented_days?: number;
  admin_user?: string;
  admin_pass?: string;
  radio?: string;
  iccid?: string;
  line_number?: number;
  plan_id?: number;
  model?: string;
  serial_number?: string;
  clientId?: string;
  subscription?: any;
  // Apenas campos atuais podem ser editados - campos de fábrica nunca
  ssid_atual?: string;
  pass_atual?: string;
}

export interface AssetCreateParams extends CreateAssetData {}

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
  id: string;
  radio: string | null;
  line_number: number;
  solution_id: number;
  type: string;
  status: string;
  statusId: number;
  identifier: string;
}
