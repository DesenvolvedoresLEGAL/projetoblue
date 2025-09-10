export interface RecentAlert {
  id: string;
  date: string;
  assetType: string;
  name: string;
  description: string;
  event?: string;
  asset_id?: string;
  timestamp?: number;
}

export interface StandardizedEvent {
  id: string;
  date: string;
  type: string;
  assetName: string;
  description: string;
  event?: string;
  asset_id?: string;
  timestamp?: number;
}