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
  const getActivityType = (activity: RecentActivityAsset | RecentActivityAssociation): 'Chip' | 'Speedy 5G' | 'Equipamento' | 'Associação' => {
    if ('asset_id' in activity) {
      switch (activity.details.new_record.solution_id) {
        case 11:
          return 'Chip';
          break;
        case 1:
        case 2:
        case 4:
          return 'Speedy 5G';
          break;
        default:
          return 'Equipamento';
          break;
      }
    } else {
      return 'Associação';
    }
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


  // Função para mapear status_id para texto legível
  const getAssetStatusText = (statusId: number | null): string => {
    switch (statusId) {
      case 1:
        return 'disponível';
      case 2:
        return 'em locação';
      case 3:
        return 'em assinatura';
      case 4:
        return 'sem dados';
      case 5:
        return 'bloqueado';
      case 6:
        return 'em manutenção';
      case 7:
        return 'desatualizado';
      case 8:
        return 'extraviado';
      default:
        return 'status desconhecido';
    }
  };

  const getAssociationStatusText = (status: boolean) => {
    if (status) {
      return 'ativa';
    } else {
      return 'inativa';
    }
  }

  const getEventChange = (activity: RecentActivityAsset | RecentActivityAssociation) => {
    if ('asset_id' in activity) {
      const before_status = getAssetStatusText(activity.details.old_record.status_id);
      const after_status = getAssetStatusText(activity.details.new_record.status_id);
      return `${before_status} -> ${after_status}`;
    } else {
      const before_status = getAssociationStatusText(activity.details.old_record.status);
      const after_status = getAssociationStatusText(activity.details.new_record.status);

      return `${before_status} -> ${after_status}`;
    }
  }

  // Retorna um nome descritivo para a atividade
const getActivityName = (activity: RecentActivityAsset | RecentActivityAssociation) => {
  if ('asset_id' in activity) {
    // É um RecentActivityAsset
    const newRecord = activity.details.new_record;
    
    // Verificar se existe radio
    if (newRecord?.radio) {
      if (newRecord?.solution_id === 1) return `Speedy: ${newRecord.radio}`;
      return `Equipamento: ${newRecord.radio}`;
    }
    
    // Verificar se existe line_number e formatá-lo
    if (newRecord?.line_number) {
      return `Chip: ${formatPhoneNumber(newRecord.line_number.toString())}`;
    }
    
    // Verificar outros identificadores do asset
    if (newRecord?.serial_number) {
      return newRecord.serial_number;
    }
    
    if (newRecord?.iccid) {
      return newRecord.iccid;
    }
    
    return 'Ativo';
  } else {
    // É um RecentActivityAssociation
    const associationActivity = activity as RecentActivityAssociation;
    
    // Usar o nome do cliente da association_client
    if (associationActivity.client_name) {
      return `Cliente: ${capitalize(associationActivity.client_name)}`;
    }
    
    return 'Associação';
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
                      {getActivityName(activity)}
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
                      {activity.event === 'UPDATE' ? (
                        <Badge variant="outline" className="bg-[#E3F2FD] text-[#1976D2] border-[#1976D2] text-xs">
                          {getEventChange(activity)}
                        </Badge>
                      ) : ''}
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