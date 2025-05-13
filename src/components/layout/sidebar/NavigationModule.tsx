
import { useState, ReactNode } from "react";
import { ChevronDown, ChevronRight, LucideIcon } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

interface NavigationModuleProps {
  title: string;
  icon: LucideIcon;
  description?: string;
  isActive: boolean;
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
  id: string;
}

export function NavigationModule({
  title,
  icon: Icon,
  description,
  isActive,
  isOpen,
  onToggle,
  children,
  id
}: NavigationModuleProps) {
  return (
    <div className="mb-4">
      <Collapsible
        open={isOpen}
        onOpenChange={onToggle}
        className="w-full"
      >
        <CollapsibleTrigger
          className={cn(
            "flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition-colors",
            isActive 
              ? "bg-sidebar-accent/25 text-sidebar-accent-foreground font-medium" 
              : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
          )}
          aria-label={`${isOpen ? 'Collapse' : 'Expand'} ${title.toLowerCase()} module`}
          aria-expanded={isOpen}
          aria-controls={`${id}-menu`}
        >
          <div className="flex items-center gap-2">
            <Icon className="h-5 w-5 text-sidebar-foreground/70" />
            <span className="font-medium text-sidebar-foreground/90">{title}</span>
          </div>
          {isOpen ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </CollapsibleTrigger>
        
        <CollapsibleContent className="pl-3 pt-1" id={`${id}-menu`}>
          {description && (
            <p className="text-xs text-sidebar-foreground/60 px-3 mb-3">
              {description}
            </p>
          )}
          
          <div className="flex flex-col gap-1">
            {children}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
