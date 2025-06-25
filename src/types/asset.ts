
import { Json } from "@/integrations/supabase/types";

export type AssetStatus = 
  | "DISPONÍVEL" 
  | "ALUGADO" 
  | "ASSINATURA" 
  | "SEM DADOS" 
  | "BLOQUEADO" 
  | "MANUTENÇÃO"
  | "EXTRAVIADO";

export type AssetType = "CHIP" | "ROTEADOR";

export type SolutionType = 
  | "SPEEDY 5G"
  | "4BLACK"
  | "4LITE"
  | "4PLUS"
  | "AP BLUE"
  | "POWERBANK"
  | "SWITCH"
  | "HUB USB"
  | "ANTENA"
  | "LOAD BALANCE"
  | "CHIP";

export type SubscriptionType = "MENSAL" | "ANUAL" | "ALUGUEL";

export interface SubscriptionInfo {
  type: SubscriptionType;
  startDate: string;
  endDate: string;
  event?: string;
  isExpired?: boolean;
  autoRenew?: boolean;
}

// Interface corrigida para alinhar exatamente com a tabela 'assets' do banco
export interface DatabaseAsset {
  uuid: string;
  model?: string;
  rented_days: number; // NOT NULL no banco, corrigido de opcional para obrigatório
  serial_number?: string;
  line_number?: number; // bigint nullable no banco
  iccid?: string;
  radio?: string;
  created_at?: string; // timestamp with time zone
  updated_at: string; // NOT NULL no banco
  admin_user: string; // NOT NULL no banco com default 'admin'
  admin_pass: string; // NOT NULL no banco com default ''
  solution_id?: number; // bigint nullable
  status_id?: number; // bigint nullable
  manufacturer_id?: number; // bigint nullable
  plan_id?: number; // bigint nullable
  deleted_at?: string; // timestamp nullable
  // Campos de configurações de rede - Fábrica (imutáveis)
  ssid_fabrica?: string;
  pass_fabrica?: string;
  admin_user_fabrica?: string;
  admin_pass_fabrica?: string;
  // Campos de configurações de rede - Atuais (editáveis)
  ssid_atual?: string;
  pass_atual?: string;
}

