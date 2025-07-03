
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Users, Package, AlertCircle } from "lucide-react";
import { ClientSelectionStep } from './ClientSelectionStep';
import { AssetSelectionStep } from './AssetSelectionStep';
import { AssociationSummary } from './AssociationSummary';
import { useAssetAssociationState } from '@modules/assets/hooks/useAssetAssociationState';
import { toast } from '@/utils/toast';

const STEPS = {
  client: 'Selecionar Cliente',
  assets: 'Selecionar Ativos',
  summary: 'Resumo e Confirmação'
} as const;

type StepKey = keyof typeof STEPS;

interface StepIndicatorProps {
  currentStep: StepKey;
  completedSteps: Set<StepKey>;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, completedSteps }) => {
  const stepOrder: StepKey[] = ['client', 'assets', 'summary'];
  
  return (
    <div className="flex items-center justify-center space-x-4 mb-8">
      {stepOrder.map((step, index) => {
        const isActive = currentStep === step;
        const isCompleted = completedSteps.has(step);
        const stepNumber = index + 1;
        
        return (
          <div key={step} className="flex items-center">
            <div className={`
              flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium
              ${isActive 
                ? 'bg-[#4D2BFB] text-white' 
                : isCompleted 
                  ? 'bg-[#03F9FF] text-[#020CBC]' 
                  : 'bg-gray-200 text-gray-500'
              }
            `}>
              {stepNumber}
            </div>
            <span className={`ml-2 text-sm font-medium ${
              isActive ? 'text-[#4D2BFB]' : isCompleted ? 'text-[#020CBC]' : 'text-gray-500'
            }`}>
              {STEPS[step]}
            </span>
            {index < stepOrder.length - 1 && (
              <div className={`w-8 h-px mx-4 ${
                completedSteps.has(stepOrder[index + 1]) || currentStep === stepOrder[index + 1] 
                  ? 'bg-[#03F9FF]' 
                  : 'bg-gray-300'
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );
};

export const AssetAssociation: React.FC = () => {
  const {
    currentStep,
    selectedClient,
    selectedAssets,
    setCurrentStep,
    clearState
  } = useAssetAssociationState();

  const [completedSteps, setCompletedSteps] = useState<Set<StepKey>>(new Set());

  // Marcar steps como completos baseado no estado
  React.useEffect(() => {
    const newCompletedSteps = new Set<StepKey>();
    
    if (selectedClient) {
      newCompletedSteps.add('client');
    }
    
    if (selectedAssets.length > 0) {
      newCompletedSteps.add('assets');
    }
    
    setCompletedSteps(newCompletedSteps);
  }, [selectedClient, selectedAssets]);

  const handleBack = useCallback(() => {
    const stepOrder: StepKey[] = ['client', 'assets', 'summary'];
    const currentIndex = stepOrder.indexOf(currentStep);
    
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1]);
    }
  }, [currentStep, setCurrentStep]);

  const handleReset = useCallback(() => {
    clearState();
    setCompletedSteps(new Set());
  }, [clearState]);

  const handleAssociationComplete = useCallback(async (result: unknown) => {
    try {
      console.log('Associação concluída:', result);
      
      // Verificar se o resultado tem a estrutura esperada
      if (result && typeof result === 'object') {
        const resultObj = result as Record<string, unknown>;
        if (resultObj.success) {
          toast.success('Associação criada com sucesso!');
        } else if (resultObj.details) {
          const details = resultObj.details as Record<string, unknown>;
          const message = details.message as string || 'Associação criada';
          toast.success(message);
        }
      } else {
        toast.success('Associação criada com sucesso!');
      }
      
      // Reset do estado após sucesso
      setTimeout(() => {
        handleReset();
      }, 2000);
    } catch (error) {
      console.error('Erro no callback de conclusão:', error);
      toast.error('Erro ao processar resultado da associação');
    }
  }, [handleReset]);

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'client':
        return <ClientSelectionStep />;
      
      case 'assets':
        return <AssetSelectionStep />;
      
      case 'summary':
        return (
          <AssociationSummary
            client={selectedClient!}
            assets={selectedAssets}
            generalConfig={null}
            onComplete={handleAssociationComplete}
            onBack={handleBack}
          />
        );
      
      default:
        return <ClientSelectionStep />;
    }
  };

  const canGoBack = currentStep !== 'client';
  const hasSelectedItems = selectedClient || selectedAssets.length > 0;

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      {/* Header */}
      <Card className="mb-6 border-[#4D2BFB]/20">
        <CardHeader className="bg-gradient-to-r from-[#4D2BFB]/5 to-[#03F9FF]/5">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold text-[#020CBC] flex items-center gap-2">
              <Package className="h-6 w-6" />
              Nova Associação Asset-Cliente
            </CardTitle>
            <div className="flex items-center gap-2">
              {hasSelectedItems && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  <AlertCircle className="h-4 w-4 mr-1" />
                  Limpar Tudo
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Step Indicator */}
      <StepIndicator currentStep={currentStep} completedSteps={completedSteps} />

      {/* Progress Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card className="border-[#03F9FF]/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-[#03F9FF]" />
              <span className="font-medium">Cliente Selecionado:</span>
              {selectedClient ? (
                <Badge variant="secondary" className="bg-[#03F9FF]/10 text-[#020CBC]">
                  {selectedClient.nome}
                </Badge>
              ) : (
                <span className="text-muted-foreground">Nenhum</span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#4D2BFB]/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-[#4D2BFB]" />
              <span className="font-medium">Ativos Selecionados:</span>
              <Badge variant="secondary" className="bg-[#4D2BFB]/10 text-[#4D2BFB]">
                {selectedAssets.length}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card className="border-[#4D2BFB]/20">
        <CardContent className="p-6">
          {/* Back Button */}
          {canGoBack && (
            <div className="mb-6">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBack}
                className="border-[#4D2BFB] text-[#4D2BFB] hover:bg-[#4D2BFB]/10"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Voltar
              </Button>
            </div>
          )}

          {/* Step Content */}
          {renderCurrentStep()}
        </CardContent>
      </Card>
    </div>
  );
};
