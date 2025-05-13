import { useState, useEffect } from "react";
import { NavLink, useLocation, Link } from "react-router-dom";
import {
  LayoutDashboard,
  PlusCircle,
  PackageSearch,
  Users,
  Link as LinkIcon,
  Clock,
  ActivitySquare,
  History,
  Database,
  Wifi,
  Package,
  Building,
  ChevronDown,
  ChevronRight,
  Home,
  X,
  Wrench
} from "lucide-react";
import { NamedLogo } from "@/components/ui/namedlogo";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";

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
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                    }`
                  }
                  aria-label="Home - Home page"
                  onClick={isMobile ? onClose : undefined}
                >
                  <Home className="h-4 w-4" />
                  <span>Home</span>
                </NavLink>
              </TooltipTrigger>
              <TooltipContent side="right">Home page</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Módulo 1 - Inventory */}
        <div className="mb-4">
          <Collapsible
            open={openModules.inventory}
            onOpenChange={() => toggleModule('inventory')}
            className="w-full"
          >
            <CollapsibleTrigger
              className={cn(
                "flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition-colors",
                isModuleActive(['/inventory']) 
                  ? "bg-sidebar-accent/25 text-sidebar-accent-foreground font-medium" 
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              )}
              aria-label={`${openModules.inventory ? 'Collapse' : 'Expand'} inventory module`}
              aria-expanded={openModules.inventory}
              aria-controls="inventory-menu"
            >
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-sidebar-foreground/70" />
                <span className="font-medium text-sidebar-foreground/90">Inventory</span>
              </div>
              {openModules.inventory ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </CollapsibleTrigger>
            
            <CollapsibleContent className="pl-3 pt-1" id="inventory-menu">
              <p className="text-xs text-sidebar-foreground/60 px-3 mb-3">
                Manage and monitor your assets, customers, suppliers and subscriptions
              </p>
              
              <div className="flex flex-col gap-1">
                <NavLink
                  to="/inventory/dashboard"
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                    }`
                  }
                  aria-label="Dashboard - Inventory overview"
                  onClick={isMobile ? onClose : undefined}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Dashboard</span>
                </NavLink>

                <NavLink
                  to="/inventory/assets"
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                    }`
                  }
                  aria-label="Assets - Equipment and chip management"
                  onClick={isMobile ? onClose : undefined}
                >
                  <PackageSearch className="h-4 w-4" />
                  <span>Assets</span>
                </NavLink>

                <NavLink
                  to="/inventory/customers"
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                    }`
                  }
                  aria-label="Customers - Customer data management"
                  onClick={isMobile ? onClose : undefined}
                >
                  <Users className="h-4 w-4" />
                  <span>Customers</span>
                </NavLink>

                <NavLink
                  to="/inventory/suppliers"
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                    }`
                  }
                  aria-label="Suppliers - Manufacturer and partner management"
                  onClick={isMobile ? onClose : undefined}
                >
                  <Building className="h-4 w-4" />
                  <span>Suppliers</span>
                </NavLink>

                {/* Management Section */}
                <div className="mt-4">
                  <div className="px-3 py-1">
                    <span className="text-xs text-sidebar-foreground/70 font-medium uppercase">Management</span>
                  </div>
                  <NavLink
                    to="/inventory/subscriptions"
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                          : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                      }`
                    }
                    aria-label="Subscriptions - Plan and contract control"
                    onClick={isMobile ? onClose : undefined}
                  >
                    <Clock className="h-4 w-4" />
                    <span>Subscriptions</span>
                  </NavLink>
                </div>

                {/* Monitoring Section */}
                <div className="mt-4">
                  <div className="px-3 py-1">
                    <span className="text-xs text-sidebar-foreground/70 font-medium uppercase">Monitoring</span>
                  </div>
                  <NavLink
                    to="/inventory/monitoring/history"
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                          : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                      }`
                    }
                    aria-label="History - Activity and event log"
                    onClick={isMobile ? onClose : undefined}
                  >
                    <History className="h-4 w-4" />
                    <span>History</span>
                  </NavLink>

                  <NavLink
                    to="/inventory/monitoring/active"
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                          : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                      }`
                    }
                    aria-label="Monitoring - Real-time monitoring"
                    onClick={isMobile ? onClose : undefined}
                  >
                    <ActivitySquare className="h-4 w-4" />
                    <span>Monitoring</span>
                  </NavLink>
                </div>

                {/* Tools Section */}
                <div className="mt-4">
                  <div className="px-3 py-1">
                    <span className="text-xs text-sidebar-foreground/70 font-medium uppercase">Tools</span>
                  </div>
                  <NavLink
                    to="/inventory/tools/register-asset"
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                          : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                      }`
                    }
                    aria-label="Register Asset - Add new equipment or chips"
                    onClick={isMobile ? onClose : undefined}
                  >
                    <PlusCircle className="h-4 w-4" />
                    <span>Register Asset</span>
                  </NavLink>
                  
                  <NavLink
                    to="/inventory/tools/associate-assets"
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                          : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                      }`
                    }
                    aria-label="Associate Assets - Link devices and chips"
                    onClick={isMobile ? onClose : undefined}
                  >
                    <LinkIcon className="h-4 w-4" />
                    <span>Associate Assets</span>
                  </NavLink>
                  
                  <NavLink
                    to="/inventory/tools/data-usage"
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                          : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                      }`
                    }
                    aria-label="Data Usage - Monitor data consumption"
                    onClick={isMobile ? onClose : undefined}
                  >
                    <Database className="h-4 w-4" />
                    <span>Data Usage</span>
                  </NavLink>
                  
                  <NavLink
                    to="/inventory/tools/wifi-analyzer"
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                          : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                      }`
                    }
                    aria-label="WiFi Analyzer - Analyze wireless networks"
                    onClick={isMobile ? onClose : undefined}
                  >
                    <Wifi className="h-4 w-4" />
                    <span>WiFi Analyzer</span>
                  </NavLink>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
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
