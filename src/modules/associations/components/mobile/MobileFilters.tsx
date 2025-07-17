
import React from 'react';
import { Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MobileFiltersDrawer from './MobileFiltersDrawer';
import { AssociationFilters } from '../../types/filterTypes';

interface MobileFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  searchType: string;
  isSearching: boolean;
  totalMatches: number;
  // Novos props para filtros
  filters: AssociationFilters;
  onFiltersChange: (filters: AssociationFilters) => void;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
  getFilterOptionCount: (filterType: keyof AssociationFilters, optionValue: string | number) => number;
}

const MobileFilters: React.FC<MobileFiltersProps> = ({
  searchTerm,
  onSearchChange,
  searchType,
  isSearching,
  totalMatches,
  filters,
  onFiltersChange,
  onResetFilters,
  hasActiveFilters,
  getFilterOptionCount
}) => {
  return (
    <div className="bg-card rounded-lg border p-4 space-y-4">
      {/* Campo de busca */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className={`h-4 w-4 ${isSearching ? 'text-primary animate-pulse' : 'text-muted-foreground'}`} />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar clientes, empresas ou equipamentos..."
          className="w-full pl-10 pr-4 py-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground placeholder:text-muted-foreground text-base"
          autoComplete="off"
        />
      </div>

      {/* Botão de filtros e resultados */}
      <div className="flex items-center justify-between">
        <MobileFiltersDrawer
          filters={filters}
          onFiltersChange={onFiltersChange}
          onResetFilters={onResetFilters}
          hasActiveFilters={hasActiveFilters}
          getFilterOptionCount={getFilterOptionCount}
          totalResults={totalMatches}
        />
        
        {/* Resultados da busca */}
        {searchTerm.trim() && (
          <div className="text-sm text-muted-foreground">
            {isSearching ? (
              "Buscando..."
            ) : (
              <>
                {totalMatches} {totalMatches === 1 ? 'resultado' : 'resultados'}
              </>
            )}
            {searchType && (
              <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded mt-1">
                {searchType === 'client_name' ? 'Nome/Empresa' : 
                 searchType === 'iccid' ? 'Chip' : 
                 searchType === 'radio' ? 'Equipamento' : 'Geral'}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileFilters;
