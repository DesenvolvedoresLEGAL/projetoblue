
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { SidebarMenu } from "./SidebarMenu";
import { sidebarModules } from "./sidebarModules";
import { SidebarModule } from "./sidebarTypes";

interface SidebarContentProps {
  isCollapsed: boolean;
  isMobile?: boolean;
  onClose?: () => void;
}

export function SidebarContent({
  isCollapsed,
  isMobile,
  onClose
}: SidebarContentProps) {
  const location = useLocation();
  const [openModules, setOpenModules] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Find which module should be open based on current path
    const currentPath = location.pathname;
    let activeModuleId = '';
    
    sidebarModules.forEach(module => {
      if (module.isExpandable && module.subItems) {
        const hasActiveSubItem = module.subItems.some(item => 
          currentPath === item.path || currentPath.startsWith(item.path + '/')
        );
        
        if (hasActiveSubItem) {
          activeModuleId = module.id;
        }
      }
    });

    if (activeModuleId) {
      setOpenModules(prev => ({ ...prev, [activeModuleId]: true }));
    }
  }, [location.pathname]);

  const toggleModule = (moduleId: string) => {
    setOpenModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };

  return (
    <div className="overflow-y-auto py-2 flex-1">
      {sidebarModules.map((module: SidebarModule) => (
        <div key={module.id} className="px-3 py-1">
          <SidebarMenu
            module={module}
            isOpen={openModules[module.id]}
            toggleModule={toggleModule}
            isCollapsed={isCollapsed}
            isMobile={isMobile}
            onClose={onClose}
          />
        </div>
      ))}
    </div>
  );
}
