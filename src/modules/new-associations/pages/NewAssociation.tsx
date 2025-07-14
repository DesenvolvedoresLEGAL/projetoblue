
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
import { AssociationGeneralConfig } from '@modules/associations/components/association/AssociationGeneralConfig';
import { Client } from '@/types/client';
import { useAssetAssociationState } from '@modules/assets/hooks/useAssetAssociationState';
import { SelectedAsset } from '@modules/associations/types';
import { useCreateAssociation } from '../hooks/useCreateAssociation';
import { toast } from '@/utils/toast';

type Step = 'client' | 'assets' | 'summary';


const NewAssociation = () => {
  const {
    currentStep,
    selectedClient,
    selectedAssets,
    generalConfig: persistedGeneralConfig,
    setCurrentStep,
    setSelectedClient,
    setSelectedAssets,
    setGeneralConfig: setPersistedGeneralConfig,
    clearState
  } = useAssetAssociationState();
  
  // Estado local para configuração geral
  const [generalConfig, setGeneralConfig] = useState<AssociationGeneralConfig>({
    // IDs definidos em supabase/seed.sql (1 = aluguel, 2 = assinatura)
    associationType: 1,
    startDate: new Date(),
    endDate: undefined,
    notes: ''
  });
  
  const navigate = useNavigate();
  const createAssociationMutation = useCreateAssociation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sincronizar com o estado persistido
  useEffect(() => {
    if (persistedGeneralConfig) {
      if (import.meta.env.DEV) console.log('📥 NewAssociation - Loading persisted config:', persistedGeneralConfig);
      setGeneralConfig(persistedGeneralConfig);
    }
  }, [persistedGeneralConfig]);

  // Debug log on component mount and state changes
  useEffect(() => {
    if (import.meta.env.DEV) console.log('🏗️ NewAssociation component mounted/updated:', {
      currentStep,
      hasSelectedClient: !!selectedClient,
      selectedAssetsCount: selectedAssets.length,
      generalConfig,
      persistedGeneralConfig
    });
  }, [currentStep, selectedClient, selectedAssets, generalConfig, persistedGeneralConfig]);

  const handleClientSelect = (client: Client) => {
    if (import.meta.env.DEV) console.log('👤 Client selected in NewAssociation:', client);
    setSelectedClient(client);
    setCurrentStep('assets');
  };

  const handleGeneralConfigUpdate = (updates: Partial<AssociationGeneralConfig>) => {
    const newConfig = { ...generalConfig, ...updates };
    if (import.meta.env.DEV) console.log('🔧 NewAssociation - General config updated:', newConfig);
    setGeneralConfig(newConfig);
    setPersistedGeneralConfig(newConfig);
  };

  const handleBack = () => {
    if (import.meta.env.DEV) console.log('⬅️ Back button pressed from step:', currentStep);
    if (currentStep === 'assets') {
      setCurrentStep('client');
    } else if (currentStep === 'summary') {
      setCurrentStep('assets');
    }
  };

  const handleComplete = async () => {
    if (import.meta.env.DEV) console.log('✅ Starting association creation process');
    if (import.meta.env.DEV) console.log('📊 Association data:', {
      client: selectedClient,
      assetsCount: selectedAssets.length,
      generalConfig
    });

    if (!selectedClient || selectedAssets.length === 0) {
      const errorMsg = 'Dados incompletos para criar as associações';
      if (import.meta.env.DEV) console.error('❌ Validation failed:', errorMsg);
      toast.error(errorMsg);
      return;
    }

    setIsSubmitting(true);

    try {
      if (import.meta.env.DEV) console.log('🚀 Creating association with assets:', selectedAssets.length);
      
      // Valor numérico já vem da configuração geral
      const associationTypeId = generalConfig.associationType;

      if (import.meta.env.DEV) console.log('🔄 Using association type ID:', associationTypeId);

      // Preparar dados da associação com associationTypeId numérico
      const associationData = {
        clientId: selectedClient.uuid,
        associationTypeId: associationTypeId, // Agora é number
        startDate: generalConfig.startDate.toISOString().split('T')[0],
        selectedAssets: selectedAssets.map(asset => ({
          id: asset.uuid,
          type: asset.type,
          identifier: asset.type === 'CHIP' 
            ? (asset.line_number?.toString() || asset.iccid || asset.uuid)
            : (asset.radio || asset.serial_number || asset.uuid)
        })),
        generalConfig: {
          notes: generalConfig.notes || '',
          ssid: undefined,
          password: undefined,
          dataLimit: undefined,
          rentedDays: 0
        }
      };

      if (import.meta.env.DEV) console.log('📤 Final association data being sent:', associationData);

      // Executar criação da associação
      const result = await createAssociationMutation.mutateAsync(associationData);
      
      if (import.meta.env.DEV) console.log('✅ Association creation result:', result);

      toast.success(`Associação criada com sucesso!`);
      
      // Clear persisted state and navigate
      clearState();
      navigate('/associations');
      
    } catch (error) {
      if (import.meta.env.DEV) console.error('❌ Error creating association:', error);
      toast.error('Erro ao criar associação. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (import.meta.env.DEV) console.log('❌ Canceling association creation');
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
              selectedAssets={selectedAssets}
              generalConfig={generalConfig}
              onAssetAdded={(asset) => setSelectedAssets([...selectedAssets, asset])}
              onAssetRemoved={(assetId) => setSelectedAssets(selectedAssets.filter(a => a.uuid !== assetId))}
              onAssetUpdated={(assetId, updates) => setSelectedAssets(selectedAssets.map(a => a.uuid === assetId ? { ...a, ...updates } : a))}
              onGeneralConfigUpdate={handleGeneralConfigUpdate}
              onProceed={() => setCurrentStep('summary')}
              excludeAssociatedToClient={selectedClient.uuid}
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

export default NewAssociation;
