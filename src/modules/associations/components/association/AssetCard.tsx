
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Settings, Wifi, X, Link, Plus } from 'lucide-react';
import { SelectedAsset } from '@modules/associations/types';
import { useAssetBusinessRules } from '@modules/associations/hooks/useAssetBusinessRules';

interface AssetCardProps {
  asset: SelectedAsset;
  mode?: 'view' | 'select' | 'selected';
  onRemove?: (assetId: string) => void;
  onConfigure?: (asset: SelectedAsset) => void;
  onAssociateChip?: (asset: SelectedAsset) => void;
  onSelect?: (asset: SelectedAsset) => void;
  onEdit?: (asset: SelectedAsset) => void;
  isSelecting?: boolean;
  className?: string;
  showActions?: boolean;
}

export const AssetCard: React.FC<AssetCardProps> = ({
  asset,
  mode = 'view',
  onRemove,
  onConfigure,
  onAssociateChip,
  onSelect,
  onEdit,
  isSelecting = false,
  className = '',
  showActions = true
}) => {
  const { needsChip, isChip, getAssetRules } = useAssetBusinessRules();
  const rules = getAssetRules(asset);

  const getAssetIdentifier = () => {
    if (asset.type === 'CHIP') {
      return asset.line_number || asset.iccid || asset.uuid;
    }
    return asset.radio || asset.serial_number || asset.model || asset.uuid;
  };

  const getAssetTypeColor = () => {
    if (asset.type === 'CHIP') {
      return asset.isPrincipalChip ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800';
    }
    return 'bg-green-100 text-green-800';
  };

  const shouldShowChipAssociation = () => {
    return rules.needsChip && !asset.associatedEquipmentId;
  };

  const shouldShowConfiguration = () => {
    return !rules.isChip && showActions && mode !== 'select';
  };

  const handleSelectClick = () => {
    if (onSelect && !isSelecting) {
      onSelect(asset);
    }
  };

  return (
    <Card className={`border-l-4 ${rules.needsChip ? 'border-l-orange-500' : rules.isChip ? 'border-l-blue-500' : 'border-l-green-500'} ${className} ${isSelecting ? 'opacity-50' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className={getAssetTypeColor()}>
                {asset.type}
              </Badge>
              {rules.needsChip && (
                <Badge variant="outline" className="bg-orange-100 text-orange-800">
                  Precisa CHIP
                </Badge>
              )}
              {asset.isPrincipalChip && (
                <Badge variant="outline" className="bg-blue-100 text-blue-800">
                  Principal
                </Badge>
              )}
              {rules.isChip && !asset.isPrincipalChip && (
                <Badge variant="outline" className="bg-gray-100 text-gray-800">
                  Backup
                </Badge>
              )}
            </div>

            <h3 className="font-medium text-gray-900 mb-1">
              {getAssetIdentifier()}
            </h3>
            
            <div className="text-sm text-gray-600 space-y-1">
              <p><span className="font-medium">Solução:</span> {asset.solucao || 'N/A'}</p>
              <p><span className="font-medium">Status:</span> {asset.status}</p>
              {asset.marca && (
                <p><span className="font-medium">Marca:</span> {asset.marca}</p>
              )}
              {asset.associatedEquipmentId && (
                <div className="flex items-center gap-1 text-blue-600">
                  <Link className="h-3 w-3" />
                  <span className="text-xs">Associado a equipamento</span>
                </div>
              )}
            </div>

            {/* Alertas e sugestões */}
            {shouldShowChipAssociation() && (
              <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded text-sm text-orange-800">
                ⚠️ Este equipamento precisa ser associado a um CHIP
              </div>
            )}
          </div>

          {/* Ações baseadas no modo */}
          <div className="flex flex-col gap-1 ml-2">
            {mode === 'select' && onSelect && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectClick}
                disabled={isSelecting}
                className="h-8 w-8 p-0 text-green-600 hover:bg-green-50"
              >
                <Plus className="h-4 w-4" />
              </Button>
            )}

            {mode === 'selected' && showActions && (
              <>
                {onRemove && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemove(asset.uuid)}
                    className="h-8 w-8 p-0 text-red-600 hover:bg-red-50"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
                
                {shouldShowChipAssociation() && onAssociateChip && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onAssociateChip(asset)}
                    className="h-8 w-8 p-0 text-orange-600 hover:bg-orange-50"
                  >
                    <Link className="h-4 w-4" />
                  </Button>
                )}
                
                {shouldShowConfiguration() && onEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(asset)}
                    className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-50"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                )}
              </>
            )}

            {mode === 'view' && showActions && (
              <>
                {onRemove && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemove(asset.uuid)}
                    className="h-8 w-8 p-0 text-red-600 hover:bg-red-50"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
                
                {shouldShowChipAssociation() && onAssociateChip && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onAssociateChip(asset)}
                    className="h-8 w-8 p-0 text-orange-600 hover:bg-orange-50"
                  >
                    <Link className="h-4 w-4" />
                  </Button>
                )}
                
                {shouldShowConfiguration() && onConfigure && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onConfigure(asset)}
                    className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-50"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
