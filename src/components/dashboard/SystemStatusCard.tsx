
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle, Clock } from "lucide-react";
import { useIsMobile } from '@/hooks/useIsMobile';

interface SystemStatusCardProps {
  isOnline: boolean;
  lastSync: string;
  isSyncing: boolean;
}

export const SystemStatusCard: React.FC<SystemStatusCardProps> = ({
  isOnline,
  lastSync,
  isSyncing
}) => {
  const isMobile = useIsMobile();

  const getStatusColor = () => {
    if (isSyncing) return 'bg-blue-50 border-blue-200';
    if (isOnline) return 'bg-green-50 border-green-200';
    return 'bg-red-50 border-red-200';
  };

  const getStatusIcon = () => {
    if (isSyncing) return <Clock className="h-4 w-4 text-blue-600 animate-spin" />;
    if (isOnline) return <CheckCircle className="h-4 w-4 text-green-600" />;
    return <AlertTriangle className="h-4 w-4 text-red-600" />;
  };

  const getStatusText = () => {
    if (isSyncing) return 'Sincronizando...';
    if (isOnline) return 'Sistema Operacional';
    return 'Sistema Offline';
  };

  const getStatusBadgeVariant = () => {
    if (isSyncing) return 'default';
    if (isOnline) return 'secondary';
    return 'destructive';
  };

  return (
    <Card className={`${getStatusColor()} border-2`}>
      <CardContent className={`${isMobile ? 'p-3' : 'p-4'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getStatusIcon()}
            <div>
              <div className={`font-semibold ${isMobile ? 'text-sm' : 'text-base'}`}>
                {getStatusText()}
              </div>
              <div className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-sm'}`}>
                Última sincronização: {lastSync}
              </div>
            </div>
          </div>
          <Badge variant={getStatusBadgeVariant()}>
            {isOnline ? 'Online' : 'Offline'}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};
