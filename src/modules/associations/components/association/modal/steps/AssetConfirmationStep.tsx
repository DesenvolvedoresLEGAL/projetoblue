
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SelectedAsset } from '@modules/associations/types';
import { Wifi, Smartphone, CheckCircle } from 'lucide-react';

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
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              <Wifi className="h-3 w-3 mr-1" />
              {equipmentCount} Equipamento{equipmentCount !== 1 ? 's' : ''}
            </Badge>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <Smartphone className="h-3 w-3 mr-1" />
              {chipCount} CHIP{chipCount !== 1 ? 's' : ''}
            </Badge>
            <Badge variant="outline">
              Total: {selectedAssets.length} ativo{selectedAssets.length !== 1 ? 's' : ''}
            </Badge>
          </div>
          
          <p className="text-sm text-muted-foreground">
            Confirme a seleção dos ativos acima. Esta ação irá prosseguir com a associação dos ativos selecionados.
          </p>
        </CardContent>
      </Card>

      {/* Lista compacta dos ativos selecionados */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Ativos Selecionados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {selectedAssets.map((asset) => {
              const identifier = asset.type === 'CHIP' 
                ? asset.iccid || asset.line_number || asset.uuid.substring(0, 8)
                : asset.radio || asset.serial_number || asset.uuid.substring(0, 8);

              return (
                <div key={asset.uuid} className="flex items-center gap-3 p-2 rounded-lg border bg-muted/30">
                  <div className="flex-shrink-0">
                    {asset.type === 'CHIP' ? (
                      <div className="w-6 h-6 bg-green-100 rounded flex items-center justify-center">
                        <Smartphone className="h-3 w-3 text-green-600" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
                        <Wifi className="h-3 w-3 text-blue-600" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{identifier}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {asset.brand || asset.type}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Ação de confirmação - apenas visual, o botão real está no footer */}
      {onConfirm && (
        <div className="text-center pt-4">
          <p className="text-sm text-muted-foreground mb-4">
            Clique em "Confirmar" no rodapé para prosseguir
          </p>
        </div>
      )}
    </div>
  );
};
