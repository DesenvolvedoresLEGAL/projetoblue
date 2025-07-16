
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDebounce } from '@/hooks/useDebounce';
import { SearchOptions } from '../../types/associationsList';

interface AssociationSearchProps {
  search: SearchOptions;
  onSearchChange: (search: Partial<SearchOptions>) => void;
}

export const AssociationSearch: React.FC<AssociationSearchProps> = ({
  search,
  onSearchChange
}) => {
  const [localQuery, setLocalQuery] = useState(search.query);
  const debouncedQuery = useDebounce(localQuery, 300);

  // Update search when debounced query changes
  useEffect(() => {
    onSearchChange({ query: debouncedQuery });
  }, [debouncedQuery, onSearchChange]);

  // Sync local state with external changes
  useEffect(() => {
    setLocalQuery(search.query);
  }, [search.query]);

  const clearSearch = () => {
    setLocalQuery('');
    onSearchChange({ query: '', searchType: 'all' });
  };

  const hasSearch = search.query.trim().length > 0;

  return (
    <div className="flex items-center space-x-4">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por cliente, ICCID ou rádio..."
          value={localQuery}
          onChange={(e) => setLocalQuery(e.target.value)}
          className="pl-9 pr-9"
        />
        {hasSearch && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSearch}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      <div className="w-48">
        <Select
          value={search.searchType}
          onValueChange={(value) => onSearchChange({ searchType: value as SearchOptions['searchType'] })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Buscar em todos</SelectItem>
            <SelectItem value="client">Cliente</SelectItem>
            <SelectItem value="iccid">ICCID</SelectItem>
            <SelectItem value="radio">Rádio</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
