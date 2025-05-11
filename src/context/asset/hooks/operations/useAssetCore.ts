
import { Asset, AssetStatus, AssetType, StatusRecord } from '@/types/asset';
import { supabase } from '@/integrations/supabase/client';
import { getAssetById, getAssetsByStatus, getAssetsByType } from '@/context/assetActions';
import { toast } from '@/utils/toast';

export const useAssetCore = (
  assets: Asset[],
  setAssets: React.Dispatch<React.SetStateAction<Asset[]>>,
  statusRecords: StatusRecord[],
  mapStatusIdToAssetStatus: (statusId: number) => AssetStatus,
  mapAssetStatusToId: (status: AssetStatus) => number
) => {
  // Load assets from the database
  const loadAssets = async (): Promise<void> => {
    try {
      const { data: dbAssets, error } = await supabase
        .from('assets')
        .select('*');

      if (error) {
        throw error;
      }

      if (dbAssets) {
        // Transform database assets to our Asset type
        const mappedAssets = dbAssets.map(dbAsset => ({
          id: dbAsset.uuid,
          type: dbAsset.type_id === 1 ? "CHIP" as const : "ROTEADOR" as const,
          status: mapStatusIdToAssetStatus(dbAsset.status_id),
          statusId: dbAsset.status_id,
          registrationDate: new Date().toISOString(), // This should come from the DB
          ...(dbAsset.type_id === 1 
            ? {
                iccid: dbAsset.iccid || '',
                phoneNumber: dbAsset.line_number?.toString() || '',
                carrier: "Unknown" // This should come from the DB
              }
            : {
                uniqueId: dbAsset.serial_number || '',
                brand: dbAsset.manufacturer_id ? "Unknown" : "Unknown", // Should map manufacturer_id
                model: dbAsset.model || '',
                ssid: "Default",
                password: dbAsset.password || ''
              })
        })) as Asset[];

        setAssets(mappedAssets);
      }
    } catch (error) {
      console.error("Error loading assets:", error);
      toast.error("Erro ao carregar ativos");
    }
  };

  // Getter functions - reusing from assetActions.ts
  const getAssetByIdWrapper = (id: string): Asset | undefined => {
    return getAssetById(assets, id);
  };

  const getAssetsByStatusWrapper = (status: AssetStatus): Asset[] => {
    return getAssetsByStatus(assets, status);
  };

  const getAssetsByTypeWrapper = (type: AssetType): Asset[] => {
    return getAssetsByType(assets, type);
  };

  // Filter assets based on custom criteria
  const filterAssets = (criteria: any): Asset[] => {
    return assets.filter(asset => {
      let match = true;
      
      // Filter by type
      if (criteria.type && asset.type !== criteria.type) {
        match = false;
      }
      
      // Filter by status
      if (criteria.status && asset.status !== criteria.status) {
        match = false;
      }
      
      // Filter by search term (on iccid or uniqueId)
      if (criteria.searchTerm) {
        const searchLower = criteria.searchTerm.toLowerCase();
        const identifierField = asset.type === "CHIP" ? "iccid" : "uniqueId";
        const identifier = (asset as any)[identifierField]?.toLowerCase() || "";
        
        if (!identifier.includes(searchLower)) {
          match = false;
        }
      }
      
      return match;
    });
  };

  // Get expired subscriptions
  const getExpiredSubscriptions = (): Asset[] => {
    const now = new Date().toISOString();
    return assets.filter(asset => 
      asset.subscription && 
      asset.subscription.endDate < now &&
      (asset.subscription.isExpired === undefined || asset.subscription.isExpired === true)
    );
  };

  return {
    loadAssets,
    getAssetById: getAssetByIdWrapper,
    getAssetsByStatus: getAssetsByStatusWrapper,
    getAssetsByType: getAssetsByTypeWrapper,
    filterAssets,
    getExpiredSubscriptions
  };
};
