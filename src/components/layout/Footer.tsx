import React from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
type FooterProps = React.HTMLAttributes<HTMLElement>
export function Footer({
  className,
  ...props
}: FooterProps) {
  const lastSyncTime = new Date().toLocaleTimeString();

  // API status - this would be fetched from your API status service
  const apiStatus = "online"; // 'online' or 'offline'

  return <footer className={cn("h-10 border-t border-border bg-background px-4 flex justify-between items-center text-xs text-text-secondary-dark dark:text-text-secondary-dark z-10 shadow-legal-sm dark:shadow-legal-dark", className)} {...props}>
      <div className="flex items-center gap-4">
        <span className="text-legal-primary dark:text-legal-secondary font-medium">LEGAL Platform v1.4.252</span>
        <div className="flex items-center gap-1 text-muted-foreground">
          <Clock className="w-3 h-3 text-legal-primary dark:text-legal-secondary" />
          <span>Última sincronização: {lastSyncTime}</span>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <Button variant="link" size="sm" className="h-auto p-0 text-xs text-legal-primary dark:text-legal-secondary hover:text-legal-primary-light dark:hover:text-legal-secondary-light">
          Ver changelog
        </Button>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center">
                <div className={cn("w-2 h-2 rounded-full transition-colors duration-200", apiStatus === 'online' ? "bg-success shadow-[0_0_4px_rgba(34,197,94,0.5)]" : "bg-destructive shadow-[0_0_4px_rgba(239,68,68,0.5)]")}></div>
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" className="bg-background border border-legal-primary/20 dark:border-legal-secondary/20 shadow-legal-lg">
              <p className="text-legal-primary dark:text-legal-secondary font-medium">
                Status da API: {apiStatus === 'online' ? 'Online' : 'Offline'}
              </p>
              <p className="text-xs text-muted-foreground">
                Ver detalhes técnicos da API
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </footer>;
}