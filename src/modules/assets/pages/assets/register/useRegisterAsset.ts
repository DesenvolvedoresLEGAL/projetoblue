
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

  // Reset mutation state when asset type changes
  useEffect(() => {
    console.log('[useRegisterAsset] Asset type changed to:', assetType);
    
    // Reset success state when changing asset type
    setShowSuccess(false);
    
    // Reset mutation state to prevent interference
    if (formHandlers.createAssetMutation.isSuccess || formHandlers.createAssetMutation.isError) {
      console.log('[useRegisterAsset] Resetting mutation state due to asset type change');
      formHandlers.createAssetMutation.reset();
    }
  }, [assetType, formHandlers.createAssetMutation]);

  // Sync form data with state management
  useEffect(() => {
    if (assetType === "CHIP") {
      syncWithForm(chipForm, "chip");
    } else {
      syncWithForm(equipmentForm, "equipment");
    }
  }, [assetType, chipForm, equipmentForm, syncWithForm]);

  useEffect(() => {
    const sub = chipForm.watch(data => updateFormData(data, "chip"));
    return () => sub.unsubscribe();
  }, [chipForm, chipForm.watch, updateFormData]);

  useEffect(() => {
    const sub = equipmentForm.watch(data => updateFormData(data, "equipment"));
    return () => sub.unsubscribe();
  }, [equipmentForm, equipmentForm.watch, updateFormData]);

  // Update success state when mutation succeeds
  useEffect(() => {
    console.log('[useRegisterAsset] Mutation status:', {
      isSuccess: formHandlers.createAssetMutation.isSuccess,
      isError: formHandlers.createAssetMutation.isError,
      isPending: formHandlers.createAssetMutation.isPending,
      assetType
    });

    if (formHandlers.createAssetMutation.isSuccess) {
      console.log('[useRegisterAsset] Setting showSuccess to true for asset type:', assetType);
      setShowSuccess(true);
    }
  }, [
    formHandlers.createAssetMutation.isSuccess,
    formHandlers.createAssetMutation.isError,
    formHandlers.createAssetMutation.isPending,
    assetType
  ]);

  // Reset success state when starting a new submission
  useEffect(() => {
    if (formHandlers.createAssetMutation.isPending) {
      console.log('[useRegisterAsset] Mutation is pending, resetting showSuccess');
      setShowSuccess(false);
    }
  }, [formHandlers.createAssetMutation.isPending]);

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
