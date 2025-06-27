
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  PackageSearch, 
  Users, 
  AlertTriangle, 
  Network, 
  Smartphone,
  Wifi,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface KpiCardsProps {
  totalAssets: number;
  activeClients: number;
  assetsWithIssues: number;
}

export function EnhancedKpiCards({ 
  totalAssets, 
  activeClients, 
  assetsWithIssues 
}: KpiCardsProps) {
  // Additional query for chip and equipment counts
  const { data: statusTypeData, isLoading } = useQuery({
    queryKey: ['asset-status-by-type-summary'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('status_by_asset_type');
      
      if (error) throw error;
      
      // Process data to get counts for CHIPS and EQUIPAMENTOS
      const summary = {
        chips: { available: 0, unavailable: 0, total: 0 },
        equipment: { available: 0, unavailable: 0, total: 0 }
      };
      
      interface StatusTypeRow { type: string; status: string; count: number }

      data?.forEach((item: StatusTypeRow) => {
        // Detect if this is a CHIP type
        if (item.type.toLowerCase().includes('chip') || 
            item.type.toLowerCase().includes('speedy')) {
          summary.chips.total += item.count;
          if (item.status.toLowerCase() === 'disponivel' || 
              item.status.toLowerCase() === 'disponível') {
            summary.chips.available += item.count;
          } else {
            summary.chips.unavailable += item.count;
          }
        }
        // Detect if this is EQUIPMENT type
        else if (item.type.toLowerCase().includes('router') || 
                 item.type.toLowerCase().includes('4black') || 
                 item.type.toLowerCase().includes('4lite')) {
          summary.equipment.total += item.count;
          if (item.status.toLowerCase() === 'disponivel' || 
              item.status.toLowerCase() === 'disponível') {
            summary.equipment.available += item.count;
          } else {
            summary.equipment.unavailable += item.count;
          }
        }
      });
      
      return summary;
    }
  });

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Ativos</CardTitle>
          <PackageSearch className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {totalAssets}
          </div>
          <div className="mt-2 flex items-center gap-3 text-xs">
            <div className="flex items-center">
              <Smartphone className="h-3 w-3 mr-1 text-[#4D2BFB]" />
              <span>Chips</span>
            </div>
            <div className="flex items-center">
              <Wifi className="h-3 w-3 mr-1 text-[#4D2BFB]" />
              <span>Equipamentos</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">CHIPS</CardTitle>
          <Smartphone className="h-4 w-4 text-[#4D2BFB]" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-12 w-full" />
          ) : (
            <>
              <div className="text-2xl font-bold">{statusTypeData?.chips.total || 0}</div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center text-green-600">
                  <ArrowUp className="h-3 w-3 mr-1" />
                  <span>{statusTypeData?.chips.available || 0} disponíveis</span>
                </div>
                <div className="flex items-center text-amber-600">
                  <ArrowDown className="h-3 w-3 mr-1" />
                  <span>{statusTypeData?.chips.unavailable || 0} em uso</span>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">EQUIPAMENTOS</CardTitle>
          <Wifi className="h-4 w-4 text-[#4D2BFB]" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-12 w-full" />
          ) : (
            <>
              <div className="text-2xl font-bold">{statusTypeData?.equipment.total || 0}</div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center text-green-600">
                  <ArrowUp className="h-3 w-3 mr-1" />
                  <span>{statusTypeData?.equipment.available || 0} disponíveis</span>
                </div>
                <div className="flex items-center text-amber-600">
                  <ArrowDown className="h-3 w-3 mr-1" />
                  <span>{statusTypeData?.equipment.unavailable || 0} em uso</span>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card className="border-red-100 dark:border-red-900">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ativos com Problema</CardTitle>
          <AlertTriangle className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-500">{assetsWithIssues}</div>
          <p className="text-xs text-muted-foreground mt-2">
            Necessitam atenção imediata
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
