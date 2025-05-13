
import React from "react";
import { ChevronDown, ChevronRight, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface SidebarSectionProps {
  id: string;
  title: string;
  icon: LucideIcon;
  children: React.ReactNode;
  isOpen: boolean;
  isActive?: boolean;
  onToggle: (id: string) => void;
}

export const SidebarSection: React.FC<SidebarSectionProps> = ({
  id,
  title,
  icon: Icon,
  children,
  isOpen,
  isActive,
  onToggle,
}) => {
  return (
    <div className="mb-4">
      <Collapsible
        open={isOpen}
        onOpenChange={() => onToggle(id)}
        className="w-full"
      >
        <CollapsibleTrigger
          className={cn(
            "flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition-colors",
            isActive 
              ? "bg-sidebar-accent/25 text-sidebar-accent-foreground font-medium" 
              : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
          )}
          aria-label={`${isOpen ? 'Collapse' : 'Expand'} ${id} module`}
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
          {children}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};
