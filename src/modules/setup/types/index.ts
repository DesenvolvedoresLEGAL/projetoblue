/* eslint-disable @typescript-eslint/no-explicit-any */

export type SetupStatus = 'scheduled' | 'in_progress' | 'completed' | 'approved' | 'rejected';
export type OrderType = 'install' | 'uninstall';
export type AssetStatusSetup = 'available' | 'in_use' | 'maintenance' | 'retired';

export interface Order {
  id: string;
  customer_id: string;
  address: Record<string, any>;
  type: OrderType;
  status: string;
  scheduled_at?: string;
  qr_code?: string;
  created_at: string;
  updated_at: string;
}

export interface Setup {
  id: string;
  order_id: string;
  technician_id?: string;
  status: SetupStatus;
  delivered_at?: string;
  completed_at?: string;
  approved_at?: string;
  rejected_reason?: string;
  region?: string;
  created_at: string;
  updated_at: string;
  // Campos derivados
  order?: Order;
  photos_count?: number;
  speed_tests_count?: number;
  signatures_count?: number;
  asset_serials?: string[];
}

export interface SetupAsset {
  id: string;
  serial: string;
  model: string;
  status: AssetStatusSetup;
  order_id?: string;
  setup_id?: string;
  qr_code?: string;
  firmware_version?: string;
  last_seen_at?: string;
  created_at: string;
  updated_at: string;
}

export interface SetupPhoto {
  id: string;
  setup_id: string;
  storage_path: string;
  iv?: string;
  is_encrypted: boolean;
  taken_at: string;
  created_at: string;
}

export interface SpeedTest {
  id: string;
  setup_id: string;
  download_mbps: number;
  upload_mbps: number;
  ping_ms: number;
  taken_at: string;
  created_at: string;
}

export interface ClientSignature {
  id: string;
  setup_id: string;
  storage_path: string;
  iv?: string;
  is_encrypted: boolean;
  signed_at: string;
  signer_name: string;
  created_at: string;
}

export interface SetupFormData {
  photos: File[];
  speed_test: {
    download_mbps: number;
    upload_mbps: number;
    ping_ms: number;
  };
  signature: string; // Base64 encoded signature
  signer_name: string;
  notes?: string;
}

export interface QRScanResult {
  type: 'order' | 'asset';
  id: string;
  data?: any;
}

// API Response types
export interface SetupDetailedView {
  id: string;
  order_id: string;
  technician_id?: string;
  status: SetupStatus;
  delivered_at?: string;
  completed_at?: string;
  approved_at?: string;
  rejected_reason?: string;
  region?: string;
  created_at: string;
  updated_at: string;
  customer_id: string;
  address: Record<string, any>;
  order_type: OrderType;
  order_scheduled_at?: string;
  photos_count: number;
  speed_tests_count: number;
  signatures_count: number;
  asset_serials: string[];
}