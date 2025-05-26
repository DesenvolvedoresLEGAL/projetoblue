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

export interface BaseAsset {
  id: string;
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
  serial_number?: string;
  dias_alugada?: number;
  radio?: string;
  solution_id?: number;
  manufacturer_id?: number;
  plan_id?: number;
  rented_days?: number;
  admin_user?: string;
  admin_pass?: string;
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

// Interface Client corrigida para alinhar com banco de dados
export interface Client {
  id: string;
  uuid: string;
  nome: string;
  cnpj: string;
  email?: string;
  contato: number;
  assets?: string[];
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

export interface Status {
  id: number;
  status: string;
  association_id: number;
}

export interface AssetLog {
  id: number;
  assoc_id: string;
  date: string;
  event: string;
  details: Json;
  status_before_id: number;
  status_after_id: number;
}

// Nova interface para asset_client_assoc (faltava na aplicação)
export interface AssetClientAssociation {
  id: number;
  asset_id: string;
  client_id: string;
  entry_date: string;
  exit_date?: string;
  association_id: number;
  plan_id: number;
  notes?: string;
  pass?: string;
  gb: number;
  ssid?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

// Interface Plan corrigida para alinhar com banco de dados
export interface Plan {
  id: number;
  nome: string;
  tamanho_gb?: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

// Interface Manufacturer corrigida para alinhar com banco de dados
export interface Manufacturer {
  id: number;
  name: string;
  country?: string;
  description?: string;
  website?: string;
  created_at: string;
  updated_at?: string;
  deleted_at?: string;
}

// Interface StatusRecord corrigida para alinhar com banco de dados
export interface StatusRecord {
  id: number;
  status: string;
  association?: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

// Interface AssetSolution para alinhar com banco de dados
export interface AssetSolution {
  id: number;
  solution: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

// Interface Location para alinhar com banco de dados
export interface Location {
  id: number;
  name: string;
  client_id?: string;
  type_id?: number;
  latitude?: number;
  longitude?: number;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

// Interface LocationType para alinhar com banco de dados
export interface LocationType {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

// Interface AssociationType para alinhar com banco de dados
export interface AssociationType {
  id: number;
  type: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}
