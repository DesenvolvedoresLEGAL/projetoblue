
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
  type: AssetType;
  registrationDate: string;
  status: AssetStatus;
  statusId?: number; // Added for database status reference
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
}

export interface ChipAsset extends BaseAsset {
  type: "CHIP";
  iccid: string;
  phoneNumber: string;
  carrier: string;
  num_linha?: number;
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
  ipAddress?: string;     // IP Gerência
  adminUser?: string;     // Usuário admin roteador
  adminPassword?: string; // Senha admin roteador
  imei?: string;          // IMEI
  serialNumber?: string;  // SN (Número de Série)
  hasWeakPassword?: boolean; // Flag for weak passwords
  needsPasswordChange?: boolean; // Flag to indicate password should be changed
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

export interface Client {
  id: string;
  name: string;
  document: string;
  documentType: "CPF" | "CNPJ";
  contact: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  assets: string[];
}

// Added StatusRecord interface to represent records from the status table
export interface StatusRecord {
  id: number;
  nome: string;
}
