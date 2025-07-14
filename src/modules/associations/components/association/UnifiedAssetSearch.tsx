
import React, { useState } from 'react';
import { SelectedAsset } from '@modules/associations/types';
import { useAssetSearch } from '@modules/associations/hooks/useAssetSearch';
import { DirectSearch } from './search/DirectSearch';
import { AdvancedSearch } from './search/AdvancedSearch';
import { SearchResults } from './search/SearchResults';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Filter } from 'lucide-react';
import { useIsMobile } from '@/hooks/useIsMobile';
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
  const isMobile = useIsMobile();
  
  const {
    assets,
    isLoading,
    filters,
    onFiltersUpdate
  } = useAssetSearch({
    excludeAssociatedToClient,
    selectedAssets
  });

  const handleAssetSelect = (asset: SelectedAsset) => {
    if (import.meta.env.DEV) console.log('UnifiedAssetSearch: Asset selecionado', asset.uuid);
    if (asset.iccid) {
      toast.info(`CHIP selecionado.`);
    } else {
      toast.info(`${asset.radio} selecionado.`);
    }
    setSelectingAssetId(asset.uuid);
    onAssetSelected(asset);
    setSelectingAssetId(null);
  };

  const searchSpecificAsset = async (term: string, type: 'chip' | 'equipment'): Promise<SelectedAsset | null> => {
    if (import.meta.env.DEV) console.log('searchSpecificAsset:', { term, type });
    
    let query = supabase
      .from('assets')
      .select(`
        uuid,
        radio,
        line_number,
        serial_number,
        iccid,
        model,
        status_id,
        solution_id,
        manufacturer_id,
        created_at,
        asset_status!inner(status),
        asset_solutions!inner(solution),
        manufacturers(name)
      `)
      .not('status_id', 'eq', 2)
      .not('status_id', 'eq', 3)
      .is('deleted_at', null);

      
      if (type === 'chip') {
        query = query.or(`iccid.ilike.%${term}%,line_number.eq.${term}`);
      } else {
        query = query.or(`radio.eq.${term},serial_number.eq.${term}`);
      }
      
      const { data, error } = await query.limit(1);

    if (error) {
      if (import.meta.env.DEV) console.error('Erro na busca direta:', error);
      return null;
    }

    if (!data || data.length === 0) {
      if (type == "equipment") toast.warning(`Ativo ${term} não encontrado, ou já associado.`);
      if (type == "chip") toast.warning(`Chip não encontrado, ou já associado.`);
      return null;
    }

    const asset = data[0];
    return {
      id: asset.uuid,
      uuid: asset.uuid,
      radio: asset.radio,
      line_number: asset.line_number?.toString(),
      serial_number: asset.serial_number,
      iccid: asset.iccid,
      model: asset.model,
      statusId: asset.status_id,
      solution_id: asset.solution_id,
      manufacturer_id: asset.manufacturer_id,
      status: asset.asset_status?.status,
      solucao: asset.asset_solutions?.solution,
      marca: asset.manufacturers?.name,
      type: (asset.iccid ? 'CHIP' : 'EQUIPMENT') as 'CHIP' | 'EQUIPMENT',
      registrationDate: asset.created_at || new Date().toISOString()
    };
  };

  const equipmentCount = assets.filter(asset => asset.type === 'EQUIPMENT').length;
  const chipCount = assets.filter(asset => asset.type === 'CHIP').length;

  return (
    <div className="h-full overflow-hidden">
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
            onAssetFound={handleAssetSelect}
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
            onAssetSelected={onAssetSelected}
            selectedAssets={selectedAssets}
            selectingAssetId={selectingAssetId}
          />
          
          <SearchResults
            assets={assets}
            isLoading={isLoading}
            onAssetSelect={handleAssetSelect}
            selectingAssetId={selectingAssetId}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
