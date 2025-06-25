
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
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

export const useAssetRegistrationState = create<AssetRegistrationState>()(
  devtools(
    (set, get) => ({
      // Initial state
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
      
      // Actions
      setCurrentFormType: (formType) => {
        set({ 
          currentFormType: formType,
          assetType: formType === 'chip' ? 'CHIP' : 'ROTEADOR'
        });
      },
      
      setIsInitialized: (initialized) => set({ isInitialized: initialized }),
      
      setAssetType: (type) => {
        set({ 
          assetType: type,
          currentFormType: type === 'CHIP' ? 'chip' : 'equipment'
        });
      },
      
      setPasswordStrength: (strength) => set({ passwordStrength: strength }),
      setAllowWeakPassword: (allow) => set({ allowWeakPassword: allow }),
      setBasicInfoOpen: (open) => set({ basicInfoOpen: open }),
      setTechnicalInfoOpen: (open) => set({ technicalInfoOpen: open }),
      setSecurityInfoOpen: (open) => set({ securityInfoOpen: open }),
      setNetworkInfoOpen: (open) => set({ networkInfoOpen: open }),
      
      setFormValue: (form, key, value) => {
        try {
          form.setValue(key as any, value);
        } catch (error) {
          console.warn(`Could not set form value for key: ${key}`, error);
        }
      },
      
      updateFormData: (data, formType) => {
        if (formType === 'chip') {
          set({ chipFormData: { ...get().chipFormData, ...data } });
        } else {
          set({ equipmentFormData: { ...get().equipmentFormData, ...data } });
        }
      },
      
      syncWithForm: (form, formType) => {
        const currentValues = form.getValues();
        if (formType === 'chip') {
          set({ chipFormData: currentValues });
        } else {
          set({ equipmentFormData: currentValues });
        }
      },
      
      clearState: () => {
        set({
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
        });
      },
    }),
    {
      name: 'asset-registration-state',
    }
  )
);
