
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Package, ExternalLink } from "lucide-react";
import { AssetWithRelations } from "@/types/assetWithRelations";
import { StandardStatusBadge } from "@/components/ui/standard-status-badge";

interface RentedAssetsCardProps {
  assets?: AssetWithRelations[];
  isLoading?: boolean;
}

export function RentedAssetsCard({ assets = [], isLoading }: RentedAssetsCardProps) {
  // Filter rented assets (status_id = 2 typically means rented/allocated)
  const rentedAssets = assets.filter(asset => 
    asset.status_id === 2 || 
    asset.status?.name?.toLowerCase().includes('alocado') ||
    asset.status?.name?.toLowerCase().includes('locação')
  );

  const processedAssets = rentedAssets.map(asset => {
    const chipCount = asset.solucao?.name === 'CHIP' ? 1 : 0;
    const speedyCount = asset.solucao?.name === 'SPEEDY 5G' ? 1 : 0;
    const equipmentCount = !chipCount && !speedyCount ? 1 : 0;

    return {
      ...asset,
      identifier: asset.radio || 
                 asset.line_number?.toString() || 
                 asset.serial_number || 
                 asset.iccid || 
                 'N/A',
      type: asset.solucao?.name || 'Unknown',
      chipCount,
      speedyCount,
      equipmentCount
    };
  });

  const totalChips = processedAssets.reduce((sum, asset) => sum + asset.chipCount, 0);
  const totalSpeedys = processedAssets.reduce((sum, asset) => sum + asset.speedyCount, 0);
  const totalEquipments = processedAssets.reduce((sum, asset) => sum + asset.equipmentCount, 0);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Ativos Alugados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Carregando ativos alugados...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Ativos Alugados ({rentedAssets.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-primary">{totalChips}</div>
            <div className="text-sm text-muted-foreground">Chips</div>
          </div>
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-primary">{totalSpeedys}</div>
            <div className="text-sm text-muted-foreground">Speedys</div>
          </div>
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-primary">{totalEquipments}</div>
            <div className="text-sm text-muted-foreground">Equipamentos</div>
          </div>
        </div>

        {/* Asset List */}
        <ScrollArea className="h-48">
          <div className="space-y-2">
            {processedAssets.length > 0 ? (
              processedAssets.map((asset) => (
                <div key={asset.uuid} className="flex items-center justify-between p-2 rounded border">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {asset.identifier}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {asset.type}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StandardStatusBadge 
                      status={asset.status?.name || 'Unknown'}
                      variant="secondary"
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum ativo alugado no momento
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Action Button */}
        <div className="mt-4">
          <Button variant="outline" size="sm" className="w-full">
            <ExternalLink className="h-4 w-4 mr-2" />
            Ver Todos os Alugados
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
