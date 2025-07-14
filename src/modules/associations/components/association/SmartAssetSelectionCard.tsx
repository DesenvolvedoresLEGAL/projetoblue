
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Link, Settings, Wifi, Smartphone } from 'lucide-react';
import { SelectedAsset } from '@modules/associations/types';
import { useAssetBusinessRules } from '@modules/associations/hooks/useAssetBusinessRules';

interface SmartAssetSelectionCardProps {
  asset: SelectedAsset;
  onAssociateChip?: (asset: SelectedAsset) => void;
  onConfigure?: (asset: SelectedAsset) => void;
  onRemove?: (assetId: string) => void;
  associatedChip?: SelectedAsset | null;
  isChipPrincipal?: boolean;
  className?: string;
}

export const SmartAssetSelectionCard: React.FC<SmartAssetSelectionCardProps> = ({
  asset,
  onAssociateChip,
  onConfigure,
  onRemove,
  associatedChip,
  isChipPrincipal = false,
  className = ''
}) => {
  const { needsChip, isChip, getAssetRules } = useAssetBusinessRules([asset]);
  const rules = getAssetRules(asset);

  const getAssetIdentifier = () => {
    if (asset.type === 'CHIP') {
      return asset.line_number || asset.iccid || asset.uuid;
    }
    return asset.radio || asset.serial_number || asset.model || asset.uuid;
  };

  const getAssetTypeColor = () => {
    if (asset.type === 'CHIP') {
      return isChipPrincipal ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800';
    }
    return 'bg-green-100 text-green-800';
  };

  const getBorderColor = () => {
    if (rules.needsChip && !associatedChip) {
      return 'border-l-orange-500';
    }
    if (rules.isChip) {
      return isChipPrincipal ? 'border-l-blue-500' : 'border-l-gray-500';
    }
    return 'border-l-green-500';
  };

  const shouldShowChipAssociation = () => {
    return rules.needsChip && !associatedChip && onAssociateChip;
  };

  const shouldShowConfiguration = () => {
    return !rules.isChip && onConfigure;
  };

  return (
    <Card className={`border-l-4 ${getBorderColor()} ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {asset.type === 'CHIP' ? (
              <Smartphone className="h-5 w-5 text-blue-600" />
            ) : (
              <Wifi className="h-5 w-5 text-green-600" />
            )}
            <CardTitle className="text-base font-medium">
              {getAssetIdentifier()}
            </CardTitle>
          </div>
          <div className="flex gap-1">
            <Badge variant="outline" className={getAssetTypeColor()}>
              {asset.type}
            </Badge>
            {rules.needsChip && (
              <Badge variant="outline" className="bg-orange-100 text-orange-800">
                Precisa CHIP
              </Badge>
            )}
            {isChipPrincipal && (
              <Badge variant="outline" className="bg-blue-100 text-blue-800">
                Principal
              </Badge>
            )}
            {rules.isChip && !isChipPrincipal && (
              <Badge variant="outline" className="bg-gray-100 text-gray-800">
                Backup
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          {/* Informações do Asset */}
          <div className="text-sm text-gray-600 space-y-1">
            <p><span className="font-medium">Solução:</span> {asset.solucao || 'N/A'}</p>
            <p><span className="font-medium">Status:</span> {asset.status}</p>
            {asset.marca && (
              <p><span className="font-medium">Marca:</span> {asset.marca}</p>
            )}
          </div>

          {/* CHIP Associado */}
          {associatedChip && (
            <div className="flex items-center gap-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm">
              <Link className="h-4 w-4 text-blue-600" />
              <span className="text-blue-800">
                Associado ao CHIP: {associatedChip.line_number || associatedChip.iccid}
              </span>
            </div>
          )}

          {/* Alerta para equipamentos que precisam de CHIP */}
          {shouldShowChipAssociation() && (
            <div className="p-3 bg-orange-50 border border-orange-200 rounded">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-orange-800">
                    CHIP Obrigatório
                  </p>
                  <p className="text-xs text-orange-700 mt-1">
                    Este equipamento precisa ser associado a um CHIP para funcionar
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Ações */}
          <div className="flex gap-2 pt-2">
            {shouldShowChipAssociation() && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAssociateChip?.(asset)}
                className="flex-1 text-orange-600 border-orange-300 hover:bg-orange-50"
              >
                <Link className="h-4 w-4 mr-2" />
                Associar CHIP
              </Button>
            )}
            
            {shouldShowConfiguration() && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onConfigure?.(asset)}
                className="flex-1 text-blue-600 border-blue-300 hover:bg-blue-50"
              >
                <Settings className="h-4 w-4 mr-2" />
                Configurar
              </Button>
            )}
            
            {onRemove && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onRemove(asset.uuid)}
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                Remover
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
