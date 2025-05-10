
import { Button } from "@/components/ui/button";
import { X, ChevronRight } from "lucide-react";
import { ChevronLeft } from "../../icons/ChevronLeft";

interface SidebarHeaderProps {
  isCollapsed: boolean;
  isMobile?: boolean;
  onClose?: () => void;
  onToggleCollapse?: () => void;
}

export function SidebarHeader({
  isCollapsed,
  isMobile,
  onClose,
  onToggleCollapse
}: SidebarHeaderProps) {
  return (
    <div className="flex h-16 items-center px-4 border-b border-gray-200 dark:border-gray-800 justify-between">
      {!isCollapsed && (
        <div className="text-xl font-semibold">
          BLUE
        </div>
      )}
      
      {isMobile ? (
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onClose}
          className="h-8 w-8"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close menu</span>
        </Button>
      ) : (
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCollapse}
          className="h-8 w-8"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
          <span className="sr-only">Toggle sidebar</span>
        </Button>
      )}
    </div>
  );
}
