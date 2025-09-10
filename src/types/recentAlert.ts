export interface RecentAlert {
  id: string;
  date: string;
  assetType: string;
  name: string;
  description: string;
  event?: string;
  asset_id?: string;
  timestamp?: number;
  new_status?: { status: string };
}

export interface RecentAlertWithDefaults extends RecentAlert {
  description: string; // Always required for standardized events
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

// Utility type for converting RecentAlert to StandardizedEvent
export const convertToStandardizedEvent = (alert: RecentAlert): StandardizedEvent => {
  return {
    id: alert.id,
    date: alert.date,
    type: alert.assetType,
    assetName: alert.name,
    description: alert.description || alert.event || 'Evento registrado',
    event: alert.event,
    asset_id: alert.asset_id,
    timestamp: alert.timestamp
  };
};