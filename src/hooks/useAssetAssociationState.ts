
import { useState, useEffect } from 'react';
import { Client } from '@/types/client';
import { SelectedAsset } from '@/pages/AssetAssociation';
import { AssociationGeneralConfig } from '@/components/association/AssociationGeneralConfig';

type Step = 'client' | 'assets' | 'summary';

interface AssetAssociationState {
  currentStep: Step;
  selectedClient: Client | null;
  selectedAssets: SelectedAsset[];
  generalConfig: AssociationGeneralConfig;
}

const STORAGE_KEY = 'asset-association-state';

const defaultGeneralConfig: AssociationGeneralConfig = {
  associationType: 'ALUGUEL',
  startDate: new Date(),
  endDate: undefined,
  notes: ''
};

export const useAssetAssociationState = () => {
  // Initialize state from sessionStorage or defaults
  const [state, setState] = useState<AssetAssociationState>(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsedState = JSON.parse(saved);
        // Converter string dates de volta para Date objects
        if (parsedState.generalConfig?.startDate) {
          parsedState.generalConfig.startDate = new Date(parsedState.generalConfig.startDate);
        }
        if (parsedState.generalConfig?.endDate) {
          parsedState.generalConfig.endDate = new Date(parsedState.generalConfig.endDate);
        }
        return parsedState;
      }
    } catch (error) {
      console.warn('Failed to load association state from sessionStorage:', error);
    }
    
    return {
      currentStep: 'client' as Step,
      selectedClient: null,
      selectedAssets: [],
      generalConfig: defaultGeneralConfig
    };
  });

  // Persist state to sessionStorage whenever it changes
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.warn('Failed to save association state to sessionStorage:', error);
    }
  }, [state]);

  // Helper functions to update state
  const setCurrentStep = (step: Step) => {
    setState(prev => ({ ...prev, currentStep: step }));
  };

  const setSelectedClient = (client: Client | null) => {
    setState(prev => ({ ...prev, selectedClient: client }));
  };

  const setSelectedAssets = (assets: SelectedAsset[] | ((prev: SelectedAsset[]) => SelectedAsset[])) => {
    setState(prev => ({
      ...prev,
      selectedAssets: typeof assets === 'function' ? assets(prev.selectedAssets) : assets
    }));
  };

  const setGeneralConfig = (config: AssociationGeneralConfig | ((prev: AssociationGeneralConfig) => AssociationGeneralConfig)) => {
    setState(prev => ({
      ...prev,
      generalConfig: typeof config === 'function' ? config(prev.generalConfig) : config
    }));
  };

  // Clear all state (used when completing or canceling)
  const clearState = () => {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear association state from sessionStorage:', error);
    }
    
    setState({
      currentStep: 'client',
      selectedClient: null,
      selectedAssets: [],
      generalConfig: defaultGeneralConfig
    });
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
    clearState
  };
};
