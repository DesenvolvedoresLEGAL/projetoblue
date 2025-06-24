
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Filter } from 'lucide-react';
import { DirectSearch } from './DirectSearch';
import { AdvancedSearch } from './AdvancedSearch';
import { SearchResults } from './SearchResults';
import { AssetSearchFilters } from '@modules/associations/hooks/useAssetSearch';
import { SelectedAsset } from '@modules/associations/types';
import { useIsMobile } from '@/hooks/useIsMobile';

interface SearchTabsProps {
  // Direct search props
  onAssetFound: (asset: SelectedAsset) => void;
  searchSpecificAsset: (term: string, type: 'chip' | 'equipment') => Promise<SelectedAsset | null>;
  
  // Advanced search props
  filters: AssetSearchFilters;
  onFiltersUpdate: (updates: Partial<AssetSearchFilters>) => void;
  assets: SelectedAsset[];
  isLoading: boolean;
  onAssetSelect: (asset: SelectedAsset) => void;
  selectingAssetId: string | null;
}

export const SearchTabs: React.FC<SearchTabsProps> = ({
  onAssetFound,
  searchSpecificAsset,
  filters,
  onFiltersUpdate,
  assets,
  isLoading,
  onAssetSelect,
  selectingAssetId
}) => {
  const isMobile = useIsMobile();
  
  const equipmentCount = assets.filter(asset => asset.type === 'EQUIPMENT').length;
  const chipCount = assets.filter(asset => asset.type === 'CHIP').length;

  return (
    <Tabs defaultValue="direct" className="w-full">
      <TabsList className={`grid w-full grid-cols-2 ${isMobile ? 'h-auto' : ''}`}>
        <TabsTrigger 
          value="direct" 
          className={`flex items-center gap-2 ${isMobile ? 'text-xs px-2 py-2' : ''}`}
        >
          <Search className="h-4 w-4" />
          {isMobile ? 'Direta' : 'Busca Direta'}
        </TabsTrigger>
        <TabsTrigger 
          value="advanced"
          className={`flex items-center gap-2 ${isMobile ? 'text-xs px-2 py-2' : ''}`}
        >
          <Filter className="h-4 w-4" />
          {isMobile ? 'Avançada' : 'Busca Avançada'}
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="direct" className="mt-4 space-y-4">
        <DirectSearch
          onAssetFound={onAssetFound}
          searchSpecificAsset={searchSpecificAsset}
        />
      </TabsContent>
      
      <TabsContent value="advanced" className="mt-4 space-y-4">
        <AdvancedSearch
          filters={filters}
          onFiltersUpdate={onFiltersUpdate}
          equipmentCount={equipmentCount}
          chipCount={chipCount}
          totalCount={assets.length}
        />
        
        <SearchResults
          assets={assets}
          isLoading={isLoading}
          onAssetSelect={onAssetSelect}
          selectingAssetId={selectingAssetId}
        />
      </TabsContent>
    </Tabs>
  );
};
