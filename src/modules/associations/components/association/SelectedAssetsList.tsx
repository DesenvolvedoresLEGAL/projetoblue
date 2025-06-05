
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { SelectedAsset } from '@modules/associations/types';
import { Trash2, Settings, Wifi, Smartphone } from 'lucide-react';

interface SelectedAssetsListProps {
  assets: SelectedAsset[];
  onRemoveAsset: (assetId: string) => void;
  onEditAsset: (asset: SelectedAsset) => void;
}

export const SelectedAssetsList: React.FC<SelectedAssetsListProps> = ({
  assets,
  onRemoveAsset,
  onEditAsset
}) => {
  const getAssetIdentifier = (asset: SelectedAsset) => {
    if (asset.type === 'CHIP') {
      return asset.iccid || asset.line_number || asset.uuid.substring(0, 8);
    }
    return asset.radio || asset.serial_number || asset.uuid.substring(0, 8);
  };

  const getAssetSecondaryInfo = (asset: SelectedAsset) => {
    if (asset.type === 'CHIP' && asset.line_number) {
      return `Linha: ${asset.line_number}`;
    }
    if (asset.model) {
      return asset.model;
    }
    return asset.solucao || 'N/A';
  };

  return (
    <div className="space-y-3 max-h-96 overflow-y-auto">
      {assets.map((asset) => (
        <Card key={asset.uuid} className="border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  {asset.type === 'CHIP' ? (
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Smartphone className="h-4 w-4 text-green-600" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Wifi className="h-4 w-4 text-blue-600" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm text-gray-900 truncate">
                      {getAssetIdentifier(asset)}
                    </p>
                    <Badge 
                      variant="secondary" 
                      className={`text-xs ${
                        asset.type === 'CHIP' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {asset.type === 'CHIP' ? 'CHIP' : 'EQUIPAMENTO'}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 truncate">
                    {getAssetSecondaryInfo(asset)}
                  </p>
                  {asset.brand && (
                    <p className="text-xs text-gray-400">
                      {asset.brand}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEditAsset(asset)}
                  className="h-8 w-8 p-0 hover:bg-blue-50"
                >
                  <Settings className="h-3 w-3 text-blue-600" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveAsset(asset.uuid)}
                  className="h-8 w-8 p-0 hover:bg-red-50"
                >
                  <Trash2 className="h-3 w-3 text-red-600" />
                </Button>
              </div>
            </div>

            {/* Informações adicionais se configuradas */}
            {(asset.ssid || asset.password || asset.associationType) && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="grid grid-cols-2 gap-2 text-xs">
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
      ))}
    </div>
  );
};
