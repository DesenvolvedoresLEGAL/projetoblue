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
