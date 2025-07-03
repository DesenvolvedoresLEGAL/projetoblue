
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from '@/components/ui/skeleton';
import { Smartphone, Wifi, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AssetStatusCount {
  type: string;
  status: string;
  count: number;
}

interface StatusGroups {
  [type: string]: {
    disponivel: number;
    indisponivel: number;
    problema: number;
  };
}

export function AssetStatusByTypeCard() {
  const { data, isLoading } = useQuery({
    queryKey: ['asset-status-by-type'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('status_by_asset_type');
      
      if (error) {
        if (import.meta.env.DEV) console.error("Error fetching status by type:", error);
        throw new Error(error.message);
      }
      
      return data as AssetStatusCount[];
    },
    staleTime: 60000 // 1 minute
  });

  // Process data by grouping status counts by asset type
  const statusGroups: StatusGroups = React.useMemo(() => {
    const groups: StatusGroups = {};
    
    if (!data) return groups;
    
    data.forEach(item => {
      if (!groups[item.type]) {
        groups[item.type] = {
          disponivel: 0,
          indisponivel: 0,
          problema: 0
        };
      }
      
      if (item.status.toLowerCase() === 'disponivel' || item.status.toLowerCase() === 'disponível') {
        groups[item.type].disponivel += item.count;
      } else if (item.status.toLowerCase().includes('bloqueado') || 
                item.status.toLowerCase().includes('manuten') ||
                item.status.toLowerCase().includes('sem dados')) {
        groups[item.type].problema += item.count;
      } else {
        groups[item.type].indisponivel += item.count;
      }
    });
    
    return groups;
  }, [data]);

  const chipIcon = <Smartphone className="h-5 w-5 text-blue-600" />;
  const routerIcon = <Wifi className="h-5 w-5 text-purple-600" />;
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Status por Tipo de Ativo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Find the main asset types (we're looking for CHIP and ROUTER equivalent types)
  const chipType = Object.keys(statusGroups).find(type => 
    type.toLowerCase().includes('chip') || type.toLowerCase().includes('speedy')
  );
  
  const routerType = Object.keys(statusGroups).find(type => 
    type.toLowerCase().includes('router') || type.toLowerCase().includes('4black') || 
    type.toLowerCase().includes('4lite') || type.toLowerCase().includes('4plus')
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Status por Tipo de Ativo</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* CHIPS Section */}
          {chipType && (
            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-3 mb-3">
                {chipIcon}
                <h3 className="text-lg font-semibold">CHIPS</h3>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {statusGroups[chipType].disponivel}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">Disponíveis</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-600">
                    {statusGroups[chipType].indisponivel}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">Em Uso</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {statusGroups[chipType].problema}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">Com Problema</div>
                </div>
              </div>
            </div>
          )}

          {/* EQUIPAMENTOS Section */}
          {routerType && (
            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-3 mb-3">
                {routerIcon}
                <h3 className="text-lg font-semibold">EQUIPAMENTOS</h3>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {statusGroups[routerType].disponivel}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">Disponíveis</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-600">
                    {statusGroups[routerType].indisponivel}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">Em Uso</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {statusGroups[routerType].problema}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">Com Problema</div>
                </div>
              </div>
            </div>
          )}

          {/* If there are other types, show a summary */}
          {Object.keys(statusGroups).filter(type => 
            type !== chipType && type !== routerType
          ).length > 0 && (
            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-3 mb-3">
                <AlertTriangle className="h-5 w-5 text-muted-foreground" />
                <h3 className="text-lg font-semibold">Outros Dispositivos</h3>
              </div>
              <div className="space-y-2">
                {Object.keys(statusGroups)
                  .filter(type => type !== chipType && type !== routerType)
                  .map((type, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span>{type}</span>
                      <div className="flex gap-2">
                        <Badge variant="outline" className="bg-green-50">
                          {statusGroups[type].disponivel} disponíveis
                        </Badge>
                        <Badge variant="outline" className="bg-amber-50">
                          {statusGroups[type].indisponivel} em uso
                        </Badge>
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
