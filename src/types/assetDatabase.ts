
// Types that match the Supabase database structure
export interface AssetRecord {
  uuid: string;
  type_id: number;
  status_id: number;
  iccid?: string;
  line_number?: number;
  manufacturer_id?: number;
  model?: string;
  serial_number?: string;
  password?: string;
  plan_id?: number;
  radio?: string;
  solution_id?: number;
  rented_days?: number;
  observacoes?: string;
  created_at?: string;
}

export interface StatusRecord {
  id: number;
  status: string;
  association?: number;
}

export interface ClientRecord {
  uuid: string;
  nome: string;
  cnpj: string;
  contato: number;
  email?: string;
}

export interface AssetClientAssocRecord {
  id: number;
  asset_id: string;
  client_id: string;
  association_id: number;
  entry_date: string;
  exit_date?: string;
}

export interface AssetLogRecord {
  id: number;
  assoc_id?: number;
  date?: string;
  event?: string;
  details?: any;
  status_before_id?: number;
  status_after_id?: number;
}

export interface ProfileRecord {
  id: string;
  email: string;
  role: string;
  created_at: string;
  is_active: boolean;
}
