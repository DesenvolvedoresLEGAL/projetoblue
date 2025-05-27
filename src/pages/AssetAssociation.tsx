
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { ClientSelection } from '@/components/association/ClientSelection';
import { AssetSelection } from '@/components/association/AssetSelection';
import { AssociationSummary } from '@/components/association/AssociationSummary';
import { Client, Asset, AssetType } from '@/types/asset';
import { toast } from 'sonner';

// Interface específica para ativos selecionados na associação
export interface SelectedAsset {
  // Campos base do Asset
  id: string;
  uuid: string;
  type: AssetType;
  registrationDate: string;
  status: string;
  statusId?: number;
  solucao?: string;
  marca?: string;
  modelo?: string;
  
  // Campos específicos da base de dados
  serial_number?: string;
  model?: string;
  radio?: string;
  solution_id?: number;
  manufacturer_id?: number;
  plan_id?: number;
  rented_days?: number;
  admin_user?: string;
  admin_pass?: string;
  created_at?: string;
  updated_at?: string;
  iccid?: string;
  line_number?: string;
  
  // Campos específicos da associação
  gb?: number;
  ssid?: string;
  password?: string;
  notes?: string;
  
  // Campos herdados para compatibilidade
  phoneNumber?: string;
  carrier?: string;
  uniqueId?: string;
  brand?: string;
  serialNumber?: string;
}

interface AssociationFormData {
  client: Client | null;
  assets: SelectedAsset[];
  step: 'client' | 'assets' | 'summary';
}

const AssetAssociation = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<AssociationFormData>({
    client: null,
    assets: [],
    step: 'client'
  });

  const handleClientSelected = (client: Client) => {
    setFormData(prev => ({
      ...prev,
      client,
      step: 'assets'
    }));
  };

  const handleAssetAdded = (asset: SelectedAsset) => {
    setFormData(prev => ({
      ...prev,
      assets: [...prev.assets, asset]
    }));
  };

  const handleAssetRemoved = (assetId: string) => {
    setFormData(prev => ({
      ...prev,
      assets: prev.assets.filter(asset => asset.uuid !== assetId)
    }));
  };

  const handleAssetUpdated = (assetId: string, updatedAsset: Partial<SelectedAsset>) => {
    setFormData(prev => ({
      ...prev,
      assets: prev.assets.map(asset => 
        asset.uuid === assetId ? { ...asset, ...updatedAsset } : asset
      )
    }));
  };

  const handleProceedToSummary = () => {
    if (formData.assets.length === 0) {
      toast.error('Selecione pelo menos um ativo para continuar');
      return;
    }

    // Validar regra SPEEDY 5G + CHIP
    const speedyAssets = formData.assets.filter(asset => 
      asset.solucao === 'SPEEDY 5G' || asset.solution_id === 1
    );
    const chipAssets = formData.assets.filter(asset => asset.type === 'CHIP');

    if (speedyAssets.length > 0 && chipAssets.length === 0) {
      toast.error('Ao associar um equipamento SPEEDY 5G é obrigatório associar também um CHIP');
      return;
    }

    setFormData(prev => ({ ...prev, step: 'summary' }));
  };

  const handleBack = () => {
    if (formData.step === 'assets') {
      setFormData(prev => ({ ...prev, step: 'client' }));
    } else if (formData.step === 'summary') {
      setFormData(prev => ({ ...prev, step: 'assets' }));
    } else {
      navigate('/assets');
    }
  };

  const handleAssociationComplete = () => {
    // Limpar formulário
    setFormData({
      client: null,
      assets: [],
      step: 'client'
    });
    
    toast.success('Associação criada com sucesso!');
    // Redirecionar para a página de gestão de associações
    navigate('/assets/associations');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">
            Nova Associação de Ativos
          </h1>
          <p className="text-muted-foreground">
            Associe ativos a clientes seguindo o fluxo guiado
          </p>
        </div>
      </div>

      <div className="max-w-4xl">
        {/* Indicador de progresso */}
        <div className="flex items-center mb-6">
          <div className={`flex items-center gap-2 ${formData.step === 'client' ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium ${
              formData.step === 'client' ? 'border-primary bg-primary text-primary-foreground' : 
              formData.client ? 'border-green-500 bg-green-500 text-white' : 'border-muted-foreground'
            }`}>
              1
            </div>
            <span className="font-medium">Cliente</span>
          </div>
          
          <div className="flex-1 h-px bg-border mx-4" />
          
          <div className={`flex items-center gap-2 ${formData.step === 'assets' ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium ${
              formData.step === 'assets' ? 'border-primary bg-primary text-primary-foreground' : 
              formData.assets.length > 0 ? 'border-green-500 bg-green-500 text-white' : 'border-muted-foreground'
            }`}>
              2
            </div>
            <span className="font-medium">Ativos</span>
          </div>
          
          <div className="flex-1 h-px bg-border mx-4" />
          
          <div className={`flex items-center gap-2 ${formData.step === 'summary' ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium ${
              formData.step === 'summary' ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground'
            }`}>
              3
            </div>
            <span className="font-medium">Confirmação</span>
          </div>
        </div>

        {/* Conteúdo das etapas */}
        {formData.step === 'client' && (
          <ClientSelection onClientSelected={handleClientSelected} />
        )}

        {formData.step === 'assets' && formData.client && (
          <AssetSelection
            client={formData.client}
            selectedAssets={formData.assets}
            onAssetAdded={handleAssetAdded}
            onAssetRemoved={handleAssetRemoved}
            onAssetUpdated={handleAssetUpdated}
            onProceed={handleProceedToSummary}
          />
        )}

        {formData.step === 'summary' && formData.client && (
          <AssociationSummary
            client={formData.client}
            assets={formData.assets}
            onComplete={handleAssociationComplete}
            onBack={() => setFormData(prev => ({ ...prev, step: 'assets' }))}
          />
        )}
      </div>
    </div>
  );
};

export default AssetAssociation;
