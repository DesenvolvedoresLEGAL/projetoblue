/* eslint-disable @typescript-eslint/no-explicit-any */
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
    // Group assets by type
    const equipments = state.selectedAssets.filter(asset => asset.solution_id !== 11);
    const chips = [...state.selectedAssets.filter(asset => asset.solution_id === 11)];
    const associations = [];
    const usedChipIds = new Set();

    // Process equipment associations first
    for (const equipment of equipments) {
      if ([1, 2, 4].includes(equipment.solution_id)) {
        // Equipment that requires chip
        const configuredId = state.assetConfiguration[equipment.uuid]?.chip_id || null;
        
        if (!configuredId) {
          throw new Error(`Equipamento ${equipment.radio || equipment.serial_number} requer um chip principal.`);
        }
        
        // Find the configured chip
        const chipIndex = chips.findIndex(c => c.uuid === configuredId);
        
        if (chipIndex === -1) {
          // Chip isn't in selectedAssets, it must be from availableChips
          // Mark as used to avoid duplicates
          usedChipIds.add(configuredId);
          
          associations.push({
            client_id: state.client.uuid,
            equipment_id: equipment.uuid,
            chip_id: configuredId,
            entry_date: state.entryDate,
            exit_date: state.exitDate || null,
            association_type_id: state.associationType,
            plan_id: state.planId || null,
            plan_gb: state.planGb || 0,
            equipment_ssid: state.assetConfiguration[equipment.uuid]?.ssid || null,
            equipment_pass: state.assetConfiguration[equipment.uuid]?.password || null,
            notes: state.notes || null,
          });
        } else {
          // Chip is in selectedAssets, remove it from array to avoid duplicates
          const chip = chips.splice(chipIndex, 1)[0];
          usedChipIds.add(chip.uuid);
          
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
        // Regular equipment without chip requirement
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
    
    // Process remaining chips as backups
    for (const chip of chips) {
      if (!usedChipIds.has(chip.uuid)) {
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
          notes: `BACKUP | ${state.notes || ''}`,
        });
      }
    }
      // Create all associations
      for (const association of associations) {
        await associationService.create(association);
      }

      toast.success(
        `${associations.length} associação(ões) criada(s) com sucesso!`
      );

      dispatch({ type: 'RESET' });
    } catch (error) {
      console.error("Erro ao criar associações:", error);

      toast.error(
        "Erro ao criar associações. Tente novamente.\nO ativo " + error.message.split(' ').slice(3, 1000).join(' ')
      );
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
