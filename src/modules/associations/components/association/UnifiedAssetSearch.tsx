
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { useAssetSearch, AssetSearchFilters } from '@modules/associations/hooks/useAssetSearch';
import { AssetCard } from './AssetCard';
import { SelectedAsset } from '@modules/associations/types';
import { Search, Filter, Wifi, Smartphone, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface UnifiedAssetSearchProps {
  selectedAssets: SelectedAsset[];
  onAssetSelected: (asset: SelectedAsset) => void;
}

export const UnifiedAssetSearch: React.FC<UnifiedAssetSearchProps> = ({
  selectedAssets,
  onAssetSelected
}) => {
  const [directSearchTerm, setDirectSearchTerm] = useState('');
  const [directSearchType, setDirectSearchType] = useState<'chip' | 'equipment'>('equipment');
  const [isDirectSearching, setIsDirectSearching] = useState(false);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(true);
  const [selectingAssetId, setSelectingAssetId] = useState<string | null>(null);

  const {
    filters,
    setFilters,
    assets,
    isLoading,
    searchSpecificAsset,
    validateAssetSelection
  } = useAssetSearch({ selectedAssets });

  // Busca direta (exata)
  const handleDirectSearch = async () => {
    if (!directSearchTerm.trim()) {
      toast.error('Digite um valor para buscar');
      return;
    }

    setIsDirectSearching(true);
    try {
      const asset = await searchSpecificAsset(directSearchTerm, directSearchType);
      if (asset) {
        const isValid = await validateAssetSelection(asset);
        if (isValid) {
          onAssetSelected(asset);
          setDirectSearchTerm('');
          toast.success(`${directSearchType === 'chip' ? 'CHIP' : 'Equipamento'} encontrado e adicionado!`);
        }
      }
    } finally {
      setIsDirectSearching(false);
    }
  };

  // Selecionar ativo da lista
  const handleAssetSelect = async (asset: SelectedAsset) => {
    setSelectingAssetId(asset.uuid);
    try {
      const isValid = await validateAssetSelection(asset);
      if (isValid) {
        onAssetSelected(asset);
        toast.success('Ativo adicionado com sucesso!');
      }
    } finally {
      setSelectingAssetId(null);
    }
  };

  // Atualizar filtros
  const updateFilters = (updates: Partial<AssetSearchFilters>) => {
    setFilters(prev => ({ ...prev, ...updates }));
  };

  const equipmentCount = assets.filter(asset => asset.type === 'EQUIPMENT').length;
  const chipCount = assets.filter(asset => asset.type === 'CHIP').length;

  return (
    <div className="space-y-6">
      {/* Busca Direta */}
      <Card className="border-[#4D2BFB]/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Search className="h-4 w-4" />
            Busca Direta
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Seletor de tipo */}
          <div className="space-y-2">
            <Label>Tipo de Ativo</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={directSearchType === 'equipment' ? 'default' : 'outline'}
                onClick={() => {
                  setDirectSearchType('equipment');
                  setDirectSearchTerm('');
                }}
                className="flex-1 h-12"
              >
                <Wifi className="h-4 w-4 mr-2" />
                <div className="text-left">
                  <div className="font-medium">Equipamento</div>
                  <div className="text-xs opacity-70">Por rádio</div>
                </div>
              </Button>
              <Button
                type="button"
                variant={directSearchType === 'chip' ? 'default' : 'outline'}
                onClick={() => {
                  setDirectSearchType('chip');
                  setDirectSearchTerm('');
                }}
                className="flex-1 h-12"
              >
                <Smartphone className="h-4 w-4 mr-2" />
                <div className="text-left">
                  <div className="font-medium">CHIP</div>
                  <div className="text-xs opacity-70">Por ICCID</div>
                </div>
              </Button>
            </div>
          </div>

          {/* Campo de busca direta */}
          <div className="space-y-2">
            <Label>
              {directSearchType === 'chip' ? 'ICCID do CHIP' : 'Rádio do Equipamento'}
            </Label>
            <div className="flex gap-2">
              <Input
                value={directSearchTerm}
                onChange={(e) => setDirectSearchTerm(e.target.value)}
                placeholder={
                  directSearchType === 'chip' 
                    ? 'Digite o ICCID (busca parcial)...' 
                    : 'Digite o número do rádio...'
                }
                disabled={isDirectSearching}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleDirectSearch();
                  }
                }}
                className="flex-1"
              />
              <Button
                onClick={handleDirectSearch}
                disabled={isDirectSearching || !directSearchTerm.trim()}
              >
                {isDirectSearching ? 'Buscando...' : 'Buscar'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Busca Avançada */}
      <Card className="border-[#4D2BFB]/20">
        <CardHeader className="pb-3 border-none shadow-none">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Filter className="h-4 w-4" />
              Busca Avançada
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
            >
              {showAdvancedSearch ? 'Ocultar' : 'Mostrar'}
            </Button>
          </div>
        </CardHeader>
        
        {showAdvancedSearch && (
          <CardContent className="space-y-4">
            {/* Filtros */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Filtro de tipo */}
              <div className="space-y-2">
                <Label>Tipo</Label>
                <div className="flex gap-1">
                  {[
                    { key: 'all', label: 'Todos', icon: null },
                    { key: 'equipment', label: 'Equipamentos', icon: Wifi },
                    { key: 'chip', label: 'CHIPs', icon: Smartphone }
                  ].map(({ key, label, icon: Icon }) => (
                    <Button
                      key={key}
                      variant={filters.type === key ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => updateFilters({ type: key as any })}
                      className="flex-1"
                    >
                      {Icon && <Icon className="h-3 w-3 mr-1" />}
                      {label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Campo de busca */}
              <div className="space-y-2">
                <Label>Buscar</Label>
                <Input
                  value={filters.searchTerm}
                  onChange={(e) => updateFilters({ searchTerm: e.target.value })}
                  placeholder="ICCID, rádio, serial, modelo..."
                  className="w-full"
                />
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label>Status</Label>
                <div className="flex gap-1">
                  <Button
                    variant={filters.status === 'available' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updateFilters({ status: 'available' })}
                    className="flex-1"
                  >
                    Disponíveis
                  </Button>
                  <Button
                    variant={filters.status === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updateFilters({ status: 'all' })}
                    className="flex-1"
                  >
                    Todos
                  </Button>
                </div>
              </div>
            </div>

            {/* Estatísticas */}
            <div className="flex items-center gap-4 pt-2">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                <Wifi className="h-3 w-3 mr-1" />
                {equipmentCount} Equipamentos
              </Badge>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <Smartphone className="h-3 w-3 mr-1" />
                {chipCount} CHIPs
              </Badge>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Resultados da busca avançada */}
      {showAdvancedSearch && (
        <Card className="border-[#4D2BFB]/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              Resultados ({assets.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Carregando ativos...</p>
              </div>
            ) : assets.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                {assets.map((asset) => (
                  <AssetCard
                    key={asset.uuid}
                    asset={asset}
                    mode="select"
                    onSelect={handleAssetSelect}
                    isSelecting={selectingAssetId === asset.uuid}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Nenhum ativo encontrado</p>
                <p className="text-sm">
                  Ajuste os filtros ou busque por termos específicos
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
