
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Users, ArrowRight } from "lucide-react";
import { useIsMobile } from '@/hooks/useIsMobile';

interface AssociationSummaryCardProps {
  totalActive: number;
  endingToday: number;
  byType: { aluguel: number; assinatura: number; outros: number };
  topClients: { name: string; count: number }[];
  isLoading?: boolean;
}

export const AssociationSummaryCard: React.FC<AssociationSummaryCardProps> = ({
  totalActive,
  endingToday,
  byType,
  topClients,
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

  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-[#03F9FF]/10 rounded-lg">
              <Users className="h-5 w-5 text-[#03F9FF]" />
            </div>
            <div>
              <CardTitle className={`legal-title ${isMobile ? 'text-lg' : 'text-xl'}`}>
                Associações
              </CardTitle>
              <CardDescription className="legal-text text-sm">
                Resumo de associações ativas
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col justify-between space-y-4">
        <div>
          <div className="text-3xl font-bold text-[#03F9FF] mb-4">
            {totalActive.toLocaleString()}
          </div>

          {endingToday > 0 && (
            <div className="mb-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-orange-800">
                  Encerram hoje
                </span>
                <Badge variant="destructive" className="bg-orange-600">
                  {endingToday}
                </Badge>
              </div>
            </div>
          )}

          <div className="space-y-3 mb-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Aluguel</span>
              <span className="font-semibold text-[#4D2BFB]">{byType.aluguel}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Assinatura</span>
              <span className="font-semibold text-[#020CBC]">{byType.assinatura}</span>
            </div>
            {byType.outros > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Outros</span>
                <span className="font-semibold text-gray-600">{byType.outros}</span>
              </div>
            )}
          </div>

          {topClients.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">Top Clientes</h4>
              {topClients.map((client, index) => (
                <div key={index} className="flex justify-between items-center text-sm">
                  <span className="truncate">{client.name}</span>
                  <Badge variant="outline">{client.count}</Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        <Button 
          onClick={() => navigate('/associations-list')}
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
