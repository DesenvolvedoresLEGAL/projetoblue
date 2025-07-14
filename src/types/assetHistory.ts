
export interface AssetHistoryEntry {
  id: string;
  date: string;
  event: string;
  description: string;
  user?: string;
  details?: Record<string, any>;
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
