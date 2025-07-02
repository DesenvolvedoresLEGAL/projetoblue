
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { UseFormReturn, Path } from 'react-hook-form';
import type {
  ChipFormValues,
  EquipmentFormValues,
} from '../pages/assets/register/types';

type ChipRegistrationData = Partial<ChipFormValues>;
type EquipmentRegistrationData = Partial<EquipmentFormValues>;

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
  chipFormData: ChipRegistrationData;
  equipmentFormData: EquipmentRegistrationData;

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
  setFormValue: <T extends ChipFormValues | EquipmentFormValues>(
    form: UseFormReturn<T>,
    key: keyof T,
    value: T[keyof T]
  ) => void;
  updateFormData: (
    data: ChipRegistrationData | EquipmentRegistrationData,
    formType: 'chip' | 'equipment'
  ) => void;
  syncWithForm: (
    form: UseFormReturn<ChipFormValues | EquipmentFormValues>,
    formType: 'chip' | 'equipment'
  ) => void;
  clearState: () => void;
}

export const useAssetRegistrationState = create<AssetRegistrationState>()(
  devtools(
    persist(
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
            assetType: formType === 'chip' ? 'CHIP' : 'ROTEADOR',
          });
        },

        setIsInitialized: (initialized) => set({ isInitialized: initialized }),

        setAssetType: (type) => {
          set({
            assetType: type,
            currentFormType: type === 'CHIP' ? 'chip' : 'equipment',
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
            // Type casting para resolver o problema Path<T> vs keyof T
            form.setValue(key as Path<typeof form extends UseFormReturn<infer T> ? T : never>, value);
          } catch (error) {
            console.warn(`Could not set form value for key: ${String(key)}`, error);
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
        partialize: (state) => ({
          currentFormType: state.currentFormType,
          isInitialized: state.isInitialized,
          assetType: state.assetType,
          passwordStrength: state.passwordStrength,
          allowWeakPassword: state.allowWeakPassword,
          basicInfoOpen: state.basicInfoOpen,
          technicalInfoOpen: state.technicalInfoOpen,
          securityInfoOpen: state.securityInfoOpen,
          networkInfoOpen: state.networkInfoOpen,
          chipFormData: state.chipFormData,
          equipmentFormData: state.equipmentFormData,
        }),
      }
    ),
    { name: 'asset-registration-state' }
  )
);
