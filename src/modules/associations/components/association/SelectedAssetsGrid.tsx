
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AssetCard } from './AssetCard';
import { SelectedAsset } from '@modules/associations/types';
import { Search, Wifi, Smartphone } from 'lucide-react';

interface SelectedAssetsGridProps {
  assets: SelectedAsset[];
  onRemoveAsset: (assetId: string) => void;
  onEditAsset: (asset: SelectedAsset) => void;
}

export const SelectedAssetsGrid: React.FC<SelectedAssetsGridProps> = ({
  assets,
  onRemoveAsset,
  onEditAsset
}) => {
  const equipmentCount = assets.filter(asset => asset.type === 'ROTEADOR').length;
  const chipCount = assets.filter(asset => asset.type === 'CHIP').length;

  return (
    <Card className="border-[#4D2BFB]/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">
            Ativos Selecionados ({assets.length})
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              <Wifi className="h-3 w-3 mr-1" />
              {equipmentCount}
            </Badge>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <Smartphone className="h-3 w-3 mr-1" />
              {chipCount}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {assets.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
            {assets.map((asset) => (
              <AssetCard
                key={asset.uuid}
                asset={asset}
                mode="selected"
                onEdit={onEditAsset}
                onRemove={onRemoveAsset}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Nenhum ativo selecionado</p>
            <p className="text-sm">
              Use a busca acima para adicionar ativos
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
