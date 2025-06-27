
import React from "react";
import { useAssets } from "@/context/AssetContext";
import type { Asset } from '@/types/asset';
import { Card, CardContent } from "@/components/ui/card";
import { Wifi, AlertTriangle, Clock, PackageSearch } from "lucide-react";
import { SOLUTION_IDS, isSameStatus } from "@/utils/assetUtils";

export function DashboardKpis() {
  const { assets, loading } = useAssets();
  
  // Calculate KPIs using standardized type checking
  const totalAssets = assets.length;
  
  const availableChips = assets.filter((a: Asset) =>
    (a.solution_id === SOLUTION_IDS.CHIP || a.type === 'CHIP') &&
    isSameStatus(a.status, 'DISPONÍVEL')
  ).length;
  
  const availableRouters = assets.filter((a: Asset) =>
    a.solution_id !== SOLUTION_IDS.CHIP &&
    a.type === 'ROTEADOR' &&
    isSameStatus(a.status, 'DISPONÍVEL')
  ).length;
  
  const problemAssets = assets.filter(a => 
    ['BLOQUEADO', 'MANUTENÇÃO', 'SEM DADOS'].some(status => 
      isSameStatus(a.status, status)
    )
  ).length;
  
  const expiredSubscriptions = assets.filter(a => 
    a.subscription?.isExpired || 
    (a.subscription?.endDate && new Date(a.subscription.endDate) < new Date())
  ).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <KpiCard
        title="Total Assets"
        value={totalAssets}
        icon={<PackageSearch className="h-6 w-6 text-telecom-600" />}
      />
      <KpiCard
        title="Available Chips"
        value={availableChips}
        icon={<Wifi className="h-6 w-6 text-green-600" />}
      />
      <KpiCard
        title="Available Routers"
        value={availableRouters}
        icon={<Wifi className="h-6 w-6 text-blue-600" />}
      />
      <KpiCard
        title="Problem Assets"
        value={problemAssets}
        icon={<AlertTriangle className="h-6 w-6 text-amber-600" />}
      />
      <KpiCard
        title="Expired Subscriptions"
        value={expiredSubscriptions}
        icon={<Clock className="h-6 w-6 text-red-600" />}
      />
    </div>
  );
}

interface KpiCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
}

function KpiCard({ title, value, icon }: KpiCardProps) {
  return (
    <Card className="rounded-2xl shadow-md border">
      <CardContent className="flex flex-col items-center justify-center p-6">
        <div className="mb-2">
          {icon}
        </div>
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-sm text-muted-foreground">{title}</div>
      </CardContent>
    </Card>
  );
}
