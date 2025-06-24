
import React, { useState } from 'react';
import { useAddAssetsToAssociation } from '../../hooks/useAddAssetsToAssociation';
import { ResponsiveAssetModal } from '../association/modal/ResponsiveAssetModal';
import { AddAssetsConfirmationDialog } from './AddAssetsConfirmationDialog';
import { SelectedAsset } from '@modules/associations/types';
import { toast } from 'sonner';

interface ExistingAssociation {
  client_id: string;
  client_name: string;
  association_id: number;
  entry_date: string;
  exit_date: string | null;
  notes?: string | null;
  ssid?: string | null;
  pass?: string | null;
  gb?: number | null;
}

interface AddAssetsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingAssociation: ExistingAssociation;
  onSuccess?: () => void;
}

export const AddAssetsDialog: React.FC<AddAssetsDialogProps> = ({
  open,
  onOpenChange,
  existingAssociation,
  onSuccess
}) => {
  const [selectedAssets, setSelectedAssets] = useState<SelectedAsset[]>([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const addAssetsMutation = useAddAssetsToAssociation();

  const handleAssetSelected = (asset: SelectedAsset) => {
    // Verificar se o asset já foi selecionado (evitar duplicatas)
    const isAlreadySelected = selectedAssets.some(selectedAsset => selectedAsset.uuid === asset.uuid);
    
    if (isAlreadySelected) {
      toast.warning('Este ativo já foi selecionado');
      return;
    }

    setSelectedAssets(prev => [...prev, asset]);
    toast.success('Ativo adicionado à seleção');
  };

  const handleAssetRemoved = (assetId: string) => {
    setSelectedAssets(prev => prev.filter(asset => asset.uuid !== assetId));
  };

  const handleProceedToConfirmation = () => {
    if (selectedAssets.length === 0) {
      toast.warning('Selecione pelo menos um ativo');
      return;
    }
    setShowConfirmation(true);
  };

  const handleConfirm = async () => {
    try {
      const result = await addAssetsMutation.mutateAsync({
        client_id: existingAssociation.client_id,
        association_id: existingAssociation.association_id,
        entry_date: existingAssociation.entry_date,
        asset_ids: selectedAssets.map(asset => asset.uuid),
        exit_date: existingAssociation.exit_date,
        notes: existingAssociation.notes,
        ssid: existingAssociation.ssid,
        pass: existingAssociation.pass,
        gb: existingAssociation.gb
      });

      if (result.success) {
        onSuccess?.();
        handleCloseAll();
      }
    } catch (error) {
      console.error('Erro ao adicionar ativos:', error);
    }
  };

  const handleCloseAll = () => {
    setShowConfirmation(false);
    onOpenChange(false);
    setSelectedAssets([]);
  };

  const handleCancelConfirmation = () => {
    setShowConfirmation(false);
  };

  const handleCancelSelection = () => {
    setSelectedAssets([]);
    onOpenChange(false);
  };

  const associationType = existingAssociation.association_id === 1 ? 'Locação' : 'Assinatura';
  const title = `Adicionar Ativos - ${existingAssociation.client_name}`;
  const description = `${associationType} • Início: ${existingAssociation.entry_date}${existingAssociation.exit_date ? ` • Fim: ${existingAssociation.exit_date}` : ''}`;

  return (
    <>
      {/* Modal de Seleção de Ativos */}
      <ResponsiveAssetModal
        open={open && !showConfirmation}
        onOpenChange={onOpenChange}
        title={title}
        description={description}
        selectedAssets={selectedAssets}
        onAssetSelected={handleAssetSelected}
        onAssetRemoved={handleAssetRemoved}
        excludeAssociatedToClient={existingAssociation.client_id}
        multipleSelection={true}
        onConfirm={handleProceedToConfirmation}
        onCancel={handleCancelSelection}
        isLoading={false}
        confirmText="Prosseguir para Confirmação"
        cancelText="Cancelar"
      />

      {/* Modal de Confirmação */}
      <AddAssetsConfirmationDialog
        open={showConfirmation}
        onOpenChange={setShowConfirmation}
        existingAssociation={existingAssociation}
        selectedAssets={selectedAssets}
        onConfirm={handleConfirm}
        onCancel={handleCancelConfirmation}
        isLoading={addAssetsMutation.isPending}
      />
    </>
  );
};
