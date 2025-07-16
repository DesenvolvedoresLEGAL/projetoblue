/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Monitor, Smartphone, Plus, Minus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface AssetSelectionStepProps {
  state: any;
  dispatch: any;
}

export const AssetSelectionStep: React.FC<AssetSelectionStepProps> = ({ state, dispatch }) => {
  const [assets, setAssets] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAvailableAssets();
  }, []);

  const fetchAvailableAssets = async () => {
    try {
      const { data, error } = await supabase
        .from('assets')
        .select(`
          *,
          asset_solutions!inner(solution),
          asset_status!inner(status)
        `)
        .or('status_id.eq.1, deleted_at.is.null')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAssets(data || []);
    } catch (error) {
      console.error("Erro ao buscar ativos:", error);
      toast.error('Erro ao carregar ativos disponíveis.');
    } finally {
      setLoading(false);
    }
  };

  const handleAssetToggle = (asset: any) => {
    const isSelected = state.selectedAssets.some((a: any) => a.uuid === asset.uuid);
    
    if (isSelected) {
      const newAssets = state.selectedAssets.filter((a: any) => a.uuid !== asset.uuid);
      dispatch({ type: 'SET_ASSETS', payload: newAssets });
    } else {
      dispatch({ type: 'SET_ASSETS', payload: [...state.selectedAssets, asset] });
    }
  };

  const getAssetIcon = (solutionId: number) => {
    if (solutionId === 11) return <Smartphone className="h-4 w-4" />;
    return <Monitor className="h-4 w-4" />;
  };

  const getAssetTypeLabel = (asset: any) => {
    if (asset.solution_id === 11) return "CHIP";
    return asset.asset_solutions?.solution || "EQUIPAMENTO";
  };

  const getAssetDisplayName = (asset: any) => {
    if (asset.solution_id === 11) {
      return asset.iccid || asset.line_number || "Chip sem identificação";
    }
    return asset.radio || asset.serial_number || asset.model || "Equipamento";
  };

  const filteredAssets = assets.filter(asset => {
    const searchLower = searchTerm.toLowerCase();
    return (
      asset.iccid?.toLowerCase().includes(searchLower) ||
      asset.radio?.toLowerCase().includes(searchLower) ||
      asset.serial_number?.toLowerCase().includes(searchLower) ||
      asset.model?.toLowerCase().includes(searchLower) ||
      asset.asset_solutions?.solution?.toLowerCase().includes(searchLower)
    );
  });

  const equipmentAssets = filteredAssets.filter(asset => asset.solution_id !== 11);
  const chipAssets = filteredAssets.filter(asset => asset.solution_id === 11);

  if (loading) {
    return <div className="text-center py-8">Carregando ativos disponíveis...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="asset-search">Buscar Ativos</Label>
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="asset-search"
            placeholder="Digite ICCID, radio, serial, modelo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {state.selectedAssets.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-blue-800">
              Ativos Selecionados ({state.selectedAssets.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {state.selectedAssets.map((asset: any) => (
                <Badge key={asset.uuid} variant="secondary" className="flex items-center gap-1">
                  {getAssetIcon(asset.solution_id)}
                  {getAssetDisplayName(asset)}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-4 w-4 p-0 ml-1"
                    onClick={() => handleAssetToggle(asset)}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Equipment Section */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Monitor className="mr-2 h-5 w-5" />
            Equipamentos ({equipmentAssets.length})
          </h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {equipmentAssets.map((asset) => {
              const isSelected = state.selectedAssets.some((a: any) => a.uuid === asset.uuid);
              return (
                <Card 
                  key={asset.uuid}
                  className={`cursor-pointer transition-colors hover:border-primary ${
                    isSelected ? 'border-primary bg-primary/5' : ''
                  }`}
                  onClick={() => handleAssetToggle(asset)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {getAssetTypeLabel(asset)}
                          </Badge>
                          {isSelected && <Plus className="h-4 w-4 text-primary" />}
                        </div>
                        <p className="font-medium">{getAssetDisplayName(asset)}</p>
                        {asset.model && (
                          <p className="text-sm text-muted-foreground">{asset.model}</p>
                        )}
                        {asset.serial_number && (
                          <p className="text-xs text-muted-foreground">SN: {asset.serial_number}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          {equipmentAssets.length === 0 && (
            <p className="text-center text-muted-foreground py-4">
              Nenhum equipamento disponível
            </p>
          )}
        </div>

        {/* Chips Section */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Smartphone className="mr-2 h-5 w-5" />
            Chips ({chipAssets.length})
          </h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {chipAssets.map((asset) => {
              const isSelected = state.selectedAssets.some((a: any) => a.uuid === asset.uuid);
              return (
                <Card 
                  key={asset.uuid}
                  className={`cursor-pointer transition-colors hover:border-primary ${
                    isSelected ? 'border-primary bg-primary/5' : ''
                  }`}
                  onClick={() => handleAssetToggle(asset)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            CHIP
                          </Badge>
                          {isSelected && <Plus className="h-4 w-4 text-primary" />}
                        </div>
                        <p className="font-medium">{asset.iccid || "Sem ICCID"}</p>
                        {asset.line_number && (
                          <p className="text-sm text-muted-foreground">
                            Linha: {asset.line_number}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          {chipAssets.length === 0 && (
            <p className="text-center text-muted-foreground py-4">
              Nenhum chip disponível
            </p>
          )}
        </div>
      </div>

      {filteredAssets.length === 0 && searchTerm && (
        <div className="text-center py-8 text-muted-foreground">
          <p>Nenhum ativo encontrado com "{searchTerm}"</p>
        </div>
      )}
    </div>
  );
};
