
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
  details: Record<string, unknown>;  // Changed from JSON to Record<string, unknown>
}

export const useAssetHistory = () => {
  return useQuery({
    queryKey: ['asset-history'],
    queryFn: async (): Promise<ProcessedHistoryLog[]> => {
      const { data, error } = await supabase.rpc('get_asset_history_with_details');
      
      if (error) {
        console.error('Error fetching asset history:', error);
        throw error;
      }

      return (data || []).map((row: any) => ({
        id: row.id,
        date: row.date,
        event: row.event,
        description: row.description,
        client_name: row.client_name,
        asset_name: row.asset_name,
        old_status: row.old_status,
        new_status: row.new_status,
        user_email: row.user_email,
        details: row.details as Record<string, unknown>  // Cast instead of conversion
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
      const { data, error } = await supabase
        .rpc('get_asset_history_with_details')
        .eq('asset_id', assetId);
      
      if (error) {
        console.error(`Error fetching asset history for ${assetId}:`, error);
        throw error;
      }

      return (data || []).map((row: any) => {
        // Safe parsing of details field
        let parsedDetails: Record<string, unknown> = {};
        try {
          parsedDetails = typeof row.details === 'string' 
            ? JSON.parse(row.details)
            : (row.details as Record<string, unknown>) || {};
        } catch (e) {
          console.warn('Failed to parse details for history entry:', row.id);
          parsedDetails = {};
        }

        return {
          id: row.id,
          date: row.date,
          event: row.event,
          description: row.description,
          client_name: String(parsedDetails.client_name || ''),
          asset_name: String(parsedDetails.asset_name || ''),
          old_status: row.old_status,
          new_status: row.new_status,
          user_email: row.user_email,
          details: parsedDetails
        };
      });
    },
    enabled: !!assetId,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};
