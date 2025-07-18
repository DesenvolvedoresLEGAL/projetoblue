export interface User {
  id: string;
  role: string;
  email: string;
  username: string;
  is_active: boolean;
  created_at: string; // ISO string
  deleted_at: string | null;
  last_login: string;
  updated_at: string;
  is_approved: boolean;
}

export interface AssociationRecord {
  uuid: string;
  notes: string | null;
  status: boolean;
  chip_id: string | null;
  plan_gb: number;
  plan_id: number;
  client_id: string;
  exit_date: string; // Date string (YYYY-MM-DD)
  created_at: string;
  deleted_at: string | null;
  entry_date: string; // Date string (YYYY-MM-DD)
  updated_at: string;
  equipment_id: string;
  equipment_pass: string;
  equipment_ssid: string;
  association_type_id: number;
}

export interface AssetRecord {
  uuid: string;
  serial_number?: string | null;
  line_number?: number | null;
  iccid?: string | null;
  model?: string | null;
  rented_days: number;
  radio?: string | null;
  manufacturer_id?: number | null;
  status_id?: number | null;
  solution_id?: number | null;
  created_at?: string | null;   // timestamp ISO
  updated_at: string;           // timestamp ISO
  deleted_at?: string | null;   // timestamp ISO
  admin_user: string;
  admin_pass: string;
  plan_id?: number | null;
  ssid_fabrica?: string | null;
  pass_fabrica?: string | null;
  admin_user_fabrica?: string | null;
  admin_pass_fabrica?: string | null;
  ssid_atual?: string | null;
  pass_atual?: string | null;
}

export interface AssociationLogDetails {
  user: User;
  new_record: AssociationRecord;
  old_record?: AssociationRecord;
}

export interface AssetLogDetails {
  user: User;
  new_record: AssetRecord;
  old_record?: AssetRecord;
}

export interface RecentActivity {
  uuid: string;
  user_id: string;
  event: string;
  created_at: string;
  updated_at: string;
}

export interface RecentActivityAsset extends RecentActivity {
  asset_id: string;
  details: AssetLogDetails; // OLD AND NEW ASSETS JSONB
  status_after: string; // JOIN WITH ASSET_STATUS
  status_before: string; // JOIN WITH ASSET_STATUS
}

export interface AssociationAsset {
  radio: string;
  iccid: number;
  line_number: number;
  serial_number: string;
  model: string;
}

export interface RecentActivityAssociation extends RecentActivity {
  association_id: string;
  client_name: string;
  asset_names: AssociationAsset;
  details: AssociationLogDetails; // OLD AND NEW ASSETS JSONB
}