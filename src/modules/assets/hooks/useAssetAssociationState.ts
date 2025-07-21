
import { useState, useEffect } from 'react';
import type { Client } from '@/types/client';

interface SelectedAsset {
  id: string;
  uuid: string;
  type: 'CHIP' | 'EQUIPMENT';
  registrationDate: string;
  status?: string;
  statusId?: number;
  associatedEquipmentId?: string;
  isPrincipalChip?: boolean;
}

interface AssociationGeneralConfig {
  associationType: number;
  startDate: Date;
  endDate?: Date;
  notes: string;
  planId?: number;
  planGb?: number;
}

interface AssetAssociationState {
  selectedAssets: SelectedAsset[];
  currentStep: 'client' | 'assets' | 'summary';
  isLoading: boolean;
  selectedClient: Client | null;
  generalConfig: AssociationGeneralConfig | null;
}

const STORAGE_KEY = 'asset_association_state';

export const useAssetAssociationState = () => {
  const [state, setState] = useState<AssetAssociationState>(() => {
    // Initialize from sessionStorage if available
    try {
      const savedState = sessionStorage.getItem(STORAGE_KEY);
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        

        if (parsedState.generalConfig) {
          parsedState.generalConfig.startDate = new Date(parsedState.generalConfig.startDate);
          if (parsedState.generalConfig.endDate) {
            parsedState.generalConfig.endDate = new Date(parsedState.generalConfig.endDate);
          }
        }

        return parsedState;
      }
    } catch (error) {
      return;
    }
    
    // Default state com configuração inicial correta
    const defaultState: AssetAssociationState = {
      selectedAssets: [],
      currentStep: 'client' as const,
      isLoading: false,
      selectedClient: null,
      generalConfig: {
        associationType: 1, // Padrão: ALUGUEL (ID = 1)
        startDate: new Date(),
        endDate: undefined,
        notes: '',
        rentedDays: 0
      } as AssociationGeneralConfig
    };
    
    return defaultState;
  });

  // Persist state to sessionStorage whenever it changes
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      
    } catch (error) {
      return;
    }
  }, [state]);

  const setCurrentStep = (step: 'client' | 'assets' | 'summary') => {
    
    setState(prevState => ({ ...prevState, currentStep: step }));
  };

  const setSelectedClient = (client: Client | null) => {
    
    setState(prevState => ({ ...prevState, selectedClient: client }));
  };

  const setSelectedAssets = (assets: SelectedAsset[]) => {
    
    setState(prevState => ({ ...prevState, selectedAssets: assets }));
  };

  const setGeneralConfig = (config: AssociationGeneralConfig | null) => {
    
    setState(prevState => ({ ...prevState, generalConfig: config }));
  };

  // Validação para verificar se os dados estão completos
  const validateCurrentStep = (): boolean => {
    switch (state.currentStep) {
      case 'client':
        return !!state.selectedClient;
      case 'assets':
        return state.selectedAssets.length > 0;
      case 'summary':
        return !!(state.selectedClient && state.selectedAssets.length > 0 && state.generalConfig);
      default:
        return false;
    }
  };

  const clearState = () => {
    
    const defaultState: AssetAssociationState = {
      selectedAssets: [],
      currentStep: 'client' as const,
      isLoading: false,
      selectedClient: null,
      generalConfig: {
        associationType: 1,
        startDate: new Date(),
        endDate: undefined,
        notes: '',
        rentedDays: 0
      } as AssociationGeneralConfig
    };
    setState(defaultState);
    
    // Also clear from sessionStorage
    try {
      sessionStorage.removeItem(STORAGE_KEY);
      
    } catch (error) {
      return;
    }
  };
  
  return {
    currentStep: state.currentStep,
    selectedClient: state.selectedClient,
    selectedAssets: state.selectedAssets,
    generalConfig: state.generalConfig,
    setCurrentStep,
    setSelectedClient,
    setSelectedAssets,
    setGeneralConfig,
    validateCurrentStep,
    clearState
  };
};
