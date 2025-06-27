
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
    console.log('[AssetAssociation] Iniciando submissão da associação');
    console.log('[AssetAssociation] Cliente selecionado:', selectedClient);
    console.log('[AssetAssociation] Assets selecionados:', selectedAssets);
    console.log('[AssetAssociation] Configuração geral:', generalConfig);

    if (!selectedClient || !selectedAssets.length || !generalConfig) {
      const errorMsg = 'Dados incompletos para criar associação';
      console.error('[AssetAssociation] Validação falhou:', {
        hasClient: !!selectedClient,
        assetsCount: selectedAssets.length,
        hasGeneralConfig: !!generalConfig
      });
      toast.error(errorMsg);
      return;
    }

    setIsSubmitting(true);

    try {
      // Garantir que startDate seja uma string ISO completa
      let formattedStartDate: string;
      if (generalConfig.startDate instanceof Date) {
        formattedStartDate = generalConfig.startDate.toISOString();
      } else if (typeof generalConfig.startDate === 'string') {
        // Se for string, converter para Date e depois para ISO
        const dateObj = new Date(generalConfig.startDate);
        if (isNaN(dateObj.getTime())) {
          throw new Error('Data de início inválida');
        }
        formattedStartDate = dateObj.toISOString();
      } else {
        throw new Error('Data de início não fornecida');
      }

      console.log('[AssetAssociation] Data formatada:', formattedStartDate);

      // Preparar dados para envio
      const associationData = {
        clientId: selectedClient.uuid,
        associationTypeId: generalConfig.associationType, // Agora é number
        startDate: formattedStartDate,
        endDate: generalConfig.endDate ? 
          (generalConfig.endDate instanceof Date ? 
            generalConfig.endDate.toISOString() : 
            new Date(generalConfig.endDate).toISOString()
          ) : undefined,
        selectedAssets: selectedAssets.map(asset => ({
          id: asset.uuid, // Usar uuid como id
          type: asset.type,
          identifier: asset.type === 'CHIP' 
            ? (asset.line_number?.toString() || asset.iccid || asset.uuid)
            : (asset.radio || asset.serial_number || asset.uuid)
        })),
        generalConfig: {
          notes: generalConfig.notes || undefined,
          ssid: undefined, // Não implementado ainda
          password: undefined, // Não implementado ainda
          dataLimit: undefined, // Não implementado ainda
          rentedDays: generalConfig.rentedDays || 0
        }
      };

      console.log('[AssetAssociation] Dados preparados para envio:', associationData);

      // Executar criação da associação
      const result = await createAssociationMutation.mutateAsync(associationData);
      
      console.log('[AssetAssociation] Resultado:', result);

      // Limpar estado e navegar de volta
      clearState();
      toast.success('Associação criada com sucesso!');
      navigate('/associations');

    } catch (error: unknown) {
      console.error('[AssetAssociation] Erro ao criar associação:', error);

      // Exibir erro detalhado
      let errorMessage = 'Erro ao criar associação';

      if (error instanceof Error && error.message) {
        errorMessage = error.message;
      }
      
      if (error.details) {
        console.error('[AssetAssociation] Detalhes do erro:', error.details);
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
          {currentStep === 'summary' && <AssociationSummary />}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 'client' || isSubmitting}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>

            {currentStep !== 'summary' ? (
              <Button
                onClick={handleNext}
                disabled={!canProceed || isSubmitting}
              >
                Próximo
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!canProceed || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Criando...
                  </>
                ) : (
                  'Criar Associação'
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
