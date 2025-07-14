
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AssetCard } from '../AssetCard';
import { SelectedAsset } from '@modules/associations/types';
import { AlertCircle } from 'lucide-react';
import { useIsMobile } from '@/hooks/useIsMobile';

interface SearchResultsProps {
  assets: SelectedAsset[];
  isLoading: boolean;
  onAssetSelect: (asset: SelectedAsset) => void;
  selectingAssetId: string | null;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  assets,
  isLoading,
  onAssetSelect,
  selectingAssetId
}) => {
  const isMobile = useIsMobile();

  if (isLoading) {
    return (
      <Card className="border-[#4D2BFB]/20">
        <CardContent className="p-4">
          <div className="text-center py-8">
            <p className="text-muted-foreground">Carregando ativos...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (assets.length === 0) {
    return (
      <Card className="border-[#4D2BFB]/20">
        <CardContent className="p-4">
          <div className="text-center py-8 text-gray-500">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Nenhum ativo encontrado</p>
            <p className="text-sm">
              Ajuste os filtros ou busque por termos específicos
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-[#4D2BFB]/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">
          Resultados ({assets.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div 
          className={`
            grid gap-3 
            overflow-y-scroll
            ${isMobile ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}
            ${isMobile ? 'max-h-[25vh]' : 'max-h-[35vh]'} 
          `}
        >
          {assets.map((asset) => (
            <AssetCard
              key={asset.uuid}
              asset={asset}
              mode="select"
              onSelect={onAssetSelect}
              isSelecting={selectingAssetId === asset.uuid}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
