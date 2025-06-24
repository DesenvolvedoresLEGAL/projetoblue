
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Building2, Calendar, Hash } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAddAssetsToAssociation } from '../../hooks/useAddAssetsToAssociation';
import { AssetSelection } from '../association/AssetSelection';
import { useIsMobile } from '@/hooks/useIsMobile';

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
  const [selectedAssets, setSelectedAssets] = useState<any[]>([]);
  const addAssetsMutation = useAddAssetsToAssociation();
  const isMobile = useIsMobile();

  const handleSubmit = async () => {
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className={`
          ${isMobile ? 'max-w-[95vw] max-h-[95vh] w-full m-2' : 'max-w-4xl max-h-[90vh]'} 
          overflow-hidden flex flex-col
        `}
      >
        <DialogHeader className={isMobile ? 'pb-2' : ''}>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {isMobile ? 'Adicionar Ativos' : 'Adicionar Ativos à Associação'}
          </DialogTitle>
          <DialogDescription>
            {isMobile ? 'Selecione os ativos para adicionar' : 'Selecione os ativos que deseja adicionar à associação existente'}
          </DialogDescription>
        </DialogHeader>

        {/* Informações da Associação Existente */}
        <div className={`bg-muted/50 rounded-lg space-y-2 ${isMobile ? 'p-3' : 'p-4'}`}>
          <div className={`flex items-center gap-4 ${isMobile ? 'flex-col items-start gap-2' : 'flex-wrap'}`}>
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span className={`font-medium ${isMobile ? 'text-sm' : ''}`}>
                {existingAssociation.client_name}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Hash className="h-4 w-4 text-muted-foreground" />
              <Badge variant="outline">{associationType}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-sm'}`}>
                Início: {existingAssociation.entry_date}
                {existingAssociation.exit_date && ` • Fim: ${existingAssociation.exit_date}`}
              </span>
            </div>
          </div>
        </div>

        {/* Seleção de Ativos - com scroll */}
        <div className="flex-1 overflow-y-auto">
          <AssetSelection
            selectedAssets={selectedAssets}
            onAssetsChange={setSelectedAssets}
            multipleSelection={true}
            excludeAssociatedToClient={existingAssociation.client_id}
          />
        </div>

        <DialogFooter className={`${isMobile ? 'flex-col gap-2 pt-4' : ''} border-t mt-4 pt-4`}>
          <Button 
            variant="outline" 
            onClick={handleCancel}
            disabled={addAssetsMutation.isPending}
            className={isMobile ? 'w-full order-2' : ''}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={selectedAssets.length === 0 || addAssetsMutation.isPending}
            className={isMobile ? 'w-full order-1' : ''}
          >
            {addAssetsMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Adicionar {selectedAssets.length > 0 && `(${selectedAssets.length})`} Ativo
            {selectedAssets.length > 1 ? 's' : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
