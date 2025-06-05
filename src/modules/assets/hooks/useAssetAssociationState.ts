
import { useState } from 'react';
import { AssetAssociationState } from '@modules/associations/types';

export const useAssetAssociationState = () => {
  const [state, setState] = useState<AssetAssociationState>({
    selectedAssets: [],
    currentStep: 'client', // Changed to string
    isLoading: false,
    selectedClient: null,
    generalConfig: null
  });

  const setCurrentStep = (step: 'client' | 'assets' | 'summary') => {
    setState(prevState => ({ ...prevState, currentStep: step }));
  };

  const setSelectedClient = (client: any) => {
    setState(prevState => ({ ...prevState, selectedClient: client }));
  };

  const setSelectedAssets = (assets: any[]) => {
    setState(prevState => ({ ...prevState, selectedAssets: assets }));
  };

  const setGeneralConfig = (config: any) => {
    setState(prevState => ({ ...prevState, generalConfig: config }));
  };

  const clearState = () => {
    setState({
      selectedAssets: [],
      currentStep: 'client', // Changed to string
      isLoading: false,
      selectedClient: null,
      generalConfig: null
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
