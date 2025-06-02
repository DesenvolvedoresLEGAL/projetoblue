
import React from "react";
import { RefreshCw, CheckCircle, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface SyncStatusAlertProps {
  lastSync?: string;
  isOnline?: boolean;
  isSyncing?: boolean;
}

export const SyncStatusAlert: React.FC<SyncStatusAlertProps> = ({
  lastSync = "Há 5 minutos",
  isOnline = true,
  isSyncing = false
}) => {
  const formatLastSync = (syncTime: string) => {
    // In a real implementation, this would format the actual timestamp
    return syncTime;
  };

  const getSyncStatus = () => {
    if (!isOnline) {
      return {
        icon: <AlertCircle className="h-3 w-3 md:h-4 md:w-4 text-red-500" />,
        text: "Desconectado",
        color: "bg-red-50 border-red-200 text-red-800 dark:bg-red-950 dark:border-red-800 dark:text-red-200"
      };
    }
    
    if (isSyncing) {
      return {
        icon: <RefreshCw className="h-3 w-3 md:h-4 md:w-4 text-legal-primary animate-sync-spin" />,
        text: "Sincronizando...",
        color: "bg-blue-50 border-legal-primary/30 text-legal-dark dark:bg-blue-950 dark:border-legal-primary dark:text-legal-primary"
      };
    }

    return {
      icon: <CheckCircle className="h-3 w-3 md:h-4 md:w-4 text-green-500" />,
      text: "Sincronizado",
      color: "bg-green-50 border-green-200 text-green-800 dark:bg-green-950 dark:border-green-800 dark:text-green-200"
    };
  };

  const status = getSyncStatus();

  return (
    <TooltipProvider>
      <Alert className={`mb-4 md:mb-6 ${status.color} transition-all duration-300`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center space-x-2 md:space-x-3">
            {status.icon}
            <div>
              <AlertDescription className="font-medium legal-text text-sm md:text-base">
                Sistema {status.text}
              </AlertDescription>
              <p className="text-xs opacity-75 mt-1">
                Última sincronização: {formatLastSync(lastSync)}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Tooltip>
              <TooltipTrigger>
                <Badge 
                  variant="secondary" 
                  className="bg-legal-primary/10 text-legal-dark hover:bg-legal-primary/20 transition-colors cursor-help text-xs md:text-sm"
                >
                  Status da Rede
                </Badge>
              </TooltipTrigger>
              <TooltipContent side="left" className="max-w-xs">
                <p className="text-sm">
                  {isOnline 
                    ? "Conectado aos servidores LEGAL. Dados atualizados em tempo real."
                    : "Conexão perdida. Alguns dados podem estar desatualizados."
                  }
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </Alert>
    </TooltipProvider>
  );
};

export default SyncStatusAlert;
