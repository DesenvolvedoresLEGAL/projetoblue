
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { getAssetIdentifier } from '@/utils/assetUtils';

export interface AssetHistoryEntry {
  id: number;
  date: string;
  event: string;
  description: string;
  asset_id?: string;
  asset_name?: string;
  old_status?: string;
  new_status?: string;
}

export function useAssetHistory() {
  return useQuery({
    queryKey: ['asset', 'history'],
    queryFn: async (): Promise<AssetHistoryEntry[]> => {
      try {
        console.log('Fetching asset history...');
        
        const { data, error } = await supabase
          .from('asset_logs')
          .select('id, event, date, details')
          .order('date', { ascending: false })
          .limit(20);
        
        if (error) {
          console.error('Error fetching asset history:', error);
          throw error;
        }
        
        console.log('Raw asset history data:', data);
        
        if (!data || data.length === 0) {
          console.log('No asset history found');
          return [];
        }
        
        const processedHistory = data.map(log => {
          let description = log.event || 'Event logged';
          let asset_name = 'N/A';
          let old_status = undefined;
          let new_status = undefined;
          let asset_id = undefined;
          
          // Safely parse details
          if (log.details && typeof log.details === 'object') {
            const details = log.details as Record<string, any>;
            
            if (details.description) {
              description = details.description;
            }
            
            // Handle asset identification
            if (details.solution_id || details.line_number || details.radio) {
              const mockAsset = {
                solution_id: details.solution_id,
                line_number: details.line_number,
                radio: details.radio,
                type: details.solution_id === 11 ? 'CHIP' : 'ROTEADOR'
              };
              asset_name = getAssetIdentifier(mockAsset);
            }
            
            old_status = details.old_status;
            new_status = details.new_status;
            asset_id = details.asset_id;
          }
          
          return {
            id: log.id,
            date: log.date,
            event: log.event,
            description,
            asset_name,
            old_status,
            new_status,
            asset_id
          };
        });
        
        console.log('Processed asset history:', processedHistory);
        return processedHistory;
        
      } catch (error) {
        console.error('Error in useAssetHistory:', error);
        throw error;
      }
    },
    staleTime: 30000,
    retry: 1
  });
}
