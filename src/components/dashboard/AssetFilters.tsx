
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';

export interface AssetFilterValues {
  assetType?: string;
  status?: string;
  client?: string;
  manufacturer?: string;
  searchText?: string;
}

interface AssetFiltersProps {
  onFilterChange: (filters: AssetFilterValues) => void;
}

export function AssetFilters({ onFilterChange }: AssetFiltersProps) {
  const [filters, setFilters] = useState<AssetFilterValues>({});
  const [searchText, setSearchText] = useState("");

  // Fetch asset solutions for asset type filter
  const { data: assetSolutions } = useQuery({
    queryKey: ['asset-solutions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('asset_solutions')
        .select('id, solution')
        .order('solution', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch status records for status filter
  const { data: statusRecords } = useQuery({
    queryKey: ['status-records'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('asset_status')
        .select('id, status')
        .order('status', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  // Fetch clients for client filter
  const { data: clients } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('uuid, nome')
        .is('deleted_at', null)
        .order('nome', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  // Fetch manufacturers for manufacturer filter
  const { data: manufacturers } = useQuery({
    queryKey: ['manufacturers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('manufacturers')
        .select('id, name')
        .order('name', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const handleFilterChange = (key: string, value: string | undefined) => {
    const newFilters = { ...filters, [key]: value };
    
    if (!value) {
      delete newFilters[key as keyof AssetFilterValues];
    }
    
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleSearch = () => {
    if (searchText.trim() !== "") {
      const newFilters = { ...filters, searchText: searchText.trim() };
      setFilters(newFilters);
      onFilterChange(newFilters);
    }
  };

  const handleClearSearch = () => {
    setSearchText("");
    const { searchText: _, ...restFilters } = filters;
    setFilters(restFilters);
    onFilterChange(restFilters);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleClearAllFilters = () => {
    setFilters({});
    setSearchText("");
    onFilterChange({});
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex justify-between items-center">
          Filtros
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleClearAllFilters}
            disabled={Object.keys(filters).length === 0}
          >
            Limpar todos
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Input */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              placeholder="Buscar ativos..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={handleKeyPress}
              className="pr-8"
            />
            {searchText && (
              <button 
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={handleClearSearch}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <Button onClick={handleSearch} className="shrink-0">
            <Search className="h-4 w-4 mr-1" />
            Buscar
          </Button>
        </div>

        <Separator />

        {/* Filter Dropdowns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Asset Type Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Tipo de Ativo</label>
            <Select 
              value={filters.assetType || ""} 
              onValueChange={(value) => handleFilterChange('assetType', value || undefined)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecionar tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os tipos</SelectItem>
                {assetSolutions?.map((solution) => (
                  <SelectItem key={solution.id} value={solution.id.toString()}>
                    {solution.solution}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <Select 
              value={filters.status || ""} 
              onValueChange={(value) => handleFilterChange('status', value || undefined)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecionar status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os status</SelectItem>
                {statusRecords?.map((status) => (
                  <SelectItem key={status.id} value={status.id.toString()}>
                    {status.status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Client Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Cliente</label>
            <Select 
              value={filters.client || ""} 
              onValueChange={(value) => handleFilterChange('client', value || undefined)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecionar cliente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os clientes</SelectItem>
                {clients?.map((client) => (
                  <SelectItem key={client.uuid} value={client.uuid}>
                    {client.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Manufacturer Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Fabricante</label>
            <Select 
              value={filters.manufacturer || ""} 
              onValueChange={(value) => handleFilterChange('manufacturer', value || undefined)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecionar fabricante" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os fabricantes</SelectItem>
                {manufacturers?.map((manufacturer) => (
                  <SelectItem key={manufacturer.id} value={manufacturer.id.toString()}>
                    {manufacturer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
