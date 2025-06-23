
import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Calendar, Hash } from "lucide-react";
import { RankedAsset } from '@modules/assets/hooks/useRentedAssetsRanking';
import { cn } from "@/lib/utils";

interface RankingCardProps {
  asset: RankedAsset;
  className?: string;
}

export const RankingCard: React.FC<RankingCardProps> = ({ asset, className }) => {
  const isHighRented = asset.rented_days >= 30;
  const identifier = asset.radio || asset.line_number?.toString() || asset.model || asset.serial_number || 'N/A';

  return (
    <Card className={cn(
      "transition-all duration-200 hover:shadow-md",
      isHighRented && "ring-2 ring-[#4D2BFB]/30 bg-gradient-to-r from-[#4D2BFB]/5 to-[#03F9FF]/5",
      className
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn(
              "flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold",
              isHighRented 
                ? "bg-[#4D2BFB] text-white" 
                : "bg-muted text-muted-foreground"
            )}>
              {asset.ranking_position}
            </div>
            {asset.ranking_position <= 3 && (
              <Trophy className={cn(
                "h-4 w-4",
                asset.ranking_position === 1 ? "text-yellow-500" :
                asset.ranking_position === 2 ? "text-gray-400" :
                "text-amber-600"
              )} />
            )}
          </div>
          {isHighRented && (
            <Badge variant="default" className="bg-[#4D2BFB] hover:bg-[#4D2BFB]/90">
              Alto Rendimento
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div>
          <h3 className="font-semibold text-lg text-foreground">
            {identifier}
          </h3>
          <p className="text-sm text-muted-foreground">
            {asset.solucao.name} • {asset.manufacturer.name}
          </p>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className={cn(
              "font-medium",
              isHighRented ? "text-[#4D2BFB]" : "text-foreground"
            )}>
              {asset.rented_days} dias
            </span>
          </div>
          
          <Badge variant="outline" className="text-xs">
            {asset.status.name}
          </Badge>
        </div>

        {asset.model && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Hash className="h-3 w-3" />
            <span>{asset.model}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
