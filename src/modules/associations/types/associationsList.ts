
export interface AssociationWithDetails {
  uuid: string;
  client_id: string;
  equipment_id: string | null;
  chip_id: string | null;
  entry_date: string;
  exit_date: string | null;
  association_type_id: number;
  plan_id: number | null;
  plan_gb: number | null;
  equipment_ssid: string | null;
  equipment_pass: string | null;
  status: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
  
  // Related data
  client_name: string;
  client_contato: number;
  client_responsavel: string;
  client_empresa: string;
  client_email: string | null;
  
  // Equipment data
  equipment_radio: string | null;
  equipment_model: string | null;
  equipment_serial_number: string | null;
  equipment_solution_id: number | null;
  equipment_solution_name: string | null;
  
  // Chip data
  chip_iccid: string | null;
  chip_line_number: number | null;
  chip_manufacturer_id: number | null;
  chip_manufacturer_name: string | null;
  chip_is_operator: boolean;
  
  // Association type
  association_type_name: string;
  
  // Plan data
  plan_name: string | null;
  plan_tamanho_gb: number | null;
}

export interface AssociationGroup {
  client_id: string;
  client_name: string;
  client_contato: number;
  client_responsavel: string;
  client_empresa: string;
  client_email: string | null;
  total_associations: number;
  active_associations: number;
  inactive_associations: number;
  associations: AssociationWithDetails[];
  is_expanded: boolean;
}

export interface FilterOptions {
  status: 'all' | 'active' | 'inactive';
  associationType: 'all' | number;
  assetType: 'all' | 'priority' | 'others';
  manufacturer: 'all' | number;
  dateRange: {
    start: string | null;
    end: string | null;
  };
}

export interface SearchOptions {
  query: string;
  searchType: 'all' | 'client' | 'iccid' | 'radio';
}

export interface PaginationOptions {
  page: number;
  limit: number;
  total: number;
}
