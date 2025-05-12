
import React from "react";
import { Clock, FileText, AlertCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function Footer() {
  const lastSyncDate = new Date().toLocaleDateString();
  const lastSyncTime = new Date().toLocaleTimeString();
  const apiStatus = true; // Replace with actual API status check
  
  return (
    <footer className="fixed bottom-0 left-0 right-0 border-t bg-background h-10 px-4 flex justify-between items-center text-xs text-muted-foreground">
      <div className="flex items-center gap-2">
        <span>BLUE Platform v1.0.2</span>
        <div className="flex items-center gap-1 ml-4">
          <Clock className="w-3 h-3" />
          <span>Last sync: {lastSyncDate} {lastSyncTime}</span>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <a href="#" className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors">
          <FileText className="w-3 h-3" />
          <span>View changelog</span>
        </a>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1">
                <span>API Status:</span>
                <span className={`w-2 h-2 rounded-full ${apiStatus ? 'bg-green-500' : 'bg-red-500'}`}></span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>View technical API details</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </footer>
  );
}
