
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AssetWithRelations } from '@/types/assetWithRelations';
import AssetStatusBadge from './AssetStatusBadge';

interface AssetDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  asset: AssetWithRelations | null;
}

const AssetDetailsDialog = ({ isOpen, onClose, asset }: AssetDetailsDialogProps) => {
  if (!asset) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-medium">Detalhes do Ativo</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          <div className="flex justify-between items-center">
            <span className="font-medium">Identificador:</span>
            <span>{asset.uuid.substring(0, 8)}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="font-medium">Tipo:</span>
            <span>{asset.solucao.name}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="font-medium">Status:</span>
            <AssetStatusBadge status={asset.status.name} />
          </div>

          <div className="flex justify-between items-center">
            <span className="font-medium">Fabricante:</span>
            <span>{asset.manufacturer.name}</span>
          </div>
          
          {asset.model && (
            <div className="flex justify-between items-center">
              <span className="font-medium">Modelo:</span>
              <span>{asset.model}</span>
            </div>
          )}
          
          {asset.solucao.id === 11 ? (
            <div className="flex justify-between items-center">
              <span className="font-medium">ICCID:</span>
              <span>
                {asset.iccid 
                  ? `${asset.iccid.substring(0, 4)}...${asset.iccid.substring(asset.iccid.length - 5)}` 
                  : 'N/A'}
              </span>
            </div>
          ) : (
            <div className="flex justify-between items-center">
              <span className="font-medium">Número de Série:</span>
              <span>{asset.serial_number || 'N/A'}</span>
            </div>
          )}
          
          {asset.radio && (
            <div className="flex justify-between items-center">
              <span className="font-medium">Rádio:</span>
              <span>{asset.radio}</span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AssetDetailsDialog;
