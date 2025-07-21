/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar, Settings, Plus, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

interface ConfigurationStepProps {
  state: any;
  dispatch: any;
}

interface Chip {
  id: string;
  number: string;
  status: string;
}

export const ConfigurationStep: React.FC<ConfigurationStepProps> = ({ state, dispatch }) => {
  const [associationTypes, setAssociationTypes] = useState<any[]>([]);
  const [solutions, setSolutions] = useState<any[]>([]);
  const [availableChips, setAvailableChips] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchAssociationTypes();
    fetchSolutions().then(setSolutions);
    fetchAvailableChips().then(setAvailableChips);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAssociationTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('association_types')
        .select('*')
        .is('deleted_at', null)
        .order('id');

      if (error) throw error;
      setAssociationTypes(data || []);
    } catch (error) {
     
      return error;
    }
  };

  const fetchSolutions = async () => {
    try {
      const { data, error } = await supabase
        .from('asset_solutions')
        .select('*')
        .in('id', [1, 2, 3])
        .is('deleted_at', null);

      if (error) throw error;
      return data || [];
    } catch (error) {
     
      return [];
    }
  };

  const fetchAvailableChips = async () => {
    try {
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .eq('solution_id', 11)
        .eq('status_id', 1)
        .is('deleted_at', null)
        .not('uuid', 'in', `(${state.selectedAssets.map((asset: any) => `'${asset.uuid}'`).join(',')})`);

      if (error) throw error;
      return data || [];
    } catch (error) {
     
      return [];
    }
  };

  const handleDateChange = (field: 'entryDate' | 'exitDate', value: string) => {
    dispatch({
      type: 'SET_DATES',
      payload: {
        ...state,
        [field]: value
      }
    });
  };

  const handleAssociationTypeChange = (value: string) => {
    dispatch({ type: 'SET_ASSOCIATION_TYPE', payload: parseInt(value) });
  };

  const handleAssetConfig = (assetId: string, field: string, value: string) => {
    const currentConfig = state.assetConfiguration[assetId] || {};
    dispatch({
      type: 'SET_ASSET_CONFIG',
      payload: {
        assetId,
        config: {
          ...currentConfig,
          [field]: value
        }
      }
    });
  };

  const handleChipSelect = (assetId: string, chipId: string) => {
    const currentChip = state.assetConfiguration[assetId]?.chip_id;
    const newChipId = currentChip === chipId ? '' : chipId;
    handleAssetConfig(assetId, 'chip_id', newChipId);

    // If a chip is being set as the main chip and it exists in the
    // selectedAssets list, remove it to avoid duplicates
    if (newChipId && state.selectedAssets.some((a: any) => a.uuid === chipId)) {
      const newAssets = state.selectedAssets.filter((a: any) => a.uuid !== chipId);
      dispatch({ type: 'SET_ASSETS', payload: newAssets });
    }
  };

  const filteredAssets = availableChips.filter(chip => {
    const searchLower = searchTerm.toLowerCase();
    return (
      chip.iccid?.toLowerCase().includes(searchLower) ||
      chip.line_number?.toString().toLowerCase().includes(searchLower) ||
      chip.asset_solutions?.solution?.toLowerCase().includes(searchLower)
    );
  });

  const equipmentAssets = state.selectedAssets.filter((asset: any) => asset.solution_id !== 11);
  const assetsWithSpecificSolutions = state.selectedAssets.filter((asset: any) => [1, 4, 2].includes(asset.solution_id));
  const chipAssets = filteredAssets.filter(asset => asset.solution_id === 11);

  return (
    <div className="space-y-6">
      {/* Date Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="mr-2 h-5 w-5" />
            Período da Associação
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="entry-date">Data de Início *</Label>
              <Input
                id="entry-date"
                type="date"
                value={state.entryDate}
                onChange={(e) => handleDateChange('entryDate', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="exit-date">Data de Fim (opcional)</Label>
              <Input
                id="exit-date"
                type="date"
                value={state.exitDate || ''}
                onChange={(e) => handleDateChange('exitDate', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Association Type */}
      <Card>
        <CardHeader>
          <CardTitle>Tipo de Associação</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={state.associationType?.toString()}
            onValueChange={handleAssociationTypeChange}
          >
            {associationTypes.map((type) => (
              <div key={type.id} className="flex items-center space-x-2">
                <RadioGroupItem value={type.id.toString()} id={`type-${type.id}`} />
                <Label htmlFor={`type-${type.id}`} className="capitalize">
                  {type.type}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Equipment Configuration */}
      {equipmentAssets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="mr-2 h-5 w-5" />
              Configuração de Equipamentos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {equipmentAssets.map((asset: any) => {
              const config = state.assetConfiguration[asset.uuid] || {};

              return (
                <div key={asset.uuid} className="p-4 border rounded-lg space-y-3">
                  <h4 className="font-medium">
                    {asset.radio || asset.serial_number || asset.model || "Equipamento"}
                  </h4>

                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <Label htmlFor={`ssid-${asset.uuid}`}>SSID da Rede</Label>
                      <Input
                        id={`ssid-${asset.uuid}`}
                        placeholder="Nome da rede WiFi"
                        value={config.ssid || ''}
                        onChange={(e) => handleAssetConfig(asset.uuid, 'ssid', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`password-${asset.uuid}`}>Senha da Rede</Label>
                      <Input
                        id={`password-${asset.uuid}`}
                        type="password"
                        placeholder="Senha da rede WiFi"
                        value={config.password || ''}
                        onChange={(e) => handleAssetConfig(asset.uuid, 'password', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Main Chip Configuration */}
      {assetsWithSpecificSolutions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="mr-2 h-5 w-5" />
              Configuração de Chip Principal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="asset-search">Buscar Ativos</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="asset-search"
                  placeholder="Digite ICCID ou número da linha..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {assetsWithSpecificSolutions.map((asset: any) => {
              const config = state.assetConfiguration[asset.uuid] || {};

              return (
                <div key={asset.uuid} className="p-4 border rounded-lg space-y-3">
                  <h4 className="font-medium">
                    {asset.radio || asset.serial_number || asset.model || 'Equipamento'}
                  </h4>
                  <div className="space-y-3">
                    <Label>Chip Principal</Label>
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {chipAssets
                        .filter(chip => {
                          // chip selecionado em algum equipamento?
                          const selectedIn = Object.entries(state.assetConfiguration)
                            .find(([assetId, config]: [string, { chip_id?: string }]) => config?.chip_id === chip.uuid);

                          // chip não foi selecionado OU está selecionado neste próprio asset
                          return !selectedIn || selectedIn[0] === asset.uuid;
                        })
                        .map((chip) => {
                          const isSelected = config.chip_id === chip.uuid;
                          return (
                            <Card
                              key={chip.uuid}
                              className={`cursor-pointer transition-colors hover:border-primary ${isSelected ? 'border-primary bg-primary/5' : ''
                                }`}
                              onClick={() => handleChipSelect(asset.uuid, chip.uuid)}
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
                                    <p className="font-medium">{chip.iccid || 'Sem ICCID'}</p>
                                    {chip.line_number && (
                                      <p className="text-sm text-muted-foreground">
                                        Linha: {chip.line_number}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      {chipAssets.length === 0 && (
                        <p className="text-center text-muted-foreground py-4">Nenhum chip disponível</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
