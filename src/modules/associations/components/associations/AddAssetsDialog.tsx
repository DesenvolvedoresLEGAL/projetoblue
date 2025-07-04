
import React, { useState } from 'react';
import { useAddAssetsToAssociation } from '../../hooks/useAddAssetsToAssociation';
import { ResponsiveAssetModal } from '../association/modal/ResponsiveAssetModal';
import { AddAssetsConfirmationDialog } from './AddAssetsConfirmationDialog';
import { SelectedAsset } from '@modules/associations/types';
import { toast } from 'sonner'; // Corrigido: usar sonner consistentemente

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
    if (process.env.NODE_ENV === 'development') {
      if (import.meta.env.DEV) console.log('AddAssetsDialog: Tentando adicionar asset', asset.uuid);
    }
    
    // Verificar se o asset já foi selecionado (evitar duplicatas)
    const isAlreadySelected = selectedAssets.some(selectedAsset => selectedAsset.uuid === asset.uuid);
    
    if (isAlreadySelected) {
      if (process.env.NODE_ENV === 'development') {
        if (import.meta.env.DEV) console.log('AddAssetsDialog: Asset já selecionado', asset.uuid);
      }
      toast.warning('Este ativo já foi selecionado');
      return;
    }

    if (process.env.NODE_ENV === 'development') {
      if (import.meta.env.DEV) console.log('AddAssetsDialog: Adicionando novo asset', asset.uuid);
    }
    setSelectedAssets(prev => {
      const newList = [...prev, asset];
      if (process.env.NODE_ENV === 'development') {
        if (import.meta.env.DEV) console.log(
          'AddAssetsDialog: Nova lista de assets selecionados',
          newList.map(a => a.uuid)
        );
      }
      return newList;
    });
    toast.success('Ativo adicionado à seleção');
  };

  const handleAssetRemoved = (assetId: string) => {
    if (process.env.NODE_ENV === 'development') {
      if (import.meta.env.DEV) console.log('AddAssetsDialog: Removendo asset', assetId);
    }
    setSelectedAssets(prev => {
      const newList = prev.filter(asset => asset.uuid !== assetId);
      if (process.env.NODE_ENV === 'development') {
        if (import.meta.env.DEV) console.log(
          'AddAssetsDialog: Nova lista após remoção',
          newList.map(a => a.uuid)
        );
      }
      return newList;
    });
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
      if (process.env.NODE_ENV === 'development') {
        if (import.meta.env.DEV) console.log(
          'AddAssetsDialog: Iniciando adição de assets',
          selectedAssets.map(a => a.uuid)
        );
      }
      
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

      if (process.env.NODE_ENV === 'development') {
        if (import.meta.env.DEV) console.log('AddAssetsDialog: Resultado da adição:', result);
      }

      // Lógica de fechamento do modal mais rigorosa
      if (result.success) {
        if (result.inserted_count > 0) {
          // Só chamar onSuccess se pelo menos um ativo foi inserido
          onSuccess?.();
          handleCloseAll();
        } else {
          // Se nenhum ativo foi inserido (todos falharam), não fechar o modal
          // Permitir que o usuário veja os erros e tente novamente
          setShowConfirmation(false);
          // Não chamar handleCloseAll() para manter o modal aberto
        }
      } else {
        // Se a operação falhou completamente, mostrar erro e não fechar
        toast.error(result.message || 'Erro ao adicionar ativos');
        setShowConfirmation(false);
      }
    } catch (error) {
      if (import.meta.env.DEV) console.error('AddAssetsDialog: Erro ao adicionar ativos:', error);
      // Em caso de erro de rede/sistema, não fechar o modal
      setShowConfirmation(false);
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
