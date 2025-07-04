
import { UseFormReturn } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "@/utils/toast";
import { checkPasswordStrength } from "@/utils/passwordStrength";
import { useCreateAsset } from "@modules/assets/hooks/useAssetManagement";
import { useAssetRegistrationState } from "@modules/assets/hooks/useAssetRegistrationState";
import { ChipFormValues, EquipmentFormValues } from "./types";

export function useFormHandlers(
  chipForm: UseFormReturn<ChipFormValues>,
  equipmentForm: UseFormReturn<EquipmentFormValues>
) {
  const navigate = useNavigate();
  const createAssetMutation = useCreateAsset();
  const {
    passwordStrength,
    allowWeakPassword,
    setPasswordStrength,
    clearState
  } = useAssetRegistrationState();

  const handlePasswordChange = (value: string) => {
    const strength = checkPasswordStrength(value);
    setPasswordStrength(strength);
    equipmentForm.setValue("admin_pass_fabrica", value);
  };

  const copyFactoryToCurrentFields = () => {
    const factoryData = {
      ssid_atual: equipmentForm.getValues("ssid_fabrica"),
      pass_atual: equipmentForm.getValues("pass_fabrica"),
      admin_user: equipmentForm.getValues("admin_user_fabrica"),
      admin_pass: equipmentForm.getValues("admin_pass_fabrica"),
    };
    Object.entries(factoryData).forEach(([key, value]) => {
      if (value) {
        equipmentForm.setValue(key as keyof EquipmentFormValues, value);
      }
    });
    toast.success("Dados de fábrica copiados para os campos atuais");
  };

  const onSubmitChip = (formData: ChipFormValues) => {
    if (import.meta.env.DEV) console.log('[onSubmitChip] Starting chip submission with data:', formData);
    
    const createData = {
      type: "CHIP" as const,
      solution_id: 11,
      model: "NANOSIM",
      line_number: formData.line_number,
      iccid: formData.iccid,
      manufacturer_id: formData.manufacturer_id,
      status_id: formData.status_id,
    };

    if (import.meta.env.DEV) console.log('[onSubmitChip] Calling mutation with:', createData);

    createAssetMutation.mutate(createData, {
      onSuccess: () => {
        if (import.meta.env.DEV) console.log('[onSubmitChip] Success callback executed');
        clearState();
        chipForm.reset();
        equipmentForm.reset();
        setTimeout(() => navigate("/assets/management"), 2000);
      },
      onError: (error) => {
        if (import.meta.env.DEV) console.error('[onSubmitChip] Error callback executed:', error);
      }
    });
  };

  const onSubmitEquipment = (formData: EquipmentFormValues) => {
    if (import.meta.env.DEV) console.log('[onSubmitEquipment] Starting equipment submission with data:', formData);

    // Inherit factory values for current fields if they are empty
    const currentData = {
      ssid_atual: formData.ssid_atual || formData.ssid_fabrica,
      pass_atual: formData.pass_atual || formData.pass_fabrica,
      admin_user: formData.admin_user || formData.admin_user_fabrica,
      admin_pass: formData.admin_pass || formData.admin_pass_fabrica,
    };

    if (import.meta.env.DEV) console.log('[onSubmitEquipment] Current credentials after inheritance:', currentData);

    // Check password strength for factory password (which is mandatory)
    if (passwordStrength === "weak" && !allowWeakPassword) {
      if (import.meta.env.DEV) console.log('[onSubmitEquipment] Blocking submission due to weak factory password');
      equipmentForm.setError("admin_pass_fabrica", { 
        type: "manual", 
        message: "Use uma senha mais forte ou marque para permitir senha fraca." 
      });
      return;
    }

    const createData = {
      type: "EQUIPMENT" as const,
      solution_id: formData.solution_id,
      serial_number: formData.serial_number,
      model: formData.model,
      rented_days: formData.rented_days,
      radio: formData.radio,
      status_id: formData.status_id,
      manufacturer_id: formData.manufacturer_id,
      // Factory credentials (mandatory)
      ssid_fabrica: formData.ssid_fabrica,
      pass_fabrica: formData.pass_fabrica,
      admin_user_fabrica: formData.admin_user_fabrica,
      admin_pass_fabrica: formData.admin_pass_fabrica,
      // Current credentials (with inheritance from factory)
      ssid_atual: currentData.ssid_atual,
      pass_atual: currentData.pass_atual,
      admin_user: currentData.admin_user,
      admin_pass: currentData.admin_pass,
    };

    if (import.meta.env.DEV) console.log('[onSubmitEquipment] Calling mutation with:', createData);

    createAssetMutation.mutate(createData, {
      onSuccess: (data) => {
        if (import.meta.env.DEV) console.log('[onSubmitEquipment] Success callback executed with data:', data);
        clearState();
        chipForm.reset();
        equipmentForm.reset();
        setTimeout(() => navigate("/assets/management"), 2000);
      },
      onError: (error) => {
        if (import.meta.env.DEV) console.error('[onSubmitEquipment] Error callback executed:', error);
      }
    });
  };

  return {
    handlePasswordChange,
    copyFactoryToCurrentFields,
    onSubmitChip,
    onSubmitEquipment,
    createAssetMutation
  };
}
