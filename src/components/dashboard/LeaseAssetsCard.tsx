
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
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-yellow-600" />
        Ativos em Locação
      </CardTitle>
      <CardDescription>
        Ativos atualmente em locação, subdivididos por tipo
      </CardDescription>
    </CardHeader>
    <CardContent>
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-36" />
        </div>
      ) : leaseAssetsByType.total > 0 ? (
        <div className="space-y-3">
          <div className="text-2xl font-bold text-yellow-600">
            Total: {leaseAssetsByType.total}
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium">CHIPS:</span>
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-semibold">
                {leaseAssetsByType.chips}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium">SPEEDY 5G:</span>
              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-semibold">
                {leaseAssetsByType.speedys}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium">EQUIPAMENTOS:</span>
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold">
                {leaseAssetsByType.equipments}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8">
          <AlertTriangle className="h-10 w-10 text-muted-foreground/30 mb-2" />
          <p className="text-muted-foreground">Nenhum ativo em locação detectado.</p>
        </div>
      )}
    </CardContent>
    <CardFooter>
      <Link to="/assets/inventory?status=on-lease" className="w-full">
        <Button variant="outline" size="sm" className="w-full">
          Ver todos em locação
        </Button>
      </Link>
    </CardFooter>
  </Card>
);
