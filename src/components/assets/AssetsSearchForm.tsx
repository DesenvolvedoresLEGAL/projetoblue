
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Search, Filter, X } from "lucide-react";

interface AssetsSearchFormProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  solutionFilter: string;
  onSolutionChange: (value: string) => void;
  manufacturerFilter: string;
  onManufacturerChange: (value: string) => void;
  onClearFilters: () => void;
  totalResults?: number;
}

export default function AssetsSearchForm({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  solutionFilter,
  onSolutionChange,
  manufacturerFilter,
  onManufacturerChange,
  onClearFilters,
  totalResults
}: AssetsSearchFormProps) {
  // Buscar solutions do banco
  const { data: solutions = [] } = useQuery({
    queryKey: ['asset-solutions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('asset_solutions')
        .select('id, solution')
        .is('deleted_at', null)
        .order('solution');
      
      if (error) {
        console.error('Erro ao buscar solutions:', error);
        return [];
      }
      return data || [];
    }
  });

  // Buscar status do banco
  const { data: statuses = [] } = useQuery({
    queryKey: ['asset-status'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('asset_status')
        .select('id, status')
        .is('deleted_at', null)
        .order('status');
      
      if (error) {
        console.error('Erro ao buscar status:', error);
        return [];
      }
      return data || [];
    }
  });

  // Buscar manufacturers do banco
  const { data: manufacturers = [] } = useQuery({
    queryKey: ['manufacturers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('manufacturers')
        .select('id, name')
        .is('deleted_at', null)
        .order('name');
      
      if (error) {
        console.error('Erro ao buscar manufacturers:', error);
        return [];
      }
      return data || [];
    }
  });

  const hasActiveFilters = statusFilter !== 'all' || solutionFilter !== 'all' || manufacturerFilter !== 'all' || searchTerm.trim() !== '';
  const activeFiltersCount = [statusFilter !== 'all', solutionFilter !== 'all', manufacturerFilter !== 'all', searchTerm.trim() !== ''].filter(Boolean).length;

  return (
    <Card className="border-[#4D2BFB]/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Search className="h-5 w-5 text-[#03F9FF]" />
          Filtros de Busca
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="bg-[#03F9FF]/20 text-[#020CBC]">
              {activeFiltersCount} filtro{activeFiltersCount > 1 ? 's' : ''} ativo{activeFiltersCount > 1 ? 's' : ''}
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Use os filtros para encontrar ativos específicos
          {totalResults !== undefined && (
            <span className="ml-2 font-medium text-[#020CBC]">
              ({totalResults} resultado{totalResults !== 1 ? 's' : ''})
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Busca por texto */}
        <div className="space-y-2">
          <Label htmlFor="search-text" className="text-sm font-medium">
            Buscar por ICCID, Número, Rádio ou ID
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="search-text"
              type="text"
              placeholder="Digite para buscar..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 border-[#4D2BFB]/30 focus:border-[#4D2BFB] focus:ring-[#4D2BFB]/20"
            />
          </div>
        </div>

        {/* Filtros em grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Filtro por Status */}
          <div className="space-y-2">
            <Label htmlFor="status-filter" className="text-sm font-medium">
              Status
            </Label>
            <Select value={statusFilter} onValueChange={onStatusChange}>
              <SelectTrigger className="border-[#4D2BFB]/30 focus:border-[#4D2BFB] focus:ring-[#4D2BFB]/20">
                <SelectValue placeholder="Todos os status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                {statuses.map((status) => (
                  <SelectItem key={status.id} value={status.id.toString()}>
                    {status.status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtro por Solução */}
          <div className="space-y-2">
            <Label htmlFor="solution-filter" className="text-sm font-medium">
              Tipo/Solução
            </Label>
            <Select value={solutionFilter} onValueChange={onSolutionChange}>
              <SelectTrigger className="border-[#4D2BFB]/30 focus:border-[#4D2BFB] focus:ring-[#4D2BFB]/20">
                <SelectValue placeholder="Todas as soluções" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as soluções</SelectItem>
                {solutions.map((solution) => (
                  <SelectItem key={solution.id} value={solution.id.toString()}>
                    {solution.solution}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtro por Fabricante */}
          <div className="space-y-2">
            <Label htmlFor="manufacturer-filter" className="text-sm font-medium">
              Fabricante
            </Label>
            <Select value={manufacturerFilter} onValueChange={onManufacturerChange}>
              <SelectTrigger className="border-[#4D2BFB]/30 focus:border-[#4D2BFB] focus:ring-[#4D2BFB]/20">
                <SelectValue placeholder="Todos os fabricantes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os fabricantes</SelectItem>
                {manufacturers.map((manufacturer) => (
                  <SelectItem key={manufacturer.id} value={manufacturer.id.toString()}>
                    {manufacturer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Botão Limpar Filtros */}
        {hasActiveFilters && (
          <div className="flex justify-end pt-2">
            <Button
              onClick={onClearFilters}
              variant="outline"
              size="sm"
              className="border-gray-300 text-gray-600 hover:bg-gray-50"
            >
              <X className="h-4 w-4 mr-2" />
              Limpar Filtros
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
