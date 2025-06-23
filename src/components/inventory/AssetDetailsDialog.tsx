
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Asset } from '@/types/asset';

interface AssetDetailsDialogProps {
  asset: Asset | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AssetDetailsDialog: React.FC<AssetDetailsDialogProps> = ({
  asset,
  isOpen,
  onClose
}) => {
  if (!asset) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Detalhes do Ativo</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p>Tipo: {asset.type}</p>
          <p>Status: {asset.status}</p>
          {/* Adicionar mais detalhes conforme necessário */}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AssetDetailsDialog;
