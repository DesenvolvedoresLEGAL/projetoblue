
import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AssetCard } from '../AssetCard';
import { SelectedAsset } from '@modules/associations/types';
import { AlertCircle } from 'lucide-react';
import { useIsMobile } from '@/hooks/useIsMobile';
import { SearchResultsPagination } from './SearchResultsPagination';

interface SearchResultsProps {
  assets: SelectedAsset[];
  isLoading: boolean;
  onAssetSelect: (asset: SelectedAsset) => void;
  selectingAssetId: string | null;
  // Novas props para paginação
  currentPage?: number;
  itemsPerPage?: number;
  onPageChange?: (page: number) => void;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  assets,
  isLoading,
  onAssetSelect,
  selectingAssetId,
  currentPage: externalCurrentPage,
  itemsPerPage = 12,
  onPageChange: externalOnPageChange
}) => {
  const isMobile = useIsMobile();
  
  // Estado interno para paginação quando não controlado externamente
  const [internalCurrentPage, setInternalCurrentPage] = useState(1);
  
  // Usar props externas se fornecidas, caso contrário usar estado interno
  const currentPage = externalCurrentPage || internalCurrentPage;
  const onPageChange = externalOnPageChange || setInternalCurrentPage;
  
  // Resetar para página 1 quando assets mudarem
  useEffect(() => {
    if (!externalCurrentPage) {
      setInternalCurrentPage(1);
    }
  }, [assets, externalCurrentPage]);
  
  // Calcular dados paginados
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return assets.slice(startIndex, endIndex);
  }, [assets, currentPage, itemsPerPage]);
  
  // Calcular total de páginas
  const totalPages = Math.ceil(assets.length / itemsPerPage);

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
      <CardContent className="p-4 space-y-4">
        <div 
          className={`
            grid gap-3 
            ${isMobile ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}
          `}
        >
          {paginatedData.map((asset) => (
            <AssetCard
              key={asset.uuid}
              asset={asset}
              mode="select"
              onSelect={onAssetSelect}
              isSelecting={selectingAssetId === asset.uuid}
            />
          ))}
        </div>
        
        {totalPages > 1 && (
          <SearchResultsPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={assets.length}
            itemsPerPage={itemsPerPage}
            onPageChange={onPageChange}
          />
        )}
      </CardContent>
    </Card>
  );
};
