
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, ArrowRight } from "lucide-react";
import { useAssetAssociationState } from '@modules/assets/hooks/useAssetAssociationState';
import { UnifiedAssetSearch } from './UnifiedAssetSearch';
import { SelectedAsset } from '@modules/associations/types';

export const AssetSelectionStep: React.FC = () => {
  const { 
    selectedClient, 
    selectedAssets, 
    setSelectedAssets, 
    setCurrentStep 
  } = useAssetAssociationState();

  const handleAssetSelected = (asset: SelectedAsset) => {
    console.log('AssetSelectionStep: Ativo selecionado', asset.uuid);
    
    // Verificar se o ativo já foi selecionado
    const alreadySelected = selectedAssets.some(a => a.uuid === asset.uuid);
    if (alreadySelected) {
      console.log('AssetSelectionStep: Ativo já selecionado, ignorando');
      return;
    }

    // Adicionar ativo à lista de selecionados
    const updatedAssets = [...selectedAssets, asset];
    setSelectedAssets(updatedAssets);
    console.log('AssetSelectionStep: Ativos selecionados atualizados', updatedAssets.length);
  };

  const handleAssetRemoved = (assetId: string) => {
    console.log('AssetSelectionStep: Removendo ativo', assetId);
    const updatedAssets = selectedAssets.filter(a => a.uuid !== assetId);
    setSelectedAssets(updatedAssets);
  };

  const canProceed = selectedAssets.length > 0;

  return (
    <div className="space-y-6">
      {/* Selected Client Info */}
      {selectedClient && (
        <Card className="border-[#03F9FF]/30 bg-[#03F9FF]/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-[#03F9FF]/10 text-[#020CBC] border-[#03F9FF]">
                Cliente Selecionado
              </Badge>
              <span className="font-medium text-[#020CBC]">{selectedClient.nome}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Selected Assets Summary */}
      {selectedAssets.length > 0 && (
        <Card className="border-[#4D2BFB]/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-[#020CBC] flex items-center gap-2">
              <Package className="h-4 w-4 text-[#03F9FF]" />
              Ativos Selecionados ({selectedAssets.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 max-h-32 overflow-y-auto">
              {selectedAssets.map((asset) => (
                <div key={asset.uuid} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    <Badge variant={asset.type === 'CHIP' ? 'default' : 'secondary'}>
                      {asset.type}
                    </Badge>
                    <span className="text-sm font-medium">
                      {asset.type === 'CHIP' 
                        ? (asset.line_number || asset.iccid) 
                        : (asset.radio || asset.serial_number)
                      }
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleAssetRemoved(asset.uuid)}
                    className="text-red-600 hover:bg-red-50 h-6 px-2"
                  >
                    ×
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Asset Search */}
      <Card className="border-[#4D2BFB]/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-[#020CBC]">Buscar e Selecionar Ativos</CardTitle>
        </CardHeader>
        <CardContent>
          <UnifiedAssetSearch
            selectedAssets={selectedAssets}
            onAssetSelected={handleAssetSelected}
            excludeAssociatedToClient={selectedClient?.uuid}
          />
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button
          variant="outline"
          onClick={() => setCurrentStep('client')}
          className="border-[#4D2BFB] text-[#4D2BFB] hover:bg-[#4D2BFB]/10"
        >
          Voltar
        </Button>
        
        <Button
          onClick={() => setCurrentStep('summary')}
          disabled={!canProceed}
          className="bg-[#4D2BFB] hover:bg-[#4D2BFB]/90 disabled:opacity-50"
        >
          Continuar para Resumo
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {!canProceed && (
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Selecione pelo menos um ativo para continuar
          </p>
        </div>
      )}
    </div>
  );
};
