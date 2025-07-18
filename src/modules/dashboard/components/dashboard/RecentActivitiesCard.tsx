import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, ExternalLink, User } from "lucide-react";
import { useIsMobile } from '@/hooks/useIsMobile';
import { capitalize } from '@/utils/stringUtils';
import { useNavigate } from 'react-router-dom';
import { RecentActivityAsset, RecentActivityAssociation } from '../../types/recentActivitiesTypes';
import { formatPhoneNumber } from '@/utils/formatters';

interface RecentActivitiesCardProps {
  activities: (RecentActivityAsset | RecentActivityAssociation)[];
  isLoading?: boolean;
}

export const RecentActivitiesCard: React.FC<RecentActivitiesCardProps> = ({
  activities = [],
  isLoading = false
}) => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    return date.toLocaleString('pt-BR', options);
  }

  // Determina se a atividade é um ativo ou uma associação
  const getActivityType = (activity: RecentActivityAsset | RecentActivityAssociation): 'ATIVO' | 'ASSOCIAÇÃO' => {
    return 'asset_id' in activity ? 'ATIVO' : 'ASSOCIAÇÃO';
  };

  // Retorna a descrição baseada no tipo de evento
  const getEventDescription = (activity: RecentActivityAsset | RecentActivityAssociation) => {
    const event = activity.event;
    const type = capitalize(getActivityType(activity));
    
    switch (event.toUpperCase()) {
      case 'INSERT':
        return `${type} criado`;
      case 'UPDATE':
        return `${type} atualizado`;
      case 'DELETE':
        return `${type} removido`;
      default:
        return `Evento de ${type.toLowerCase()}`;
    }
  };

  // Retorna um nome descritivo para a atividade
  const getActivityName = (activity: RecentActivityAsset | RecentActivityAssociation) => {
    if ('asset_id' in activity) {
      return activity.details.new_record.radio || formatPhoneNumber(activity.details.new_record.line_number.toString()) || 'Ativo';
    } else {
      // TODO: Adicionar cliente à association logs com join
      return capitalize(activity.client_name) || 'Associação';
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
            Eventos: {activities.length}
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
                <div key={activity.uuid || index} className="relative p-4 bg-[#f7fafd] rounded-lg border border-gray-100">
                  <div className="absolute top-3 right-3 text-xs text-gray-500">
                    {formatTimestamp(activity.created_at)}
                  </div>
                  <div className="pr-24">
                    <p className="text-sm font-medium text-gray-900 mb-2 leading-relaxed">
                      {getActivityName(activity)} - {activity.event}
                    </p>
                    {/* Display performed by user */}
                    {activity.details.user && (
                      <div className="flex items-center gap-1 mb-2 text-xs text-gray-600">
                        <User className="h-3 w-3" />
                        <span>por {activity.details.user.username}</span>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="outline" className="bg-[#E3F2FD] text-[#1976D2] border-[#1976D2] text-xs">
                        {getActivityType(activity)}
                      </Badge>
                      <Badge variant="outline" className="bg-[#E3F2FD] text-[#1976D2] border-[#1976D2] text-xs">
                        {getEventDescription(activity)}
                      </Badge>
                      {activity.event && (
                        <Badge variant="outline" className="bg-[#E3F2FD] text-[#1976D2] border-[#1976D2] text-xs">
                          Status: {activity.event}
                        </Badge>
                      )}
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