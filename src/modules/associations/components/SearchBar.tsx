
import React from 'react';
import { Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  searchType: 'client_name' | 'iccid' | 'radio';
  isSearching: boolean;
  totalMatches: number;
  placeholder?: string;
}

const getSearchTypeLabel = (type: SearchBarProps['searchType']): string => {
  switch (type) {
    case 'client_name':
      return 'Cliente';
    case 'iccid':
      return 'ICCID';
    case 'radio':
      return 'Rádio';
    default:
      return 'Cliente';
  }
};

const getSearchTypeColor = (type: SearchBarProps['searchType']): string => {
  switch (type) {
    case 'client_name':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case 'iccid':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'radio':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  }
};

export const SearchBar: React.FC<SearchBarProps> = ({
  searchTerm,
  onSearchChange,
  searchType,
  isSearching,
  totalMatches,
  placeholder = "Buscar por cliente, ICCID ou rádio..."
}) => {
  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 pr-4"
        />
        {isSearching && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>
      
      {searchTerm.trim() && (
        <div className="flex items-center gap-2 text-sm">
          <Badge variant="outline" className={getSearchTypeColor(searchType)}>
            Buscando por {getSearchTypeLabel(searchType)}
          </Badge>
          <span className="text-muted-foreground">
            {totalMatches} {totalMatches === 1 ? 'resultado encontrado' : 'resultados encontrados'}
          </span>
        </div>
      )}
    </div>
  );
};
