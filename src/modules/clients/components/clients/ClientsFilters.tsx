
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, X } from 'lucide-react';

interface ClientsFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  onClearFilters: () => void;
}

export const ClientsFilters: React.FC<ClientsFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  onClearFilters
}) => {
  return (
    <Card className="border border-gray-200 rounded-lg shadow-sm">
      <CardContent className="p-3 sm:p-4 lg:p-6">
        {/* Mobile-first: Grid 1 coluna, tablet: 2 colunas, desktop: flex */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:items-end gap-3 sm:gap-4">
          
          {/* Busca */}
          <div className="space-y-1 lg:flex-1">
            <Label htmlFor="search" className="text-sm font-medium text-[#020CBC]">Buscar</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="search"
                placeholder="Empresa, responsável, telefone..."
                className="pl-10 w-full h-10 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          {/* Status Filter */}
          <div className="space-y-1 lg:w-48">
            <Label htmlFor="statusFilter" className="text-sm font-medium text-[#020CBC]">Status</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full h-10 text-sm">
                <SelectValue placeholder="Todos os status" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Ativos</SelectItem>
                <SelectItem value="inactive">Inativos</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Botões de Ação */}
          <div className="flex flex-col sm:flex-row gap-2 sm:col-span-2 lg:col-span-1 lg:w-auto">
            <Button
              variant="outline"
              onClick={onClearFilters}
              className="w-full sm:w-auto h-10 text-sm flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Limpar
            </Button>
            <Button
              className="bg-[#4D2BFB] text-white hover:bg-[#3a1ecc] w-full sm:w-auto h-10 text-sm flex items-center gap-2"
            >
              <Search className="h-4 w-4" />
              Buscar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