// Interface base para uso no frontend, mantendo compatibilidade
export interface BaseAsset {
  id: string; // Mapeado do uuid para compatibilidade com frontend
  uuid: string;
  type: AssetType;
  registrationDate: string;
  status: AssetStatus;
  statusId?: number;
  notes?: string;
  clientId?: string;
  subscription?: SubscriptionInfo;
  lastSeen?: string;
  isOnline?: boolean;
  solucao?: SolutionType;
  marca?: string; 
  modelo?: string;
  model?: string; // Adicionado para compatibilidade
  serial_number?: string;
  radio?: string;
  solution_id?: number;
  manufacturer_id?: number;
  plan_id?: number;
  rented_days?: number;
  admin_user?: string;
  admin_pass?: string;
  // Campos de configurações de rede mantidos para compatibilidade
  ssid_fabrica?: string;
  pass_fabrica?: string;
  admin_user_fabrica?: string;
  admin_pass_fabrica?: string;
  ssid_atual?: string;
  pass_atual?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

export interface ChipAsset extends BaseAsset {
  type: "CHIP";
  iccid: string;
  phoneNumber: string;
  carrier: string;
  line_number?: number;
  dataUsage?: {
    download: number;
    upload: number;
    period: string;
    lastUpdated: string;
  }
}

export interface EquipamentAsset extends BaseAsset {
  type: "ROTEADOR";
  uniqueId: string;
  brand: string;
  model: string;
  ssid: string;
  password: string;
  ipAddress?: string;
  adminUser?: string;
  adminPassword?: string;
  imei?: string;
  serialNumber?: string;
  hasWeakPassword?: boolean;
  needsPasswordChange?: boolean;
  wifiAnalysis?: {
    signalStrength: number;
    latency: number;
    transmissionSpeed: number;
    interference: number;
    connectedDevices: number;
    lastUpdated: string;
  }
}

export type Asset = ChipAsset | EquipamentAsset;

// Interface Client corrigida para alinhar com tabela 'clients' do banco
export interface Client {
  uuid: string; // Campo principal no banco (NOT NULL)
  nome: string; // NOT NULL no banco
  cnpj?: string; // Nullable no banco, corrigido para opcional
  email?: string; // Nullable no banco
  contato: number; // bigint NOT NULL no banco
  created_at?: string; // timestamp with time zone
  updated_at?: string; // timestamp with time zone NOT NULL
  deleted_at?: string; // timestamp nullable
  // Removido campo 'id' que não existe no banco
  // Removido campo 'assets' que não existe no banco
}

// Interface corrigida para alinhar com tabela 'asset_status' do banco
export interface AssetStatusRecord {
  id: number; // bigint NOT NULL
  status: string; // text NOT NULL
  association?: number; // bigint nullable, corrigido nome do campo
  created_at: string; // timestamp NOT NULL
  updated_at: string; // timestamp NOT NULL  
  deleted_at?: string; // timestamp nullable
}

// Interface corrigida para alinhar com tabela 'asset_logs' do banco
export interface AssetLog {
  id: number; // bigint NOT NULL (sequence)
  assoc_id?: number; // bigint nullable, corrigido tipo para number
  date?: string; // timestamp nullable
  event?: string; // text nullable
  details?: Json; // jsonb nullable
  status_before_id?: number; // bigint nullable
  status_after_id?: number; // bigint nullable
  deleted_at?: string; // timestamp nullable
  updated_at: string; // timestamp NOT NULL
  created_at: string; // timestamp NOT NULL
}

// Interface corrigida para alinhar com tabela 'asset_client_assoc' do banco
export interface AssetClientAssociation {
  id: number; // bigint NOT NULL (sequence)
  asset_id: string; // text NOT NULL
  client_id: string; // text NOT NULL
  entry_date: string; // date NOT NULL
  exit_date?: string; // date nullable
  association_id: number; // bigint NOT NULL
  plan_id?: number; // bigint nullable
  notes?: string; // text nullable
  pass?: string; // text nullable
  gb?: number; // bigint nullable com default 0
  ssid?: string; // text nullable
  created_at: string; // timestamp NOT NULL
  updated_at: string; // timestamp NOT NULL
  deleted_at?: string; // timestamp nullable
}

// Interface corrigida para alinhar com tabela 'plans' do banco
export interface Plan {
  id: number; // bigint NOT NULL (sequence)
  nome: string; // text NOT NULL
  tamanho_gb?: number; // bigint nullable
  created_at: string; // timestamp NOT NULL
  updated_at: string; // timestamp NOT NULL
  deleted_at?: string; // timestamp nullable
}

// Interface corrigida para alinhar com tabela 'manufacturers' do banco
export interface Manufacturer {
  id: number; // bigint NOT NULL
  name: string; // text NOT NULL
  country?: string; // text nullable
  description?: string; // text nullable com default ''
  website?: string; // text nullable
  created_at: string; // timestamp NOT NULL
  updated_at?: string; // timestamp nullable
  deleted_at?: string; // timestamp nullable
}

// Renomeado de StatusRecord para evitar confusão, alinhado com asset_status
export interface StatusRecord {
  id: number;
  status: string;
  association?: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

// Adicionar alias para compatibilidade com código existente
export type Status = StatusRecord;

// Interface corrigida para alinhar com tabela 'asset_solutions' do banco
export interface AssetSolution {
  id: number; // bigint NOT NULL
  solution: string; // text NOT NULL
  created_at: string; // timestamp NOT NULL
  updated_at: string; // timestamp NOT NULL
  deleted_at?: string; // timestamp nullable
}

// Interface corrigida para alinhar com tabela 'locations' do banco
export interface Location {
  id: number; // integer NOT NULL (sequence)
  name: string; // text NOT NULL
  client_id?: string; // text nullable
  type_id?: number; // integer nullable
  latitude?: number; // numeric nullable
  longitude?: number; // numeric nullable
  created_at?: string; // timestamp nullable
  updated_at?: string; // timestamp nullable
  deleted_at?: string; // timestamp nullable
}

// Interface corrigida para alinhar com tabela 'location_types' do banco
export interface LocationType {
  id: number; // integer NOT NULL (sequence)
  name: string; // text NOT NULL
  created_at: string; // timestamp NOT NULL
  updated_at: string; // timestamp NOT NULL
  deleted_at?: string; // timestamp nullable
}

// Interface corrigida para alinhar com tabela 'association_types' do banco
export interface AssociationType {
  id: number; // bigint NOT NULL
  type: string; // text NOT NULL
  created_at: string; // timestamp NOT NULL
  updated_at: string; // timestamp NOT NULL
  deleted_at?: string; // timestamp nullable
}
