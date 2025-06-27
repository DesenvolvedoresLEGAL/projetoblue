
import React from 'react';
import { Search, Filter, RotateCcw, Zap, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { useAssetSolutions } from '@modules/assets/hooks/useAssetSolutions';
import { useManufacturers, useStatusRecords } from '@modules/assets/hooks/useAssetManagement';
import { capitalize } from '@/utils/stringUtils';

interface AssetsSearchFormProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterType: string;
  filterStatus: string;
  filterManufacturer: string;
  handleSearch: (e: React.FormEvent) => void;
  handleFilterChange: (type: string, value: string) => void;
  isSearching?: boolean;
}

const AssetsSearchForm = ({
  searchTerm,
  setSearchTerm,
  filterType,
  filterStatus,
  filterManufacturer,
  handleSearch,
  handleFilterChange,
  isSearching = false
}: AssetsSearchFormProps) => {
  
  // Hook para buscar soluções dinamicamente
  const { data: assetSolutions = [], isLoading: loadingSolutions } = useAssetSolutions();
  // Hook para buscar fabricantes dinamicamente
  const { data: manufacturers = [], isLoading: loadingManufacturers } = useManufacturers();
  // Hook para buscar status disponíveis
  const { data: statusRecords = [], isLoading: loadingStatus } = useStatusRecords();
  
  const handleReset = () => {
    setSearchTerm('');
    handleFilterChange('type', 'all');
    handleFilterChange('status', 'all');
    handleFilterChange('manufacturer', 'all');
  };

  // Placeholder responsivo baseado no tamanho da tela
  const getSearchPlaceholder = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 640) {
      return "Buscar ativos...";
    }
    return "Pesquisar por ICCID, número de linha, rádio, modelo ou série...";
  };

  return (
    <Card className="border-legal-primary/20 shadow-lg">
      <CardContent className="p-4 md:p-6">
        <div className="space-y-4">
          {/* Header da busca */}
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-legal-primary rounded-lg">
              <Search className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <div>
              <h3 className="font-black text-legal-dark font-neue-haas text-base sm:text-lg">
                Buscar e Filtrar Ativos
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 font-neue-haas">
                Encontre rapidamente o equipamento que você precisa
              </p>
            </div>
          </div>

          <form onSubmit={handleSearch} className="space-y-4">
            {/* Campo de busca principal */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-legal-primary" />
              {isSearching && (
                <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-legal-secondary animate-spin" />
              )}
              <Input
                type="text"
                placeholder={getSearchPlaceholder()}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-10 h-12 border-legal-primary/30 focus:border-legal-primary focus:ring-legal-primary/20 font-neue-haas"
              />
            </div>

            {/* Filtros com grid responsivo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
              {/* Filtro por Tipo - Dinâmico */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-legal-dark font-neue-haas flex items-center gap-2">
                  <Filter className="h-4 w-4 text-legal-secondary" />
                  <span className="hidden sm:inline">Tipo de Solução</span>
                  <span className="sm:hidden">Tipo</span>
                </label>
                <Select
                  value={filterType}
                  onValueChange={(value) => handleFilterChange('type', value)}
                  disabled={loadingSolutions}
                >
                  <SelectTrigger className="h-12 border-legal-secondary/30 focus:border-legal-secondary font-neue-haas">
                    <SelectValue placeholder={loadingSolutions ? "Carregando..." : "Todos os tipos"} />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-legal-secondary/20">
                    <SelectItem value="all" className="font-neue-haas">Todos os Tipos</SelectItem>
                    {assetSolutions.map((solution) => (
                      <SelectItem
                        key={solution.id}
                        value={solution.id.toString()}
                        className="font-neue-haas"
                      >
                        {solution.solution === 'CHIP' ? '📱 '
                        : solution.solution === 'SPEEDY 5G' ? '📡 '
                        : '📶 ' }
                        {solution.solution}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Filtro por Status - Usando IDs */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-legal-dark font-neue-haas flex items-center gap-2">
                  <Filter className="h-4 w-4 text-legal-secondary" />
                  <span className="hidden sm:inline">Status do Ativo</span>
                  <span className="sm:hidden">Status</span>
                </label>
                <Select
                  value={filterStatus}
                  onValueChange={(value) => handleFilterChange('status', value)}
                  disabled={loadingStatus}
                >
                  <SelectTrigger className="h-12 border-legal-secondary/30 focus:border-legal-secondary font-neue-haas">
                    <SelectValue placeholder={loadingStatus ? "Carregando..." : "Todos os status"} />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-legal-secondary/20">
                    <SelectItem value="all" className="font-neue-haas">Todos os Status</SelectItem>
                    {statusRecords.map((status) => (
                      <SelectItem 
                        key={status.id} 
                        value={status.id.toString()} 
                        className="font-neue-haas"
                      >
                        {status.status === 'DISPONÍVEL' && '✓ '}
                        {status.status === 'EM LOCAÇÃO' && '📍 '}
                        {status.status === 'EM ASSINATURA' && '📋 '}
                        {status.status === 'SEM DADOS' && '⚠️ '}
                        {status.status === 'BLOQUEADO' && '🚫 '}
                        {status.status === 'EM MANUTENÇÃO' && '🔧 '}
                        {status.status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Filtro por Fabricante */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-legal-dark font-neue-haas flex items-center gap-2">
                  <Filter className="h-4 w-4 text-legal-secondary" />
                  <span className="hidden sm:inline">Fabricante</span>
                  <span className="sm:hidden">Marca</span>
                </label>
                <Select
                  value={filterManufacturer}
                  onValueChange={(value) => handleFilterChange('manufacturer', value)}
                  disabled={loadingManufacturers}
                >
                  <SelectTrigger className="h-12 border-legal-secondary/30 focus:border-legal-secondary font-neue-haas">
                    <SelectValue placeholder={loadingManufacturers ? 'Carregando...' : 'Todos os fabricantes'} />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-legal-secondary/20">
                    <SelectItem value="all" className="font-neue-haas">Todos os Fabricantes</SelectItem>
                    {manufacturers.map((manu) => (
                      <SelectItem key={manu.id} value={manu.id.toString()} className="font-neue-haas">
                        {capitalize(manu.name)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Botão de Busca */}
              <div className="space-y-2">
                <label className="text-sm text-transparent">Ações</label>
                <Button
                  type="submit"
                  disabled={isSearching}
                  className="w-full h-12 bg-legal-primary hover:bg-legal-dark text-white font-bold font-neue-haas transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-70"
                >
                  {isSearching ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Zap className="h-4 w-4 mr-2" />
                  )}
                  <span className="hidden sm:inline">
                    {isSearching ? 'Buscando...' : 'Buscar Ativos'}
                  </span>
                  <span className="sm:hidden">
                    {isSearching ? 'Buscando...' : 'Buscar'}
                  </span>
                </Button>
              </div>

              {/* Botão de Reset */}
              <div className="space-y-2">
                <label className="text-sm text-transparent">Reset</label>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleReset}
                  disabled={isSearching}
                  className="w-full h-12 border-legal-secondary text-legal-secondary hover:bg-legal-secondary hover:text-white font-bold font-neue-haas transition-all duration-200 disabled:opacity-70"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Limpar Filtros</span>
                  <span className="sm:hidden">Limpar</span>
                </Button>
              </div>
            </div>
          </form>

          {/* Dicas de busca */}
          <div className="mt-4 p-3 bg-legal-primary/5 rounded-lg border border-legal-primary/20">
            <p className="text-xs text-legal-dark font-neue-haas">
              💡 <strong>Dica:</strong> <span className="hidden sm:inline">Use números para buscar linhas telefônicas, ou digite texto para encontrar por ICCID, modelo ou série.</span>
              <span className="sm:hidden">Digite para buscar por ICCID, modelo ou série.</span>
              {isSearching && (
                <span className="ml-2 text-legal-secondary font-bold">
                  Buscando...
                </span>
              )}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AssetsSearchForm;
