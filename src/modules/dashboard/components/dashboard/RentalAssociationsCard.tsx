
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Users, ArrowRight } from "lucide-react";
import { useIsMobile } from '@/hooks/useIsMobile';

interface RentalAssociationsCardProps {
  totalActive: number;
  recentAssets: { name: string; type: string; clientName: string }[];
  distributionByType: { chips: number; speedys: number; equipment: number };
  isLoading?: boolean;
}

export const RentalAssociationsCard: React.FC<RentalAssociationsCardProps> = ({
  totalActive,
  recentAssets,
  distributionByType,
  isLoading = false
}) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const total = distributionByType.chips + distributionByType.speedys + distributionByType.equipment;
  const getPercentage = (value: number) => total > 0 ? (value / total) * 100 : 0;

  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-[#4D2BFB]/10 rounded-lg">
              <Users className="h-5 w-5 text-[#4D2BFB]" />
            </div>
            <div>
              <CardTitle className={`legal-title ${isMobile ? 'text-lg' : 'text-xl'}`}>
                Associações - Aluguel
              </CardTitle>
              <CardDescription className="legal-text text-sm">
                Ativos em locação ativa
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col space-y-4">
        <div className="flex-grow">
          <div className="text-3xl font-bold text-[#4D2BFB] mb-4">
            {totalActive.toLocaleString()}
          </div>

          {recentAssets.length > 0 && (
            <div className="space-y-2 mb-4">
              <h4 className="text-sm font-medium text-muted-foreground">Últimos Associados</h4>
              {recentAssets.slice(0, 3).map((asset, index) => (
                <div key={index} className="flex justify-between items-center text-sm">
                  <div className="flex flex-col">
                    <span className="font-medium truncate">{asset.name.split(' - ')[0]}</span>
                    <span className="font-medium truncate">{asset.name.split(' - ')[1]}</span>
                    <span className="text-xs text-muted-foreground">{asset.clientName}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {asset.type}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Seção de distribuição fixada no final */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">Distribuição por Tipo</h4>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">CHIPs</span>
              <span className="font-semibold text-[#4D2BFB]">{distributionByType.chips}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-[#4D2BFB] h-2 rounded-full transition-all duration-300" 
                style={{ width: `${getPercentage(distributionByType.chips)}%` }}
              ></div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">Speedys 5G</span>
              <span className="font-semibold text-[#03F9FF]">{distributionByType.speedys}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-[#03F9FF] h-2 rounded-full transition-all duration-300" 
                style={{ width: `${getPercentage(distributionByType.speedys)}%` }}
              ></div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">Equipamentos</span>
              <span className="font-semibold text-[#020CBC]">{distributionByType.equipment}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-[#020CBC] h-2 rounded-full transition-all duration-300" 
                style={{ width: `${getPercentage(distributionByType.equipment)}%` }}
              ></div>
            </div>
          </div>
        </div>

        <Button 
          onClick={() => navigate('/associations-list?type=aluguel')}
          className={`legal-button w-full ${isMobile ? 'h-12 text-base' : 'h-10'}`}
          variant="outline"
        >
          Ver todas as associações
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
};
