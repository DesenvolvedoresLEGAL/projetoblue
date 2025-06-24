
import React, { useState } from 'react';
import { Building2, Calendar, Hash } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAddAssetsToAssociation } from '../../hooks/useAddAssetsToAssociation';
import { ResponsiveAssetModal } from '../association/modal/ResponsiveAssetModal';
import { SelectedAsset } from '@modules/associations/types';

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
  const addAssetsMutation = useAddAssetsToAssociation();

  const handleAssetSelected = (asset: SelectedAsset) => {
    setSelectedAssets(prev => [...prev, asset]);
  };

  const handleAssetRemoved = (assetId: string) => {
    setSelectedAssets(prev => prev.filter(asset => asset.uuid !== assetId));
  };

  const handleConfirm = async () => {
    if (selectedAssets.length === 0) {
      return;
    }

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
        onOpenChange(false);
        setSelectedAssets([]);
      }
    } catch (error) {
      console.error('Erro ao adicionar ativos:', error);
    }
  };

  const handleCancel = () => {
    setSelectedAssets([]);
    onOpenChange(false);
  };

  const associationType = existingAssociation.association_id === 1 ? 'Locação' : 'Assinatura';

  // Criar título e descrição mais informativos
  const title = `Adicionar Ativos - ${existingAssociation.client_name}`;
  const description = `${associationType} • Início: ${existingAssociation.entry_date}${existingAssociation.exit_date ? ` • Fim: ${existingAssociation.exit_date}` : ''}`;

  return (
    <ResponsiveAssetModal
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      selectedAssets={selectedAssets}
      onAssetSelected={handleAssetSelected}
      onAssetRemoved={handleAssetRemoved}
      excludeAssociatedToClient={existingAssociation.client_id}
      multipleSelection={true}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
      isLoading={addAssetsMutation.isPending}
      confirmText="Adicionar Ativos"
      cancelText="Cancelar"
    />
  );
};
