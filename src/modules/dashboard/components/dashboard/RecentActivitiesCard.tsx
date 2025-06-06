
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, ExternalLink } from "lucide-react";
import { useIsMobile } from '@/hooks/useIsMobile';
import { capitalize } from '@/utils/stringUtils';
import { useNavigate } from 'react-router-dom';

interface RecentActivity {
  id: number;
  type: 'asset_created' | 'association_created' | 'association_ended' | 'status_updated';
  description: string;
  assetName?: string;
  clientName?: string;
  timestamp: string;
  details?: any;
}

interface RecentActivitiesCardProps {
  activities: RecentActivity[];
  isLoading?: boolean;
}

export const RecentActivitiesCard: React.FC<RecentActivitiesCardProps> = ({
  activities,
  isLoading = false
}) => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const getAssetTypeBadge = (description: string, details?: any): string => {
    // Usar detalhes da solução se disponível
    if (details?.solution) {
      const solution = details.solution.toLowerCase();
      if (solution.includes('chip') || solution.includes('simcard')) {
        return 'CHIP';
      } else if (solution.includes('speedy') || solution.includes('5g')) {
        return 'SPEEDY 5G';
      } else {
        return 'EQUIPAMENTO';
      }
    }
    
    // Fallback para descrição
    if (description.includes('CHIP') || description.includes('chip')) {
      return 'CHIP';
    }
    if (description.includes('SPEEDY') || description.includes('speedy')) {
      return 'SPEEDY 5G';
    }
    if (description.includes('equipamento') || description.includes('EQUIPAMENTO')) {
      return 'EQUIPAMENTO';
    }
    return 'ATIVO';
  };

  const getStatusBadge = (details?: any): string => {
    if (details?.new_status?.status) {
      return details.new_status.status;
    }
    if (details?.status_after) {
      return details.status_after;
    }
    return 'disponível';
  };

  const getEventTypeBadge = (type: string): string => {
    switch (type) {
      case 'asset_created':
        return 'ASSET CRIADO';
      case 'association_created':
        return 'ASSOCIAÇÃO CRIADA';
      case 'association_ended':
        return 'ASSOCIAÇÃO REMOVIDA';
      case 'status_updated':
        return 'STATUS ATUALIZADO';
      default:
        return 'EVENTO';
    }
  };

  const formatTimestamp = (timestamp: string): string => {
    try {
      if (!timestamp || timestamp === 'undefined' || timestamp === 'null') {
        return 'Data não disponível';
      }

      const date = new Date(timestamp);
      
      if (isNaN(date.getTime())) {
        console.warn('Invalid timestamp:', timestamp);
        return 'Data inválida';
      }

      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting timestamp:', error, 'Input:', timestamp);
      return 'Erro na data';
    }
  };

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="p-4 bg-gray-50 rounded-lg">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-[#4D2BFB]" />
            <span className="text-[#4D2BFB] font-semibold">Atividades Recentes</span>
          </div>
          <Badge variant="secondary" className="bg-[#E3F2FD] text-[#1976D2] text-xs">
            {activities.length} eventos
          </Badge>
        </CardTitle>
        <CardDescription className="text-sm text-gray-600">
          Últimos eventos e atividades registrados no sistema
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto space-y-3">
        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
            <Bell className="h-8 w-8 mb-2" />
            <p className="text-sm">Nenhuma atividade recente</p>
          </div>
        ) : (
          <>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {activities.map((activity, index) => (
                <div key={activity.id || index} className="relative p-4 bg-[#f7fafd] rounded-lg border border-gray-100">
                  <div className="absolute top-3 right-3 text-xs text-gray-500">
                    {formatTimestamp(activity.timestamp)}
                  </div>
                  <div className="pr-24">
                    <p className="text-sm font-medium text-gray-900 mb-2 leading-relaxed">
                      {activity.description}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="outline" className="bg-[#E3F2FD] text-[#1976D2] border-[#1976D2] text-xs">
                        {getAssetTypeBadge(activity.description, activity.details) === "ATIVO" ? "ASSOCIAÇÃO" : getAssetTypeBadge(activity.description, activity.details)}
                      </Badge>
                      <Badge variant="outline" className="bg-[#E3F2FD] text-[#1976D2] border-[#1976D2] text-xs">
                        {getStatusBadge(activity.details)}
                      </Badge>
                      <Badge variant="outline" className="bg-[#E3F2FD] text-[#1976D2] border-[#1976D2] text-xs">
                        {capitalize(getEventTypeBadge(activity.type))}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="pt-3 border-t border-gray-100">
              <Button variant="outline"
              onClick={() => navigate('/assets/history')}
              className="w-full h-10 border-[#4D2BFB] text-[#4D2BFB] hover:bg-[#4D2BFB]/5">
                <ExternalLink className="h-4 w-4 mr-2" />
                Ver Histórico Completo
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
