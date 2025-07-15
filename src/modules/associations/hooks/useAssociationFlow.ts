import { useReducer, useCallback } from "react";
import { toast } from "@/hooks/use-toast";
import { associationService } from "../services/associationService";

export interface AssociationState {
  client?: any;
  selectedAssets: any[];
  assetConfiguration: Record<string, any>;
  entryDate: string;
  exitDate?: string;
  associationType: number; // 1 = aluguel, 2 = assinatura
  planId?: number;
  planGb?: number;
  notes?: string;
}

type AssociationAction = 
  | { type: 'SET_CLIENT'; payload: any }
  | { type: 'SET_ASSETS'; payload: any[] }
  | { type: 'SET_ASSET_CONFIG'; payload: { assetId: string; config: any } }
  | { type: 'SET_DATES'; payload: { entryDate: string; exitDate?: string } }
  | { type: 'SET_ASSOCIATION_TYPE'; payload: number }
  | { type: 'SET_PLAN'; payload: { planId?: number; planGb?: number } }
  | { type: 'SET_NOTES'; payload: string }
  | { type: 'RESET' };

const initialState: AssociationState = {
  selectedAssets: [],
  assetConfiguration: {},
  entryDate: new Date().toISOString().split('T')[0],
  associationType: 1, // Default: aluguel
};

function associationReducer(state: AssociationState, action: AssociationAction): AssociationState {
  switch (action.type) {
    case 'SET_CLIENT':
      return { ...state, client: action.payload };
    case 'SET_ASSETS':
      return { ...state, selectedAssets: action.payload };
    case 'SET_ASSET_CONFIG':
      return {
        ...state,
        assetConfiguration: {
          ...state.assetConfiguration,
          [action.payload.assetId]: action.payload.config
        }
      };
    case 'SET_DATES':
      return { ...state, ...action.payload };
    case 'SET_ASSOCIATION_TYPE':
      return { ...state, associationType: action.payload };
    case 'SET_PLAN':
      return { ...state, ...action.payload };
    case 'SET_NOTES':
      return { ...state, notes: action.payload };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

export const useAssociationFlow = () => {
  const [state, dispatch] = useReducer(associationReducer, initialState);

  const canProceed = useCallback((step: number): boolean => {
    switch (step) {
      case 1: // Client selection
        return !!state.client;
      case 2: // Asset selection
        return state.selectedAssets.length > 0;
      case 3: // Configuration
        return !!state.entryDate;
      case 4: // Plan - optional
        return true;
      case 5: // Notes - optional
        return true;
      case 6: // Summary
        return !!state.client && state.selectedAssets.length > 0 && !!state.entryDate;
      default:
        return false;
    }
  }, [state]);

  const createAssociation = useCallback(async () => {
    try {
      // Group assets by type for association creation
      const equipments = state.selectedAssets.filter(asset => 
        asset.solution_id !== 11 // Not a chip
      );
      const chips = state.selectedAssets.filter(asset => 
        asset.solution_id === 11 // Is a chip
      );

      // Create associations based on business rules
      const associations = [];

      // If we have both equipment and chips, create combined associations
      if (equipments.length > 0 && chips.length > 0) {
        for (const equipment of equipments) {
          // For SPEEDY 5G, 4 PLUS, 4 BLACK - associate with a chip
          if ([2, 3, 4].includes(equipment.solution_id)) {
            const chip = chips.shift(); // Take first available chip
            if (chip) {
              associations.push({
                client_id: state.client.uuid,
                equipment_id: equipment.uuid,
                chip_id: chip.uuid,
                entry_date: state.entryDate,
                exit_date: state.exitDate || null,
                association_type_id: state.associationType,
                plan_id: state.planId || null,
                plan_gb: state.planGb || 0,
                equipment_ssid: state.assetConfiguration[equipment.uuid]?.ssid || null,
                equipment_pass: state.assetConfiguration[equipment.uuid]?.password || null,
                notes: state.notes || null,
              });
            }
          } else {
            // Other equipment types go alone
            associations.push({
              client_id: state.client.uuid,
              equipment_id: equipment.uuid,
              chip_id: null,
              entry_date: state.entryDate,
              exit_date: state.exitDate || null,
              association_type_id: state.associationType,
              plan_id: state.planId || null,
              plan_gb: state.planGb || 0,
              equipment_ssid: state.assetConfiguration[equipment.uuid]?.ssid || null,
              equipment_pass: state.assetConfiguration[equipment.uuid]?.password || null,
              notes: state.notes || null,
            });
          }
        }
      }

      // Handle remaining chips (backup chips or standalone)
      for (const chip of chips) {
        associations.push({
          client_id: state.client.uuid,
          equipment_id: null,
          chip_id: chip.uuid,
          entry_date: state.entryDate,
          exit_date: state.exitDate || null,
          association_type_id: state.associationType,
          plan_id: state.planId || null,
          plan_gb: state.planGb || 0,
          equipment_ssid: null,
          equipment_pass: null,
          notes: state.notes || null,
        });
      }

      // Handle standalone equipment
      if (equipments.length > 0 && chips.length === 0) {
        for (const equipment of equipments) {
          associations.push({
            client_id: state.client.uuid,
            equipment_id: equipment.uuid,
            chip_id: null,
            entry_date: state.entryDate,
            exit_date: state.exitDate || null,
            association_type_id: state.associationType,
            plan_id: state.planId || null,
            plan_gb: state.planGb || 0,
            equipment_ssid: state.assetConfiguration[equipment.uuid]?.ssid || null,
            equipment_pass: state.assetConfiguration[equipment.uuid]?.password || null,
            notes: state.notes || null,
          });
        }
      }

      // Create all associations
      for (const association of associations) {
        await associationService.create(association);
      }

      toast({
        title: "Sucesso",
        description: `${associations.length} associação(ões) criada(s) com sucesso!`,
      });

      dispatch({ type: 'RESET' });
    } catch (error) {
      console.error("Erro ao criar associações:", error);
      toast({
        title: "Erro",
        description: "Erro ao criar associações. Tente novamente.",
        variant: "destructive",
      });
      throw error;
    }
  }, [state]);

  return {
    state,
    dispatch,
    canProceed,
    createAssociation,
    isLoading: false, // Implement proper loading state if needed
  };
};
