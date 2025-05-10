
import { NavLink } from "react-router-dom";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { SidebarModule } from "./sidebarTypes";

interface SidebarMenuProps {
  module: SidebarModule;
  isOpen: boolean;
  toggleModule: (moduleId: string) => void;
  isCollapsed: boolean;
  isMobile?: boolean;
  onClose?: () => void;
}

export function SidebarMenu({ 
  module, 
  isOpen, 
  toggleModule, 
  isCollapsed,
  isMobile,
  onClose
}: SidebarMenuProps) {
  if (module.isExpandable) {
    return (
      <Collapsible
        open={!isCollapsed && isOpen}
        onOpenChange={() => !isCollapsed && toggleModule(module.id)}
        className="w-full"
      >
        <CollapsibleTrigger
          className={cn(
            "flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition-colors",
            "hover:bg-[#4D2BFB]/5",
            isCollapsed ? "justify-center" : ""
          )}
        >
          <div className={cn(
            "flex items-center gap-2",
            isCollapsed ? "justify-center" : ""
          )}>
            <module.icon className="h-5 w-5 text-gray-500" />
            {!isCollapsed && <span>{module.title}</span>}
          </div>
          {!isCollapsed && (
            isOpen ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )
          )}
        </CollapsibleTrigger>
        
        {!isCollapsed && (
          <CollapsibleContent className="pl-3 pt-1">
            <div className="flex flex-col gap-1 text-sm">
              {module.subItems?.map((item, index) => (
                <NavLink
                  key={index}
                  to={item.path}
                  className={({ isActive }) => cn(
                    "flex items-center gap-2 rounded-md px-3 py-2 transition-colors",
                    isActive
                      ? "bg-[#4D2BFB]/10 text-[#4D2BFB] font-medium"
                      : "text-gray-700 dark:text-gray-300 hover:bg-[#4D2BFB]/5"
                  )}
                  onClick={isMobile ? onClose : undefined}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </NavLink>
              ))}
            </div>
          </CollapsibleContent>
        )}
      </Collapsible>
    );
  } else {
    return (
      <NavLink
        to={module.path || "/"}
        className={({ isActive }) => cn(
          "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
          isActive
            ? "bg-[#4D2BFB]/10 text-[#4D2BFB] font-medium"
            : "text-gray-700 dark:text-gray-300 hover:bg-[#4D2BFB]/5",
          isCollapsed ? "justify-center" : ""
        )}
        onClick={isMobile ? onClose : undefined}
      >
        <module.icon className="h-5 w-5" />
        {!isCollapsed && <span>{module.title}</span>}
      </NavLink>
    );
  }
}
