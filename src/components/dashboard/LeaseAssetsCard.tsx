
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { AlertTriangle } from "lucide-react";

interface LeaseAssetsCardProps {
  leaseAssetsByType: { 
    chips: number; 
    speedys: number; 
    equipments: number; 
    total: number 
  };
  isLoading: boolean;
}

export const LeaseAssetsCard: React.FC<LeaseAssetsCardProps> = ({ 
  leaseAssetsByType, 
  isLoading 
}) => (
  <Card className="h-full flex flex-col">
    <CardHeader className="pb-2 md:pb-3">
      <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
        <AlertTriangle className="h-4 w-4 md:h-5 md:w-5 text-yellow-600" />
        <span className="text-sm sm:text-base md:text-lg">Ativos em Locação</span>
      </CardTitle>
      <CardDescription className="text-xs md:text-sm">
        Ativos atualmente em locação, subdivididos por tipo
      </CardDescription>
    </CardHeader>
    <CardContent className="flex-1">
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-6 md:h-8 w-20 md:w-24" />
          <Skeleton className="h-3 md:h-4 w-24 md:w-32" />
          <Skeleton className="h-3 md:h-4 w-20 md:w-28" />
          <Skeleton className="h-3 md:h-4 w-28 md:w-36" />
        </div>
      ) : leaseAssetsByType.total > 0 ? (
        <div className="space-y-3 md:space-y-4">
          <div className="text-xl md:text-2xl font-bold text-yellow-600">
            Total: {leaseAssetsByType.total}
          </div>
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0 text-sm">
              <span className="font-medium">CHIPS:</span>
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-semibold w-fit">
                {leaseAssetsByType.chips}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0 text-sm">
              <span className="font-medium">SPEEDY 5G:</span>
              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-semibold w-fit">
                {leaseAssetsByType.speedys}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0 text-sm">
              <span className="font-medium">EQUIPAMENTOS:</span>
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold w-fit">
                {leaseAssetsByType.equipments}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-6 md:py-8">
          <AlertTriangle className="h-8 w-8 md:h-10 md:w-10 text-muted-foreground/30 mb-2" />
          <p className="text-xs md:text-sm text-muted-foreground text-center px-4">
            Nenhum ativo em locação detectado.
          </p>
        </div>
      )}
    </CardContent>
    <CardFooter className="mt-auto">
      <Link to="/assets/inventory?status=on-lease" className="w-full">
        <Button variant="outline" size="sm" className="w-full text-xs md:text-sm h-8 md:h-9">
          Ver todos em locação
        </Button>
      </Link>
    </CardFooter>
  </Card>
);
