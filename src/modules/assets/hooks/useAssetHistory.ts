
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ProcessedHistoryLog {
  id: number;
  date: string;
  event: string;
  description: string;
  client_name: string;
  asset_name: string;
  old_status: string;
  new_status: string;
  user_email: string;
  details: Record<string, unknown>;
}

export const useAssetHistory = () => {
  return useQuery({
    queryKey: ['asset-history'],
    queryFn: async (): Promise<ProcessedHistoryLog[]> => {
      // Query asset_logs table directly instead of using RPC
      const { data, error } = await supabase
        .from('asset_logs')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching asset history:', error);
        throw error;
      }

      return (data || []).map((row: any) => ({
        id: row.id,
        date: row.date || row.created_at,
        event: row.event || 'Unknown Event',
        description: row.event || 'No description',
        client_name: row.details?.client_name || 'Unknown',
        asset_name: row.details?.asset_name || 'Unknown',
        old_status: row.details?.old_status || 'Unknown',
        new_status: row.details?.new_status || 'Unknown',
        user_email: row.details?.user_email || 'Unknown',
        details: (row.details as Record<string, unknown>) || {}
      }));
    },
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useAssetHistoryByAssetId = (assetId: string) => {
  return useQuery({
    queryKey: ['asset-history', assetId],
    queryFn: async (): Promise<ProcessedHistoryLog[]> => {
      // Query asset_logs table directly and filter by asset details
      const { data, error } = await supabase
        .from('asset_logs')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error(`Error fetching asset history for ${assetId}:`, error);
        throw error;
      }

      return (data || [])
        .filter((row: any) => {
          // Filter by asset_id in details or other relevant fields
          const details = row.details as Record<string, unknown> || {};
          return details.asset_id === assetId || details.asset_uuid === assetId;
        })
        .map((row: any) => {
          // Safe parsing of details field
          let parsedDetails: Record<string, unknown> = {};
          try {
            parsedDetails = (row.details as Record<string, unknown>) || {};
          } catch (e) {
            console.warn('Failed to parse details for history entry:', row.id);
            parsedDetails = {};
          }

          return {
            id: row.id,
            date: row.date || row.created_at,
            event: row.event || 'Unknown Event',
            description: row.event || 'No description',
            client_name: String(parsedDetails.client_name || ''),
            asset_name: String(parsedDetails.asset_name || ''),
            old_status: String(parsedDetails.old_status || ''),
            new_status: String(parsedDetails.new_status || ''),
            user_email: String(parsedDetails.user_email || ''),
            details: parsedDetails
          };
        });
    },
    enabled: !!assetId,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};
