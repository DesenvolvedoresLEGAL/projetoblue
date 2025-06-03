
import React from 'react';
import { StandardPageHeader } from "@/components/ui/standard-page-header";
import { StandardFiltersCard } from "@/components/ui/standard-filters-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Users, ArrowLeft, ArrowRight } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { ClientSelectionSimplified } from '@/components/association/ClientSelectionSimplified';
import { AssetSelection } from '@/components/association/AssetSelection';
import { AssociationSummary } from '@/components/association/AssociationSummary';
import { Client } from '@/types/client';
import { useAssetAssociationState } from '@/hooks/useAssetAssociationState';

export interface SelectedAsset {
  id: string;
  uuid: string;
  type: 'CHIP' | 'EQUIPMENT';
  registrationDate: string;
  status: string;
  statusId?: number;
  notes?: string;
  solucao?: string;
  marca?: string;
  modelo?: string;
  serial_number?: string;
  model?: string;
  radio?: string;
  solution_id?: number;
  manufacturer_id?: number;
  plan_id?: number;
  rented_days?: number;
  admin_user?: string;
  admin_pass?: string;
  iccid?: string;
  line_number?: string;
  phoneNumber?: string;
  carrier?: string;
  uniqueId?: string;
  brand?: string;
  ssid?: string;
  password?: string;
  serialNumber?: string;
  gb?: number;
  associationType?: string;
  startDate?: string;
  endDate?: string; // Nova propriedade para data de fim
  ssid_atual?: string; // Campos de rede editáveis
  pass_atual?: string; // Campos de rede editáveis
}

type Step = 'client' | 'assets' | 'summary';

const AssetAssociation = () => {
  const {
    currentStep,
    selectedClient,
    selectedAssets,
    setCurrentStep,
    setSelectedClient,
    setSelectedAssets,
    clearState
  } = useAssetAssociationState();
  
  const navigate = useNavigate();

  const handleClientSelect = (client: Client) => {
    setSelectedClient(client);
    setCurrentStep('assets');
  };

  const handleAssetsConfirm = (assets: SelectedAsset[]) => {
    setSelectedAssets(assets);
    setCurrentStep('summary');
  };

  const handleBack = () => {
    if (currentStep === 'assets') {
      setCurrentStep('client');
    } else if (currentStep === 'summary') {
      setCurrentStep('assets');
    }
  };

  const handleComplete = () => {
    // Clear persisted state and navigate
    clearState();
    navigate('/associations');
  };

  const handleCancel = () => {
    // Clear persisted state when canceling
    clearState();
    navigate(-1);
  };

  const getStepNumber = () => {
    switch (currentStep) {
      case 'client': return 1;
      case 'assets': return 2;
      case 'summary': return 3;
      default: return 1;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 'client': return 'Selecionar Cliente';
      case 'assets': return 'Selecionar Ativos';
      case 'summary': return 'Confirmar Associação';
      default: return 'Selecionar Cliente';
    }
  };

  return (
    <div className="space-y-6">
      <StandardPageHeader
        icon={Users}
        title="Nova Associação de Ativos"
        description="Associe ativos disponíveis a clientes de forma rápida e organizada"
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCancel}
          className="flex items-center gap-2 text-[#4D2BFB] hover:bg-[#4D2BFB]/10 font-neue-haas"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
      </StandardPageHeader>

      {/* Progress indicator */}
      <StandardFiltersCard title={`Etapa ${getStepNumber()}/3: ${getStepTitle()}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {['client', 'assets', 'summary'].map((step, index) => {
              const stepNumber = index + 1;
              const isActive = currentStep === step;
              const isCompleted = getStepNumber() > stepNumber;
              
              return (
                <div key={step} className="flex items-center">
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                    ${isActive ? 'bg-[#4D2BFB] text-white' : 
                      isCompleted ? 'bg-[#03F9FF] text-[#020CBC]' : 'bg-gray-200 text-gray-500'}
                  `}>
                    {stepNumber}
                  </div>
                  {index < 2 && (
                    <ArrowRight className={`
                      h-4 w-4 mx-2 
                      ${isCompleted ? 'text-[#03F9FF]' : 'text-gray-300'}
                    `} />
                  )}
                </div>
              );
            })}
          </div>
          
          {currentStep !== 'client' && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleBack}
              className="border-[#4D2BFB] text-[#4D2BFB] hover:bg-[#4D2BFB]/10 font-neue-haas"
            >
              Voltar
            </Button>
          )}
        </div>
      </StandardFiltersCard>

      {/* Step content */}
      <Card className="border-[#4D2BFB]/20 shadow-sm">
        <CardContent className="p-6">
          {currentStep === 'client' && (
            <ClientSelectionSimplified onClientSelected={handleClientSelect} />
          )}
          
          {currentStep === 'assets' && selectedClient && (
            <AssetSelection
              client={selectedClient}
              selectedAssets={selectedAssets}
              onAssetAdded={(asset) => setSelectedAssets(prev => [...prev, asset])}
              onAssetRemoved={(assetId) => setSelectedAssets(prev => prev.filter(a => a.uuid !== assetId))}
              onAssetUpdated={(assetId, updates) => setSelectedAssets(prev => prev.map(a => a.uuid === assetId ? { ...a, ...updates } : a))}
              onProceed={() => setCurrentStep('summary')}
            />
          )}
          
          {currentStep === 'summary' && selectedClient && selectedAssets.length > 0 && (
            <AssociationSummary
              client={selectedClient}
              assets={selectedAssets}
              onComplete={handleComplete}
              onBack={handleBack}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AssetAssociation;
