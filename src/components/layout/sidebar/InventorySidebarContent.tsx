
import React from "react";
import { 
  LayoutDashboard, 
  PackageSearch, 
  Users, 
  Building, 
  Clock, 
  ActivitySquare, 
  History, 
  PlusCircle, 
  Link as LinkIcon, 
  Database, 
  Wifi 
} from "lucide-react";
import { SidebarNavLink } from "./SidebarNavLink";
import { SidebarCategory } from "./SidebarCategory";

interface InventorySidebarContentProps {
  isMobile?: boolean;
  onClose?: () => void;
}

export const InventorySidebarContent: React.FC<InventorySidebarContentProps> = ({
  isMobile,
  onClose
}) => {
  return (
    <>
      <p className="text-xs text-sidebar-foreground/60 px-3 mb-3">
        Manage and monitor your assets, customers, suppliers and subscriptions
      </p>
      
      <div className="flex flex-col gap-1">
        <SidebarNavLink
          to="/inventory/dashboard"
          icon={LayoutDashboard}
          label="Dashboard"
          onClick={isMobile ? onClose : undefined}
        />

        <SidebarNavLink
          to="/inventory/assets"
          icon={PackageSearch}
          label="Assets"
          onClick={isMobile ? onClose : undefined}
        />

        <SidebarNavLink
          to="/inventory/customers"
          icon={Users}
          label="Customers"
          onClick={isMobile ? onClose : undefined}
        />

        <SidebarNavLink
          to="/inventory/suppliers"
          icon={Building}
          label="Suppliers"
          onClick={isMobile ? onClose : undefined}
        />

        <SidebarCategory label="Management">
          <SidebarNavLink
            to="/inventory/subscriptions"
            icon={Clock}
            label="Subscriptions"
            onClick={isMobile ? onClose : undefined}
          />
        </SidebarCategory>

        <SidebarCategory label="Monitoring">
          <SidebarNavLink
            to="/inventory/monitoring/history"
            icon={History}
            label="History"
            onClick={isMobile ? onClose : undefined}
          />

          <SidebarNavLink
            to="/inventory/monitoring/active"
            icon={ActivitySquare}
            label="Monitoring"
            onClick={isMobile ? onClose : undefined}
          />
        </SidebarCategory>

        <SidebarCategory label="Tools">
          <SidebarNavLink
            to="/inventory/tools/register-asset"
            icon={PlusCircle}
            label="Register Asset"
            onClick={isMobile ? onClose : undefined}
          />
          
          <SidebarNavLink
            to="/inventory/tools/associate-assets"
            icon={LinkIcon}
            label="Associate Assets"
            onClick={isMobile ? onClose : undefined}
          />
          
          <SidebarNavLink
            to="/inventory/tools/data-usage"
            icon={Database}
            label="Data Usage"
            onClick={isMobile ? onClose : undefined}
          />
          
          <SidebarNavLink
            to="/inventory/tools/wifi-analyzer"
            icon={Wifi}
            label="WiFi Analyzer"
            onClick={isMobile ? onClose : undefined}
          />
        </SidebarCategory>
      </div>
    </>
  );
};
