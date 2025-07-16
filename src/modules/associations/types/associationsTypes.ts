
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

export interface Asset {
  uuid: string;
  model?: string;
  serial_number?: string;
  line_number?: number;
  iccid?: string;
  radio?: string;
  solution_id?: number;
  manufacturer_id?: number;
  rented_days: number;
  admin_user: string;
  admin_pass: string;
  created_at: string;
  updated_at: string;
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
  equipment?: Asset & { manufacturer?: Manufacturer; solution?: AssetSolution };
  chip?: Asset & { manufacturer?: Manufacturer; solution?: AssetSolution };
}

export interface ClientAssociationGroup {
  client: Client;
  associations: AssociationWithRelations[];
  totalAssociations: number;
  activeAssociations: number;
  inactiveAssociations: number;
}
