
import { useState } from "react";
import { cn } from "@/lib/utils";
import { SidebarHeader } from "./sidebar/SidebarHeader";
import { SidebarContent } from "./sidebar/SidebarContent";
import { SidebarFooter } from "./sidebar/SidebarFooter";
import { ModularSidebarProps } from "./sidebar/sidebarTypes";

export function ModularSidebar({ 
  isMobile = false, 
  onClose,
  collapsed = false,
  onToggleCollapse
}: ModularSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(collapsed);

  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
    if (onToggleCollapse) onToggleCollapse();
  };

  const sidebarWidth = isCollapsed ? "w-16" : "w-60";

  return (
    <div className={cn(
      "h-screen bg-white dark:bg-[#0C0C1F] border-r border-gray-200 dark:border-gray-800 flex flex-col transition-all duration-300 ease-in-out",
      sidebarWidth,
      isMobile ? "w-full max-w-xs" : ""
    )}>
      <SidebarHeader 
        isCollapsed={isCollapsed}
        isMobile={isMobile}
        onClose={onClose}
        onToggleCollapse={handleToggleCollapse}
      />
      
      <SidebarContent 
        isCollapsed={isCollapsed}
        isMobile={isMobile}
        onClose={onClose}
      />
      
      <SidebarFooter isCollapsed={isCollapsed} />
    </div>
  );
}
