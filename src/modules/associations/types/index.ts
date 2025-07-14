
// Tipos para o módulo de associações
import type { Client } from '@/types/client';
import type { AssociationGeneralConfig } from '../components/association/AssociationGeneralConfig';

// Type for SelectedAsset from AssetAssociation page - ATUALIZADO com solution_id
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
  solution_id?: number; // ADICIONADO - crítico para a nova lógica
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
  // NOVAS propriedades para a lógica de CHIP
  isPrincipalChip?: boolean; // CHIP principal (associado a equipamento) ou backup
  associatedEquipmentId?: string; // ID do equipamento associado (se for CHIP principal)
  // Propriedade para exibição amigável
  identifier?: string;
}

export interface AssetAssociationState {
  selectedAssets: SelectedAsset[];
  currentStep: 'client' | 'assets' | 'summary';
  isLoading: boolean;
  selectedClient: Client | null;
  generalConfig: AssociationGeneralConfig | null;
}

export interface AssetConfiguration {
  assetId: string;
  configuration: Record<string, unknown>;
}

// NOVAS interfaces para as regras de negócio
export interface AssetBusinessRules {
  needsChip: boolean;
  isChip: boolean;
  canBeAssociatedAlone: boolean;
  compatibleChips?: SelectedAsset[];
  compatibleEquipments?: SelectedAsset[];
}

export interface AssetValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}
