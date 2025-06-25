
// Define AssetWithRelations interface for components that need asset data with relationships
export interface AssetWithRelations {
  uuid: string;
  model?: string;
  rented_days: number;
  serial_number?: string;
  line_number?: number;
  iccid?: string;
  radio?: string;
  created_at: string;
  updated_at: string;
  admin_user?: string;
  admin_pass?: string;
  notes?: string;
  ssid_atual?: string;
  pass_atual?: string;
  ssid_fabrica?: string;
  pass_fabrica?: string;
  admin_user_fabrica?: string;
  admin_pass_fabrica?: string;
  plan_id?: number;
  manufacturer_id?: number;
  status_id: number;
  solution_id: number;
  solucao: {
    id: number;
    name: string;
  };
  manufacturer: {
    id: number;
    name: string;
  };
  status: {
    id: number;
    name: string;
  };
  // Optional field for search highlighting
  matchedField?: string;
}
