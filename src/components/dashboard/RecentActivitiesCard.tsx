
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Plus, Link as LinkIcon, Settings, Building2, UserPlus, UserMinus, UserCheck } from "lucide-react";
import { useIsMobile } from '@/hooks/useIsMobile';

interface RecentActivity {
  id: number | string; // Atualizar para aceitar tanto number quanto string
  type: 'asset_created' | 'association_created' | 'association_ended' | 'status_updated' | 'client_created' | 'client_updated' | 'client_deleted';
  description: string;
  assetName?: string;
  clientName?: string;
  timestamp: string;
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

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'asset_created':
        return <Plus className="h-4 w-4 text-green-600" />;
      case 'association_created':
        return <LinkIcon className="h-4 w-4 text-blue-600" />;
      case 'association_ended':
        return <LinkIcon className="h-4 w-4 text-orange-600" />;
      case 'status_updated':
        return <Settings className="h-4 w-4 text-purple-600" />;
      case 'client_created':
        return <UserPlus className="h-4 w-4 text-emerald-600" />;
      case 'client_updated':
        return <UserCheck className="h-4 w-4 text-indigo-600" />;
      case 'client_deleted':
        return <UserMinus className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActivityBadgeVariant = (type: string) => {
    switch (type) {
      case 'asset_created':
      case 'client_created':
        return 'secondary';
      case 'association_created':
        return 'default';
      case 'association_ended':
      case 'client_deleted':
        return 'destructive';
      case 'status_updated':
      case 'client_updated':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getActivityBadgeText = (type: string) => {
    switch (type) {
      case 'asset_created':
        return 'Ativo criado';
      case 'association_created':
        return 'Associação';
      case 'association_ended':
        return 'Encerrado';
      case 'status_updated':
        return 'Status';
      case 'client_created':
        return 'Cliente criado';
      case 'client_updated':
        return 'Cliente atualizado';
      case 'client_deleted':
        return 'Cliente removido';
      default:
        return type.replace('_', ' ');
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
              <div key={i} className="flex items-center space-x-3">
                <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
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
        <CardTitle className="legal-title flex items-center gap-2">
          <Clock className="h-5 w-5 text-[#4D2BFB]" />
          Atividades Recentes
        </CardTitle>
        <CardDescription className="legal-text">
          Últimos eventos do sistema
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto">
        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
            <Clock className="h-8 w-8 mb-2" />
            <p className="text-sm">Nenhuma atividade recente</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activities.map((activity, index) => (
              <div key={`${activity.id}-${index}`} className="flex items-start space-x-3 pb-3 border-b border-gray-100 last:border-b-0">
                <div className="p-2 bg-gray-50 rounded-full">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`font-medium ${isMobile ? 'text-sm' : 'text-base'}`}>
                    {activity.description}
                  </div>
                  <div className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-sm'} truncate`}>
                    {activity.assetName && `${activity.assetName}`}
                    {activity.clientName && !activity.assetName && `${activity.clientName}`}
                    {activity.assetName && activity.clientName && ` • ${activity.clientName}`}
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-sm'}`}>
                      {activity.timestamp}
                    </span>
                    <Badge variant={getActivityBadgeVariant(activity.type)} className="text-xs">
                      {getActivityBadgeText(activity.type)}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
