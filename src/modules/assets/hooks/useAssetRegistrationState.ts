
import { useState, useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';

type AssetType = 'CHIP' | 'EQUIPAMENTO';

interface ChipFormValues {
  line_number?: number;
  iccid: string;
  manufacturer_id?: number;
  status_id?: number;
}

interface EquipmentFormValues {
  serial_number: string;
  model: string;
  rented_days: number;
  radio: string;
  status_id?: number;
  manufacturer_id?: number;
  solution_id?: number;
  admin_user: string;
  admin_pass: string;
  // Novos campos de configurações de rede - Fábrica
  ssid_fabrica: string;
  pass_fabrica: string;
  admin_user_fabrica: string;
  admin_pass_fabrica: string;
  // Novos campos de configurações de rede - Atuais
  ssid_atual: string;
  pass_atual: string;
}

interface AssetRegistrationState {
  assetType: AssetType;
  chipFormData: Partial<ChipFormValues>;
  equipmentFormData: Partial<EquipmentFormValues>;
  passwordStrength: 'weak' | 'medium' | 'strong' | null;
  allowWeakPassword: boolean;
  basicInfoOpen: boolean;
  technicalInfoOpen: boolean;
  securityInfoOpen: boolean;
  networkInfoOpen: boolean; // Nova seção para configurações de rede
}

// Use a chave específica solicitada
const STORAGE_KEY = 'register-asset-form-draft';

export const useAssetRegistrationState = () => {
  // Initialize state from sessionStorage or defaults
  const [state, setState] = useState<AssetRegistrationState>(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsedState = JSON.parse(saved);
        console.log('Dados do formulário restaurados do sessionStorage:', parsedState);
        return parsedState;
      }
    } catch (error) {
      console.warn('Failed to load registration state from sessionStorage:', error);
    }
    
    return {
      assetType: 'CHIP' as AssetType,
      chipFormData: {
        status_id: 1
      },
      equipmentFormData: {
        rented_days: 0,
        admin_user: "admin",
        status_id: 1,
        ssid_fabrica: "",
        pass_fabrica: "",
        admin_user_fabrica: "admin",
        admin_pass_fabrica: "",
        ssid_atual: "",
        pass_atual: ""
      },
      passwordStrength: null,
      allowWeakPassword: false,
      basicInfoOpen: true,
      technicalInfoOpen: false,
      securityInfoOpen: false,
      networkInfoOpen: false
    };
  });

  // Persist state to sessionStorage whenever it changes - salvar em tempo real
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      console.log('Estado do formulário salvo no sessionStorage:', state);
    } catch (error) {
      console.warn('Failed to save registration state to sessionStorage:', error);
    }
  }, [state]);

  // Helper functions to update state
  const setAssetType = (type: AssetType) => {
    setState(prev => ({ ...prev, assetType: type }));
  };

  const setChipFormData = (data: Partial<ChipFormValues>) => {
    setState(prev => ({ ...prev, chipFormData: { ...prev.chipFormData, ...data } }));
  };

  const setEquipmentFormData = (data: Partial<EquipmentFormValues>) => {
    setState(prev => ({ ...prev, equipmentFormData: { ...prev.equipmentFormData, ...data } }));
  };

  const setPasswordStrength = (strength: 'weak' | 'medium' | 'strong' | null) => {
    setState(prev => ({ ...prev, passwordStrength: strength }));
  };

  const setAllowWeakPassword = (allow: boolean) => {
    setState(prev => ({ ...prev, allowWeakPassword: allow }));
  };

  const setBasicInfoOpen = (open: boolean) => {
    setState(prev => ({ ...prev, basicInfoOpen: open }));
  };

  const setTechnicalInfoOpen = (open: boolean) => {
    setState(prev => ({ ...prev, technicalInfoOpen: open }));
  };

  const setSecurityInfoOpen = (open: boolean) => {
    setState(prev => ({ ...prev, securityInfoOpen: open }));
  };

  const setNetworkInfoOpen = (open: boolean) => {
    setState(prev => ({ ...prev, networkInfoOpen: open }));
  };

  // Sync form data with React Hook Form - restaurar dados automaticamente
  const syncWithForm = (form: UseFormReturn<any>, formType: 'chip' | 'equipment') => {
    const formData = formType === 'chip' ? state.chipFormData : state.equipmentFormData;
    
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        form.setValue(key, value);
      }
    });
  };

  // Update persisted data when form changes - salvar dados em tempo real
  const updateFormData = (data: any, formType: 'chip' | 'equipment') => {
    if (formType === 'chip') {
      setChipFormData(data);
    } else {
      setEquipmentFormData(data);
    }
  };

  // Reset specific form data
  const resetFormData = (formType?: 'chip' | 'equipment') => {
    if (!formType || formType === 'chip') {
      setChipFormData({ status_id: 1 });
    }
    if (!formType || formType === 'equipment') {
      setEquipmentFormData({
        rented_days: 0,
        admin_user: "admin",
        status_id: 1,
        ssid_fabrica: "",
        pass_fabrica: "",
        admin_user_fabrica: "admin",
        admin_pass_fabrica: "",
        ssid_atual: "",
        pass_atual: ""
      });
    }
  };

  // Clear all state - limpar após sucesso ou cancelamento
  const clearState = () => {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
      console.log('Dados do formulário removidos do sessionStorage');
    } catch (error) {
      console.warn('Failed to clear registration state from sessionStorage:', error);
    }
    
    setState({
      assetType: 'CHIP',
      chipFormData: { status_id: 1 },
      equipmentFormData: {
        rented_days: 0,
        admin_user: "admin",
        status_id: 1,
        ssid_fabrica: "",
        pass_fabrica: "",
        admin_user_fabrica: "admin",
        admin_pass_fabrica: "",
        ssid_atual: "",
        pass_atual: ""
      },
      passwordStrength: null,
      allowWeakPassword: false,
      basicInfoOpen: true,
      technicalInfoOpen: false,
      securityInfoOpen: false,
      networkInfoOpen: false
    });
  };

  return {
    assetType: state.assetType,
    chipFormData: state.chipFormData,
    equipmentFormData: state.equipmentFormData,
    passwordStrength: state.passwordStrength,
    allowWeakPassword: state.allowWeakPassword,
    basicInfoOpen: state.basicInfoOpen,
    technicalInfoOpen: state.technicalInfoOpen,
    securityInfoOpen: state.securityInfoOpen,
    networkInfoOpen: state.networkInfoOpen,
    setAssetType,
    setChipFormData,
    setEquipmentFormData,
    setPasswordStrength,
    setAllowWeakPassword,
    setBasicInfoOpen,
    setTechnicalInfoOpen,
    setSecurityInfoOpen,
    setNetworkInfoOpen,
    syncWithForm,
    updateFormData,
    resetFormData,
    clearState
  };
};
