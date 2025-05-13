
import React from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface FooterProps extends React.HTMLAttributes<HTMLElement> {}

export function Footer({ className, ...props }: FooterProps) {
  const lastSyncTime = new Date().toLocaleTimeString();
  
  // API status - this would be fetched from your API status service
  const apiStatus = "online"; // 'online' or 'offline'

  return (
    <footer 
      className={cn(
        "h-10 border-t bg-background px-4 flex justify-between items-center text-xs text-muted-foreground z-10",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-4">
        <span>LEGAL Platform v1.0.2</span>
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>Last sync: {lastSyncTime}</span>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <Button variant="link" size="sm" className="h-auto p-0 text-xs">
          View changelog
        </Button>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center">
                <div 
                  className={cn(
                    "w-2 h-2 rounded-full",
                    apiStatus === 'online' ? "bg-green-500" : "bg-red-500"
                  )}
                ></div>
              </div>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>API Status: {apiStatus}</p>
              <p className="text-xs text-muted-foreground">View technical API details</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </footer>
  );
}
