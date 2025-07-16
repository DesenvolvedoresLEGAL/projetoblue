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
import React from "react";

interface AssociationSummaryProps {
  state: any;
  dispatch: any;
}

export const AssociationSummary: React.FC<AssociationSummaryProps> = ({ state }) => {
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
              Ativos Selecionados ({state.selectedAssets.length})
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
                    Chips ({chipAssets.length})
                  </h4>
                  <div className="pl-6 space-y-2">
                    {chipAssets.map((asset) => (
                      <div key={asset.uuid} className="p-3 bg-white border rounded">
                        <p className="font-medium">{getAssetDisplayName(asset)}</p>
                        <Badge variant="outline" className="text-xs mt-1">
                          CHIP
                        </Badge>
                        {asset.line_number && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Linha: {asset.line_number}
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
}
