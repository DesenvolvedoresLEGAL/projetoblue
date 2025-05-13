
import { cn } from "@/lib/utils";
import { SidebarHeader } from "./sidebar/SidebarHeader";
import { SidebarFooter } from "./sidebar/SidebarFooter";
import { CollapsedNavigation } from "./sidebar/CollapsedNavigation";
import { ExpandedNavigation } from "./sidebar/ExpandedNavigation";

interface ModularSidebarProps {
  isMobile?: boolean;
  onClose?: () => void;
  collapsed?: boolean;
}

export function ModularSidebar({ isMobile = false, onClose, collapsed = false }: ModularSidebarProps) {
  return (
    <div className={cn(
      "h-screen flex-shrink-0 bg-sidebar border-r flex flex-col",
      isMobile ? "w-full max-w-xs rounded-r-lg" : collapsed ? "w-16" : "w-64",
      "transition-all duration-300"
    )}>
      <SidebarHeader
        collapsed={collapsed}
        isMobile={isMobile}
        onClose={onClose}
      />
      
      <nav className="flex-1 overflow-auto py-4 px-3" role="navigation" aria-label="Main navigation menu">
        {/* Use collapsed or expanded navigation based on state */}
        {collapsed && !isMobile ? (
          <CollapsedNavigation />
        ) : (
          <ExpandedNavigation isMobile={isMobile} onClose={onClose} />
        )}
      </nav>
      
      <SidebarFooter collapsed={collapsed} />
    </div>
  );
}
