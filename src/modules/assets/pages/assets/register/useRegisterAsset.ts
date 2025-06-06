
import { useState, useEffect } from "react";
import { useAssetRegistrationState } from "@modules/assets/hooks/useAssetRegistrationState";
import { useFormSetup } from "./useFormSetup";
import { useFormHandlers } from "./useFormHandlers";
import { useReferenceData } from "./useReferenceData";

export function useRegisterAsset() {
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
    setAllowWeakPassword,
    setBasicInfoOpen,
    setTechnicalInfoOpen,
    setSecurityInfoOpen,
    setNetworkInfoOpen,
    setPasswordStrength,
    syncWithForm,
    updateFormData
  } = useAssetRegistrationState();

  const { chipForm, equipmentForm } = useFormSetup();
  const referenceData = useReferenceData();
  const formHandlers = useFormHandlers(chipForm, equipmentForm);

  const equipmentPassword = equipmentForm.watch("admin_pass");

  // Sync form data with state management
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

  // Update success state when mutation succeeds
  useEffect(() => {
    if (formHandlers.createAssetMutation.isSuccess) {
      setShowSuccess(true);
    }
  }, [formHandlers.createAssetMutation.isSuccess]);

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
    setPasswordStrength,
    chipForm,
    equipmentForm,
    ...referenceData,
    ...formHandlers,
  };
}
