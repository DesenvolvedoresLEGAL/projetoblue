
import React from "react";
import { useAssets } from "@/context/useAssets";
import { Card, CardContent } from "@/components/ui/card";
import { CircleDollarSign, PackageSearch, Wifi, AlertTriangle, Clock } from "lucide-react";

export function DashboardKpis() {
  const { assets, loading } = useAssets();
  
  // Count totals
  const totalAssets = assets.length;
  const availableChips = assets.filter(asset => asset.type === "CHIP" && asset.status === "DISPONÍVEL").length;
  const availableRouters = assets.filter(asset => asset.type === "ROTEADOR" && asset.status === "DISPONÍVEL").length;
  const problemAssets = assets.filter(asset => ["BLOQUEADO", "SEM DADOS", "MANUTENÇÃO"].includes(asset.status)).length;
  
  // Check for subscription in the asset
  const expiredSubscriptions = assets.filter(asset => {
    return asset.status === "ASSINATURA" && 
           asset.subscription && 
           asset.subscription.endDate && 
           new Date(asset.subscription.endDate) < new Date();
  }).length;

  const kpis = [
    {
      title: "Total Assets",
      value: totalAssets,
      icon: <PackageSearch className="h-5 w-5 text-primary" />,
      description: "Registered in the system"
    },
    {
      title: "Available Chips",
      value: availableChips,
      icon: <Wifi className="h-5 w-5 text-cyan-500" />,
      description: "Ready to use"
    },
    {
      title: "Available Routers",
      value: availableRouters,
      icon: <Wifi className="h-5 w-5 text-blue-500" />,
      description: "Ready to deploy"
    },
    {
      title: "Problem Assets",
      value: problemAssets,
      icon: <AlertTriangle className="h-5 w-5 text-orange-500" />,
      description: "Need attention"
    },
    {
      title: "Expired Subscriptions",
      value: expiredSubscriptions,
      icon: <Clock className="h-5 w-5 text-red-500" />,
      description: "Need renewal"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {kpis.map((kpi, index) => (
        <Card key={index} className="bg-white dark:bg-gray-800">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="bg-primary/5 rounded-full p-3">
              {kpi.icon}
            </div>
            <div>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <div className="text-sm font-medium">{kpi.title}</div>
              <div className="text-xs text-muted-foreground">{kpi.description}</div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
