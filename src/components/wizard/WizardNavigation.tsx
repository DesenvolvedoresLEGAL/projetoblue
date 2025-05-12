
import React from "react";
import { Button } from "@/components/ui/button";
import { useWizard } from "./WizardContext";
import { ArrowLeft, ArrowRight, Save } from "lucide-react";

interface WizardNavigationProps {
  onSubmit?: () => void;
  isSubmitting?: boolean;
  disableNext?: boolean;
}

export const WizardNavigation: React.FC<WizardNavigationProps> = ({
  onSubmit,
  isSubmitting = false,
  disableNext = false,
}) => {
  const { currentStep, isLastStep, goToNextStep, goToPreviousStep } = useWizard();

  return (
    <div className="flex justify-between pt-6 mt-6 border-t">
      <Button
        type="button"
        variant="outline"
        onClick={goToPreviousStep}
        disabled={currentStep === "assetDetails" || isSubmitting}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar
      </Button>

      {isLastStep ? (
        <Button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting || disableNext}
        >
          {isSubmitting ? (
            <>Salvando...</>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Finalizar Cadastro
            </>
          )}
        </Button>
      ) : (
        <Button
          type="button"
          onClick={goToNextStep}
          disabled={disableNext || isSubmitting}
        >
          Próximo
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      )}
    </div>
  );
};
