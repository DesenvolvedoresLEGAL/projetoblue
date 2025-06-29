
import { Asset, AssetLog, AssetStatusByType } from "@/types/asset";

// Helper function to format relative time
export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const dateObj = date instanceof Date ? date : new Date(date);
  const diffMs = now.getTime() - dateObj.getTime();
  const diffMins = Math.round(diffMs / 60000);
  const diffHours = Math.round(diffMs / 3600000);
  const diffDays = Math.round(diffMs / 86400000);
  
  if (diffMins < 60) {
    return diffMins <= 1 ? '1 minuto atrás' : `${diffMins} minutos atrás`;
  } else if (diffHours < 24) {
    return diffHours === 1 ? '1 hora atrás' : `${diffHours} horas atrás`;
  } else {
    return diffDays === 1 ? '1 dia atrás' : `${diffDays} dias atrás`;
  }
}

// Process recent assets data
export function processRecentAssets(
  assetsData: Asset[],
  solutions: { id: number; solution: string }[],
  statuses: { id: number; status: string }[]
) {
  return (assetsData || []).map(asset => {
    const solution = solutions.find(s => s.id === asset.solution_id);
    const status = statuses.find(s => s.id === asset.status_id);
    
    return {
      id: asset.uuid.substring(0, 8),
      name: asset.radio || asset.line_number?.toString() || asset.serial_number || 'N/A',
      type: solution?.solution || 'Unknown',
      status: status?.status || 'Unknown'
    };
  });
}

// Process recent events data
export function processRecentEvents(eventsData: AssetLog[]) {
  return (eventsData || []).map(event => {
    const details = event.details as Record<string, unknown> | null;
    let description = event.event || 'Event logged';
    let asset_name = 'N/A'; 
    
    // Extract more meaningful description and asset_name from details if available
    if (details && details.asset_id) {
      asset_name = details.radio || details.asset_id.toString().substring(0, 8) || 'unknown';
      description = `${event.event} para ${asset_name}`;
    } else if (details && details.description) {
      description = details.description;
    }
    
    // Determine event type for color coding
    let type = 'status';
    if (event.event?.toLowerCase().includes('register')) {
      type = 'register';
    } else if (event.event?.toLowerCase().includes('link') || 
               event.event?.toLowerCase().includes('assoc')) {
      type = 'link';
    }
    
    return {
      id: event.id,
      type,
      description,
      asset_name,
      time: event.date ? new Date(event.date) : new Date()
    };
  });
}

// Calculate status summary
export function calculateStatusSummary(statusBreakdownData: AssetStatusByType[]) {
  let active = 0;
  let warning = 0;
  let critical = 0;
  
  if (statusBreakdownData) {
    statusBreakdownData.forEach((item: AssetStatusByType) => {
      const status = item.status?.toLowerCase() || '';
      if (status.includes('active') || status.includes('disponível')) {
        active += item.count || 0;
      } else if (status.includes('warning') || status.includes('aviso')) {
        warning += item.count || 0;
      } else if (status.includes('critical') || status.includes('crítico')) {
        critical += item.count || 0;
      }
    });
  }
  
  return { active, warning, critical };
}
