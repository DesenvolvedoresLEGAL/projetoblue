
import React from "react";
import { Clock, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const Footer: React.FC = () => {
  const lastSyncTime = new Date().toLocaleTimeString();
  const apiStatus = "online"; // This could be fetched from a context or API

  return (
    <footer className="h-10 mt-auto border-t bg-background z-10 flex justify-between items-center px-4 py-2 text-xs text-muted-foreground">
      <div className="flex items-center gap-2">
        <Clock className="w-3.5 h-3.5" />
        <span>Última sincronização: {lastSyncTime}</span>
      </div>
      
      <div>
        <span>BLUE Platform v1.0.2</span>
      </div>
      
      <div className="flex items-center gap-3">
        <Link to="/changelog" className="text-primary hover:underline flex items-center gap-1">
          <FileText className="w-3.5 h-3.5" />
          <span>Changelog</span>
        </Link>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${apiStatus === 'online' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span>API Status</span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="top">
              <div className="text-xs">
                <p className="font-medium">API Status: {apiStatus === 'online' ? 'Online' : 'Offline'}</p>
                <p className="text-muted-foreground">Latência: 45ms</p>
                <p className="text-muted-foreground">Uptime: 99.9%</p>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </footer>
  );
};
