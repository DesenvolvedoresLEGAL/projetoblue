import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAssets } from "@/context/useAssets";
import { PackageSearch, Cpu, BarChart3, UserCog } from "lucide-react";

export function DashboardKpis() {
  const { assets } = useAssets();

  const totalAssets = assets.length;
  const availableAssets = assets.filter((asset) => asset.status === "DISPONÍVEL").length;
  const rentedAssets = assets.filter((asset) => asset.status === "ALUGADO").length;
  const underMaintenanceAssets = assets.filter((asset) => asset.status === "MANUTENÇÃO").length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PackageSearch className="h-4 w-4" />
            Total de Ativos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalAssets}</div>
          <p className="text-sm text-muted-foreground">
            Número total de ativos cadastrados
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cpu className="h-4 w-4" />
            Disponíveis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{availableAssets}</div>
          <p className="text-sm text-muted-foreground">
            Ativos prontos para alocação
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Alugados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{rentedAssets}</div>
          <p className="text-sm text-muted-foreground">
            Ativos alocados a clientes
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCog className="h-4 w-4" />
            Em Manutenção
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{underMaintenanceAssets}</div>
          <p className="text-sm text-muted-foreground">
            Ativos em manutenção ou reparo
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
