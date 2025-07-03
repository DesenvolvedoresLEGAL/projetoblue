
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, TrendingUp, Clock, Target } from "lucide-react";
import { RankedAsset } from '@modules/assets/hooks/useRentedAssetsRanking';

interface RankingMetricsProps {
  assets: RankedAsset[];
}

export const RankingMetrics: React.FC<RankingMetricsProps> = ({ assets }) => {
  const totalAssets = assets.length;
  const lastAssetsArrayIndex = assets.length -1;
  const highRentedAssets = assets.filter(asset => asset.rented_days >= 30).length;
  const lessRentedAsset: RankedAsset = assets.sort(a =>  a.rented_days)[lastAssetsArrayIndex] || null;
  const moreRentedAsset: RankedAsset = assets.sort(a =>  a.rented_days)[0] || null;
  const topRentedDays = assets.length > 0 ? assets[0]?.rented_days || 0 : 0;

  if (import.meta.env.DEV) console.log(`[DEBUG] ASSET MENOS ALUGADO -->>${lessRentedAsset}`);

  const metrics = [
    {
      title: "Total de Equipamentos",
      value: totalAssets,
      icon: Trophy,
      description: "Speedys 5G e equipamentos no ranking"
    },
    {
      title: "Alto Rendimento",
      value: highRentedAssets,
      icon: TrendingUp,
      description: "Equipamentos com ≥ 30 dias locados",
      highlight: highRentedAssets > 0
    },
    {
      title: "Ativo menos alugado",
      value: lessRentedAsset?.radio,
      icon: Clock,
      description: `Em locação durante ${lessRentedAsset?.rented_days} dias` 
    },
    {
      title: "Líder do Ranking",
      value: moreRentedAsset?.radio,
      icon: Target,
      description: `Em locação durante ${moreRentedAsset?.rented_days} dias` ,
      highlight: topRentedDays >= 30
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {metrics.map((metric, index) => (
        <Card key={index} className={
          metric.highlight 
            ? "border-[#4D2BFB]/30 bg-gradient-to-r from-[#4D2BFB]/5 to-[#03F9FF]/5" 
            : ""
        }>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <metric.icon 
                className={`h-4 w-4 ${
                  metric.highlight ? "text-[#4D2BFB]" : "text-muted-foreground"
                }`} 
              />
              {metric.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              metric.highlight ? "text-[#4D2BFB]" : "text-foreground"
            }`}>
              {metric.value}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {metric.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
