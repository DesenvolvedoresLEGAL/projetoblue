
import React from 'react';
import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  StatusFilter, 
  AssociationTypeFilter, 
  AssetTypeFilter, 
  ManufacturerFilter, 
  DateRangeFilter 
} from '../filters/FilterComponents';
import { AssociationFilters as IAssociationFilters } from '../../types/filterTypes';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface MobileFiltersDrawerProps {
  filters: IAssociationFilters;
  onFiltersChange: (filters: IAssociationFilters) => void;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
  getFilterOptionCount: (filterType: keyof IAssociationFilters, optionValue: string | number) => number;
  totalResults: number;
}

const MobileFiltersDrawer: React.FC<MobileFiltersDrawerProps> = ({
  filters,
  onFiltersChange,
  onResetFilters,
  hasActiveFilters,
  getFilterOptionCount,
  totalResults
}) => {
  // Buscar tipos de associação
  const { data: associationTypes = [] } = useQuery({
    queryKey: ['association-types'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('association_types')
        .select('id, type')
        .order('id');
      
      if (error) throw error;
      return data.map(type => ({
        value: type.id,
        label: type.type
      }));
    }
  });

  // Buscar fabricantes
  const { data: manufacturers = [] } = useQuery({
    queryKey: ['manufacturers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('manufacturers')
        .select('id, name, description')
        .order('name');
      
      if (error) throw error;
      return data.map(manufacturer => ({
        value: manufacturer.id,
        label: manufacturer.name,
        isOperator: manufacturer.description === 'OPERADORA'
      }));
    }
  });

  const updateFilter = <K extends keyof IAssociationFilters>(
    key: K,
    value: IAssociationFilters[K]
  ) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'dateRange') {
      return Boolean(value.startDate || value.endDate);
    }
    return value !== 'all';
  }).length;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="relative">
          <Filter className="h-4 w-4 mr-2" />
          Filtros
          {activeFiltersCount > 0 && (
            <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[80vh]">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filtros
            </SheetTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {totalResults} {totalResults === 1 ? 'resultado' : 'resultados'}
              </Badge>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onResetFilters}
                  className="h-8 px-2 text-xs"
                >
                  <X className="h-3 w-3 mr-1" />
                  Limpar
                </Button>
              )}
            </div>
          </div>
        </SheetHeader>
        
        <ScrollArea className="h-full pt-4">
          <div className="space-y-6 pb-6">
            <div>
              <h3 className="text-sm font-medium text-foreground mb-3">Status da Associação</h3>
              <StatusFilter
                value={filters.status}
                onValueChange={(value) => updateFilter('status', value)}
                getOptionCount={(value) => getFilterOptionCount('status', value)}
              />
            </div>

            <Separator />

            <div>
              <h3 className="text-sm font-medium text-foreground mb-3">Tipo de Associação</h3>
              <AssociationTypeFilter
                value={filters.associationType}
                onValueChange={(value) => updateFilter('associationType', value)}
                options={associationTypes}
                getOptionCount={(value) => getFilterOptionCount('associationType', value)}
              />
            </div>

            <Separator />

            <div>
              <h3 className="text-sm font-medium text-foreground mb-3">Tipo de Ativo</h3>
              <AssetTypeFilter
                value={filters.assetType}
                onValueChange={(value) => updateFilter('assetType', value)}
                getOptionCount={(value) => getFilterOptionCount('assetType', value)}
              />
            </div>

            <Separator />

            <div>
              <h3 className="text-sm font-medium text-foreground mb-3">Fabricante/Operadora</h3>
              <ManufacturerFilter
                value={filters.manufacturer}
                onValueChange={(value) => updateFilter('manufacturer', value)}
                options={manufacturers}
                getOptionCount={(value) => getFilterOptionCount('manufacturer', value)}
              />
            </div>

            <Separator />

            <div>
              <h3 className="text-sm font-medium text-foreground mb-3">Período</h3>
              <DateRangeFilter
                value={filters.dateRange}
                onValueChange={(value) => updateFilter('dateRange', value)}
              />
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default MobileFiltersDrawer;
