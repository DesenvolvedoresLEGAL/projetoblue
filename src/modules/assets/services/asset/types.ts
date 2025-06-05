
import { AssetType, AssetStatus } from "@/types/asset";

// Interface corrigida para criação de assets, alinhada com campos do banco
export interface CreateAssetData {
  type?: AssetType; // Adicionado para compatibilidade
  solution_id: number; // Obrigatório no banco
  status_id?: number;
  manufacturer_id?: number;
  plan_id?: number;
  iccid?: string; // Para CHIPs
  line_number?: number; // bigint no banco
  serial_number?: string; // Para ROUTERs
  model?: string;
  admin_pass?: string;
  radio?: string;
  admin_user?: string;
  rented_days?: number; // bigint com default 0
  notes?: string; // Removido do banco, mantido para compatibilidade
  // Campos de configurações de rede - Fábrica (imutáveis)
  ssid_fabrica?: string;
  pass_fabrica?: string;
  admin_user_fabrica?: string;
  admin_pass_fabrica?: string;
  // Campos de configurações de rede - Atuais (editáveis)
  ssid_atual?: string;
  pass_atual?: string;
  // Removido 'type' pois não existe no banco - derivado de solution_id
}

// Interface corrigida para atualização de assets
export interface AssetUpdateParams {
  status_id?: number;
  status?: AssetStatus; // Mantido para compatibilidade
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
  clientId?: string; // Mantido para compatibilidade (não existe no banco assets)
  subscription?: any; // Mantido para compatibilidade
  // Apenas campos atuais podem ser editados - campos de fábrica nunca
  ssid_atual?: string;
  pass_atual?: string;
  // Removidos campos que não existem no banco:
  // phoneNumber, carrier, uniqueId, brand, ssid, password, serialNumber
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
