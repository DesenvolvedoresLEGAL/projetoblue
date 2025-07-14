
export interface SelectedAsset {
  id: string;
  uuid: string;
  type: 'CHIP' | 'EQUIPMENT';
  registrationDate: string;
  status?: string;
  statusId?: number;
  notes?: string;
  clientId?: string;
  lastSeen?: string;
  isOnline?: boolean;
  solucao?: string;
  marca?: string;
  modelo?: string;
  serial_number?: string;
  radio?: string;
  solution_id?: number;
  manufacturer_id?: number;
  plan_id?: number;
  rented_days?: number;
  admin_user?: string;
  admin_pass?: string;
  ssid_fabrica?: string;
  pass_fabrica?: string;
  admin_user_fabrica?: string;
  admin_pass_fabrica?: string;
  ssid_atual?: string;
  pass_atual?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
  // Campos específicos para CHIPs
  iccid?: string;
  line_number?: string;
  phoneNumber?: string;
  carrier?: string;
  isPrincipalChip?: boolean;
  gb?: number;
  // Campos específicos para equipamentos
  uniqueId?: string;
  brand?: string;
  model?: string;
  ssid?: string;
  password?: string;
  ipAddress?: string;
  adminUser?: string;
  adminPassword?: string;
  imei?: string;
  serialNumber?: string;
  hasWeakPassword?: boolean;
  needsPasswordChange?: boolean;
  // Campos para associação
  associatedEquipmentId?: string;
  associatedChipId?: string;
}

export interface AssetSearchFilters {
  type?: 'ALL' | 'CHIP' | 'EQUIPMENT';
  statusId?: number;
  solutionId?: number;
  manufacturerId?: number;
  searchTerm?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

export interface AssetValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

export interface AssetBusinessRules {
  needsChip: boolean;
  isChip: boolean;
  isPrincipal: boolean;
  isBackup: boolean;
  canBeAssociated: boolean;
  requiredFields: string[];
}

export interface AssetAssociationState {
  selectedAssets: SelectedAsset[];
  currentStep: 'client' | 'assets' | 'summary';
  isLoading: boolean;
  selectedClient: any | null; // Using any for now to avoid circular dependency
  generalConfig: any | null; // Using any for now to avoid circular dependency
}
