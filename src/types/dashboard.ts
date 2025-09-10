// Dashboard-specific types to fix build errors

export interface AssetStatusByType {
  type: string;
  status: string;
  count: number;
}

export interface ProcessedHistoryLog {
  id: string;
  event: string;
  date: string;
  asset_name?: string;
  client_name?: string;
  description?: string;
  details?: any;
}

// Add type assertions for dashboard hooks
export interface DashboardSystemStatus {
  isOperational: boolean;
  lastUpdate: string;
  errors: string[];
}

export interface RecentEventsResponse {
  recentAssets: any[];
  recentAssociations: any[];
  error?: string;
  data?: any[];
}

export interface ClientType {
  uuid: string;
  nome: string;
  empresa: string;
  responsavel: string;
  contato: string;
  telefones?: string[];
  cnpj?: string;
  email?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface AuthResult {
  data: { user: any; session: any; } | { user: null; session: null; };
  error: any;
  profileCreated: boolean;
  technicalError?: any;
}