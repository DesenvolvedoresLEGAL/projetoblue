
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { Bell, Clock, Activity, TrendingUp } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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
  const recentEventsCount = dashboard.recentAlerts.data?.length ?? 0;
  const validEvents = removeDuplicateEvents(dashboard.recentAlerts.data?.filter(isValidEvent) || []);

  return (
    <TooltipProvider>
      <Card className="legal-card h-full flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="legal-title flex items-center gap-2">
            <Bell className="h-5 w-5 text-legal-primary" />
            <span>Atividades Recentes</span>
            <Tooltip>
              <TooltipTrigger>
                <div className="legal-badge">
                  {recentEventsCount} eventos
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Total de eventos registrados recentemente</p>
              </TooltipContent>
            </Tooltip>
          </CardTitle>
          <CardDescription className="legal-text">
            Últimos eventos e atividades registrados no sistema
          </CardDescription>
        </CardHeader>
        
        <CardContent className="flex-1">
          {dashboard.recentAlerts.isLoading ? (
            <div className="space-y-3">
              {Array(4)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <Skeleton className="h-16 w-full rounded-lg" />
                  </div>
                ))}
            </div>
          ) : validEvents.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {validEvents
                .slice(0, 5)
                .map((alert: any) => {
                  return (
                    <Tooltip key={`${alert.id}-${alert.timestamp || alert.date}`}>
                      <TooltipTrigger asChild>
                        <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-850 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-legal-primary/30 transition-all duration-200 cursor-help group">
                          <div className="space-y-2">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <p className="text-sm font-medium leading-relaxed legal-text group-hover:text-legal-dark dark:group-hover:text-legal-primary transition-colors">
                                  {improveEventMessage(alert)}
                                </p>
                              </div>
                              <div className="flex items-center gap-1 ml-2">
                                <Clock className="h-3 w-3 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                  {formatBrazilianDateTime(alert.date)}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`text-xs px-2 py-1 rounded-full font-medium transition-colors ${getAssetTypeBadgeColor(alert.assetType)}`}>
                                {alert.assetType}
                              </span>
                              
                              {alert.new_status?.status && (
                                <span className="text-xs bg-legal-primary/10 text-legal-dark dark:text-legal-primary px-2 py-1 rounded-full border border-legal-primary/20">
                                  {alert.new_status.status}
                                </span>
                              )}
                              
                              {alert.event && (
                                <span className="text-xs bg-legal-secondary/10 text-legal-dark px-2 py-1 rounded-full border border-legal-secondary/20">
                                  {alert.event.replace('_', ' ')}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="left" className="max-w-xs">
                        <div className="space-y-2">
                          <p className="font-semibold">Detalhes do Evento</p>
                          <p><strong>Tipo:</strong> {alert.assetType}</p>
                          <p><strong>Data:</strong> {formatBrazilianDateTime(alert.date)}</p>
                          {alert.new_status?.status && (
                            <p><strong>Status:</strong> {alert.new_status.status}</p>
                          )}
                          {alert.name && (
                            <p><strong>Ativo:</strong> {Array.isArray(alert.name) ? alert.name.join(', ') : alert.name}</p>
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="p-4 bg-legal-primary/10 rounded-full mb-4">
                <Activity className="h-8 w-8 text-legal-primary" />
              </div>
              <h3 className="font-semibold text-legal-dark dark:text-legal-primary mb-2">
                Sistema Tranquilo
              </h3>
              <p className="text-muted-foreground text-sm max-w-xs">
                Nenhuma atividade recente registrada. O sistema está operando normalmente.
              </p>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="pt-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <Link to="/history" className="w-full">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full legal-button border-legal-primary text-legal-primary hover:bg-legal-primary hover:text-white group transition-all duration-200"
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Ver Histórico Completo
                </Button>
              </Link>
            </TooltipTrigger>
            <TooltipContent>
              <p>Acessar histórico detalhado de todas as atividades</p>
            </TooltipContent>
          </Tooltip>
        </CardFooter>
      </Card>
    </TooltipProvider>
  );
};
