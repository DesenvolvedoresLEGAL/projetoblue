import { useEffect, useReducer } from 'react';
import { UseFormReturn } from 'react-hook-form';

interface RegistrationFormData {
  [key: string]: any;
}

interface AssetRegistrationState {
  // Form type management
  currentFormType: 'chip' | 'equipment';
  isInitialized: boolean;

  // Asset type (for compatibility)
  assetType: 'CHIP' | 'ROTEADOR';

  // Password strength management
  passwordStrength: 'weak' | 'medium' | 'strong';
  allowWeakPassword: boolean;

  // UI state management
  basicInfoOpen: boolean;
  technicalInfoOpen: boolean;
  securityInfoOpen: boolean;
  networkInfoOpen: boolean;

  // Form data
  chipFormData: RegistrationFormData;
  equipmentFormData: RegistrationFormData;

  // Actions
  setCurrentFormType: (formType: 'chip' | 'equipment') => void;
  setIsInitialized: (initialized: boolean) => void;
  setAssetType: (type: 'CHIP' | 'ROTEADOR') => void;
  setPasswordStrength: (strength: 'weak' | 'medium' | 'strong') => void;
  setAllowWeakPassword: (allow: boolean) => void;
  setBasicInfoOpen: (open: boolean) => void;
  setTechnicalInfoOpen: (open: boolean) => void;
  setSecurityInfoOpen: (open: boolean) => void;
  setNetworkInfoOpen: (open: boolean) => void;
  setFormValue: (form: UseFormReturn<any>, key: string, value: any) => void;
  updateFormData: (data: RegistrationFormData, formType: 'chip' | 'equipment') => void;
  syncWithForm: (form: UseFormReturn<any>, formType: 'chip' | 'equipment') => void;
  clearState: () => void;
}

type InternalState = Omit<AssetRegistrationState,
  | 'setCurrentFormType'
  | 'setIsInitialized'
  | 'setAssetType'
  | 'setPasswordStrength'
  | 'setAllowWeakPassword'
  | 'setBasicInfoOpen'
  | 'setTechnicalInfoOpen'
  | 'setSecurityInfoOpen'
  | 'setNetworkInfoOpen'
  | 'setFormValue'
  | 'updateFormData'
  | 'syncWithForm'
  | 'clearState'>;

const initialState: InternalState = {
  currentFormType: 'chip',
  isInitialized: false,
  assetType: 'CHIP',
  passwordStrength: 'weak',
  allowWeakPassword: false,
  basicInfoOpen: true,
  technicalInfoOpen: false,
  securityInfoOpen: false,
  networkInfoOpen: false,
  chipFormData: {},
  equipmentFormData: {},
};

let state: InternalState = { ...initialState };
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach(listener => listener());
}

function setState(partial: Partial<InternalState>) {
  state = { ...state, ...partial };
  notify();
}

export function useAssetRegistrationState(): AssetRegistrationState {
  const [, forceUpdate] = useReducer(v => v + 1, 0);

  useEffect(() => {
    listeners.add(forceUpdate);
    return () => {
      listeners.delete(forceUpdate);
    };
  }, []);

  const setCurrentFormType = (formType: 'chip' | 'equipment') => {
    setState({
      currentFormType: formType,
      assetType: formType === 'chip' ? 'CHIP' : 'ROTEADOR',
    });
  };

  const setIsInitialized = (initialized: boolean) => {
    setState({ isInitialized: initialized });
  };

  const setAssetType = (type: 'CHIP' | 'ROTEADOR') => {
    setState({
      assetType: type,
      currentFormType: type === 'CHIP' ? 'chip' : 'equipment',
    });
  };

  const setPasswordStrength = (strength: 'weak' | 'medium' | 'strong') => {
    setState({ passwordStrength: strength });
  };

  const setAllowWeakPassword = (allow: boolean) => {
    setState({ allowWeakPassword: allow });
  };

  const setBasicInfoOpen = (open: boolean) => {
    setState({ basicInfoOpen: open });
  };

  const setTechnicalInfoOpen = (open: boolean) => {
    setState({ technicalInfoOpen: open });
  };

  const setSecurityInfoOpen = (open: boolean) => {
    setState({ securityInfoOpen: open });
  };

  const setNetworkInfoOpen = (open: boolean) => {
    setState({ networkInfoOpen: open });
  };

  const setFormValue = (form: UseFormReturn<any>, key: string, value: any) => {
    try {
      form.setValue(key as any, value);
    } catch (error) {
      console.warn(`Could not set form value for key: ${key}`, error);
    }
  };

  const updateFormData = (
    data: RegistrationFormData,
    formType: 'chip' | 'equipment',
  ) => {
    if (formType === 'chip') {
      setState({ chipFormData: { ...state.chipFormData, ...data } });
    } else {
      setState({ equipmentFormData: { ...state.equipmentFormData, ...data } });
    }
  };

  const syncWithForm = (
    form: UseFormReturn<any>,
    formType: 'chip' | 'equipment',
  ) => {
    const currentValues = form.getValues();
    if (formType === 'chip') {
      setState({ chipFormData: currentValues });
    } else {
      setState({ equipmentFormData: currentValues });
    }
  };

  const clearState = () => {
    state = { ...initialState };
    notify();
  };

  return {
    ...state,
    setCurrentFormType,
    setIsInitialized,
    setAssetType,
    setPasswordStrength,
    setAllowWeakPassword,
    setBasicInfoOpen,
    setTechnicalInfoOpen,
    setSecurityInfoOpen,
    setNetworkInfoOpen,
    setFormValue,
    updateFormData,
    syncWithForm,
    clearState,
  };
}
