
import { useState, useEffect } from 'react';
import { Client } from '@/types/asset';
import { SelectedAsset } from '@/pages/AssetAssociation';

type Step = 'client' | 'assets' | 'summary';

interface AssetAssociationState {
  currentStep: Step;
  selectedClient: Client | null;
  selectedAssets: SelectedAsset[];
}

const STORAGE_KEY = 'asset-association-state';

export const useAssetAssociationState = () => {
  // Initialize state from sessionStorage or defaults
  const [state, setState] = useState<AssetAssociationState>(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.warn('Failed to load association state from sessionStorage:', error);
    }
    
    return {
      currentStep: 'client' as Step,
      selectedClient: null,
      selectedAssets: []
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
      selectedAssets: []
    });
  };

  return {
    currentStep: state.currentStep,
    selectedClient: state.selectedClient,
    selectedAssets: state.selectedAssets,
    setCurrentStep,
    setSelectedClient,
    setSelectedAssets,
    clearState
  };
};
