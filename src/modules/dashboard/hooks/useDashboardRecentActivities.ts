import { useQuery } from '@tanstack/react-query';
import * as dashboardQueries from '@modules/dashboard/services/dashboardQueries';
import { AssetLogDetails, AssetRecord, AssociationChip, AssociationLogDetails, AssociationRecord, RecentActivity, RecentActivityAsset, RecentActivityAssociation, User } from '@modules/dashboard/types/recentActivitiesTypes'; 

// Interfaces para melhor tipagem das respostas do Supabase
interface AssetLogFromDB {
  uuid: string;
  user_id: string;
  event: string;
  details: AssetLogDetails;
  created_at: string;
  updated_at: string;
  status_after: { status: string } | null;
  status_before: { status: string } | null;
  manufacturer: {
    manufacturer: {name: string;};
  };
}

interface AssociationLogFromDB {
  uuid: string;
  user_id: string;
  event: string;
  details: AssociationLogDetails;
  created_at: string;
  updated_at: string;
  association_client: {
    client: {
      empresa: string;
    };
  } | null;
  association_equipment: {
    equipment: {
      radio: string;
      serial_number: string;
      model: string;
    }
  } | null;
  association_chip: {
    chip: {
      iccid: number;
      line_number: number;
      manufacturer: {
        manufacturer: {
          name: string;
        };
      };
    }
  } | null;
}

interface FetchRecentEventsResult {
  recentAssets: AssetLogFromDB[];
  recentAssociations: AssociationLogFromDB[];
}

export function useDashboardRecentActivities() {
  return useQuery<RecentActivity[], Error>({
    queryKey: ['dashboard', 'recent-activities'],
    queryFn: async () => {
      try {
        if (process.env.NODE_ENV === 'development') {
          console.log('Fetching recent activities...');
        }
        
        const recentEventsResult = await dashboardQueries.fetchRecentEvents();
        
        if (!recentEventsResult.recentAssets?.length && !recentEventsResult.recentAssociations?.length) {
          return [];
        }

        const assetEvents = recentEventsResult.recentAssets || [];
        const associationEvents = recentEventsResult.recentAssociations || [];

        // Map asset events to RecentActivityAsset
        const assetActivities: RecentActivityAsset[] = assetEvents.map((e) => {
          const details = e.details;
          const user = details?.user;
          const newAsset = details?.new_record;
          const oldAsset = details?.old_record;
          const manufacturer = e.manufacturer.manufacturer;

          // Determine performed by user
          let performedBy = "Sistema";
          if (user?.email) {
            performedBy = user.email;
          } else if (user?.username && user.username !== "system") {
            performedBy = user.username;
          }
          
          // Extract asset name more robustly
          let assetName = 'Não identificado';
          if (newAsset?.radio) {
            assetName = newAsset.radio;
          } else if (newAsset?.line_number) {
            assetName = `Linha ${newAsset.line_number}`;
          } else if (newAsset?.uuid) {
            assetName = newAsset.uuid.substring(0, 8);
          } else if (newAsset?.iccid) {
            assetName = newAsset.iccid;
          } else if (newAsset?.serial_number) {
            assetName = newAsset.serial_number;
          }
          
          return {
            uuid: e.uuid,
            user_id: e.user_id,
            event: e.event,
            created_at: e.created_at,
            updated_at: e.updated_at,
            performedBy,
            asset_id: newAsset?.uuid || '',
            assetName,
            details: {
              user: user || {} as User,
              new_record: newAsset || {} as AssetRecord,
              old_record: oldAsset,
            },
            status_after: e.status_after?.status || '',
            status_before: e.status_before?.status || '',
            manufacturer_name: manufacturer.name
          };
        });

        // Map association events to RecentActivityAssociation
        const associationActivities: RecentActivityAssociation[] = associationEvents.map((e) => {
          const details = e.details;
          const user = details?.user;
          const newAssociation = details?.new_record;
          const oldAssociation = details?.old_record;
          const association_client = e.association_client;
          const association_equipment = e.association_equipment;
          const association_chip = e.association_chip;

          // Determine performed by user
          let performedBy = "Sistema";
          if (user?.email) {
            performedBy = user.email;
          } else if (user?.username && user.username !== "system") {
            performedBy = user.username;
          }

          // Extract association details
          let associationName = 'Associação';
          if (newAssociation?.client_id && newAssociation?.equipment_id) {
            associationName = `Associação ${newAssociation.client_id}-${newAssociation.equipment_id}`;
          }

          console.log('LALALALLALALLALALALLALALLA');
          console.log(e.association_chip);
          console.log('LALALALLALALLALALALLALALLA');
          
          return {
            uuid: e.uuid,
            user_id: e.user_id,
            event: e.event,
            created_at: e.created_at,
            updated_at: e.updated_at,
            performedBy,
            association_id: newAssociation?.uuid || '',
            associationName,
            details: {
              user: user || {} as User,
              new_record: newAssociation || {} as AssociationRecord,
              old_record: oldAssociation,
            },
            client_name: association_client.client?.empresa,
            equipment: association_equipment.equipment,
            chip: association_chip.chip
          };
        });

        // Combine and sort by date (most recent first)
        const allActivities: RecentActivity[] = [
          ...assetActivities,
          ...associationActivities
        ];

        return allActivities.sort((a, b) => {
          const dateA = new Date(a.created_at);
          const dateB = new Date(b.created_at);
          return dateB.getTime() - dateA.getTime();
        });

      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error fetching recent activities:', error.message);
        }
        return [];
      }
    },
    staleTime: 30000,
    retry: 1,
    refetchOnWindowFocus: false
  });
}