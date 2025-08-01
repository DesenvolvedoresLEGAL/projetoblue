/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar, Settings, Plus, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface ConfigurationStepProps {
  state: any;
  dispatch: any;
}

export const ConfigurationStep: React.FC<ConfigurationStepProps> = ({ state, dispatch }) => {
  const [associationTypes, setAssociationTypes] = useState<any[]>([]);
  const [solutions, setSolutions] = useState<any[]>([]);
  const [availableChips, setAvailableChips] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [principalChip, setPincipalChip] = useState<any>(null);

  // Limpar associationType na primeira carga e mostrar toast
  useEffect(() => {
    dispatch({ type: 'SET_ASSOCIATION_TYPE', payload: null });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Correção 1: Dependency array correta
  useEffect(() => {
    fetchAssociationTypes();
    fetchSolutions().then(setSolutions);
    fetchAvailableChips().then(setAvailableChips);
  }, [state.selectedAssets]); // ✅ Agora atualiza quando selectedAssets muda

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

  // Correção 2: Buscar TODOS os chips disponíveis, não apenas os selecionados
  const fetchAvailableChips = async () => {
    try {
      const { data, error } = await supabase
        .from('assets')
        .select(`*,
          manufacturer:manufacturers(id, name)`)
        .eq('solution_id', 11)
        .eq('status_id', 1)
        .is('deleted_at', null);
        // ✅ Removido o filtro .in() para buscar todos os chips disponíveis

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

    // Calcular o novo estado de selectedAssets de uma só vez
    let newSelectedAssets = [...state.selectedAssets];

    // 1. Se havia um chip anterior, restaurá-lo à lista (se não estiver já)
    if (currentChip && currentChip !== newChipId) {
      const chipToRestore = availableChips.find(chip => chip.uuid === currentChip);
      
      if (chipToRestore && !newSelectedAssets.some((a: any) => a.uuid === currentChip)) {
        newSelectedAssets.push(chipToRestore);
      }
    }

    // 2. Se está selecionando um novo chip, removê-lo da lista
    if (newChipId) {
      newSelectedAssets = newSelectedAssets.filter((a: any) => a.uuid !== chipId);
    }

    // Dispatch uma única vez com o estado final
    dispatch({ type: 'SET_ASSETS', payload: newSelectedAssets });
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
  
  // Correção 3: Filtrar apenas chips que estão em selectedAssets ou disponíveis
  const chipAssets = filteredAssets.filter(asset => 
    asset.solution_id === 11 && 
    state.selectedAssets.some((selected: any) => selected.uuid === asset.uuid)
  );

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
          <CardTitle>Tipo de Associação *</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={state.associationType?.toString() || ''}
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
          {state.associationType === null && (
            <p className="text-sm text-red-500 mt-2">
              Por favor, selecione um tipo de associação.
            </p>
          )}
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

                  {/* Badge para chip selecionado */}
                  {config.chip_id && (
                    <div className="mb-3">
                      <Badge variant="default" className="bg-green-100 text-green-800 border-green-300">
                        Chip Selecionado: {
                          availableChips.find(chip => chip.uuid === config.chip_id)?.iccid || config.chip_id
                        } | Operadora: {
                          availableChips.find(chip => chip.uuid === config.chip_id)?.manufacturer?.name || 'N/A'
                        }
                      </Badge>
                    </div>
                  )}

                  <div className="space-y-3">
                    <Label>Chip Principal</Label>
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {availableChips
                        .filter(chip => {
                          // Mostrar apenas chips que:
                          // 1. São do tipo chip (solution_id === 11)
                          // 2. Estão nos selectedAssets OU estão selecionados neste equipamento
                          if (chip.solution_id !== 11) return false;
                          
                          const isInSelectedAssets = state.selectedAssets.some((a: any) => a.uuid === chip.uuid);
                          const isSelectedForThisAsset = config.chip_id === chip.uuid;
                          
                          return isInSelectedAssets || isSelectedForThisAsset;
                        })
                        .filter(chip => {
                          // Aplicar filtro de busca
                          const searchLower = searchTerm.toLowerCase();
                          return (
                            chip.iccid?.toLowerCase().includes(searchLower) ||
                            chip.line_number?.toString().toLowerCase().includes(searchLower)
                          );
                        })
                        .filter(chip => {
                          // Não mostrar chips já selecionados em outros equipamentos
                          const selectedIn = Object.entries(state.assetConfiguration)
                            .find(([assetId, config]: [string, { chip_id?: string }]) => 
                              config?.chip_id === chip.uuid && assetId !== asset.uuid
                            );
                          return !selectedIn;
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
                                    {chip.manufacturer?.name && (
                                      <p className="text-sm text-muted-foreground">
                                        {chip.manufacturer.name}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      {availableChips.filter(chip => chip.solution_id === 11).length === 0 && (
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