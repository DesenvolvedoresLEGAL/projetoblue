
import React from 'react';
import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AssociationFilters as IAssociationFilters, FilterOption } from '../../types/filterTypes';

interface AssociationFiltersProps {
  filters: IAssociationFilters;
  statusOptions: FilterOption[];
  associationTypeOptions: FilterOption[];
  onFilterChange: (key: keyof IAssociationFilters, value: string | number) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

const AssociationFilters: React.FC<AssociationFiltersProps> = ({
  filters,
  statusOptions,
  associationTypeOptions,
  onFilterChange,
  onClearFilters,
  hasActiveFilters
}) => {
  return (
    <div className="bg-card rounded-lg border p-4 md:p-6">
      <div className="flex items-center gap-3 mb-4">
        <Filter className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Filtros</h3>
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClearFilters}
            className="ml-auto"
          >
            <X className="h-4 w-4 mr-2" />
            Limpar
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Filtro de Status */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Status
          </label>
          <Select
            value={filters.status}
            onValueChange={(value) => onFilterChange('status', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value.toString()}>
                  <div className="flex items-center justify-between w-full">
                    <span>{option.label}</span>
                    {option.count !== undefined && (
                      <span className="text-muted-foreground text-xs ml-2">
                        ({option.count})
                      </span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Filtro de Tipo de Associação */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Tipo de Associação
          </label>
          <Select
            value={filters.associationType.toString()}
            onValueChange={(value) => 
              onFilterChange('associationType', value === 'all' ? 'all' : parseInt(value))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              {associationTypeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value.toString()}>
                  <div className="flex items-center justify-between w-full">
                    <span>{option.label}</span>
                    {option.count !== undefined && (
                      <span className="text-muted-foreground text-xs ml-2">
                        ({option.count})
                      </span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Espaço para filtros futuros */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">
            Tipo de Ativo
          </label>
          <Select disabled>
            <SelectTrigger className="opacity-50">
              <SelectValue placeholder="Em breve" />
            </SelectTrigger>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">
            Período
          </label>
          <Select disabled>
            <SelectTrigger className="opacity-50">
              <SelectValue placeholder="Em breve" />
            </SelectTrigger>
          </Select>
        </div>
      </div>

      {/* Indicador de filtros ativos */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Filtros ativos:</span>
            {filters.status !== 'all' && (
              <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs">
                Status: {statusOptions.find(o => o.value === filters.status)?.label}
              </span>
            )}
            {filters.associationType !== 'all' && (
              <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs">
                Tipo: {associationTypeOptions.find(o => o.value === filters.associationType)?.label}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AssociationFilters;
