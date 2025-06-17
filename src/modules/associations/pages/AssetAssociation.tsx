
import React, { useState, useEffect } from 'react';
import { StandardPageHeader } from "@/components/ui/standard-page-header";
import { StandardFiltersCard } from "@/components/ui/standard-filters-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Users, ArrowLeft, ArrowRight } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { ClientSelectionSimplified } from '@modules/associations/components/association/ClientSelectionSimplified';
import { AssetSelection } from '@modules/associations/components/association/AssetSelection';
import { AssociationSummary } from '@modules/associations/components/association/AssociationSummary';
import { Client } from '@/types/client';
import { useAssetAssociationState } from '@modules/assets/hooks/useAssetAssociationState';
import { SelectedAsset } from '@modules/associations/types';
import { useCreateAssociation } from '@modules/associations/hooks/useCreateAssociation';
import { toast } from '@/utils/toast';

type Step = 'client' | 'assets' | 'summary';

const AssetAssociation = () => {
  const {
    currentStep,
    selectedClient,
    selectedAssets,
    generalConfig,
    setCurrentStep,
    setSelectedClient,
    setSelectedAssets,
    setGeneralConfig,
    clearState
  } = useAssetAssociationState();
  
  const navigate = useNavigate();
  const createAssociationMutation = useCreateAssociation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Debug log on component mount and state changes
  useEffect(() => {
    console.log('🏗️ AssetAssociation component mounted/updated:', {
      currentStep,
      hasSelectedClient: !!selectedClient,
      selectedAssetsCount: selectedAssets.length,
      hasGeneralConfig: !!generalConfig
    });
  }, [currentStep, selectedClient, selectedAssets, generalConfig]);

  const handleClientSelect = (client: Client) => {
    console.log('👤 Client selected in AssetAssociation:', client);
    setSelectedClient(client);
    setCurrentStep('assets');
  };

  const handleAssetsConfirm = (assets: SelectedAsset[]) => {
    console.log('📦 Assets confirmed in AssetAssociation:', assets.length, 'assets');
    setSelectedAssets(assets);
    setCurrentStep('summary');
  };

  const handleBack = () => {
    console.log('⬅️ Back button pressed from step:', currentStep);
    if (currentStep === 'assets') {
      setCurrentStep('client');
    } else if (currentStep === 'summary') {
      setCurrentStep('assets');
    }
  };

  const handleComplete = async () => {
    console.log('✅ Starting association creation process');
    console.log('📊 Association data:', {
      client: selectedClient,
      assetsCount: selectedAssets.length,
      generalConfig
    });

    if (!selectedClient || selectedAssets.length === 0) {
      const errorMsg = 'Dados incompletos para criar as associações';
      console.error('❌ Validation failed:', errorMsg);
      toast.error(errorMsg);
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('🚀 Creating associations for', selectedAssets.length, 'assets');
      
      // Criar associações para cada ativo selecionado
      const associationPromises = selectedAssets.map(async (asset, index) => {
        const associationData = {
          clientId: selectedClient.uuid,
          assetId: asset.uuid,
          associationType: asset.associationType || 'ALUGUEL',
          startDate: asset.startDate || new Date().toISOString().split('T')[0],
          rentedDays: asset.rented_days,
          notes: asset.notes
        };

        console.log(`📝 Creating association ${index + 1}/${selectedAssets.length}:`, associationData);
        return createAssociationMutation.mutateAsync(associationData);
      });

      // Aguardar todas as associações serem criadas
      const results = await Promise.all(associationPromises);
      console.log('✅ All associations created successfully:', results);

      toast.success(`${selectedAssets.length} associação(ões) criada(s) com sucesso!`);
      
      // Clear persisted state and navigate
      clearState();
      navigate('/associations');
      
    } catch (error) {
      console.error('❌ Error creating associations:', error);
      toast.error('Erro ao criar uma ou mais associações. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    console.log('❌ Canceling association creation');
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
          disabled={isSubmitting}
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
              disabled={isSubmitting}
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
              onAssetAdded={(asset) => setSelectedAssets([...selectedAssets, asset])}
              onAssetRemoved={(assetId) => setSelectedAssets(selectedAssets.filter(a => a.uuid !== assetId))}
              onAssetUpdated={(assetId, updates) => setSelectedAssets(selectedAssets.map(a => a.uuid === assetId ? { ...a, ...updates } : a))}
              onProceed={() => setCurrentStep('summary')}
            />
          )}
          
          {currentStep === 'summary' && selectedClient && selectedAssets.length > 0 && (
            <AssociationSummary
              client={selectedClient}
              assets={selectedAssets}
              generalConfig={generalConfig}
              onComplete={handleComplete}
              onBack={handleBack}
              isLoading={isSubmitting}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AssetAssociation;
