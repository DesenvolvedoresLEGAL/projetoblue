
export type AssetStatus = 
  | "DISPONÍVEL" 
  | "ALUGADO" 
  | "ASSINATURA" 
  | "SEM DADOS" 
  | "BLOQUEADO" 
  | "MANUTENÇÃO";

export type AssetType = "CHIP" | "ROTEADOR";

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
  notes?: string;
  clientId?: string;
  subscription?: SubscriptionInfo;
  lastSeen?: string;
  isOnline?: boolean;
}

export interface ChipAsset extends BaseAsset {
  type: "CHIP";
  iccid: string;
  phoneNumber: string;
  carrier: string;
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
