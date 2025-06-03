import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, Package, CheckCircle } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { Client } from '@/types/client';
import { Asset } from '@/types/asset';
import { ClientSelectionSimplified } from '@/components/association/ClientSelectionSimplified';
import { AssetSelection } from '@/components/association/AssetSelection';
import { AssociationSummary } from '@/components/association/AssociationSummary';
import { useAssetAssociationState } from '@/hooks/useAssetAssociationState';
import { toast } from 'sonner';

// Interface expandida para suportar campos adicionais da associação
export interface SelectedAsset extends Asset {
  associationType?: 'ALUGUEL' | 'ASSINATURA' | 'EMPRESTIMO';
  startDate?: string;
  endDate?: string;
  rented_days?: number;
  notes?: string;
  // Campos específicos para configuração de rede (separados dos dados de fábrica)
  ssid_atual?: string;
  pass_atual?: string;
}

const AssetAssociation: React.FC = () => {
  const navigate = useNavigate();
  const {
    currentStep,
    selectedClient,
    selectedAssets,
    setCurrentStep,
    setSelectedClient,
    setSelectedAssets,
    clearState
  } = useAssetAssociationState();

  const handleClientSelected = (client: Client) => {
    setSelectedClient(client);
    setCurrentStep('assets');
    toast.success(`Cliente ${client.empresa} selecionado!`);
  };

  const handleAssetAdded = (asset: SelectedAsset) => {
    setSelectedAssets(prev => {
      const exists = prev.find(a => a.uuid === asset.uuid);
      if (exists) {
        toast.warning('Este ativo já foi selecionado');
        return prev;
      }
      
      // Inicializar com valores padrão
      const newAsset: SelectedAsset = {
        ...asset,
        associationType: 'ALUGUEL',
        startDate: new Date().toISOString(),
        endDate: undefined,
        rented_days: 30,
        notes: '',
        // Inicializar campos de rede atuais baseados nos dados existentes
        ssid_atual: asset.ssid_atual || '',
        pass_atual: asset.pass_atual || ''
      };
      
      return [...prev, newAsset];
    });
  };

  const handleAssetRemoved = (assetId: string) => {
    setSelectedAssets(prev => prev.filter(asset => asset.uuid !== assetId));
    toast.success('Ativo removido da seleção');
  };

  const handleAssetUpdated = (assetId: string, updates: Partial<SelectedAsset>) => {
    setSelectedAssets(prev => 
      prev.map(asset => 
        asset.uuid === assetId 
          ? { ...asset, ...updates }
          : asset
      )
    );
  };

  const handleBackToClientSelection = () => {
    setCurrentStep('client');
  };

  const handleBackToAssets = () => {
    setCurrentStep('assets');
  };

  const handleProceedToSummary = () => {
    setCurrentStep('summary');
  };

  const handleComplete = () => {
    clearState();
    navigate('/associations');
    toast.success('Associação criada com sucesso!');
  };

  const handleCancel = () => {
    clearState();
    navigate('/assets/management');
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'client':
        return (
          <ClientSelectionSimplified 
            onClientSelected={handleClientSelected}
          />
        );
      
      case 'assets':
        return selectedClient && (
          <AssetSelection
            client={selectedClient}
            selectedAssets={selectedAssets}
            onAssetAdded={handleAssetAdded}
            onAssetRemoved={handleAssetRemoved}
            onAssetUpdated={handleAssetUpdated}
            onProceed={handleProceedToSummary}
          />
        );
      
      case 'summary':
        return selectedClient && (
          <AssociationSummary
            client={selectedClient}
            selectedAssets={selectedAssets}
            onBack={handleBackToAssets}
            onComplete={handleComplete}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Nova Associação</h1>
          <p className="text-muted-foreground">
            Associar ativos a clientes
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleCancel}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Cancelar
        </Button>
      </div>

      {/* Progress indicator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-4">
            <div className={`flex items-center gap-2 ${currentStep === 'client' ? 'text-primary' : currentStep === 'assets' || currentStep === 'summary' ? 'text-green-600' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep === 'client' ? 'bg-primary text-primary-foreground' : currentStep === 'assets' || currentStep === 'summary' ? 'bg-green-100 text-green-600' : 'bg-muted text-muted-foreground'}`}>
                {currentStep === 'assets' || currentStep === 'summary' ? <CheckCircle className="h-4 w-4" /> : '1'}
              </div>
              <span>Cliente</span>
            </div>
            
            <div className={`flex items-center gap-2 ${currentStep === 'assets' ? 'text-primary' : currentStep === 'summary' ? 'text-green-600' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep === 'assets' ? 'bg-primary text-primary-foreground' : currentStep === 'summary' ? 'bg-green-100 text-green-600' : 'bg-muted text-muted-foreground'}`}>
                {currentStep === 'summary' ? <CheckCircle className="h-4 w-4" /> : '2'}
              </div>
              <span>Ativos</span>
            </div>
            
            <div className={`flex items-center gap-2 ${currentStep === 'summary' ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep === 'summary' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                3
              </div>
              <span>Confirmação</span>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Step content */}
      <div className="min-h-[600px]">
        {renderStepContent()}
      </div>
    </div>
  );
};

export default AssetAssociation;
