export interface AssociationRecord {
  uuid: string;
  client_id: string;
  equipment_id?: string | null;
  chip_id?: string | null;
  entry_date: string;
  exit_date?: string | null;
  association_type_id: number;
  plan_id?: number | null;
  plan_gb?: number | null;
  equipment_ssid?: string | null;
  equipment_pass?: string | null;
  status: boolean;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface AssociationGroup {
  groupKey: string;
  client_name: string;
  client_id: string;
  entry_date: string;
  exit_date: string | null;
  associations: Association[];
  totalAssets: number;
  assetTypes?: { [key: string]: number };
  canEndGroup: boolean;
}

export interface Association {
  id: number;
  asset_id: string;
  client_id: string;
  entry_date: string;
  exit_date: string | null;
  association_id: number;
  created_at: string;
  client_name: string;
  asset_iccid: string | null;
  asset_radio: string | null;
  asset_line_number: number | null;
  asset_solution_id: number;
  asset_solution_name: string;
  notes?: string | null;
  ssid?: string | null;
  pass?: string | null;
  gb?: number | null;
}

export type StatusFilterType = 'all' | 'active' | 'ended' | 'today';
