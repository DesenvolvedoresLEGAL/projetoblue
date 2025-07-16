
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, X } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { FilterOptions } from '../../types/associationsList';

interface AssociationFiltersProps {
  filters: FilterOptions;
  filterOptions: {
    associationTypes: Array<{ id: number; type: string }>;
    operators: Array<{ id: number; name: string }>;
  };
  onFiltersChange: (filters: Partial<FilterOptions>) => void;
}

export const AssociationFilters: React.FC<AssociationFiltersProps> = ({
  filters,
  filterOptions,
  onFiltersChange
}) => {
  const handleDateRangeChange = (field: 'start' | 'end', date: Date | undefined) => {
    onFiltersChange({
      dateRange: {
        ...filters.dateRange,
        [field]: date ? format(date, 'yyyy-MM-dd') : null
      }
    });
  };

  const clearDateRange = () => {
    onFiltersChange({
      dateRange: { start: null, end: null }
    });
  };

  const hasActiveFilters = 
    filters.status !== 'all' ||
    filters.associationType !== 'all' ||
    filters.assetType !== 'all' ||
    filters.manufacturer !== 'all' ||
    filters.dateRange.start ||
    filters.dateRange.end;

  const clearAllFilters = () => {
    onFiltersChange({
      status: 'all',
      associationType: 'all',
      assetType: 'all',
      manufacturer: 'all',
      dateRange: { start: null, end: null }
    });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Filtros</CardTitle>
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllFilters}
              className="h-8"
            >
              <X className="h-4 w-4 mr-1" />
              Limpar Filtros
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Status Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <Select
              value={filters.status}
              onValueChange={(value) => onFiltersChange({ status: value as FilterOptions['status'] })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="inactive">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Association Type Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Tipo de Associação</label>
            <Select
              value={filters.associationType.toString()}
              onValueChange={(value) => onFiltersChange({ 
                associationType: value === 'all' ? 'all' : parseInt(value) 
              })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {filterOptions.associationTypes.map(type => (
                  <SelectItem key={type.id} value={type.id.toString()}>
                    {type.type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Asset Type Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Tipo de Ativo</label>
            <Select
              value={filters.assetType}
              onValueChange={(value) => onFiltersChange({ assetType: value as FilterOptions['assetType'] })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="priority">Prioritários (Speedy)</SelectItem>
                <SelectItem value="others">Outros</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Manufacturer/Operator Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Operadora</label>
            <Select
              value={filters.manufacturer.toString()}
              onValueChange={(value) => onFiltersChange({ 
                manufacturer: value === 'all' ? 'all' : parseInt(value) 
              })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {filterOptions.operators.map(operator => (
                  <SelectItem key={operator.id} value={operator.id.toString()}>
                    {operator.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Range Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Período de Entrada</label>
            <div className="flex items-center space-x-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "flex-1 justify-start text-left font-normal",
                      !filters.dateRange.start && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateRange.start 
                      ? format(new Date(filters.dateRange.start), 'dd/MM/yyyy', { locale: ptBR })
                      : "Data inicial"
                    }
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.dateRange.start ? new Date(filters.dateRange.start) : undefined}
                    onSelect={(date) => handleDateRangeChange('start', date)}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "flex-1 justify-start text-left font-normal",
                      !filters.dateRange.end && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateRange.end 
                      ? format(new Date(filters.dateRange.end), 'dd/MM/yyyy', { locale: ptBR })
                      : "Data final"
                    }
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.dateRange.end ? new Date(filters.dateRange.end) : undefined}
                    onSelect={(date) => handleDateRangeChange('end', date)}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              
              {(filters.dateRange.start || filters.dateRange.end) && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={clearDateRange}
                  className="h-9 w-9"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
