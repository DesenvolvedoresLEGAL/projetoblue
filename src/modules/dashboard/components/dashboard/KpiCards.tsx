
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PackageSearch, Link as LinkIcon, Users, AlertTriangle, Network, Clock, Smartphone, Wifi, Server } from "lucide-react";

interface KpiCardsProps {
  totalAssets: number;
  activeClients: number;
  assetsWithIssues: number;
}

export function KpiCards({ totalAssets, activeClients, assetsWithIssues }: KpiCardsProps) {
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
              <span>Roteadores</span>
            </div>
            <div className="flex items-center">
              <Server className="h-3 w-3 mr-1 text-[#4D2BFB]" />
              <span>Switches</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Clientes Ativos</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeClients}</div>
          <p className="text-xs text-muted-foreground mt-2">
            Clientes com dispositivos alocados
          </p>
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

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Status da Rede</CardTitle>
          <Network className="h-4 w-4 text-[#4D2BFB]" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-[#4D2BFB]">Operacional</div>
          <p className="text-xs text-muted-foreground mt-2">
            Último check: 15 minutos atrás
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
