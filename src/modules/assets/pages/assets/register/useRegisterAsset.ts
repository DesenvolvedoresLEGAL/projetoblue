import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import {
  useCreateAsset,
  useManufacturers,
  useAssetSolutions,
  useStatusRecords
} from "@modules/assets/hooks/useAssetManagement";
import { useAssetRegistrationState } from "@modules/assets/hooks/useAssetRegistrationState";
import { checkPasswordStrength } from "@/utils/passwordStrength";
import { toast } from "@/utils/toast";

const chipSchema = z.object({
  line_number: z.number().min(1, "Número da linha é obrigatório"),
  iccid: z.string().min(1, "ICCID é obrigatório"),
  manufacturer_id: z.number().min(1, "Operadora é obrigatória"),
  status_id: z.number().min(1, "Status é obrigatório"),
});

const equipmentSchema = z.object({
  serial_number: z.string().min(1, "Número de série é obrigatório"),
  model: z.string().min(1, "Modelo é obrigatório"),
  rented_days: z.number().min(0, "Dias alugada deve ser 0 ou maior"),
  radio: z.string().min(1, "Rádio é obrigatório"),
  status_id: z.number().min(1, "Status é obrigatório"),
  manufacturer_id: z.number().min(1, "Fabricante é obrigatório"),
  solution_id: z.number().min(1, "Solução é obrigatória"),
  admin_user: z.string().min(1, "Usuário admin é obrigatório"),
  admin_pass: z.string().min(1, "Senha admin é obrigatória"),
  ssid_fabrica: z.string().min(1, "SSID de fábrica é obrigatório"),
  pass_fabrica: z.string().min(1, "Senha WiFi de fábrica é obrigatória"),
  admin_user_fabrica: z.string().min(1, "Usuário admin de fábrica é obrigatório"),
  admin_pass_fabrica: z.string().min(1, "Senha admin de fábrica é obrigatória"),
  ssid_atual: z.string().optional(),
  pass_atual: z.string().optional(),
});

export type ChipFormValues = z.infer<typeof chipSchema>;
export type EquipmentFormValues = z.infer<typeof equipmentSchema>;

