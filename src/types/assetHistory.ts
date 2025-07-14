/* eslint-disable @typescript-eslint/no-explicit-any */

export interface AssetHistoryEntry {
  id: number; // Changed from string to number to match database
  date: string;
  event: string;
  description: string;
  user?: string;
  details?: Record<string, any>;
  // Added missing properties that code expects
  assetIds?: string[];
  clientId?: string;
  timestamp?: string;
  created_at?: string;
  updated_at?: string;
  // Added missing properties for asset logs compatibility
  status_before_id?: number;
  status_after_id?: number;
  assoc_id?: number;
  deleted_at?: string;
}

export interface AssociationLogEntry {
  id: string;
  association_uuid: string;
  event: string;
  date: string;
  user?: string;
  details?: Record<string, any>;
}

export interface ProfileLogEntry {
  id: string;
  user_id?: string;
  operation: string;
  table_name: string;
  date: string;
  old_data?: Record<string, any>;
  new_data?: Record<string, any>;
}
