
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, ArrowRight } from 'lucide-react';
import { toast } from '@/utils/toast';
import { useNavigate } from 'react-router-dom';
import { useAssetAssociationState } from '@modules/assets/hooks/useAssetAssociationState';
import { useCreateAssociation } from '@modules/associations/hooks/useCreateAssociation';
import { ClientSelectionStep } from './ClientSelectionStep';
import { AssetSelectionStep } from './AssetSelectionStep';
import { AssociationSummary } from './AssociationSummary';

export const AssetAssociation: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    currentStep,
    selectedClient,
    selectedAssets,
    generalConfig,
    setCurrentStep,
    validateCurrentStep,
    clearState
  } = useAssetAssociationState();

  const createAssociationMutation = useCreateAssociation();

  // Debug logs para rastrear estado
  useEffect(() => {
    console.log('🔍 AssetAssociation Debug - Estado atual:', {
      currentStep,
      hasSelectedClient: !!selectedClient,
      selectedClient: selectedClient?.nome,
      selectedAssetsCount: selectedAssets.length,
      generalConfig: {
        associationType: generalConfig?.associationType,
        associationTypeType: typeof generalConfig?.associationType,
        startDate: generalConfig?.startDate,
        notes: generalConfig?.notes
      }
    });
  }, [currentStep, selectedClient, selectedAssets, generalConfig]);

  // Reset submission state when step changes
  useEffect(() => {
    setIsSubmitting(false);
  }, [currentStep]);

  const handleNext = () => {
    if (currentStep === 'client' && selectedClient) {
      console.log('AssetAssociation: Avançando para seleção de ativos');
      setCurrentStep('assets');
    } else if (currentStep === 'assets' && selectedAssets.length > 0) {
      console.log('AssetAssociation: Avançando para resumo');
      setCurrentStep('summary');
    }
  };

  const handleBack = () => {
    if (currentStep === 'assets') {
      setCurrentStep('client');
    } else if (currentStep === 'summary') {
      setCurrentStep('assets');
    }
  };

  const handleSubmit = async () => {
    console.log('[AssetAssociation] 🚀 Iniciando submissão da associação');
    
    // Logs detalhados para debugging
    console.log('[AssetAssociation] 📊 Dados para submissão:', {
      selectedClient: selectedClient ? {
        uuid: selectedClient.uuid,
        nome: selectedClient.nome
      } : null,
      selectedAssetsCount: selectedAssets.length,
      selectedAssets: selectedAssets.map(asset => ({
        uuid: asset.uuid,
        type: asset.type,
        identifier: asset.type === 'CHIP' 
          ? (asset.line_number?.toString() || asset.iccid || asset.uuid)
          : (asset.radio || asset.serial_number || asset.uuid)
      })),
      generalConfig: generalConfig ? {
        associationType: generalConfig.associationType,
        associationTypeType: typeof generalConfig.associationType,
        startDate: generalConfig.startDate,
        endDate: generalConfig.endDate,
        notes: generalConfig.notes,
        rentedDays: generalConfig.rentedDays
      } : null
    });

    // Validação robusta com logs específicos
    const validationErrors: string[] = [];
    
    if (!selectedClient) {
      validationErrors.push('Cliente não selecionado');
    }
    
    if (!selectedAssets?.length) {
      validationErrors.push('Nenhum ativo selecionado');
    }
    
    if (!generalConfig) {
      validationErrors.push('Configuração geral não definida');
    } else {
      if (!generalConfig.associationType || typeof generalConfig.associationType !== 'number') {
        validationErrors.push(`Tipo de associação inválido: ${generalConfig.associationType} (tipo: ${typeof generalConfig.associationType})`);
      }
      
      if (!generalConfig.startDate) {
        validationErrors.push('Data de início não definida');
      }
    }

    if (validationErrors.length > 0) {
      const errorMsg = `Dados incompletos para criar associação: ${validationErrors.join(', ')}`;
      console.error('[AssetAssociation] ❌ Validação falhou:', errorMsg);
      toast.error(errorMsg);
      return;
    }

    setIsSubmitting(true);

    try {
      // Garantir que startDate seja uma string ISO completa
      let formattedStartDate: string;
      if (generalConfig!.startDate instanceof Date) {
        formattedStartDate = generalConfig!.startDate.toISOString();
      } else if (typeof generalConfig!.startDate === 'string') {
        // Se for string, converter para Date e depois para ISO
        const dateObj = new Date(generalConfig!.startDate);
        if (isNaN(dateObj.getTime())) {
          throw new Error('Data de início inválida');
        }
        formattedStartDate = dateObj.toISOString();
      } else {
        throw new Error('Data de início não fornecida');
      }

      console.log('[AssetAssociation] 📅 Data formatada:', formattedStartDate);

      // Preparar dados para envio
      const associationData = {
        clientId: selectedClient!.uuid,
        associationTypeId: generalConfig!.associationType, // Garantir que é number
        startDate: formattedStartDate,
        endDate: generalConfig!.endDate ? 
          (generalConfig!.endDate instanceof Date ? 
            generalConfig!.endDate.toISOString() : 
            new Date(generalConfig!.endDate).toISOString()
          ) : undefined,
        selectedAssets: selectedAssets.map(asset => ({
          id: asset.uuid, // Usar uuid como id
          type: asset.type,
          identifier: asset.type === 'CHIP' 
            ? (asset.line_number?.toString() || asset.iccid || asset.uuid)
            : (asset.radio || asset.serial_number || asset.uuid)
        })),
        generalConfig: {
          notes: generalConfig!.notes || undefined,
          ssid: undefined, // Não implementado ainda
          password: undefined, // Não implementado ainda
          dataLimit: undefined, // Não implementado ainda
          rentedDays: generalConfig!.rentedDays || 0
        }
      };

      console.log('[AssetAssociation] 📦 Dados preparados para envio:', associationData);

      // Executar criação da associação
      const result = await createAssociationMutation.mutateAsync(associationData);
      
      console.log('[AssetAssociation] ✅ Resultado:', result);

      // Limpar estado e navegar de volta
      clearState();
      toast.success('Associação criada com sucesso!');
      navigate('/associations');

    } catch (error: any) {
      console.error('[AssetAssociation] ❌ Erro ao criar associação:', error);
      
      // Exibir erro detalhado
      let errorMessage = 'Erro ao criar associação';
      
      if (error.message) {
        errorMessage = error.message;
      }
      
      if (error.details) {
        console.error('[AssetAssociation] 🔍 Detalhes do erro:', error.details);
      }
      
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = validateCurrentStep();

  const getStepTitle = () => {
    switch (currentStep) {
      case 'client':
        return 'Selecionar Cliente';
      case 'assets':
        return 'Selecionar Ativos';
      case 'summary':
        return 'Resumo e Confirmação';
      default:
        return 'Criar Associação';
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Criar Nova Associação</h1>
        <Button 
          variant="outline" 
          onClick={() => navigate('/associations')}
          disabled={isSubmitting}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center space-x-4 mb-8">
        {['client', 'assets', 'summary'].map((step, index) => (
          <div key={step} className="flex items-center">
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
              ${currentStep === step ? 'bg-blue-600 text-white' :
                ['client', 'assets', 'summary'].indexOf(currentStep) > index ? 'bg-green-600 text-white' :
                'bg-gray-300 text-gray-600'}
            `}>
              {index + 1}
            </div>
            {index < 2 && (
              <div className={`w-16 h-1 mx-2 ${
                ['client', 'assets', 'summary'].indexOf(currentStep) > index ? 'bg-green-600' : 'bg-gray-300'
              }`} />
            )}
          </div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{getStepTitle()}</CardTitle>
        </CardHeader>
        <CardContent>
          {currentStep === 'client' && <ClientSelectionStep />}
          {currentStep === 'assets' && <AssetSelectionStep />}
          {currentStep === 'summary' && selectedClient && selectedAssets.length > 0 && generalConfig && (
            <AssociationSummary 
              client={selectedClient}
              assets={selectedAssets}
              generalConfig={generalConfig}
              onComplete={handleSubmit}
              onBack={handleBack}
              isLoading={isSubmitting}
            />
          )}

          {/* Navigation Buttons */}
          {currentStep !== 'summary' && (
            <div className="flex justify-between mt-6">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 'client' || isSubmitting}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>

              <Button
                onClick={handleNext}
                disabled={!canProceed || isSubmitting}
              >
                Próximo
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
