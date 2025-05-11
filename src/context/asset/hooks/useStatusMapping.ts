
import { Asset, AssetStatus, StatusRecord } from '@/types/asset';
import { supabase } from '@/integrations/supabase/client';

export const useStatusMapping = (
  setStatusRecords: React.Dispatch<React.SetStateAction<StatusRecord[]>>
) => {
  const loadStatusRecords = async () => {
    try {
      const { data, error } = await supabase
        .from('status')
        .select('*');

      if (error) {
        console.error('Error fetching status records:', error);
        return;
      }

      if (data) {
        setStatusRecords(data);
      }
    } catch (error) {
      console.error('Error in loadStatusRecords:', error);
    }
  };

  const mapStatusIdToAssetStatus = (statusId: number, records: StatusRecord[]): AssetStatus => {
    const statusRecord = records.find(record => record.id === statusId);
    return (statusRecord?.nome as AssetStatus) || "DISPONÍVEL";
  };

  const mapAssetStatusToId = (status: AssetStatus, records: StatusRecord[]): number => {
    const statusRecord = records.find(record => record.nome === status);
    return statusRecord?.id || 1; // Default to 1 (DISPONÍVEL) if not found
  };

  return {
    loadStatusRecords,
    mapStatusIdToAssetStatus,
    mapAssetStatusToId,
  };
};
