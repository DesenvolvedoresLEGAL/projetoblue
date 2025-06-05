
// Tipos para o módulo de associações
export interface AssetAssociationState {
  selectedAssets: any[];
  currentStep: string; // Changed from number to string
  isLoading: boolean;
  selectedClient?: any; // Added missing property
  generalConfig?: any; // Added missing property
}

export interface AssetConfiguration {
  assetId: string;
  configuration: any;
}

// Type for SelectedAsset from AssetAssociation page
export interface SelectedAsset {
  id: string;
  uuid: string;
  type: 'CHIP' | 'EQUIPMENT';
  registrationDate: string;
  status: string;
  statusId?: number;
  notes?: string;
  solucao?: string;
  marca?: string;
  modelo?: string;
  serial_number?: string;
  model?: string;
  radio?: string;
  solution_id?: number;
  manufacturer_id?: number;
  plan_id?: number;
  rented_days?: number;
  admin_user?: string;
  admin_pass?: string;
  iccid?: string;
  line_number?: string;
  phoneNumber?: string;
  carrier?: string;
  uniqueId?: string;
  brand?: string;
  ssid?: string;
  password?: string;
  serialNumber?: string;
  gb?: number;
  associationType?: string;
  startDate?: string;
  endDate?: string;
  ssid_atual?: string;
  pass_atual?: string;
  isPrincipalChip?: boolean;
}
