
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Clock, User, Smartphone } from "lucide-react";
import { StandardizedEvent } from "@/utils/eventFormatters";

interface RecentActivitiesCardProps {
  activities: StandardizedEvent[];
  isLoading?: boolean;
}

export function RecentActivitiesCard({ activities, isLoading }: RecentActivitiesCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Atividades Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Carregando atividades...
          </div>
        </CardContent>
      </Card>
    );
  }

  const getEventVariant = (eventType: string): "default" | "secondary" | "destructive" | "outline" => {
    const type = (eventType || '').toLowerCase();
    
    if (type.includes('created') || type.includes('criado')) {
      return 'default';
    }
    if (type.includes('association') || type.includes('link')) {
      return 'secondary';
    }
    if (type.includes('status') || type.includes('updated')) {
      return 'outline';
    }
    return 'default';
  };

  const getEventIcon = (eventType: string) => {
    const type = (eventType || '').toLowerCase();
    
    if (type.includes('association') || type.includes('link')) {
      return <User className="h-3 w-3" />;
    }
    if (type.includes('asset') || type.includes('created')) {
      return <Smartphone className="h-3 w-3" />;
    }
    return <Clock className="h-3 w-3" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Atividades Recentes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-4">
            {activities && activities.length > 0 ? (
              activities.map((activity, index) => (
                <div key={activity.id || index} className="flex items-start gap-3 p-3 rounded-lg border">
                  <div className="mt-0.5">
                    {getEventIcon(activity.type || '')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={getEventVariant(activity.type || '')}>
                        {activity.type || 'EVENT'}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {activity.timestamp || 'N/A'}
                      </span>
                    </div>
                    <p className="text-sm font-medium">
                      {activity.description || 'Sem descrição'}
                    </p>
                    {activity.assetName && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Ativo: {activity.assetName}
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma atividade recente
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
