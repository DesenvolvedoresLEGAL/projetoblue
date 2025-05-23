
export type AssetStatus = 
  | "DISPONÍVEL" 
  | "ALUGADO" 
  | "ASSINATURA" 
  | "SEM DADOS" 
  | "BLOQUEADO" 
  | "MANUTENÇÃO"
  | "extraviado";

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
  uuid: string; // Adicionado para alinhar com banco de dados
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
  // Campos do banco de dados
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
  line_number?: number; // Corrigido para number conforme banco
  dataUsage?: {
    download: number;
    upload: number;
    period: string;
    lastUpdated: string;
  }
}

export interface RouterAsset extends BaseAsset {
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

export type Asset = ChipAsset | RouterAsset;

// Interface Client corrigida para alinhar com banco de dados
export interface Client {
  id: string;
  uuid: string; // Campo real do banco
  nome: string; // Campo real do banco
  cnpj: string; // Campo real do banco
  email?: string; // Campo opcional do banco
  contato: number; // Campo real do banco (bigint)
  assets?: string[]; // Para compatibilidade com código existente
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
  // Campos removidos que não existem no banco:
  // name, document, documentType, contact, address, city, state, zipCode
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
  nome: string; // Campo real do banco
  tamanho_gb?: number; // Campo real do banco
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
  status: string; // Campo real do banco
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
