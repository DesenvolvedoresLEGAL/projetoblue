
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AssetWithRelations } from '@/hooks/useAssetsData';
import { formatDate } from '@/utils/formatDate';
import AssetStatusBadge from './AssetStatusBadge';

interface AssetFullDataDialogProps {
  isOpen: boolean;
  onClose: () => void;
  asset: AssetWithRelations | null;
}

const AssetFullDataDialog = ({ isOpen, onClose, asset }: AssetFullDataDialogProps) => {
  if (!asset) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-medium">Dados Completos do Ativo</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-1">Informações Básicas</h3>
            
            <div className="grid grid-cols-2 gap-2">
              <span className="font-medium">Identificador:</span>
              <span>{asset.uuid}</span>
              
              <span className="font-medium">Tipo:</span>
              <span>{asset.solucao.name}</span>
              
              <span className="font-medium">Status:</span>
              <AssetStatusBadge status={asset.status.name} />
              
              <span className="font-medium">Fabricante:</span>
              <span>{asset.manufacturer.name}</span>
              
              {asset.model && (
                <>
                  <span className="font-medium">Modelo:</span>
                  <span>{asset.model}</span>
                </>
              )}

              {asset.radio && (
                <>
                  <span className="font-medium">Rádio:</span>
                  <span>{asset.radio}</span>
                </>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-1">Detalhes Técnicos</h3>
            
            <div className="grid grid-cols-2 gap-2">
              {asset.solucao.id === 11 ? (
                <>
                  <span className="font-medium">ICCID:</span>
                  <span>{asset.iccid || 'N/A'}</span>
                  
                  {asset.line_number && (
                    <>
                      <span className="font-medium">Número de Linha:</span>
                      <span>{asset.line_number}</span>
                    </>
                  )}
                </>
              ) : (
                <>
                  <span className="font-medium">Número de Série:</span>
                  <span>{asset.serial_number || 'N/A'}</span>
                </>
              )}
              
              {asset.rented_days !== undefined && (
                <>
                  <span className="font-medium">Dias Alugados:</span>
                  <span>{asset.rented_days}</span>
                </>
              )}
            </div>
          </div>

          <div className="space-y-4 col-span-1 md:col-span-2">
            <h3 className="text-lg font-semibold border-b pb-1">Informações de Sistema</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <span className="font-medium block">Data de Criação:</span>
                <span>{formatDate(asset.created_at)}</span>
              </div>
              
              <div>
                <span className="font-medium block">Última Atualização:</span>
                <span>{formatDate(asset.updated_at)}</span>
              </div>
              
              <div>
                <span className="font-medium block">ID da Solução:</span>
                <span>{asset.solucao.id}</span>
              </div>
              
              <div>
                <span className="font-medium block">ID do Status:</span>
                <span>{asset.status.id || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AssetFullDataDialog;
