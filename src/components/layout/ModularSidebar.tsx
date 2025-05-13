
import { cn } from "@/lib/utils";
import { SidebarHeader } from "./sidebar/SidebarHeader";
import { StaticNavigation } from "./sidebar/StaticNavigation";

interface ModularSidebarProps {
  isMobile?: boolean;
  onClose?: () => void;
  collapsed?: boolean;
}

export function ModularSidebar({ isMobile = false, onClose, collapsed = false }: ModularSidebarProps) {
  return (
    <div className={cn(
      "h-screen flex-shrink-0 bg-sidebar border-r flex flex-col",
      isMobile ? "w-full max-w-xs rounded-r-lg" : "w-64",
      "transition-all duration-300"
    )}>
      <SidebarHeader
        collapsed={false}
        isMobile={isMobile}
        onClose={onClose}
      />
      
      <nav className="flex-1 overflow-auto py-4 px-3" role="navigation" aria-label="Main navigation menu">
        <StaticNavigation isMobile={isMobile} onClose={onClose} />
      </nav>
    </div>
  );
}
