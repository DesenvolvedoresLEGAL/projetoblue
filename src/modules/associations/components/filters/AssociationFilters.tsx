
import React, { useEffect, useState } from 'react';
import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  StatusFilter, 
  AssociationTypeFilter, 
  AssetTypeFilter, 
  ManufacturerFilter, 
  DateRangeFilter 
} from './FilterComponents';
import { AssociationFilters as IAssociationFilters } from '../../types/filterTypes';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface AssociationFiltersProps {
  filters: IAssociationFilters;
  onFiltersChange: (filters: IAssociationFilters) => void;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
  getFilterOptionCount: (filterType: keyof IAssociationFilters, optionValue: string | number) => number;
  totalResults: number;
}

const AssociationFilters: React.FC<AssociationFiltersProps> = ({
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

  return (
    <Card className="border-primary/20 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-primary font-medium">
            <Filter className="h-4 w-4 text-primary" />
            Filtros
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {totalResults} {totalResults === 1 ? 'resultado' : 'resultados'}
            </Badge>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onResetFilters}
                className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3 mr-1" />
                Limpar
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatusFilter
            value={filters.status}
            onValueChange={(value) => updateFilter('status', value)}
            getOptionCount={(value) => getFilterOptionCount('status', value)}
          />

          <AssociationTypeFilter
            value={filters.associationType}
            onValueChange={(value) => updateFilter('associationType', value)}
            options={associationTypes}
            getOptionCount={(value) => getFilterOptionCount('associationType', value)}
          />

          <AssetTypeFilter
            value={filters.assetType}
            onValueChange={(value) => updateFilter('assetType', value)}
            getOptionCount={(value) => getFilterOptionCount('assetType', value)}
          />

          <ManufacturerFilter
            value={filters.manufacturer}
            onValueChange={(value) => updateFilter('manufacturer', value)}
            options={manufacturers}
            getOptionCount={(value) => getFilterOptionCount('manufacturer', value)}
          />

          <DateRangeFilter
            value={filters.dateRange}
            onValueChange={(value) => updateFilter('dateRange', value)}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default AssociationFilters;
