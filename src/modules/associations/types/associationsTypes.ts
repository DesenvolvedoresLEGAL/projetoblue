
export interface Client {
  uuid: string;
  nome: string;
  empresa: string;
  responsavel: string;
  contato: string;
  email?: string;
  cnpj?: string;
  created_at: string;
  updated_at: string;
}

export interface Manufacturer {
  id: number;
  name: string;
  country?: string;
  description?: string;
  website?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface AssetSolution {
  id: number;
  solution: string;
  created_at: string;
  updated_at: string;
}

export interface AssetStatus {
  id: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Asset {
  uuid: string;
  model?: string;
  serial_number?: string;
  line_number?: number;
  iccid?: string;
  radio?: string;
  solution_id?: number;
  manufacturer_id?: number;
  status_id?: number;
  rented_days: number;
  admin_user: string;
  admin_pass: string;
  created_at: string;
  updated_at: string;
  // Relacionamentos
  manufacturer?: Manufacturer;
  solution?: AssetSolution;
  status?: AssetStatus;
}

export interface Association {
  uuid: string;
  client_id: string;
  equipment_id?: string;
  chip_id?: string;
  entry_date: string;
  exit_date?: string;
  association_type_id: number;
  plan_id?: number;
  plan_gb?: number;
  equipment_ssid?: string;
  equipment_pass?: string;
  status: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface AssociationWithRelations extends Association {
  client: Client;
  equipment?: Asset;
  chip?: Asset;
  // Informações derivadas
  chipType?: 'principal' | 'backup' | 'none';
  hasNonChipAssets?: boolean;
}

export interface ClientAssociationGroup {
  client: Client;
  associations: AssociationWithRelations[];
  totalAssociations: number;
  activeAssociations: number;
  inactiveAssociations: number;
  // Estatísticas por tipo
  principalChips: number;
  backupChips: number;
  equipmentOnly: number;
}

export interface AssociationStats {
  totalClients: number;
  totalAssociations: number;
  activeAssociations: number;
  inactiveAssociations: number;
  principalChips: number;
  backupChips: number;
  equipmentOnly: number;
}
