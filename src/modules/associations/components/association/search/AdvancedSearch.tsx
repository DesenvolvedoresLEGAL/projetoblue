
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { AssetSearchFilters } from '@modules/associations/hooks/useAssetSearch';
import { SelectedAsset } from '@modules/associations/types';
import { Wifi, Smartphone } from 'lucide-react';
import { useIsMobile } from '@/hooks/useIsMobile';

interface AdvancedSearchProps {
  filters: AssetSearchFilters;
  onFiltersUpdate: (updates: Partial<AssetSearchFilters>) => void;
  equipmentCount: number;
  chipCount: number;
  totalCount: number;
  onAssetSelected?: (asset: SelectedAsset) => void;
  selectedAssets?: SelectedAsset[];
  selectingAssetId?: string | null;
}

export const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  filters,
  onFiltersUpdate,
  equipmentCount,
  chipCount,
  totalCount
}) => {
  const isMobile = useIsMobile();

  return (
    <div className="space-y-4">
      {/* Filtros principais */}
      <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
        {/* Filtro de tipo */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Tipo</Label>
          <div className={`grid gap-1 ${isMobile ? 'grid-cols-3' : 'grid-cols-3'}`}>
            {([
              { key: 'ALL', label: 'Todos', icon: null },
              { key: 'EQUIPMENT', label: isMobile ? 'Equip.' : 'Equipamentos', icon: Wifi },
              { key: 'CHIP', label: 'CHIPs', icon: Smartphone }
            ] as const).map(({ key, label, icon: Icon }) => (
              <Button
                key={key}
                variant={filters.type === key ? 'default' : 'outline'}
                size="sm"
                onClick={() => onFiltersUpdate({ type: key })}
                className={`${isMobile ? 'px-2 text-xs' : 'flex-1'}`}
              >
                {Icon && <Icon className="h-3 w-3 mr-1" />}
                {label}
              </Button>
            ))}
          </div>
        </div>

        {/* Campo de busca */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Buscar</Label>
          <Input
            value={filters.searchTerm || ''}
            onChange={(e) => onFiltersUpdate({ searchTerm: e.target.value })}
            placeholder={isMobile ? "ICCID, rádio..." : "ICCID, rádio, serial, linha..."}
            className="w-full"
          />
        </div>
      </div>

      {/* Estatísticas */}
      <div className={`flex items-center gap-2 flex-wrap ${isMobile ? 'justify-center' : ''}`}>
        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
          <Wifi className="h-3 w-3 mr-1" />
          {equipmentCount} {isMobile ? 'Eq.' : 'Equipamentos'}
        </Badge>
        <Badge variant="secondary" className="bg-green-100 text-green-800">
          <Smartphone className="h-3 w-3 mr-1" />
          {chipCount} CHIPs
        </Badge>
        <Badge variant="outline">
          Total: {totalCount}
        </Badge>
      </div>
    </div>
  );
};
