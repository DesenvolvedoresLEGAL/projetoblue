import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AssetWithRelations } from '@/types/assetWithRelations';
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Wifi, Smartphone, Router } from "lucide-react";
import { AssetBasicInfo } from './dialog/AssetBasicInfo';
import { AssetTechnicalDetails } from './dialog/AssetTechnicalDetails';
import { AssetNetworkConfig } from './dialog/AssetNetworkConfig';
import AssetSystemInfo from './dialog/AssetSystemInfo';

interface AssetFullDataDialogProps {
  isOpen: boolean;
  onClose: () => void;
  asset: AssetWithRelations | null;
}

const AssetFullDataDialog = ({ isOpen, onClose, asset }: AssetFullDataDialogProps) => {
  const [showPasswords, setShowPasswords] = React.useState(false);

  if (!asset) return null;

  const isChip = asset.solucao.id === 11;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-medium flex items-center gap-3">
            <div className="flex items-center gap-2">
              {isChip ? (
                <Smartphone className="h-5 w-5 text-blue-600" />
              ) : (
                <Router className="h-5 w-5 text-green-600" />
              )}
              Dados Completos do Ativo
            </div>
            {!isChip && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPasswords(!showPasswords)}
                className="mr-1"
              >
                {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {showPasswords ? 'Ocultar' : 'Mostrar'} Senhas
              </Button>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <AssetBasicInfo asset={asset} />
          <AssetTechnicalDetails asset={asset} showPasswords={showPasswords} />
          <AssetNetworkConfig asset={asset} showPasswords={showPasswords} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AssetFullDataDialog;
