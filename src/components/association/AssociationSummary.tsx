
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, User, Calendar, FileText } from "lucide-react";
import { SelectedAsset } from '@/pages/AssetAssociation';

interface Client {
  uuid: string;
  nome: string;
  cnpj: string;
  contato: number;
  email?: string;
}

interface AssociationSummaryProps {
  selectedClient: Client | null;
  selectedAssets: SelectedAsset[];
  onConfirm: () => void;
  isLoading?: boolean;
}

export const AssociationSummary: React.FC<AssociationSummaryProps> = ({
  selectedClient,
  selectedAssets,
  onConfirm,
  isLoading = false
}) => {
  if (!selectedClient || selectedAssets.length === 0) {
    return null;
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Data não definida';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const getAssetDisplayName = (asset: SelectedAsset) => {
    if (asset.asset_solution_name?.toUpperCase() === 'CHIP' || asset.solution_id === 11) {
      return asset.line_number?.toString() || asset.iccid || 'CHIP sem identificação';
    }
    return asset.radio || 'Equipamento sem identificação';
  };

  return (
    <Card className="border-[#4D2BFB]/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <CheckCircle2 className="h-5 w-5 text-[#03F9FF]" />
          Resumo da Associação
        </CardTitle>
        <CardDescription>
          Confirme os dados antes de finalizar a associação
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Informações do Cliente */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-[#03F9FF]" />
            <h3 className="font-semibold text-[#020CBC]">Cliente Selecionado</h3>
          </div>
          <div className="bg-[#4D2BFB]/5 rounded-lg p-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Nome:</span>
                <span className="font-medium">{selectedClient.nome}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">CNPJ:</span>
                <span className="font-medium">{selectedClient.cnpj}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Contato:</span>
                <span className="font-medium">{selectedClient.contato}</span>
              </div>
              {selectedClient.email && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Email:</span>
                  <span className="font-medium">{selectedClient.email}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <Separator />

        {/* Ativos Selecionados */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-[#03F9FF]" />
            <h3 className="font-semibold text-[#020CBC]">
              Ativos Selecionados ({selectedAssets.length})
            </h3>
          </div>
          <div className="space-y-3">
            {selectedAssets.map((asset, index) => (
              <div key={asset.uuid} className="bg-[#4D2BFB]/5 rounded-lg p-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-[#020CBC]">
                      {getAssetDisplayName(asset)}
                    </span>
                    <Badge variant="secondary" className="bg-[#03F9FF]/20 text-[#020CBC]">
                      {asset.asset_solution_name || 'N/A'}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Tipo:</span>
                      <div className="font-medium">{asset.associationType || 'ALUGUEL'}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Data de Início:</span>
                      <div className="font-medium">{formatDate(asset.startDate)}</div>
                    </div>
                  </div>
                  {asset.notes && (
                    <div className="pt-2">
                      <div className="flex items-center gap-1 mb-1">
                        <FileText className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Observações:</span>
                      </div>
                      <div className="text-sm bg-white/50 rounded p-2 border">
                        {asset.notes}
                      </div>
                    </div>
                  )}
                  {/* Mostrar SSID e senha para equipamentos */}
                  {asset.ssid && (
                    <div className="pt-2">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">SSID:</span>
                          <div className="font-medium">{asset.ssid}</div>
                        </div>
                        {asset.pass && (
                          <div>
                            <span className="text-muted-foreground">Senha:</span>
                            <div className="font-medium">••••••••</div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Botão de Confirmação */}
        <div className="pt-4">
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="w-full bg-[#4D2BFB] hover:bg-[#3a1ecc] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Criando Associações...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Confirmar e Criar Associações
              </>
            )}
          </button>
        </div>
      </CardContent>
    </Card>
  );
};
