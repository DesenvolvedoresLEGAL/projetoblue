
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Calendar, ExternalLink, Loader2 } from "lucide-react";
import { useRentedAssets } from '@modules/dashboard/hooks/useRentedAssets';
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { Badge } from '@/components/ui/badge';

interface RentedAsset {
  uuid: string;
  rented_days: number;
  model?: string;
  radio?: string;
  line_number?: number;
  serial_number?: string;
  solution: {
    id: number;
    solution: string;
  };
  status: {
    status: string;
  };
}

export const RentedAssetsCard = () => {
  const { data: rentedAssets, isLoading, error } = useRentedAssets();
  const navigate = useNavigate();

  const handleViewAll = () => {
    // Navigate to inventory with filter for rented assets
    navigate('/assets/inventory?rented_days=gt.0');
  };

  const getAssetIdentifier = (asset: RentedAsset) => {
    if (asset.radio) return asset.radio;
    if (asset.line_number) return asset.line_number.toString();
    if (asset.serial_number) return asset.serial_number;
    return asset.uuid.substring(0, 8);
  };

  const getAssetTypeDisplay = (asset: RentedAsset) => {
    if (asset.solution?.solution === 'CHIP') return 'CHIP';
    if (asset.solution?.solution === 'SPEEDY 5G') return 'Speedy 5G';
    return asset.model || asset.solution?.solution || 'Equipamento';
  };

  if (isLoading) {
    return (
      <Card className="h-full shadow-legal dark:shadow-legal-dark">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5 text-legal-primary dark:text-legal-secondary" />
            <span className="text-legal-dark dark:text-text-primary-dark">Ativos Alugados</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-40">
          <Loader2 className="h-6 w-6 animate-spin text-legal-primary dark:text-legal-secondary" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="h-full shadow-legal dark:shadow-legal-dark">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5 text-legal-primary dark:text-legal-secondary" />
            <span className="text-legal-dark dark:text-text-primary-dark">Ativos Alugados</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-40 text-muted-foreground">
          Erro ao carregar dados
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col shadow-legal dark:shadow-legal-dark hover:shadow-legal-lg dark:hover:shadow-legal-dark-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-legal-primary dark:text-legal-secondary" />
            <span className="text-legal-primary dark:text-legal-secondary font-semibold">Ranking de locação</span>
          </div>
          <Badge variant="secondary" className="bg-legal-secondary/20 text-legal-primary dark:bg-legal-secondary/30 dark:text-legal-secondary text-xs">
            {rentedAssets?.length || 0} ativos
          </Badge>
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Ranking de ativos pelo número de dias alugados
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto space-y-3">
        {!rentedAssets || rentedAssets.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nenhum ativo alugado encontrado</p>
          </div>
        ) : (
          <>
            {/* Assets List */}
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {rentedAssets.slice(0, 10).map((asset) => {
                const isOverThirtyDays = asset.rented_days > 30;
                
                return (
                  <div
                    key={asset.uuid}
                    className={cn(
                      "relative p-4 rounded-md transition-all duration-200 border h-full",
                      isOverThirtyDays 
                        ? "border-l-4 border-legal-primary bg-legal-primary/5 dark:bg-legal-primary/10 border-l-legal-primary hover:bg-legal-primary/10 dark:hover:bg-legal-primary/15" 
                        : "border-border hover:bg-muted/50 hover:border-legal-primary/30 dark:hover:border-legal-secondary/30"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm truncate text-legal-dark dark:text-text-primary-dark">
                            {getAssetIdentifier(asset)}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Status: {asset.status?.status}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={cn(
                          "text-sm font-medium transition-colors duration-200",
                          isOverThirtyDays 
                            ? "text-legal-primary dark:text-legal-secondary" 
                            : "text-foreground"
                        )}>
                          {asset.rented_days} dias
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* View All Button */}
            <div className="pt-3 border-t border-legal-primary/20 dark:border-legal-secondary/20">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleViewAll}
                className="w-full h-10 border-legal-primary text-legal-primary hover:bg-legal-primary hover:text-white dark:border-legal-secondary dark:text-legal-secondary dark:hover:bg-legal-secondary dark:hover:text-bg-primary-dark transition-all duration-200"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Ver todos os ativos alugados
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
