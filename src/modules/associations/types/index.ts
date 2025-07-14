
export interface SelectedAsset {
  id: string;
  uuid: string;
  radio?: string;
  line_number?: string;
  serial_number?: string;
  iccid?: string;
  model?: string;
  statusId?: number;
  solution_id?: number;
  manufacturer_id?: number;
  status?: string;
  solucao?: string;
  marca?: string;
  type: 'CHIP' | 'EQUIPMENT';
  registrationDate: string;
  associatedEquipmentId?: string;
  isPrincipalChip?: boolean;
}

export interface AssetSearchFilters {
  solutionId?: number;
  statusId?: number;
  searchTerm?: string;
  manufacturerId?: number;
  type?: 'CHIP' | 'EQUIPMENT' | 'ALL';
}

export interface AssociationFormData {
  clientId: string;
  associationTypeId: number;
  entryDate: string;
  equipmentId?: string;
  chipId?: string;
  planId?: number;
  planGb?: number;
  equipmentSsid?: string;
  equipmentPass?: string;
  notes?: string;
}
