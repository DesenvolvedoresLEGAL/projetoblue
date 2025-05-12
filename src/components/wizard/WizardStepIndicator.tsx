
import React from "react";
import { Check, Router, Link, ListChecks } from "lucide-react";
import { useWizard } from "./WizardContext";
import { cn } from "@/lib/utils";

export const WizardStepIndicator: React.FC = () => {
  const { currentStep, assetType } = useWizard();
  
  const steps = [
    {
      id: "assetDetails",
      name: `Detalhes do ${assetType === "CHIP" ? "Chip" : assetType === "ROTEADOR" ? "Roteador" : "Asset"}`,
      icon: assetType === "CHIP" ? <Router className="h-5 w-5" /> : <Router className="h-5 w-5" />,
    },
    {
      id: "association",
      name: "Vinculação (Opcional)",
      icon: <Link className="h-5 w-5" />,
    },
    {
      id: "status",
      name: "Status Inicial",
      icon: <ListChecks className="h-5 w-5" />,
    },
  ];

  return (
    <div className="w-full">
      <ol className="flex w-full">
        {steps.map((step, index) => {
          const isActive = currentStep === step.id;
          const isPast = steps.findIndex(s => s.id === currentStep) > index;
          
          return (
            <li
              key={step.id}
              className={cn(
                "relative flex flex-1 flex-col items-center justify-center",
                index !== steps.length - 1 && "after:absolute after:right-0 after:top-1/2 after:h-0.5 after:w-full after:bg-gray-300 after:content-[''] after:-translate-y-1/2 after:z-0",
                (isActive || isPast) && index !== steps.length - 1 && "after:bg-primary"
              )}
            >
              <div className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border z-10",
                isActive ? "border-primary bg-primary text-primary-foreground" :
                isPast ? "border-primary bg-white ring-2 ring-primary" : "border-gray-300 bg-white"
              )}>
                {isPast ? (
                  <Check className="h-5 w-5 text-primary" />
                ) : (
                  step.icon
                )}
              </div>
              <span className={cn(
                "mt-2 text-sm font-medium",
                isActive ? "text-primary" : isPast ? "text-primary" : "text-gray-500"
              )}>
                {step.name}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
};
