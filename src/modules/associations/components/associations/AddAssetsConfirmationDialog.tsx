
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SelectedAsset } from '@modules/associations/types';
import { Wifi, Smartphone, CheckCircle, Plus } from 'lucide-react';

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

interface AddAssetsConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingAssociation: ExistingAssociation;
  selectedAssets: SelectedAsset[];
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const AddAssetsConfirmationDialog: React.FC<AddAssetsConfirmationDialogProps> = ({
  open,
  onOpenChange,
  existingAssociation,
  selectedAssets,
  onConfirm,
  onCancel,
  isLoading = false
}) => {
  const equipmentCount = selectedAssets.filter(asset => asset.type === 'EQUIPMENT').length;
  const chipCount = selectedAssets.filter(asset => asset.type === 'CHIP').length;
  const associationType = existingAssociation.association_id === 1 ? 'Locação' : 'Assinatura';

  const handleConfirm = () => {
    onConfirm();
  };

  const handleCancel = () => {
    onCancel();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-green-600" />
            Confirmar Adição de Ativos
          </DialogTitle>
          <DialogDescription>
            Revise os ativos selecionados antes de adicionar à associação existente
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4">
          {/* Informações da Associação */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Detalhes da Associação</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Cliente:</span>
                  <span className="text-sm font-medium">{existingAssociation.client_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Tipo:</span>
                  <Badge variant="outline">{associationType}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Data de Início:</span>
                  <span className="text-sm">{existingAssociation.entry_date}</span>
                </div>
                {existingAssociation.exit_date && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Data de Fim:</span>
                    <span className="text-sm">{existingAssociation.exit_date}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Resumo da Seleção */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Resumo da Adição
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-4">
                {equipmentCount > 0 && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    <Wifi className="h-3 w-3 mr-1" />
                    {equipmentCount} Equipamento{equipmentCount !== 1 ? 's' : ''}
                  </Badge>
                )}
                {chipCount > 0 && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    <Smartphone className="h-3 w-3 mr-1" />
                    {chipCount} CHIP{chipCount !== 1 ? 's' : ''}
                  </Badge>
                )}
                <Badge variant="outline">
                  Total: {selectedAssets.length} ativo{selectedAssets.length !== 1 ? 's' : ''}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Lista dos Ativos */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Ativos que serão Adicionados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {selectedAssets.map((asset) => {
                  const identifier = asset.type === 'CHIP' 
                    ? asset.iccid || asset.line_number || asset.uuid.substring(0, 8)
                    : asset.radio || asset.serial_number || asset.uuid.substring(0, 8);

                  return (
                    <div key={asset.uuid} className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
                      <div className="flex-shrink-0">
                        {asset.type === 'CHIP' ? (
                          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                            <Smartphone className="h-4 w-4 text-green-600" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Wifi className="h-4 w-4 text-blue-600" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{identifier}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {asset.brand || asset.type} {asset.model && `• ${asset.model}`}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <Badge variant="outline" className="text-xs">
                          {asset.type === 'CHIP' ? 'CHIP' : 'Equipamento'}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Aviso */}
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle className="h-3 w-3 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-amber-800 mb-1">
                    Ação Irreversível
                  </p>
                  <p className="text-xs text-amber-700">
                    Após confirmar, os ativos serão adicionados à associação existente. Para remover, será necessário editar a associação.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="border-t pt-4">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading || selectedAssets.length === 0}
          >
            {isLoading ? 'Adicionando...' : `Confirmar Adição (${selectedAssets.length})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
