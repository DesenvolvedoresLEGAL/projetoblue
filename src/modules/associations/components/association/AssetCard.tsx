
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SelectedAsset } from '@modules/associations/types';
import { Wifi, Smartphone, Plus, Settings, Trash2 } from 'lucide-react';

interface AssetCardProps {
  asset: SelectedAsset;
  mode: 'select' | 'selected';
  onSelect?: (asset: SelectedAsset) => void;
  onEdit?: (asset: SelectedAsset) => void;
  onRemove?: (assetId: string) => void;
  isSelecting?: boolean;
}

export const AssetCard: React.FC<AssetCardProps> = ({
  asset,
  mode,
  onSelect,
  onEdit,
  onRemove,
  isSelecting = false
}) => {
  const getAssetIdentifier = () => {
    if (asset.type === 'CHIP') {
      return asset.iccid || asset.line_number || asset.uuid.substring(0, 8);
    }
    return asset.radio || asset.serial_number || asset.uuid.substring(0, 8);
  };

  const getAssetSecondaryInfo = () => {
    if (asset.type === 'CHIP' && asset.line_number) {
      return `(${asset.line_number.slice(0, 2)}) ${asset.line_number[2]} ${asset.line_number.slice(3, asset.line_number.length)}`;
    }
    if (asset.model) {
      return asset.radio;
    }
    return asset.solucao || 'N/A';
  };

  const handleSelect = () => {
    if (onSelect && !isSelecting) {
      onSelect(asset);
    }
  };

  const cardClassName = mode === 'select' 
    ? 'border border-gray-200 hover:border-[#4D2BFB] hover:shadow-md transition-all duration-200 cursor-pointer' 
    : 'border border-gray-200';

  return (
    <Card className={cardClassName} onClick={mode === 'select' ? handleSelect : undefined}>
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Ícone do tipo */}
            <div className="flex-shrink-0">
              {asset.type === 'CHIP' ? (
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Smartphone className="h-5 w-5 text-green-600" />
                </div>
              ) : (
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Wifi className="h-5 w-5 text-blue-600" />
                </div>
              )}
            </div>
            
            {/* Informações do ativo */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-semibold text-sm text-gray-900 truncate">
                  {getAssetIdentifier()}
                </p>
                <Badge 
                  variant="secondary" 
                  className={`text-xs flex-shrink-0 ${
                    asset.type === 'CHIP' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {asset.type === 'CHIP' ? 'CHIP' : 'EQUIPAMENTO'}
                </Badge>
              </div>
              
              <p className="text-xs text-gray-600 truncate">
                {getAssetSecondaryInfo()}
              </p>
              
              {asset.brand && (
                <p className="text-xs text-gray-400 truncate">
                  {asset.brand}
                </p>
              )}
              
              {/* Status */}
              <div className="mt-2">
                <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                  {asset.status}
                </Badge>
              </div>
            </div>
          </div>

          {/* Ações */}
          <div className="flex items-center gap-1 flex-shrink-0 ml-0 sm:ml-2 mt-2 sm:mt-0">
            {mode === 'select' ? (
              <Button
                size="sm"
                onClick={handleSelect}
                disabled={isSelecting}
                className="bg-[#4D2BFB] hover:bg-[#3a1ecc] text-white h-8 px-3"
              >
                <Plus className="h-3 w-3 mr-1" />
                {isSelecting ? 'Selecionando...' : 'Selecionar'}
              </Button>
            ) : (
              <>
                {onEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(asset)}
                    className="h-8 w-8 p-0 hover:bg-blue-50"
                  >
                    <Settings className="h-3 w-3 text-blue-600" />
                  </Button>
                )}
                {onRemove && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemove(asset.uuid)}
                    className="h-8 w-8 p-0 hover:bg-red-50"
                  >
                    <Trash2 className="h-3 w-3 text-red-600" />
                  </Button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Configurações específicas quando selecionado */}
        {mode === 'selected' && (asset.ssid || asset.password || asset.associationType) && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {asset.ssid && (
                <div>
                  <span className="text-gray-500">SSID:</span>
                  <span className="ml-1 font-medium">{asset.ssid}</span>
                </div>
              )}
              {asset.associationType && (
                <div>
                  <span className="text-gray-500">Tipo:</span>
                  <span className="ml-1 font-medium">{asset.associationType}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
