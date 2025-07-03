
import React from 'react';
import { EnhancedTable, EnhancedTableHeader, EnhancedTableBody, EnhancedTableRow, EnhancedTableCell } from "@/components/ui/enhanced-table";
import { Badge } from "@/components/ui/badge";
import { Trophy, Calendar } from "lucide-react";
import { RankedAsset } from '@modules/assets/hooks/useRentedAssetsRanking';
import { cn } from "@/lib/utils";
import '@/utils/stringUtils';

interface RankingTableProps {
  assets: RankedAsset[];
  className?: string;
}

export const RankingTable: React.FC<RankingTableProps> = ({ assets, className }) => {
  return (
    <div className={className}>
      <EnhancedTable>
        <EnhancedTableHeader>
          <EnhancedTableRow>
            <EnhancedTableCell isHeader>Posição</EnhancedTableCell>
            <EnhancedTableCell isHeader>Equipamento</EnhancedTableCell>
            <EnhancedTableCell isHeader>Tipo</EnhancedTableCell>
            <EnhancedTableCell isHeader>Fabricante</EnhancedTableCell>
            <EnhancedTableCell isHeader>Dias Locados</EnhancedTableCell>
            <EnhancedTableCell isHeader>Status</EnhancedTableCell>
          </EnhancedTableRow>
        </EnhancedTableHeader>
        
        <EnhancedTableBody>
          {assets.map((asset) => {
            const isHighRented = asset.rented_days >= 30;
            const identifier = asset.radio || asset.line_number?.toString() || asset.model || asset.serial_number || 'N/A';
            
            return (
              <EnhancedTableRow 
                key={asset.uuid}
                className={cn(
                  isHighRented && "bg-gradient-to-r from-[#4D2BFB]/5 to-[#03F9FF]/5"
                )}
              >
                <EnhancedTableCell>
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold",
                      isHighRented 
                        ? "bg-[#4D2BFB] text-white" 
                        : "bg-muted text-muted-foreground"
                    )}>
                      {asset.ranking_position}
                    </div>
                    {asset.ranking_position <= 3 && (
                      <Trophy className={cn(
                        "h-3 w-3",
                        asset.ranking_position === 1 ? "text-yellow-500" :
                        asset.ranking_position === 2 ? "text-gray-400" :
                        "text-amber-600"
                      )} />
                    )}
                  </div>
                </EnhancedTableCell>
                
                <EnhancedTableCell>
                  <div>
                    <span className="font-medium">{identifier}</span>
                    {asset.model && (
                      <div className="text-xs text-muted-foreground">{asset.model}</div>
                    )}
                  </div>
                </EnhancedTableCell>
                
                <EnhancedTableCell>
                  <Badge variant="outline" className="text-xs">
                    {asset.solucao.name}
                  </Badge>
                </EnhancedTableCell>
                
                <EnhancedTableCell>
                  {asset.manufacturer.name}
                </EnhancedTableCell>
                
                <EnhancedTableCell>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    <span className={cn(
                      "font-medium",
                      isHighRented ? "text-[#4D2BFB]" : "text-foreground"
                    )}>
                      {asset.rented_days}
                    </span>
                    {isHighRented && (
                      <Badge variant="default" className="bg-[#4D2BFB] hover:bg-[#4D2BFB]/90 text-xs">
                        Alto
                      </Badge>
                    )}
                  </div>
                </EnhancedTableCell>
                
                <EnhancedTableCell>
                  <Badge variant="outline" className="text-xs">
                    {asset.status.name.capitalize()}
                  </Badge>
                </EnhancedTableCell>
              </EnhancedTableRow>
            );
          })}
        </EnhancedTableBody>
      </EnhancedTable>
    </div>
  );
};
