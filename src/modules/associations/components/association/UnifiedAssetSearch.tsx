
import React, { useState } from 'react';
import { useAssetSearch, AssetSearchFilters } from '@modules/associations/hooks/useAssetSearch';
import { SearchTabs } from './search/SearchTabs';
import { SelectedAsset } from '@modules/associations/types';
import { toast } from 'sonner';

interface UnifiedAssetSearchProps {
  selectedAssets: SelectedAsset[];
  onAssetSelected: (asset: SelectedAsset) => void;
  excludeAssociatedToClient?: string;
}

export const UnifiedAssetSearch: React.FC<UnifiedAssetSearchProps> = ({
  selectedAssets,
  onAssetSelected,
  excludeAssociatedToClient
}) => {
  const [selectingAssetId, setSelectingAssetId] = useState<string | null>(null);
  
  // Filtros para busca avançada
  const [filters, setFilters] = useState<AssetSearchFilters>({
    type: 'all',
    searchTerm: '',
    status: 'available'
  });

  const {
    assets,
    isLoading,
    searchSpecificAsset,
    validateAssetSelection
  } = useAssetSearch(
    filters,
    'all',
    excludeAssociatedToClient,
    { selectedAssets }
  );

  // Busca direta (exata)
  const handleDirectAssetFound = async (asset: SelectedAsset) => {
    console.log('Asset encontrado na busca direta:', asset);
    const isValid = await validateAssetSelection(asset);
    if (isValid) {
      onAssetSelected(asset);
      toast.success(`${asset.type === 'CHIP' ? 'CHIP' : 'Equipamento'} encontrado e adicionado!`);
    }
  };

  // Selecionar ativo da lista
  const handleAssetSelect = async (asset: SelectedAsset) => {
    setSelectingAssetId(asset.uuid);
    try {
      const isValid = await validateAssetSelection(asset);
      if (isValid) {
        onAssetSelected(asset);
        toast.success('Ativo adicionado com sucesso!');
      }
    } finally {
      setSelectingAssetId(null);
    }
  };

  // Atualizar filtros
  const updateFilters = (updates: Partial<AssetSearchFilters>) => {
    const newFilters = { ...filters, ...updates };
    console.log('Atualizando filtros:', { old: filters, new: newFilters, updates });
    setFilters(newFilters);
  };

  return (
    <SearchTabs
      onAssetFound={handleDirectAssetFound}
      searchSpecificAsset={searchSpecificAsset}
      filters={filters}
      onFiltersUpdate={updateFilters}
      assets={assets}
      isLoading={isLoading}
      onAssetSelect={handleAssetSelect}
      selectingAssetId={selectingAssetId}
    />
  );
};
