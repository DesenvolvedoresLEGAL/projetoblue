
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
  FileText,
  Network,
  Scan
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
    dashboard: true, // Dashboard module starts open by default
    assets: false,
    topology: false,
    tools: false
  });

  // Determine which module to open based on the current route
  useEffect(() => {
    if (location.pathname.includes("/dashboard")) {
      setOpenModules(prev => ({ ...prev, dashboard: true }));
    } else if (location.pathname.includes("/assets")) {
      setOpenModules(prev => ({ ...prev, assets: true }));
    } else if (location.pathname.includes("/topology")) {
      setOpenModules(prev => ({ ...prev, topology: true }));
    } else if (
      location.pathname.includes("/tools") || 
      location.pathname.includes("/register-asset") || 
      location.pathname.includes("/discovery") ||
      location.pathname.includes("/export")
    ) {
      setOpenModules(prev => ({ ...prev, tools: true }));
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

      {/* Dashboard Module */}
      <NavigationModule
        id="dashboard"
        title="Dashboard"
        icon={LayoutDashboard}
        description="Overview of your assets, clients, and activities"
        isActive={isModuleActive(['/dashboard'])}
        isOpen={openModules.dashboard}
        onToggle={() => toggleModule('dashboard')}
      >
        <NavigationItem
          to="/dashboard"
          icon={LayoutDashboard}
          label="Main Dashboard"
          onClose={isMobile ? onClose : undefined}
          ariaLabel="Dashboard - Overall system overview"
        />

        {/* Shortcuts Section */}
        <div className="mt-4">
          <div className="px-3 py-1">
            <span className="text-xs text-sidebar-foreground/70 font-medium uppercase">Shortcuts</span>
          </div>
          <NavigationItem
            to="/register-asset"
            icon={PlusCircle}
            label="Register New Asset"
            onClose={isMobile ? onClose : undefined}
            ariaLabel="Register New Asset - Add a new asset to inventory"
          />

          <NavigationItem
            to="/link-asset"
            icon={LinkIcon}
            label="Link Asset to Customer"
            onClose={isMobile ? onClose : undefined}
            ariaLabel="Link Asset - Connect asset to a customer"
          />

          <NavigationItem
            to="/assets"
            icon={PackageSearch}
            label="View Full Inventory"
            onClose={isMobile ? onClose : undefined}
            ariaLabel="View Inventory - Complete asset list"
          />
        </div>
      </NavigationModule>

      {/* Assets Module */}
      <NavigationModule
        id="assets"
        title="Ativos"
        icon={Package}
        description="Manage and monitor all your assets"
        isActive={isModuleActive(['/assets'])}
        isOpen={openModules.assets}
        onToggle={() => toggleModule('assets')}
      >
        <NavigationItem
          to="/assets/dashboard"
          icon={LayoutDashboard}
          label="Dashboard"
          onClose={isMobile ? onClose : undefined}
          ariaLabel="Assets Dashboard - Asset status and metrics"
        />

        <NavigationItem
          to="/assets/inventory"
          icon={PackageSearch}
          label="Inventory"
          onClose={isMobile ? onClose : undefined}
          ariaLabel="Assets Inventory - Complete asset listing"
        />

        <NavigationItem
          to="/assets/register"
          icon={PlusCircle}
          label="New Asset"
          onClose={isMobile ? onClose : undefined}
          ariaLabel="New Asset - Register a new asset"
        />
      </NavigationModule>

      {/* Topology Module */}
      <NavigationModule
        id="topology"
        title="Topology"
        icon={Network}
        description="Network and relationship visualization"
        isActive={isModuleActive(['/topology'])}
        isOpen={openModules.topology}
        onToggle={() => toggleModule('topology')}
      >
        <NavigationItem
          to="/topology/view"
          icon={Network}
          label="Graph View"
          onClose={isMobile ? onClose : undefined}
          ariaLabel="Graph View - Visual network topology"
        />
      </NavigationModule>

      {/* Tools Section */}
      <NavigationModule
        id="tools"
        title="Tools"
        icon={Database}
        description="Utilities for asset management and discovery"
        isActive={isModuleActive(['/tools', '/register-asset', '/discovery', '/export'])}
        isOpen={openModules.tools}
        onToggle={() => toggleModule('tools')}
      >
        <NavigationItem
          to="/tools/discovery"
          icon={Scan}
          label="Discovery"
          onClose={isMobile ? onClose : undefined}
          ariaLabel="Discovery - SNMP/Netconf network scan"
        />
        
        <NavigationItem
          to="/tools/export"
          icon={FileText}
          label="Export"
          onClose={isMobile ? onClose : undefined}
          ariaLabel="Export - Export inventory data"
        />
      </NavigationModule>
    </>
  );
}
