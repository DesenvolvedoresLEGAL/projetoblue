
import { Asset, AssetType, Client } from "./asset";

export type OperationType = "ALUGUEL" | "ASSINATURA" | "ASSOCIATION" | "DISASSOCIATION";

// Interface corrigida para alinhar com tabela asset_logs
// ATUALIZADO: assoc_id agora é nullable devido às melhorias no trigger
export interface AssetHistoryEntry {
  id: number; // bigint no banco
  assoc_id?: number | null; // bigint opcional no banco, PODE SER NULL
  date?: string; // timestamp with time zone
  event?: string; // text
  details?: any; // jsonb
  status_before_id?: number; // bigint
  status_after_id?: number; // bigint
  created_at: string; // timestamp with time zone
  updated_at: string; // timestamp with time zone
  deleted_at?: string; // timestamp with time zone opcional
  
  // Campos para compatibilidade com código existente
  timestamp?: string;
  clientId?: string;
  clientName?: string;
  assetIds?: string[];
  assets?: {
    id: string;
    type: AssetType;
    identifier: string;
  }[];
  operationType?: OperationType;
  description?: string;
  comments?: string;
}

// Interface para logs de perfil (profile_logs)
export interface ProfileLogEntry {
  id: string; // uuid
  user_id?: string; // uuid opcional
  email?: string;
  operation: string;
  table_name: string;
  old_data?: any; // jsonb
  new_data?: any; // jsonb
  changed_at: string; // timestamp with time zone
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}
