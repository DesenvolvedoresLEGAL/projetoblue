
import React, { useState } from 'react';
import { StandardPageHeader } from "@/components/ui/standard-page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link2, User, Package, CheckCircle, ArrowLeft, ArrowRight } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { Client } from '@/types/asset';
import { ClientSelectionSimplified } from '@/components/association/ClientSelectionSimplified';
import { AssetSelection } from '@/components/association/AssetSelection';
import { AssociationConfirmation } from '@/components/association/AssociationConfirmation';

export interface SelectedAsset {
  uuid: string;
  type: 'CHIP' | 'EQUIPMENT';
  iccid?: string;
  radio?: string;
  serial_number?: string;
  model?: string;
  solucao?: string;
  status?: string;
  // Configurações da associação
  associationType: 1 | 2; // 1 = Locação, 2 = Assinatura
  startDate: string;
  endDate?: string;
  monthlyValue?: number;
  observations?: string;
}

type Step = 'client' | 'assets' | 'confirmation';

const AssetAssociation = () => {
  const [currentStep, setCurrentStep] = useState<Step>('client');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedAssets, setSelectedAssets] = useState<SelectedAsset[]>([]);
  const navigate = useNavigate();

  const steps = [
    { id: 'client', label: 'Cliente', icon: User, description: 'Selecionar cliente' },
    { id: 'assets', label: 'Ativos', icon: Package, description: 'Escolher ativos' },
    { id: 'confirmation', label: 'Confirmação', icon: CheckCircle, description: 'Revisar e confirmar' }
  ];

  const currentStepIndex = steps.findIndex(step => step.id === currentStep);

  const handleClientSelected = (client: Client) => {
    setSelectedClient(client);
    setCurrentStep('assets');
  };

  const handleAssetAdded = (asset: SelectedAsset) => {
    setSelectedAssets(prev => [...prev, asset]);
  };

  const handleAssetRemoved = (assetId: string) => {
    setSelectedAssets(prev => prev.filter(asset => asset.uuid !== assetId));
  };

  const handleAssetUpdated = (assetId: string, updatedAsset: Partial<SelectedAsset>) => {
    setSelectedAssets(prev => 
      prev.map(asset => 
        asset.uuid === assetId ? { ...asset, ...updatedAsset } : asset
      )
    );
  };

  const handleProceedToConfirmation = () => {
    setCurrentStep('confirmation');
  };

  const handleAssociationComplete = () => {
    // Reset state and navigate back
    setSelectedClient(null);
    setSelectedAssets([]);
    setCurrentStep('client');
    navigate('/associations');
  };

  const handleBack = () => {
    switch (currentStep) {
      case 'assets':
        setCurrentStep('client');
        break;
      case 'confirmation':
        setCurrentStep('assets');
        break;
      default:
        navigate('/associations');
    }
  };

  return (
    <div className="space-y-6">
      <StandardPageHeader
        icon={Link2}
        title="Nova Associação de Ativos"
        description="Associe ativos a clientes para controle de locação ou assinatura"
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/associations')}
          className="flex items-center gap-2 text-[#4D2BFB] hover:bg-[#4D2BFB]/10 font-neue-haas"
        >
          <ArrowLeft className="h-4 w-4" />
          Cancelar
        </Button>
      </StandardPageHeader>

      {/* Progress Steps */}
      <Card className="border-[#4D2BFB]/20 bg-gradient-to-r from-[#4D2BFB]/5 to-[#03F9FF]/5">
        <CardHeader>
          <CardTitle className="text-[#020CBC] font-neue-haas">
            Processo de Associação
          </CardTitle>
          <div className="flex items-center justify-between mt-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = step.id === currentStep;
              const isCompleted = index < currentStepIndex;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center gap-3 ${index > 0 ? 'ml-4' : ''}`}>
                    <div className={`
                      flex items-center justify-center w-10 h-10 rounded-full border-2 
                      ${isActive ? 'bg-[#4D2BFB] border-[#4D2BFB] text-white' : 
                        isCompleted ? 'bg-[#03F9FF] border-[#03F9FF] text-[#020CBC]' : 
                        'bg-white border-gray-300 text-gray-400'}
                    `}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="text-left">
                      <div className={`font-medium font-neue-haas ${
                        isActive ? 'text-[#020CBC]' : isCompleted ? 'text-[#4D2BFB]' : 'text-gray-400'
                      }`}>
                        {step.label}
                      </div>
                      <div className="text-xs text-muted-foreground font-neue-haas">
                        {step.description}
                      </div>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-12 h-0.5 mx-4 ${
                      index < currentStepIndex ? 'bg-[#03F9FF]' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </CardHeader>
      </Card>

      {/* Step Content */}
      {currentStep === 'client' && (
        <ClientSelectionSimplified onClientSelected={handleClientSelected} />
      )}

      {currentStep === 'assets' && selectedClient && (
        <AssetSelection
          client={selectedClient}
          selectedAssets={selectedAssets}
          onAssetAdded={handleAssetAdded}
          onAssetRemoved={handleAssetRemoved}
          onAssetUpdated={handleAssetUpdated}
          onProceed={handleProceedToConfirmation}
        />
      )}

      {currentStep === 'confirmation' && selectedClient && (
        <AssociationConfirmation
          client={selectedClient}
          selectedAssets={selectedAssets}
          onComplete={handleAssociationComplete}
          onBack={handleBack}
        />
      )}

      {/* Navigation */}
      {currentStep !== 'client' && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={handleBack}
                className="flex items-center gap-2 border-[#4D2BFB] text-[#4D2BFB] hover:bg-[#4D2BFB] hover:text-white font-neue-haas"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
              
              {currentStep === 'assets' && selectedAssets.length > 0 && (
                <Button
                  onClick={handleProceedToConfirmation}
                  className="flex items-center gap-2 bg-[#4D2BFB] hover:bg-[#3a1ecc] text-white font-neue-haas font-bold"
                >
                  Continuar
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AssetAssociation;
