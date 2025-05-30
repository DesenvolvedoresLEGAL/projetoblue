
import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { ClientSelectionSimplified } from '@/components/association/ClientSelectionSimplified';
import { AssetSelection } from '@/components/association/AssetSelection';
import { AssociationSummary } from '@/components/association/AssociationSummary';
import { useCreateAssociation } from '@/hooks/useCreateAssociation';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export interface SelectedAsset {
  uuid: string;
  iccid?: string | null;
  radio?: string | null;
  line_number?: number | null;
  solution_id?: number;
  asset_solution_name?: string;
  associationType?: string;
  startDate?: string;
  notes?: string;
  ssid?: string;
  pass?: string;
}

interface Client {
  uuid: string;
  nome: string;
  cnpj: string;
  contato: number;
  email?: string;
}

export default function AssetAssociation() {
  const navigate = useNavigate();
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedAssets, setSelectedAssets] = useState<SelectedAsset[]>([]);
  const createAssociation = useCreateAssociation();

  const handleAssetUpdate = (assetId: string, updates: Partial<SelectedAsset>) => {
    setSelectedAssets(prev =>
      prev.map(asset =>
        asset.uuid === assetId ? { ...asset, ...updates } : asset
      )
    );
  };

  const handleRemoveAsset = (assetId: string) => {
    setSelectedAssets(prev => prev.filter(asset => asset.uuid !== assetId));
  };

  const handleConfirmAssociations = async () => {
    if (!selectedClient || selectedAssets.length === 0) {
      toast.error('Selecione um cliente e pelo menos um ativo');
      return;
    }

    try {
      // Criar associações sequencialmente
      for (const asset of selectedAssets) {
        const params = {
          clientId: selectedClient.uuid,
          assetId: asset.uuid,
          associationType: asset.associationType || 'ALUGUEL',
          startDate: asset.startDate || new Date().toISOString().split('T')[0],
          notes: asset.notes,
          ssid: asset.ssid,
          pass: asset.pass
        };

        await createAssociation.mutateAsync(params);
      }

      toast.success(`${selectedAssets.length} associação${selectedAssets.length > 1 ? 'ões' : ''} criada${selectedAssets.length > 1 ? 's' : ''} com sucesso!`);
      
      // Resetar formulário
      setSelectedClient(null);
      setSelectedAssets([]);
      
      // Navegar para a lista de associações
      navigate('/assets/associations-list');
    } catch (error) {
      console.error('Erro ao criar associações:', error);
      toast.error('Erro ao criar associações. Tente novamente.');
    }
  };

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/assets');
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header com botão voltar */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#020CBC]">Associar Ativos</h1>
          <p className="text-muted-foreground mt-1">
            Associe ativos a clientes para aluguel, assinatura ou empréstimo
          </p>
        </div>
        <button
          onClick={handleGoBack}
          className="flex items-center gap-2 px-4 py-2 text-muted-foreground hover:text-[#4D2BFB] hover:bg-[#4D2BFB]/10 rounded-lg transition-colors"
          title="Voltar"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Coluna Esquerda - Seleções */}
        <div className="space-y-6">
          {/* Seleção de Cliente */}
          <ClientSelectionSimplified
            selectedClient={selectedClient}
            onSelectClient={setSelectedClient}
          />

          {/* Seleção de Ativos */}
          <AssetSelection
            selectedAssets={selectedAssets}
            onAssetsChange={setSelectedAssets}
            onAssetUpdate={handleAssetUpdate}
            onRemoveAsset={handleRemoveAsset}
          />
        </div>

        {/* Coluna Direita - Resumo */}
        <div className="space-y-6">
          <AssociationSummary
            selectedClient={selectedClient}
            selectedAssets={selectedAssets}
            onConfirm={handleConfirmAssociations}
            isLoading={createAssociation.isPending}
          />
        </div>
      </div>
    </div>
  );
}
