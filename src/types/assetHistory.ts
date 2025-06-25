
export interface AssetHistoryEntry {
  id: number;
  assoc_id: number | null;
  date: string;
  event: string;
  details: Record<string, unknown>;
  status_before_id?: number;
  status_after_id?: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  
  // Campos derivados/calculados para compatibilidade
  timestamp: string;
  clientId?: string;
  clientName?: string;
  assetIds?: string;
  assets?: string;
  operationType: 'ASSOCIATION' | 'STATUS_CHANGE' | 'CREATION' | 'DELETION';
  description?: string;
  comments?: string;
}
