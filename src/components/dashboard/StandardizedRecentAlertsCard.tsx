
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { Bell } from "lucide-react";
import { 
  formatBrazilianDateTime, 
  improveEventMessage, 
  removeDuplicateEvents,
  getAssetTypeBadgeColor,
  isValidEvent
} from "@/utils/eventFormatters";

interface StandardizedRecentAlertsCardProps {
  dashboard: any;
}

export const StandardizedRecentAlertsCard: React.FC<StandardizedRecentAlertsCardProps> = ({ dashboard }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Atividades Recentes
        </CardTitle>
        <CardDescription>
          Últimos eventos e atividades registrados no sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        {dashboard.recentAlerts.isLoading ? (
          <div className="space-y-3">
            {Array(4)
              .fill(0)
              .map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
          </div>
        ) : (dashboard.recentAlerts.data?.length ?? 0) > 0 ? (
          <ul className="space-y-3">
            {removeDuplicateEvents(dashboard.recentAlerts.data.filter(isValidEvent))
              .slice(0, 5)
              .map((alert: any) => {
                return (
                  <li key={`${alert.id}-${alert.timestamp || alert.date}`} className="bg-muted/50 p-3 rounded-lg">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="text-sm font-medium leading-relaxed">
                            {improveEventMessage(alert)}
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground ml-2 whitespace-nowrap">
                          {formatBrazilianDateTime(alert.date)}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getAssetTypeBadgeColor(alert.assetType)}`}>
                          {alert.assetType}
                        </span>
                        
                        {alert.new_status?.status && (
                          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                            {alert.new_status.status}
                          </span>
                        )}
                        
                        {alert.event && (
                          <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                            {alert.event.replace('_', ' ')}
                          </span>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
          </ul>
        ) : (
          <div className="flex flex-col items-center justify-center py-8">
            <Bell className="h-10 w-10 text-muted-foreground/30 mb-2" />
            <p className="text-muted-foreground">Nenhuma atividade recente registrada</p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Link to="/history" className="w-full">
          <Button variant="outline" size="sm" className="w-full">
            Ver histórico completo
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};
