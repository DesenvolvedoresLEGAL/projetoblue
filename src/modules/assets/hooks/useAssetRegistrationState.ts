
import { useState, useEffect } from 'react';
import { ChipFormValues, EquipmentFormValues } from '@modules/assets/pages/assets/register/types';
import { UseFormReturn } from 'react-hook-form';

export interface AssetRegistrationState {
  currentFormType: 'chip' | 'equipment';
  isInitialized: boolean;
}

const STORAGE_KEY = 'asset_registration_state';

export const useAssetRegistrationState = () => {
  const [state, setState] = useState<AssetRegistrationState>(() => {
    // Initialize from sessionStorage if available
    try {
      const savedState = sessionStorage.getItem(STORAGE_KEY);
      if (savedState) {
        return JSON.parse(savedState);
      }
    } catch (error) {
      console.warn('Failed to restore asset registration state from sessionStorage:', error);
    }
    
    // Default state
    return {
      currentFormType: 'chip',
      isInitialized: false
    };
  });

  // Persist state to sessionStorage whenever it changes
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.warn('Failed to save asset registration state to sessionStorage:', error);
    }
  }, [state]);

  const setCurrentFormType = (formType: 'chip' | 'equipment') => {
    setState(prevState => ({ ...prevState, currentFormType: formType }));
  };

  const setIsInitialized = (initialized: boolean) => {
    setState(prevState => ({ ...prevState, isInitialized: initialized }));
  };

  const clearState = () => {
    setState({
      currentFormType: 'chip',
      isInitialized: false
    });
    
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear asset registration state from sessionStorage:', error);
    }
  };

  // Helper function to handle setValue for different form types
  const setFormValue = (
    form: UseFormReturn<ChipFormValues> | UseFormReturn<EquipmentFormValues>,
    key: string,
    value: any
  ) => {
    if (state.currentFormType === 'chip') {
      const chipForm = form as UseFormReturn<ChipFormValues>;
      if (key in chipForm.getValues()) {
        chipForm.setValue(key as keyof ChipFormValues, value);
      }
    } else {
      const equipmentForm = form as UseFormReturn<EquipmentFormValues>;
      if (key in equipmentForm.getValues()) {
        equipmentForm.setValue(key as keyof EquipmentFormValues, value);
      }
    }
  };

  return {
    currentFormType: state.currentFormType,
    isInitialized: state.isInitialized,
    setCurrentFormType,
    setIsInitialized,
    setFormValue,
    clearState
  };
};
