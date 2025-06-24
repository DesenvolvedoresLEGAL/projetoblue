
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Search, Wifi, Smartphone, Router } from "lucide-react";
import { useAssetSearch } from '@modules/associations/hooks/useAssetSearch';
import { formatPhoneForDisplay } from '@/utils/clientMappers';

interface AssetSelectionProps {
  selectedAssets: any[];
  onAssetsChange: (assets: any[]) => void;
  multipleSelection?: boolean;
  excludeAssociatedToClient?: string; // Novo prop para excluir ativos já associados
}

export const AssetSelection: React.FC<AssetSelectionProps> = ({
  selectedAssets,
  onAssetsChange,
  multipleSelection = false,
  excludeAssociatedToClient
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSolution, setSelectedSolution] = useState<string>('all');
  
  const { 
    assets, 
    solutions, 
    isLoading, 
    isError 
  } = useAssetSearch(searchTerm, selectedSolution, excludeAssociatedToClient);

  const handleAssetToggle = (asset: any) => {
    if (multipleSelection) {
      const isSelected = selectedAssets.some(a => a.uuid === asset.uuid);
      if (isSelected) {
        onAssetsChange(selectedAssets.filter(a => a.uuid !== asset.uuid));
      } else {
        onAssetsChange([...selectedAssets, asset]);
      }
    } else {
      const isSelected = selectedAssets.some(a => a.uuid === asset.uuid);
      onAssetsChange(isSelected ? [] : [asset]);
    }
  };

  const getAssetIcon = (solutionName: string) => {
    const solution = solutionName?.toLowerCase();
    if (solution?.includes('chip')) return <Smartphone className="h-4 w-4" />;
    if (solution?.includes('speedy')) return <Wifi className="h-4 w-4" />;
    return <Router className="h-4 w-4" />;
  };

  const getAssetIdentifier = (asset: any) => {
    const solutionName = asset.asset_solutions?.solution || '';
    if (solutionName.toLowerCase().includes('chip') && asset.line_number) {
      return formatPhoneForDisplay(asset.line_number.toString());
    }
    return asset.radio || asset.serial_number || asset.uuid.substring(0, 8);
  };

  const getAssetSecondaryInfo = (asset: any) => {
    const solution = asset.asset_solutions?.solution || 'Solução não encontrada';
    const status = asset.asset_status?.status || 'Status não encontrado';
    return `${solution} • ${status}`;
  };

  if (isError) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            Erro ao carregar ativos. Tente novamente.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Selecionar Ativos</CardTitle>
        <div className="space-y-4">
          {/* Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por identificador, serial, rádio..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filtro por Solução */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedSolution === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedSolution('all')}
            >
              Todos
            </Button>
            {solutions.map(solution => (
              <Button
                key={solution.id}
                variant={selectedSolution === solution.id.toString() ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedSolution(solution.id.toString())}
              >
                {solution.solution}
              </Button>
            ))}
          </div>

          {selectedAssets.length > 0 && (
            <div className="text-sm text-muted-foreground">
              {selectedAssets.length} ativo{selectedAssets.length > 1 ? 's' : ''} selecionado{selectedAssets.length > 1 ? 's' : ''}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-muted rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : assets.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-muted-foreground">
              {excludeAssociatedToClient 
                ? "Nenhum ativo disponível encontrado para este cliente"
                : "Nenhum ativo disponível encontrado"
              }
            </div>
            {searchTerm && (
              <div className="text-sm text-muted-foreground mt-2">
                Tente ajustar os filtros de busca
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {assets.map((asset) => {
              const isSelected = selectedAssets.some(a => a.uuid === asset.uuid);
              
              return (
                <div
                  key={asset.uuid}
                  className={`
                    p-3 border rounded-lg cursor-pointer transition-colors
                    ${isSelected 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50 hover:bg-muted/50'
                    }
                  `}
                  onClick={() => handleAssetToggle(asset)}
                >
                  <div className="flex items-center space-x-3">
                    <Checkbox 
                      checked={isSelected} 
                      onChange={() => handleAssetToggle(asset)}
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {getAssetIcon(asset.asset_solutions?.solution)}
                        <span className="font-medium">
                          {getAssetIdentifier(asset)}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {asset.asset_status?.status}
                        </Badge>
                      </div>
                      
                      <div className="text-sm text-muted-foreground mt-1">
                        {getAssetSecondaryInfo(asset)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