export function useRegisterAsset() {
  const navigate = useNavigate();
  const [showSuccess, setShowSuccess] = useState(false);

  const {
    assetType,
    passwordStrength,
    allowWeakPassword,
    basicInfoOpen,
    technicalInfoOpen,
    securityInfoOpen,
    networkInfoOpen,
    setAssetType,
    setPasswordStrength,
    setAllowWeakPassword,
    setBasicInfoOpen,
    setTechnicalInfoOpen,
    setSecurityInfoOpen,
    setNetworkInfoOpen,
    syncWithForm,
    updateFormData,
    clearState
  } = useAssetRegistrationState();

  const { data: manufacturers = [], isLoading: isManufacturersLoading } = useManufacturers();
  const { data: solutions = [], isLoading: isSolutionsLoading } = useAssetSolutions();
  const { data: statuses = [], isLoading: isStatusesLoading } = useStatusRecords();

  const isReferenceDataLoading = isManufacturersLoading || isSolutionsLoading || isStatusesLoading;

  const operators = manufacturers.filter(m => m.description && m.description.toLowerCase().includes("operadora"));
  const equipmentManufacturers = manufacturers.filter(m => !m.description || !m.description.toLowerCase().includes("operadora"));
  const equipmentSolutions = solutions.filter(s => s.id !== 11);

  const chipForm = useForm<ChipFormValues>({
    resolver: zodResolver(chipSchema),
    defaultValues: {
      line_number: undefined,
      iccid: "",
      manufacturer_id: undefined,
      status_id: 1
    }
  });

  const equipmentForm = useForm<EquipmentFormValues>({
    resolver: zodResolver(equipmentSchema),
    defaultValues: {
      serial_number: "",
      model: "",
      rented_days: 0,
      radio: "",
      status_id: 1,
      manufacturer_id: undefined,
      solution_id: undefined,
      admin_user: "admin",
      admin_pass: "",
      ssid_fabrica: "",
      pass_fabrica: "",
      admin_user_fabrica: "admin",
      admin_pass_fabrica: "",
      ssid_atual: "",
      pass_atual: ""
    }
  });

  const createAssetMutation = useCreateAsset();
  const equipmentPassword = equipmentForm.watch("admin_pass");

  useEffect(() => {
    if (assetType === "CHIP") {
      syncWithForm(chipForm, "chip");
    } else {
      syncWithForm(equipmentForm, "equipment");
    }
  }, [assetType]);

  useEffect(() => {
    const sub = chipForm.watch(data => updateFormData(data, "chip"));
    return () => sub.unsubscribe();
  }, [chipForm.watch, updateFormData]);

  useEffect(() => {
    const sub = equipmentForm.watch(data => updateFormData(data, "equipment"));
    return () => sub.unsubscribe();
  }, [equipmentForm.watch, updateFormData]);

  const handlePasswordChange = (value: string) => {
    const strength = checkPasswordStrength(value);
    setPasswordStrength(strength);
    equipmentForm.setValue("admin_pass", value);
  };

  const copyFactoryToCurrentFields = () => {
    const factoryData = {
      ssid_atual: equipmentForm.getValues("ssid_fabrica"),
      pass_atual: equipmentForm.getValues("pass_fabrica"),
    };
    Object.entries(factoryData).forEach(([key, value]) => {
      if (value) {
        equipmentForm.setValue(key as keyof EquipmentFormValues, value);
      }
    });
    toast.success("Dados de fábrica copiados para os campos atuais");
  };

  const onSubmitChip = (formData: ChipFormValues) => {
    const createData = {
      type: "CHIP" as const,
      solution_id: 11,
      model: "NANOSIM",
      line_number: formData.line_number,
      iccid: formData.iccid,
      manufacturer_id: formData.manufacturer_id,
      status_id: formData.status_id,
    };

    createAssetMutation.mutate(createData, {
      onSuccess: () => {
        setShowSuccess(true);
        clearState();
        chipForm.reset();
        equipmentForm.reset();
        setTimeout(() => navigate("/assets/management"), 2000);
      }
    });
  };

  const onSubmitEquipment = (formData: EquipmentFormValues) => {
    if (passwordStrength === "weak" && !allowWeakPassword) {
      equipmentForm.setError("admin_pass", { type: "manual", message: "Use uma senha mais forte ou marque para permitir senha fraca." });
      return;
    }
    const createData = {
      type: "ROTEADOR" as const,
      solution_id: formData.solution_id,
      serial_number: formData.serial_number,
      model: formData.model,
      rented_days: formData.rented_days,
      radio: formData.radio,
      status_id: formData.status_id,
      manufacturer_id: formData.manufacturer_id,
      admin_user: formData.admin_user,
      admin_pass: formData.admin_pass,
      ssid_fabrica: formData.ssid_fabrica,
      pass_fabrica: formData.pass_fabrica,
      admin_user_fabrica: formData.admin_user_fabrica,
      admin_pass_fabrica: formData.admin_pass_fabrica,
      ssid_atual: formData.ssid_atual,
      pass_atual: formData.pass_atual,
    };

    createAssetMutation.mutate(createData, {
      onSuccess: () => {
        setShowSuccess(true);
        clearState();
        chipForm.reset();
        equipmentForm.reset();
        setTimeout(() => navigate("/assets/management"), 2000);
      }
    });
  };

  return {
    showSuccess,
    assetType,
    passwordStrength,
    allowWeakPassword,
    basicInfoOpen,
    technicalInfoOpen,
    securityInfoOpen,
    networkInfoOpen,
    setAssetType,
    setAllowWeakPassword,
    setBasicInfoOpen,
    setTechnicalInfoOpen,
    setSecurityInfoOpen,
    setNetworkInfoOpen,
    chipForm,
    equipmentForm,
    createAssetMutation,
    isReferenceDataLoading,
    operators,
    equipmentManufacturers,
    equipmentSolutions,
    statuses,
    handlePasswordChange,
    copyFactoryToCurrentFields,
    setPasswordStrength,
    onSubmitChip,
    onSubmitEquipment,
  };
}
