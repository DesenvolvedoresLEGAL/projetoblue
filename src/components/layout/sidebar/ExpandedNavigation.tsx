
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
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
  Building,
  Package,
  Home,
  Wrench
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { NavigationItem } from "./NavigationItem";
import { NavigationModule } from "./NavigationModule";

interface ExpandedNavigationProps {
  isMobile: boolean;
  onClose?: () => void;
}

export function ExpandedNavigation({ isMobile, onClose }: ExpandedNavigationProps) {
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
    <>
      {/* Home link */}
      <div className="mb-6">
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <NavigationItem 
                to="/"
                icon={Home}
                label="Home"
                onClose={isMobile ? onClose : undefined}
                ariaLabel="Home - Home page"
              />
            </TooltipTrigger>
            <TooltipContent side="right">Home page</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Inventory Module */}
      <NavigationModule
        id="inventory"
        title="Inventory"
        icon={Package}
        description="Manage and monitor your assets, customers, suppliers and subscriptions"
        isActive={isModuleActive(['/inventory'])}
        isOpen={openModules.inventory}
        onToggle={() => toggleModule('inventory')}
      >
        <NavigationItem
          to="/inventory/dashboard"
          icon={LayoutDashboard}
          label="Dashboard"
          onClose={isMobile ? onClose : undefined}
          ariaLabel="Dashboard - Inventory overview"
        />

        <NavigationItem
          to="/inventory/assets"
          icon={PackageSearch}
          label="Assets"
          onClose={isMobile ? onClose : undefined}
          ariaLabel="Assets - Equipment and chip management"
        />

        <NavigationItem
          to="/inventory/customers"
          icon={Users}
          label="Customers"
          onClose={isMobile ? onClose : undefined}
          ariaLabel="Customers - Customer data management"
        />

        <NavigationItem
          to="/inventory/suppliers"
          icon={Building}
          label="Suppliers"
          onClose={isMobile ? onClose : undefined}
          ariaLabel="Suppliers - Manufacturer and partner management"
        />

        {/* Management Section */}
        <div className="mt-4">
          <div className="px-3 py-1">
            <span className="text-xs text-sidebar-foreground/70 font-medium uppercase">Management</span>
          </div>
          <NavigationItem
            to="/inventory/subscriptions"
            icon={Clock}
            label="Subscriptions"
            onClose={isMobile ? onClose : undefined}
            ariaLabel="Subscriptions - Plan and contract control"
          />
        </div>

        {/* Monitoring Section */}
        <div className="mt-4">
          <div className="px-3 py-1">
            <span className="text-xs text-sidebar-foreground/70 font-medium uppercase">Monitoring</span>
          </div>
          <NavigationItem
            to="/inventory/monitoring/history"
            icon={History}
            label="History"
            onClose={isMobile ? onClose : undefined}
            ariaLabel="History - Activity and event log"
          />

          <NavigationItem
            to="/inventory/monitoring/active"
            icon={ActivitySquare}
            label="Monitoring"
            onClose={isMobile ? onClose : undefined}
            ariaLabel="Monitoring - Real-time monitoring"
          />
        </div>

        {/* Tools Section */}
        <div className="mt-4">
          <div className="px-3 py-1">
            <span className="text-xs text-sidebar-foreground/70 font-medium uppercase">Tools</span>
          </div>
          <NavigationItem
            to="/inventory/tools/register-asset"
            icon={PlusCircle}
            label="Register Asset"
            onClose={isMobile ? onClose : undefined}
            ariaLabel="Register Asset - Add new equipment or chips"
          />
          
          <NavigationItem
            to="/inventory/tools/associate-assets"
            icon={LinkIcon}
            label="Associate Assets"
            onClose={isMobile ? onClose : undefined}
            ariaLabel="Associate Assets - Link devices and chips"
          />
          
          <NavigationItem
            to="/inventory/tools/data-usage"
            icon={Database}
            label="Data Usage"
            onClose={isMobile ? onClose : undefined}
            ariaLabel="Data Usage - Monitor data consumption"
          />
          
          <NavigationItem
            to="/inventory/tools/wifi-analyzer"
            icon={Wifi}
            label="WiFi Analyzer"
            onClose={isMobile ? onClose : undefined}
            ariaLabel="WiFi Analyzer - Analyze wireless networks"
          />
        </div>
      </NavigationModule>
    </>
  );
}
