
import React, { createContext, useContext, useState } from "react";

type WizardStep = "assetDetails" | "association" | "status";

interface WizardContextType {
  currentStep: WizardStep;
  setCurrentStep: (step: WizardStep) => void;
  assetType: "CHIP" | "ROTEADOR" | null;
  setAssetType: (type: "CHIP" | "ROTEADOR" | null) => void;
  assetData: any;
  updateAssetData: (data: any) => void;
  resetWizard: () => void;
  isLastStep: boolean;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
}

const WizardContext = createContext<WizardContextType | undefined>(undefined);

const steps: WizardStep[] = ["assetDetails", "association", "status"];

export const WizardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentStep, setCurrentStep] = useState<WizardStep>("assetDetails");
  const [assetType, setAssetType] = useState<"CHIP" | "ROTEADOR" | null>(null);
  const [assetData, setAssetData] = useState<any>({});

  const currentStepIndex = steps.indexOf(currentStep);
  const isLastStep = currentStepIndex === steps.length - 1;

  const goToNextStep = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex]);
    }
  };

  const goToPreviousStep = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex]);
    }
  };

  const updateAssetData = (data: any) => {
    setAssetData((prevData: any) => ({ ...prevData, ...data }));
  };

  const resetWizard = () => {
    setCurrentStep("assetDetails");
    setAssetType(null);
    setAssetData({});
  };

  return (
    <WizardContext.Provider
      value={{
        currentStep,
        setCurrentStep,
        assetType,
        setAssetType,
        assetData,
        updateAssetData,
        resetWizard,
        isLastStep,
        goToNextStep,
        goToPreviousStep,
      }}
    >
      {children}
    </WizardContext.Provider>
  );
};

export const useWizard = () => {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error("useWizard must be used within a WizardProvider");
  }
  return context;
};
