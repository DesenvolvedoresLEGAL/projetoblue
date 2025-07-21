
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ClientSelectionStep } from "./ClientSelectionStep";
import { AssetSelectionStep } from "./AssetSelectionStep";
import { ConfigurationStep } from "./ConfigurationStep";
import { PlanConfigStep } from "./PlanConfigStep";
import { NotesStep } from "./NotesStep";
import { AssociationSummary } from "./AssociationSummary";
import { useAssociationFlow } from "../hooks/useAssociationFlow";

const STEPS = [
  { id: 1, title: "Cliente", component: ClientSelectionStep },
  { id: 2, title: "Ativos", component: AssetSelectionStep },
  { id: 3, title: "Configuração", component: ConfigurationStep },
  { id: 4, title: "Plano", component: PlanConfigStep },
  { id: 5, title: "Observações", component: NotesStep },
  { id: 6, title: "Resumo", component: AssociationSummary },
];

export const AssociationFlow = () => {
  const [currentStep, setCurrentStep] = useState((): number => {
    const savedStep = localStorage.getItem('wizardStep');
    console.log("[SAVEDSTEP] ", savedStep);
    console.log(!isNaN(parseInt(savedStep)) ? parseInt(savedStep) : 1)
    return isNaN(parseInt(savedStep)) ? 1 : parseInt(savedStep);
  });
  const { state, dispatch, canProceed, createAssociation, isLoading } = useAssociationFlow();

  const currentStepData = STEPS.find(step => step.id === currentStep);
  const CurrentStepComponent = currentStepData?.component;

  useEffect(() => {
    localStorage.setItem('wizardStep', String(currentStep));
    localStorage.setItem('wizardState', JSON.stringify(state));
  }, [currentStep, state]);

  useEffect(() => {
    const savedStep = localStorage.getItem('wizardStep');
    if (savedStep) {
      setCurrentStep(Number(savedStep));
    }
  }, []); // array vazio: roda só no mount

  const handleNext = () => {
    if (currentStep < STEPS.length && canProceed(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleFinish = async () => {
    try {
      await createAssociation();
      // Reset flow or navigate away
      setCurrentStep(1);
      localStorage.removeItem('wizardStep');
    } catch (error) {
      console.error("Erro ao criar associação:", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Stepper */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center flex-wrap gap-4 justify-center">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex items-center">
                  <Badge 
                    variant={currentStep >= step.id ? "default" : "secondary"}
                    className="rounded-full w-8 h-8 flex items-center justify-center"
                  >
                    {step.id}
                  </Badge>
                  <span className={`ml-2 text-sm font-medium ${
                    currentStep >= step.id ? "text-foreground" : "text-muted-foreground"
                  }`}>
                    {step.title}
                  </span>
                </div>
                {index < STEPS.length - 1 ? (
                  <ChevronRight className="mx-4 h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="mx-4 h-4 w-4 text-transparent" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Current Step Content */}
      <Card>
        <CardHeader>
          <CardTitle>{currentStepData?.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {CurrentStepComponent && (
            <CurrentStepComponent 
              state={state} 
              dispatch={dispatch} 
            />
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-6 border-t">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Anterior
            </Button>

            {currentStep === STEPS.length ? (
              <Button 
                onClick={handleFinish}
                disabled={!canProceed(currentStep) || isLoading}
              >
                {isLoading ? "Criando..." : "Finalizar"}
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={!canProceed(currentStep)}
              >
                Próximo
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
