/* eslint-disable @typescript-eslint/no-explicit-any */
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  CheckCircle,
  FileText,
  Monitor,
  Package,
  Smartphone,
  User
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AssociationSummaryProps {
  state: any;
  dispatch: any;
}

export const AssociationSummary: React.FC<AssociationSummaryProps> = ({ state }) => {
  const [allChips, setAllChips] = useState<any[]>([]);

  // Buscar informações dos chips principais configurados
  useEffect(() => {
    const fetchChipsData = async () => {
      // Extrair IDs dos chips principais configurados
      const principalChipIds = Object.values(state.assetConfiguration)
        .map((config: any) => config?.chip_id)
        .filter(Boolean);

      if (principalChipIds.length > 0) {
        try {
          const { data, error } = await supabase
            .from('assets')
            .select(`*,
              manufacturer:manufacturers(id, name)`)
            .in('uuid', principalChipIds);

          if (!error) {
            setAllChips(data || []);
          }
        } catch (error) {
          console.error('Erro ao buscar chips:', error);
        }
      }
    };

    fetchChipsData();
  }, [state.assetConfiguration]);

  const getAssetDisplayName = (asset: any) => {
    if (asset.solution_id === 11) {
      return asset.iccid || asset.line_number || "Chip sem identificação";
    }
    return asset.radio || asset.serial_number || asset.model || "Equipamento";
  };

  const getAssetIcon = (solutionId: number) => {
    if (solutionId === 11) return <Smartphone className="h-4 w-4" />;
    return <Monitor className="h-4 w-4" />;
  };

  const equipmentAssets = state.selectedAssets.filter((asset: any) => asset.solution_id !== 11);
  const chipAssets = state.selectedAssets.filter((asset: any) => asset.solution_id === 11);

  const formatDate = (dateString: string) => {
    if (!dateString) return "Não definida";
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getAssociationTypeLabel = (typeId: number) => {
    switch (typeId) {
      case 1: return "Aluguel";
      case 2: return "Assinatura";
      default: return "Não definido";
    }
  };

  function mapPlanId(): string {
    switch (state.planId) {
      case 1: return "SPEEDY 5G LITE";
      case 2: return "SPEEDY 5G PLUS";
      case 3: return "SPEEDY 5G PRO";
      case 4: return "SPEEDY 5G ULTRA";
      case 5: return "ILIMITADO";
      case 6: return "CUSTOMIZADO";
      default: return "CUSTOMIZADO";
    }
  }

  // Função para encontrar chip principal de um equipamento
  const getPrincipalChipForEquipment = (equipmentId: string) => {
    const config = state.assetConfiguration[equipmentId];
    if (!config?.chip_id) return null;

    // Primeiro procurar nos chips carregados da API
    let chip = allChips.find(c => c.uuid === config.chip_id);
    
    // Se não encontrar, procurar nos selectedAssets (caso ainda esteja lá)
    if (!chip) {
      chip = state.selectedAssets.find((c: any) => c.uuid === config.chip_id);
    }

    return chip;
  };

  return (
    <div className="space-y-6">
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center text-green-800">
            <CheckCircle className="mr-2 h-5 w-5" />
            Resumo da Associação
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Client Information */}
          <div>
            <h3 className="flex items-center font-semibold mb-3">
              <User className="mr-2 h-4 w-4" />
              Cliente
            </h3>
            <div className="pl-6 space-y-1">
              <p className="font-medium">{state.client?.nome}</p>
              <p className="text-sm text-muted-foreground">{state.client?.empresa}</p>
              <p className="text-sm text-muted-foreground">
                Responsável: {state.client?.responsavel}
              </p>
            </div>
          </div>

          <Separator />

          {/* Assets Information */}
          <div>
            <h3 className="font-semibold mb-3">
              Ativos Selecionados
            </h3>
            
            <div className="space-y-4">
              {equipmentAssets.length > 0 && (
                <div>
                  <h4 className="flex items-center text-sm font-medium mb-2">
                    <Monitor className="mr-2 h-4 w-4" />
                    Equipamentos ({equipmentAssets.length})
                  </h4>
                  <div className="pl-6 space-y-2">
                    {equipmentAssets.map((asset) => {
                      const config = state.assetConfiguration[asset.uuid];
                      const principalChip = getPrincipalChipForEquipment(asset.uuid);
                      
                      return (
                        <div key={asset.uuid} className="p-3 bg-white border rounded">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{getAssetDisplayName(asset)}</p>
                              <Badge variant="outline" className="text-xs mt-1">
                                {asset.asset_solutions?.solution || "Equipamento"}
                              </Badge>
                            </div>
                          </div>

                          {/* Chip Principal associado */}
                          {principalChip && (
                            <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded">
                              <div className="flex items-center gap-2 mb-1">
                                <Smartphone className="h-3 w-3 text-blue-600" />
                                <span className="text-xs font-medium text-blue-800">CHIP PRINCIPAL</span>
                              </div>
                              <p className="text-sm font-medium">{getAssetDisplayName(principalChip)}</p>
                              {principalChip.line_number && (
                                <p className="text-xs text-muted-foreground">
                                  Linha: {principalChip.line_number}
                                </p>
                              )}
                              {principalChip.manufacturer?.name && (
                                <p className="text-xs text-muted-foreground">
                                  Operadora: {principalChip.manufacturer.name}
                                </p>
                              )}
                            </div>
                          )}

                          {/* Configurações do equipamento */}
                          {config && (config.ssid || config.password) && (
                            <div className="mt-2 text-sm text-muted-foreground">
                              {config.ssid && <p>SSID: {config.ssid}</p>}
                              {config.password && <p>Senha: ••••••••</p>}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {chipAssets.length > 0 && (
                <div>
                  <h4 className="flex items-center text-sm font-medium mb-2">
                    <Smartphone className="mr-2 h-4 w-4" />
                    Chips Backup ({chipAssets.length})
                  </h4>
                  <div className="pl-6 space-y-2">
                    {chipAssets.map((asset) => (
                      <div key={asset.uuid} className="p-3 bg-white border rounded">
                        <p className="font-medium">{getAssetDisplayName(asset)}</p>
                        <Badge variant="outline" className="text-xs mt-1">
                          CHIP BACKUP
                        </Badge>
                        {asset.line_number && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Linha: {asset.line_number}
                          </p>
                        )}
                        {asset.manufacturer?.name && (
                          <p className="text-sm text-muted-foreground">
                            Operadora: {asset.manufacturer.name}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Configuration */}
          <div>
            <h3 className="flex items-center font-semibold mb-3">
              <Calendar className="mr-2 h-4 w-4" />
              Configuração
            </h3>
            <div className="pl-6 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Tipo:</span>
                <span className="text-sm font-medium">
                  {getAssociationTypeLabel(state.associationType)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Data de início:</span>
                <span className="text-sm font-medium">
                  {formatDate(state.entryDate)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Data de fim:</span>
                <span className="text-sm font-medium">
                  {formatDate(state.exitDate)}
                </span>
              </div>
            </div>
          </div>

          {(state.planId || state.planGb) && (
            <>
              <Separator />
              <div>
                <h3 className="flex items-center font-semibold mb-3">
                  <Package className="mr-2 h-4 w-4" />
                  Plano
                </h3>
                <div className="pl-6 space-y-2">
                  {state.planId && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Plano:</span>
                      <span className="text-sm font-medium">Plano {mapPlanId()}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">GB:</span>
                    <span className="text-sm font-medium">{state.planGb || 0} GB</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {state.notes && (
            <>
              <Separator />
              <div>
                <h3 className="flex items-center font-semibold mb-3">
                  <FileText className="mr-2 h-4 w-4" />
                  Observações
                </h3>
                <div className="pl-6">
                  <p className="text-sm text-muted-foreground">{state.notes}</p>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};