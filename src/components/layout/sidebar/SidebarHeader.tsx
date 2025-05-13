
import { Link } from "react-router-dom";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NamedLogo } from "@/components/ui/namedlogo";

interface SidebarHeaderProps {
  collapsed: boolean;
  isMobile: boolean;
  onClose?: () => void;
}

export function SidebarHeader({ collapsed, isMobile, onClose }: SidebarHeaderProps) {
  return (
    <div className="flex h-16 items-center border-b px-4 justify-between">
      <Link to="/" aria-label="Go to home page">
        {collapsed && !isMobile ? (
          <div className="flex justify-center w-full">
            <NamedLogo iconOnly size="sm" />
          </div>
        ) : (
          <NamedLogo size="sm" />
        )}
      </Link>
      {isMobile && (
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onClose}
          className="h-8 w-8"
          aria-label="Close menu"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close menu</span>
        </Button>
      )}
    </div>
  );
}
