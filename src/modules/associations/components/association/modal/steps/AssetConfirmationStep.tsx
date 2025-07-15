
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SelectedAsset } from '@modules/associations/types';
import { Wifi, Smartphone, CheckCircle, Plus } from 'lucide-react';

interface AssetConfirmationStepProps {
  selectedAssets: SelectedAsset[];
  onConfirm?: () => void;
  isLoading?: boolean;
}

export const AssetConfirmationStep: React.FC<AssetConfirmationStepProps> = ({
  selectedAssets,
  onConfirm,
  isLoading
}) => {
  const equipmentCount = selectedAssets.filter(asset => asset.type === 'EQUIPMENT').length;
  const chipCount = selectedAssets.filter(asset => asset.type === 'CHIP').length;

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      {/* Cabeçalho da confirmação */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <Plus className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-xl font-semibold text-foreground mb-2">
          Confirmar Adição de Ativos
        </h2>
        <p className="text-sm text-muted-foreground">
          Revise os ativos selecionados antes de adicionar à associação
        </p>
      </div>

      {/* Resumo da seleção */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Resumo da Seleção
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
          
          <p className="text-sm text-muted-foreground">
            Estes ativos serão adicionados à associação existente. A operação não pode ser desfeita.
          </p>
        </CardContent>
      </Card>

      {/* Lista dos ativos selecionados */}
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

      {/* Aviso importante */}
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
                Após confirmar, os ativos serão adicionados à associação. Para remover, será necessário editar a associação individualmente.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Instruções para confirmar */}
      {onConfirm && (
        <div className="text-center pt-2">
          <p className="text-sm text-muted-foreground">
            {isLoading ? 'Processando adição dos ativos...' : 'Clique em "Confirmar" para adicionar os ativos à associação'}
          </p>
        </div>
      )}
    </div>
  );
};
