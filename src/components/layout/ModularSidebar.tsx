
import { useState, useEffect } from "react";
import { NavLink, useLocation, Link } from "react-router-dom";
import { Home, X, Package } from "lucide-react";
import { NamedLogo } from "@/components/ui/namedlogo";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SidebarSection } from "./sidebar/SidebarSection";
import { SidebarNavLink } from "./sidebar/SidebarNavLink";
import { InventorySidebarContent } from "./sidebar/InventorySidebarContent";

interface ModularSidebarProps {
  isMobile?: boolean;
  onClose?: () => void;
}

export function ModularSidebar({ isMobile = false, onClose }: ModularSidebarProps) {
  const location = useLocation();
  const [openModules, setOpenModules] = useState<Record<string, boolean>>({
    inventory: true, // Inventory module starts open by default
    management: false,
    monitoring: false,
    tools: false
  });

  // Determine which module to open based on the current route
  useEffect(() => {
    if (location.pathname.includes("/inventory")) {
      setOpenModules(prev => ({ ...prev, inventory: true }));
      
      if (location.pathname.includes("/subscriptions")) {
        setOpenModules(prev => ({ ...prev, management: true }));
      } else if (location.pathname.includes("/monitoring") || location.pathname.includes("/history")) {
        setOpenModules(prev => ({ ...prev, monitoring: true }));
      } else if (
        location.pathname.includes("/tools") || 
        location.pathname.includes("/register-asset") || 
        location.pathname.includes("/associate-assets") ||
        location.pathname.includes("/data-usage") || 
        location.pathname.includes("/wifi-analyzer")
      ) {
        setOpenModules(prev => ({ ...prev, tools: true }));
      }
    }
  }, [location.pathname]);

  const toggleModule = (moduleId: string) => {
    setOpenModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };

  const isModuleActive = (paths: string[]) => {
    return paths.some(path => location.pathname.includes(path));
  };

  return (
    <div className={cn(
      "h-screen flex-shrink-0 bg-sidebar border-r flex flex-col",
      isMobile ? "w-full max-w-xs rounded-r-lg" : "w-64"
    )}>
      <div className="flex h-16 items-center border-b px-4 justify-between">
        <Link to="/" aria-label="Go to home page">
          <NamedLogo size="sm" />
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
      
      <nav className="flex-1 overflow-auto py-4 px-3" role="navigation" aria-label="Main navigation menu">
        {/* Home link */}
        <div className="mb-6">
          <SidebarNavLink
            to="/"
            icon={Home}
            label="Home"
            onClick={isMobile ? onClose : undefined}
          />
        </div>

        {/* Inventory Module */}
        <SidebarSection
          id="inventory"
          title="Inventory"
          icon={Package}
          isOpen={openModules.inventory}
          isActive={isModuleActive(['/inventory'])}
          onToggle={toggleModule}
        >
          <InventorySidebarContent isMobile={isMobile} onClose={onClose} />
        </SidebarSection>
      </nav>
      
      <div className="border-t p-4 mt-auto">
        <div className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} - BLUE
          <br />
          Ver. 2.0
        </div>
      </div>
    </div>
  );
}
