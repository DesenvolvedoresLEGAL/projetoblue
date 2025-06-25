
import { create } from 'zustand';
import { AssetType } from '@/types/asset';
import { PasswordStrength } from '@/utils/passwordStrength';
import { UseFormReturn } from 'react-hook-form';

interface ChipFormData {
  iccid: string;
  line_number?: number;
  manufacturer_id?: number;
  status_id?: number;
}

interface EquipmentFormData {
  serial_number?: string;
  model?: string;
  rented_days?: number;
  radio?: string;
  status_id?: number;
  manufacturer_id?: number;
  solution_id?: number;
  admin_user?: string;
  admin_pass?: string;
  ssid_fabrica?: string;
  pass_fabrica?: string;
  admin_user_fabrica?: string;
  admin_pass_fabrica?: string;
  ssid_atual?: string;
  pass_atual?: string;
}

interface AssetRegistrationState {
  // Form state
  assetType: AssetType;
  
  // Password validation
  passwordStrength: PasswordStrength;
  allowWeakPassword: boolean;
  
  // UI state
  basicInfoOpen: boolean;
  technicalInfoOpen: boolean;
  securityInfoOpen: boolean;
  networkInfoOpen: boolean;
  
  // Form data
  chipFormData: ChipFormData;
  equipmentFormData: EquipmentFormData;
  
  // Actions
  setAssetType: (type: AssetType) => void;
  setPasswordStrength: (strength: PasswordStrength) => void;
  setAllowWeakPassword: (allow: boolean) => void;
  setBasicInfoOpen: (open: boolean) => void;
  setTechnicalInfoOpen: (open: boolean) => void;
  setSecurityInfoOpen: (open: boolean) => void;
  setNetworkInfoOpen: (open: boolean) => void;
  updateFormData: (data: any, formType: 'chip' | 'equipment') => void;
  syncWithForm: (form: UseFormReturn<any>, formType: 'chip' | 'equipment') => void;
  clearState: () => void;
}

const initialChipFormData: ChipFormData = {
  iccid: '',
  line_number: undefined,
  manufacturer_id: undefined,
  status_id: 1
};

const initialEquipmentFormData: EquipmentFormData = {
  serial_number: '',
  model: '',
  rented_days: 0,
  radio: '',
  status_id: 1,
  manufacturer_id: undefined,
  solution_id: undefined,
  admin_user: 'admin',
  admin_pass: '',
  ssid_fabrica: '',
  pass_fabrica: '',
  admin_user_fabrica: 'admin',
  admin_pass_fabrica: '',
  ssid_atual: '',
  pass_atual: ''
};

export const useAssetRegistrationState = create<AssetRegistrationState>((set, get) => ({
  // Initial state
  assetType: "CHIP",
  passwordStrength: "weak",
  allowWeakPassword: false,
  basicInfoOpen: true,
  technicalInfoOpen: true,
  securityInfoOpen: false,
  networkInfoOpen: false,
  chipFormData: initialChipFormData,
  equipmentFormData: initialEquipmentFormData,

  // Actions
  setAssetType: (type) => {
    console.log('[AssetRegistrationState] Changing asset type to:', type);
    set({ assetType: type });
  },

  setPasswordStrength: (strength) => set({ passwordStrength: strength }),
  setAllowWeakPassword: (allow) => set({ allowWeakPassword: allow }),
  setBasicInfoOpen: (open) => set({ basicInfoOpen: open }),
  setTechnicalInfoOpen: (open) => set({ technicalInfoOpen: open }),
  setSecurityInfoOpen: (open) => set({ securityInfoOpen: open }),
  setNetworkInfoOpen: (open) => set({ networkInfoOpen: open }),

  updateFormData: (data, formType) => {
    if (formType === 'chip') {
      set({ chipFormData: { ...get().chipFormData, ...data } });
    } else {
      set({ equipmentFormData: { ...get().equipmentFormData, ...data } });
    }
  },

  syncWithForm: (form, formType) => {
    const currentData = formType === 'chip' ? get().chipFormData : get().equipmentFormData;
    
    // Sincronizar dados do estado para o form
    Object.entries(currentData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        try {
          // Usar setValue de forma mais segura
          if (formType === 'chip') {
            const chipForm = form as UseFormReturn<ChipFormData>;
            chipForm.setValue(key as keyof ChipFormData, value);
          } else {
            const equipForm = form as UseFormReturn<EquipmentFormData>;
            equipForm.setValue(key as keyof EquipmentFormData, value);
          }
        } catch (error) {
          console.warn(`Failed to set form value for ${key}:`, error);
        }
      }
    });
  },

  clearState: () => {
    console.log('[AssetRegistrationState] Clearing state');
    set({
      assetType: "CHIP",
      passwordStrength: "weak",
      allowWeakPassword: false,
      basicInfoOpen: true,
      technicalInfoOpen: true,
      securityInfoOpen: false,
      networkInfoOpen: false,
      chipFormData: initialChipFormData,
      equipmentFormData: initialEquipmentFormData,
    });
  },
}));
